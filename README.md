# *Star Pathfinder

<p align="center">
  <img src="https://github.com/erosmarcon/astar-js/blob/master/images/screenshots/AStar-shot-1.png"/>
</p>

## What is
A javascript implementation of [A* path-finding algorithm](https://en.wikipedia.org/wiki/A*_search_algorithm).

## How to setup

    <script src="js/AStar.js"></script>

## How to use

Create a map passing width and height values (number of cells on each axis)

    var graph = new AStarGraph(100, 100);

Define origin and destination coordinates, eg:

    var origin      = {x:10, y:20};
    var destination = {x:80, y:90};

By default every cell is walkable, to set it as an obstacle change the walkable property:

    graph.getCellAt(x, y).walkable = false;


Call the solve function to find the path. You can force it to be orthogonal:

     var solution = graph.solve(origin, destination, orthogonal);


You get a result object with a description property, possible values are:

* AStarGraph.INVALID_DESTINATION
* AStarGraph.NO_PATH
* AStarGraph.TOO_LONG
* AStarGraph.SOLVED

If description is AStarGraph.SOLVED, result has a path property (an array of x and y coordinates):


        switch (solution.description) {
            case AStarGraph.INVALID_DESTINATION:
                message = "Destination point is filled!"
                break;
            case AStarGraph.NO_PATH:
                message="No path beetween points!"
                break;
            case AStarGraph.TOO_LONG:
                message = "Too many !"
                break;
            case AStarGraph.UNSOLVED:
                message = "Unable to find path"
                break;
            case AStarGraph.SOLVED:
                message = "Path solved!";
                if (solution.path != null) {
                    message = "Path solved! (" + solution.path.length + " steps)";
                    view.showSolution(solution.path)
                }
                break;
        }

## Examples

