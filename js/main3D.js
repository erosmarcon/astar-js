var container;
var camera;

var scene, renderer;
var controls;
var stats;

var graph
var view

var settings = {orthogonal: false, numBlocks: 500, width:50, height:50, cellSize:10}

function init(element) {
    container = document.getElementById(element);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 50000);
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setClearColor(0x333333, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = 0;
    container.appendChild(renderer.domElement);

    camera.position.set(0, 1000, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 100;
    controls.maxDistance = 30000;

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.left = '0px'
    stats.domElement.style.zIndex = 100;
    container.appendChild(stats.domElement);

    var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(50, 100, 50);
    scene.add(dirLight);

    graph = new AStarGraph(settings.width, settings.height);
    randomize(settings.numBlocks);


    view = new MapView3D(graph, settings.cellSize)
    scene.add(view);

    lookAtCenter()


    //Gui
    var gui = new dat.GUI();
    gui.add(settings, 'orthogonal').name('Orthogonal');
    var width = gui.add(settings, 'width', 20, 100).step(1).name('Graph Width')
    var height = gui.add(settings, 'height', 20, 100).step(1).name('Graph Height')

    width.onFinishChange(function (value) {
        graph.clear();
        graph = new AStarGraph(value, settings.height);
        randomize(settings.numBlocks);
        view.graph=graph;
        view.drawMap();
        lookAtCenter()

    })

    height.onFinishChange(function (value) {
        graph.clear();
        graph = new AStarGraph(settings.width, value);
        randomize(settings.numBlocks);
        view.graph=graph;
        view.drawMap();
        lookAtCenter()

    })



    var cellSize = gui.add(settings, 'cellSize', 6, 20).step(1).name('Cell Size');

    cellSize.onFinishChange(function (value) {
        graph.clear();
        graph = new AStarGraph(settings.width, settings.height);
        randomize(settings.numBlocks);
        view.graph=graph;
        view.cellSize=value
        view.drawMap();
        lookAtCenter()

    })


    var numBlocks = gui.add(settings, 'numBlocks', 100, 1000).step(1).name('Unwalkable Cells').listen();;
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
    }, "solve").name("Solve")

    window.addEventListener('resize', onWindowResize, false);

    document.addEventListener('mousedown', onClick, false);

    animate();
}


function lookAtCenter()
{
    //get center
    var centerX = graph.width * view.cellSize * .5;
    var centerZ = graph.height * view.cellSize * .5;
    controls.target = new THREE.Vector3(centerX, 0, centerZ);
}


function onClick(event) {
    var mouse3D = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
    mouse3D.unproject(camera);
    var raycaster = new THREE.Raycaster(camera.position, mouse3D.sub(camera.position).normalize());
    var intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        var x = parseInt(intersects[0].object.position.x / view.cellSize);
        var y = parseInt(intersects[0].object.position.z / view.cellSize);
        if (event.altKey) {
            graph.getCellAt(x, y).walkable = !graph.getCellAt(x, y).walkable;
            if(graph.getCellAt(x, y).walkable)
                settings.numBlocks--
            else
                settings.numBlocks++
            view.drawMap()
        }
        else if (event.ctrlKey) {
            view.origin = {x: x, y: y}
            view.drawMap()
        }
        else if (event.shiftKey) {
            view.destination = {x: x, y: y}
            view.drawMap()
        }
    }
}

function solve() {
    if(!graph.getCellAt(view.destination.x, view.destination.y).walkable)
        graph.getCellAt(view.destination.x, view.destination.y).walkable=true;

   //view.clearSolution()
    document.getElementById('result').innerHTML = "";

    var solution = graph.solve(view.origin, view.destination, settings.orthogonal);
    var message=""
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
                message = "Path found! (" + solution.path.length + " steps)";
                view.showSolution(solution.path)
            }
            break;
    }
    document.getElementById('result').innerHTML = message;
}

function randomize(fills) {
    for (var i = 0; i < fills; i++) {
        var x = parseInt(Math.random() * settings.width);
        var y = parseInt(Math.random() * settings.height);
        graph.getCellAt(x, y).walkable = false;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    stats.update();
}
