import astarsearch
import json
import os.path
import random
import threading
import time
import tornado.ioloop
import tornado.web
import tornado.websocket

class MainHandler(tornado.web.RequestHandler):

    def get(self):
        constants = dict([\
            ('NODE_TYPE_'+k, getattr(NodeType, k)) for\
            k in dir(NodeType) if not k.startswith('__')])
        self.render('html/main.html', constants=constants)


class SubscribeHandler(tornado.websocket.WebSocketHandler):
    subscribers = set()

    def open(self):
        SubscribeHandler.subscribers.add(self)

    def on_close(self):
        SubscribeHandler.subscribers.remove(self)

    @classmethod
    def publish(cls, graph):
        graph = json.dumps(graph)
        for s in cls.subscribers:
            s.write_message(graph)


class Graph(object):
    """2-dimensional array representing the graph to be traversed by the search
    algorithm.
    """

    @classmethod
    def build(cls, width, height, node_providers):
        graph = Graph(width, height)
        [p.apply(graph) for p in node_providers]
        return graph

    def __init__(self, width, height):
        self.nodes =\
            [[0 for _ in range(width)] for _ in range(height)]
        self.width = width
        self.height = height

    def get(self, point):
        x, y = point
        return self.nodes[y][x]

    def set(self, point, node_type):
        x, y = point
        self.nodes[y][x] = node_type

    def set_many(self, points, node_type):
        for x, y in points:
            self.nodes[y][x] = node_type

    def find_one(self, node_type):
        for point, this_node_type in self._iter():
            if this_node_type == node_type:
                return point

    def find_all(self, node_type):
        for point, this_node_type in self._iter():
            if this_node_type == node_type:
                yield point

    def _iter(self):
        for y in range(self.height):
            for x in range(self.width):
                p = (x, y)
                yield p, self.get(p)


class BearProvider(object):
    
    def apply(self, graph):
        while True:
            p = (
                random.randint(0, graph.width-1),
                random.randint(0, graph.height-1))
            if graph.get(p) == NodeType.GRASS:
                graph.set(p, NodeType.BEAR)
                break


class HoneyProvider(object):

    def apply(self, graph):
        while True:
            p = (
                random.randint(0, graph.width-1),
                random.randint(0, graph.height-1))
            if graph.get(p) == NodeType.GRASS:
                graph.set(p, NodeType.HONEY)
                break


class TreeProvider(object):

    def __init__(self, count):
        self.count = count

    def apply(self, graph):
        remaining = self.count
        while remaining:
            p = (
                random.randint(0, graph.width-1),
                random.randint(0, graph.height-1))
            if graph.get(p) == NodeType.GRASS:
                graph.set(p, NodeType.TREE)
                remaining -= 1


class NodeType(object):
    """Exhaustive list of graph node types."""
    GRASS =     0
    BEAR =      1
    HONEY =     2
    PATH =      3
    TREE =      4


class GraphMutation(object):
    """Controller that modifies node values within a graph in realtime and
    publishes those modifications to all subscribers.

    The controller is run as a daemon, separate from the web server (and in its
    own thread).
    """
   
    @classmethod
    def start(cls):
        cls.inst = GraphMutation()
        cls.thread = threading.Thread(target=cls.inst.inst_start)
        cls.thread.start()

    @classmethod
    def stop(cls):
        cls.inst.inst_stop()
        cls.thread.join()
 
    def __init__(self):
        self.stop_signal = False

    def inst_start(self):
        while not self.stop_signal:
            self.graph = Graph.build(
                30, # Width
                15, # Height
                [
                    BearProvider(),
                    HoneyProvider(),
                    TreeProvider(170), # Tree count
                ])
            # TODO(jhibberd) Only show after it's solved in case it can't be
            # solved. Also need lots of comments. also don't show background
            # for bear and honey while unsolved.
            SubscribeHandler.publish(self.graph.nodes)
            start = self.graph.find_one(NodeType.BEAR)
            goal = self.graph.find_one(NodeType.HONEY)
            closed_set = set(self.graph.find_all(NodeType.TREE))
            algorithm =\
                astarsearch.Algorithm(self.graph.width, self.graph.height)
            path = algorithm.search(start, goal, closed_set) 
            if not path:
                # No path between start and goal.
                continue
            # TODO(jhibberd) The algorithm path shouldn't include the start.
            path.remove(start)
            self.graph.set_many(path, NodeType.PATH)
            time.sleep(2)
            SubscribeHandler.publish(self.graph.nodes)
            time.sleep(5)

    def inst_stop(self):
        self.stop_signal = True


settings = {
    "static_path": os.path.join(os.path.dirname(__file__), "static"),
}
application = tornado.web.Application([
    (r"/", MainHandler),
    (r"/subscribe", SubscribeHandler),
], **settings)

if __name__ == "__main__":
    GraphMutation.start()
    try:
        application.listen(8888)
        tornado.ioloop.IOLoop.instance().start()
    finally:
        GraphMutation.stop()
