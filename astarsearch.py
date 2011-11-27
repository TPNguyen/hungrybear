import math

class Algorithm(object):
    """Implementation of the A* search algorithm used in pathfinding.
    
    http://en.wikipedia.org/wiki/A*_search_algorithm
    """

    def __init__(self, plane_width, plane_height):
        self.plane_width = plane_width
        self.plane_height = plane_height

    def _heuristic_cost_estimate(self, y, goal):
        return self._dist_between(y, goal)
     
    def _node_with_lowest_f_score(self, open_set, f_score):
        return min([(f_score[x], x) for x in open_set])[1]
     
    def _neighbor_nodes(self, p):
        px, py = p
        for x, y in [(px-1, py), (px+1, py), (px, py-1), (px, py+1)]:
            if x > -1 and y > -1 and\
               x < self.plane_width and y < self.plane_height:
                yield (x, y)
    
    def _dist_between(self, node_a, node_b):
        """Use the Pythagorean theorem to calculate the distance between two
        nodes.
        
        http://en.wikipedia.org/wiki/Pythagorean_theorem
        """
        node_a_x, node_a_y = node_a
        node_b_x, node_b_y = node_b
        edge_a = abs(node_a_x - node_b_x)
        edge_b = abs(node_a_y - node_b_y)
        return math.sqrt(math.pow(edge_a, 2.) + math.pow(edge_b, 2.))
    
    def reconstruct_path(self, came_from, current_node, path):
        if current_node in came_from:
            self.reconstruct_path(came_from, came_from[current_node], path)
        path.append(current_node)
     
    def search(self, start, goal, closed_set):
        closed_set = closed_set.copy()
        open_set = set()
        open_set.add(start)
        came_from = {}
         
        g_score = {start: 0}
        h_score = {start: self._heuristic_cost_estimate(start, goal)}
        f_score = {start: h_score[start]}
         
        while open_set:
            x = self._node_with_lowest_f_score(open_set, f_score)
            if x == goal:
                path = []
                self.reconstruct_path(came_from, came_from[goal], path)
                return path
            
            open_set.remove(x)
            closed_set.add(x)
            for y in self._neighbor_nodes(x):
                
                if y in closed_set:
                    continue
                tentative_g_score = g_score[x] + self._dist_between(x, y)
                
                if y not in open_set:
                    open_set.add(y)
                    tentative_is_better = True
                elif tentative_g_score < g_score[y]:
                    tentative_is_better = True
                else:
                    tentative_is_better = False
                    
                if tentative_is_better:
                    came_from[y] = x
                    g_score[y] = tentative_g_score
                    h_score[y] = self._heuristic_cost_estimate(y, goal)
                    f_score[y] = g_score[y] + h_score[y]
     
        return None
     
