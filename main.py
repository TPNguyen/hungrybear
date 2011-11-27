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
        self.render('html/main.html')


class SubscribeHandler(tornado.websocket.WebSocketHandler):
    subscribers = set()

    def open(self):
        SubscribeHandler.subscribers.add(self)

    def on_close(self):
        SubscribeHandler.subscribers.remove(self)

    @classmethod
    def publish(cls, payload):
        payload = json.dumps(payload)
        for s in cls.subscribers:
            s.write_message(payload)


class Graph(object):
    """2-dimensional array representing the graph to be traversed by the search
    by the search algorithm.
    """

    WIDTH = 15
    HEIGHT = 10

    def __init__(self):
        self.data = [[0 for _ in range(self.WIDTH)] for _ in range(self.HEIGHT)]
        self.old_point = (0, 0)

    def random(self):
        x = random.randint(0, self.WIDTH-1)
        y = random.randint(0, self.HEIGHT-1)
        self.data[self.old_point[1]][self.old_point[0]] = 0
        self.old_point = (x, y)
        self.data[self.old_point[1]][self.old_point[0]] = 1
        

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
        self.graph = Graph()

    def inst_start(self):
        while not self.stop_signal:
            self.graph.random()
            SubscribeHandler.publish(self.graph.data)
            time.sleep(2)

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
