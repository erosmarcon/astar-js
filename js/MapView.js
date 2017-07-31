
(function () {/**
 * Created by eros on 21/07/2017.
 */
//MapView

    function MapView(map, cellSize) {
        this.Container_constructor();
        this.setup(map, cellSize);
    };

    MapView.prototype = createjs.extend(MapView, createjs.Container);

    MapView.prototype.setup = function (map, cellSize) {


        while(this.numChildren>0)
            this.removeChildAt(0)
        this.width=0
        this.height=0
        this.cellSize=cellSize;
        this.graph=map;

        this.origin={x:0, y:0};
        this.destination={x:0,y:0};

        /*this.originView=null;
        this.destinationView=null;
        this.solutionView=null;*/

        this.mainView=new createjs.Shape()
        this.mainView.x=0;
        this.mainView.y=0;
        this.addChild(this.mainView);

        this.origin={x:1,y:1};
        this.destination={x:this.graph.width-2,y:this.graph.height-2}

        this.originView=new createjs.Shape()
        this.originView.x=1*cellSize;
        this.originView.y=1*cellSize;

        this.originView.graphics.setStrokeStyle(1).beginStroke("#0000FF")
        this.originView.graphics.beginFill("#0000FF");
        this.originView.graphics.drawRect(1,1,cellSize-2,cellSize-2);
        this.originView.graphics.endFill();
        this.addChild(this.originView);

        this.destinationView=new createjs.Shape()
        this.destinationView.x=(this.graph.width-2)*cellSize;
        this.destinationView.y=(this.graph.height-2)*cellSize;

        this.destinationView.graphics.setStrokeStyle(1).beginStroke("#FF0000")
        this.destinationView.graphics.beginFill("#FF0000");
        this.destinationView.graphics.drawRect(1,1,cellSize-2,cellSize-2);
        this.destinationView.graphics.endFill();
        this.addChild(this.destinationView);

        this.solutionView=new createjs.Shape()
        this.addChild(this.solutionView)

        this.drawMap();

    };

    MapView.prototype.fillRect=function(cellX, cellY, color) {
        this.mainView.graphics.setStrokeStyle(1).beginStroke(color)
        this.mainView.graphics.moveTo(cellX + 1, cellY + 1);
        this.mainView.graphics.beginFill(color, 1);
        this.mainView.graphics.drawRect(cellX + 1, cellY + 1, this.cellSize - 2, this.cellSize - 2);
        //target.drawCircle(cellX * cellSize, cellY * cellSize, 10);
        this.mainView.graphics.endFill(); //No need??
    }

    MapView.prototype.drawMap = function () {
        clearInterval(this.solutionView.interval)
        this.width=this.graph.width*this.cellSize
        this.height=this.graph.height*this.cellSize
        this.solutionView.graphics.clear();
        this.mainView.graphics.clear();

        for(var x = 0; x < this.graph.width; x++) {
            for(var y = 0; y <  this.graph.height; y++) {

                if(!this.graph.getCellAt(x, y).walkable) {
                    this.fillRect(x * this.cellSize, y * this.cellSize, "#333333");
                }
                else{
                    this.fillRect(x * this.cellSize, y * this.cellSize, "#CCCCCC");
                }
            }
        }

        this.mainView.graphics.setStrokeStyle(1).beginStroke("#333333");

        for(var i = this.cellSize; i < this.graph.width * this.cellSize; i += this.cellSize) {
            this.mainView.graphics.moveTo(i, 0);
            this.mainView.graphics.lineTo(i, this.graph.height * this.cellSize);
        }
        for(i = this.cellSize; i < this.graph.height * this.cellSize; i += this.cellSize) {
            this.mainView.graphics.moveTo(0, i);
            this.mainView.graphics.lineTo(this.graph.width * this.cellSize, i);
        }

        this.mainView.graphics.setStrokeStyle(1).beginStroke("#333333");
        this.mainView.graphics.moveTo(0, 0);
        this.mainView.graphics.lineTo(this.graph.width * this.cellSize, 0);
        this.mainView.graphics.lineTo(this.graph.width * this.cellSize, this.graph.height * this.cellSize);
        this.mainView.graphics.lineTo(0, this.graph.height * this.cellSize);
        this.mainView.graphics.lineTo(0,0);

    }
    MapView.prototype.addStep=function(solution)
    {
        this.solutionView.graphics.setStrokeStyle(4, "round", "round", 10).beginStroke("#00FF00");
        if (this.solutionView.index < this.solutionView.solution.length) {

            var cell=this.solutionView.solution[this.solutionView.index]
            this.solutionView.graphics.moveTo(cell.x * this.cellSize + this.cellSize/2, cell.y * this.cellSize + this.cellSize/2);
            this.solutionView.graphics.lineTo(cell.parent.x * this.cellSize + this.cellSize/2, cell.parent.y * this.cellSize + this.cellSize/2);
            this.solutionView.index++;
        }
        else {
            clearInterval(this.solutionView.interval);
        }
    }

    MapView.prototype.showSolution=function(solution)
    {
        clearInterval(this.solutionView.interval);
        this.solutionView.graphics.clear();

        //var endCell = solution[0];
        var self=this;

        this.solutionView.solution = []
        this.solutionView.solution=solution.concat()
        this.solutionView.solution.reverse();
        this.solutionView.index = 0;
        this.solutionView.interval = setInterval(function(){ self.addStep() }, 50);


    }

    window.MapView = createjs.promote(MapView, "Container");
}());