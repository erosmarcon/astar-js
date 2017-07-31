var stage;
var graph
var view;

var settings = {orthogonal: false, numBlocks: 500, width:50, height:50, cellSize:10}


function init() {

    stage = new createjs.Stage("playground");
    graph = new AStarGraph(settings.width, settings.height);

    randomize(settings.numBlocks);

    view = new MapView(graph, settings.cellSize);
    stage.addChild(view);
    createjs.Ticker.addEventListener("tick", stage);

    //GUI Settings
    var gui = new dat.GUI();
    gui.add(settings, 'orthogonal').name('Orthogonal');


    var width = gui.add(settings, 'width', 20, 100).step(1).name('Graph Width')
    var height = gui.add(settings, 'height', 20, 100).step(1).name('Graph Height')
    var cellSize = gui.add(settings, 'cellSize', 6, 20).step(1).name('Cell Size');

    width.onFinishChange(function (value) {
        graph.clear();
        graph = new AStarGraph(value, settings.height);
        randomize(settings.numBlocks);
        view.setup(graph, settings.cellSize)
        resize()

    })

    height.onFinishChange(function (value) {
        graph.clear();
        graph = new AStarGraph(settings.width, value);
        randomize(settings.numBlocks);
        view.setup(graph, settings.cellSize)
        resize()

    })
    cellSize.onFinishChange(function (value) {
        graph.clear();
        graph = new AStarGraph(settings.width, settings.height);
        randomize(settings.numBlocks);
        view.setup(graph, settings.cellSize)
        resize()

    })

    var numBlocks = gui.add(settings, 'numBlocks', 100, 1000).step(1).name('Unwalkable Cells').listen();

    numBlocks.onFinishChange(function (value) {
        graph.clear();
        randomize(parseInt(value))
        view.drawMap()
    })

    gui.add({
        randomize: function () {
            graph.clear()
            randomize(settings.numBlocks)
            view.drawMap()
        }
    }, "randomize").name("Randomize")

    gui.add({
        solve: function () {
            solve()
        }
    }, "solve").name("Find Path !")

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.left = '0px';
    stats.domElement.style.zIndex = 100;
    document.body.appendChild(stats.domElement);

    update();

    view.on("mousedown", function (evt) {
        view.solutionView.graphics.clear();
        document.getElementById('result').innerHTML = "";
        var x = parseInt((evt.stageX-view.x) / view.cellSize);
        var y = parseInt((evt.stageY-view.y) / view.cellSize);

        if (evt.nativeEvent.shiftKey) {
            view.originView.x = x * view.cellSize;
            view.originView.y = y * view.cellSize;
            view.origin.x = x;
            view.origin.y = y;
            return;
        }
        else if (evt.nativeEvent.altKey) {
            view.destinationView.x = x * view.cellSize;
            view.destinationView.y = y * view.cellSize;
            view.destination.x = x;
            view.destination.y = y;
            return;
        }
        graph.getCellAt(x, y).walkable = !graph.getCellAt(x, y).walkable;
        if(graph.getCellAt(x, y).walkable)
            settings.numBlocks--;
        else
            settings.numBlocks++;
        view.drawMap();

    })
    resize();
}


update = function () {
    requestAnimationFrame(update);
    stats.update();
}


solve = function () {
    document.getElementById('result').innerHTML = "";
    var solutionPath = graph.solve(view.origin, view.destination, settings.orthogonal);
    var msg;
    switch (graph.result) {
        case AStarGraph.INVALID_DESTINATION:
            msg = "Destination point is filled!"
            break;
        case AStarGraph.NO_PATH:
            msg = "There is No Path!"
            break;
        case AStarGraph.TOO_LONG:
            msg = "Too many !"
            break;
        case AStarGraph.SOLVED:
            msg = "Path solved!";
            if (solutionPath != null) {
                msg = "Path solved! (" + solutionPath.length + " steps)";
                view.showSolution(solutionPath)
            }
            break;
    }
    document.getElementById('result').innerHTML = msg;
}


function randomize(fills) {
    document.getElementById('result').innerHTML = "";
    for (var i = 0; i < fills; i++) {
        var x = parseInt(Math.random() * settings.width);
        var y = parseInt(Math.random() * settings.height);
        graph.getCellAt(x, y).walkable = false;
    }
}

function resize() {
    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;
    view.x = (stage.canvas.width - view.width) * .5;
    view.y = (stage.canvas.height - view.height) * .5;
}

window.addEventListener('resize', resize, false);