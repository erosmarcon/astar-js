AStarCell = function () {

    this.walkable = false;
    this.parent = null;
    this.g = 0;
    this.f = 0;
    this.x = 0;
    this.y = 0;

}

AStarGraph = function (width = 10, height = 10) {
    this.width = width;
    this.height = height;

    var x,y;

    AStarGraph.MAX_ITERATIONS = 2000;
    AStarGraph.SOLVED = "solved";
    AStarGraph.UNSOLVED = "unsolved";
    AStarGraph.INVALID_DESTINATION = "invalidDestination";
    AStarGraph.TOO_LONG = "tooLong";
    AStarGraph.NO_PATH = "noPath";

    this.mapArray = [];
    for (x = 0; x < this.width; x++) {
        this.mapArray[x] = [];
        for (y = 0; y < this.height; y++) {
            var cell = new AStarCell()
            cell.walkable = true;
            cell.parent = null;
            cell.g = 0;
            cell.f = 0;
            cell.x = x;
            cell.y = y; //use point instead??
            this.mapArray[x][y] = cell
        }
    }
    this.openSet = [];
    this.closedSet = [];


    this.sort = function (a, b) {
        if (a.f > b.f)
            return -1;
        if (a.f < b.f)
            return 1;
        return 0;
    }

    this.solve = function (origin, destination, orthogonal) {

        this.result={}
        this.origin = this.mapArray[origin.x][origin.y]
        this.destination = this.mapArray[destination.x][destination.y]
        this.orthogonal = orthogonal;

        if (!this.destination.walkable) {
            this.result.description = AStarGraph.INVALID_DESTINATION;
            return this.result;
        }

        if (this.destination.x == this.origin.x && this.destination.y == this.origin.y) {
            this.result.description = AStarGraph.INVALID_DESTINATION;
            return this.result;
        }
        this.current = this.origin;
        this.reset();

        var isSolved = false;
        var iter = 0;

        do {
            isSolved = this.stepPathfinder();
            if (iter++ < AStarGraph.MAX_ITERATIONS) {
                isSolved = this.stepPathfinder();
            } else {
                isSolved = true;
                this.result.description = AStarGraph.TOO_LONG;
                return this.result;
            }
        } while (!isSolved)

        var solutionPath = []

        var cellPointer = this.closedSet[this.closedSet.length - 1];
        while(cellPointer != this.origin) {
            solutionPath.push(cellPointer);
            cellPointer = cellPointer.parent;
        }

       if(this.result.description != AStarGraph.SOLVED)
            return  this.result;

        //this.result.description=AStarGraph.SOLVED
        this.result.path=solutionPath
        return this.result

    }

    this.stepPathfinder = function () {
        if (this.current == this.destination) {
            this.result.description = AStarGraph.SOLVED;
            this.closedSet.push(this.destination);
            return true;
        }

        this.openSet.push(this.current);
        var adjacentCells = [];
        var neighbour
        var x = this.current.x;
        var y = this.current.y;

        if (!this.orthogonal) {
            for (x = -1; x <= 1; x++) {
                for (y = -1; y <= 1; y++) {
                    if (!(x == 0 && y == 0)) {
                        if (this.current.x + x >= 0 && this.current.y + y >= 0 && this.current.x + x < this.width && this.current.y + y < this.height) {
                            if (this.mapArray[this.current.x + x][this.current.y + y]) {
                                neighbour = this.mapArray[this.current.x + x][this.current.y + y];
                                if (neighbour.walkable && this.closedSet.indexOf(neighbour) == -1) {
                                    adjacentCells.push(neighbour);
                                }
                            }
                        }
                    }
                }
            }
        }
        else {//orthogonal
            if (x - 1 >= 0) {
                neighbour = this.mapArray[x - 1][y + 0];
                if (neighbour.walkable && this.closedSet.indexOf(neighbour) == -1) {
                    adjacentCells.push(neighbour);
                }
            }

            if (y - 1 >= 0) {
                neighbour = this.mapArray[x + 0][y - 1];
                if (neighbour.walkable && this.closedSet.indexOf(neighbour) == -1) {
                    adjacentCells.push(neighbour);
                }
            }

            if (x + 1 < this.width) {
                neighbour = this.mapArray[x + 1][y + 0];
                if (neighbour.walkable && this.closedSet.indexOf(neighbour) == -1) {
                    adjacentCells.push(neighbour);
                }
            }

            if (y + 1 < this.height) {
                neighbour = this.mapArray[x + 0][y + 1];
                if (neighbour.walkable && this.closedSet.indexOf(neighbour) == -1) {
                    adjacentCells.push(neighbour);
                }
            }

        }
        var g;
        var h;
        for (var i = 0; i < adjacentCells.length; i++) {
            g = this.current.g + 1;
            h = Math.abs(adjacentCells[i].x - this.destination.x) + Math.abs(adjacentCells[i].y - this.destination.y);
            if (this.openSet.indexOf(adjacentCells[i]) == -1) {
                adjacentCells[i].f = g + h;
                adjacentCells[i].parent = this.current;
                adjacentCells[i].g = g;
                this.openSet.push(adjacentCells[i]);

            } else {

                if (adjacentCells[i].g < this.current.parent.g) {
                    this.current.parent = adjacentCells[i];
                    this.current.g = adjacentCells[i].g + 1;
                    this.current.f = adjacentCells[i].g + h;

                }
            }
        }

        var currentIndex = this.openSet.indexOf(this.current);
        this.closedSet.push(this.current);
        this.openSet.splice(currentIndex, 1);

        if (this.openSet.length == 0) {
            this.result.description = AStarGraph.NO_PATH;
            return this.result;
        }

        this.openSet.sort(this.sort); //f desc
        this.current = this.openSet.pop();

        return false;
    }


    this.getCellAt = function (x, y) {
        var cell = this.mapArray[x][y];
        return cell
    }

    this.clear = function () {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var cell = this.mapArray[x][y];
                cell.walkable = true;
                cell.parent = null;
                cell.g = 0;
                cell.f = 0;
                cell.x = x;
                cell.y = y;
            }
        }
    }

    this.reset = function () {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var cell = this.mapArray[x][y]//AStarCell
                cell.parent = null;
                cell.g = 0;
                cell.f = 0;
            }
        }
        this.openSet = []
        this.closedSet = []
    }
}
