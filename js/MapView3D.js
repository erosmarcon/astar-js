MapView3D = function (graph, cellSize) {

    THREE.Group.apply(this);

    this.graph = graph;
    this.cellSize = cellSize;

    this.cellView = new THREE.Mesh(new THREE.CubeGeometry(cellSize - 1, 1, cellSize - 1), new THREE.MeshPhongMaterial({color: 0xFFFFFF}));
    this.stepView = new THREE.Mesh(new THREE.CubeGeometry(cellSize - 1, 2, cellSize - 1), new THREE.MeshPhongMaterial({color: 0x00FF00}));
    this.solutionView = new THREE.Group();

    //defaults
    this.origin = {x: 1, y: 1};
    this.destination = {x: this.graph.width - 2, y: this.graph.height - 2};
    this.materials = {
        walkable: new THREE.MeshPhongMaterial({color: 0xFFFFFF}),
        unwalkable: new THREE.MeshPhongMaterial({color: 0x000000}),
        origin: new THREE.MeshPhongMaterial({color: 0x0000FF}),
        destination: new THREE.MeshPhongMaterial({color: 0xFF0000})
    }
    this.drawMap()
}

MapView3D.prototype = Object.assign(Object.create(THREE.Group.prototype), {
    constructor: MapView3D,
    drawMap: function () {
        clearInterval(this.solutionView.interval)
        var i;
        for (i = this.children.length - 1; i >= 0; i--) {
            this.remove(this.children[i]);
        }
        for (i = this.solutionView.children.length - 1; i >= 0; i--) {
            this.solutionView.remove(this.solutionView.children[i]);
        }
        this.add(this.solutionView)

        this.originView = this.cellView.clone()
        this.originView.position.x = this.origin.x * this.cellSize;
        this.originView.position.z = this.origin.y * this.cellSize;
        this.originView.scale.y = 50;
        this.originView.position.y = 25
        this.originView.material = this.materials.origin;
        this.add(this.originView);

        this.destinationView = this.cellView.clone()
        this.destinationView.position.x = this.destination.x * this.cellSize;
        this.destinationView.position.z = this.destination.y * this.cellSize;
        this.destinationView.scale.y = 50
        this.destinationView.position.y = 25
        this.destinationView.material = this.materials.destination;
        this.add(this.destinationView);

        var cell;
        for (var x = 0; x < this.graph.width; x++) {
            for (var y = 0; y < this.graph.height; y++) {
                if (!this.graph.getCellAt(x, y).walkable) {
                    cell = this.cellView.clone();
                    cell.position.x = x * this.cellSize;
                    cell.position.z = y * this.cellSize;
                    cell.scale.y = 10
                    cell.position.y = 5
                    cell.material = this.materials.unwalkable;
                    this.add(cell);

                }
                else {
                    cell = this.cellView.clone();
                    cell.position.x = x * this.cellSize;
                    cell.position.z = y * this.cellSize;
                    cell.material = this.materials.walkable;
                    this.add(cell);
                }
            }
        }
    },

    addStep: function () {
        if (this.solutionView.index < this.solutionView.solution.length) {
            var x = this.solutionView.solution[this.solutionView.index].x* this.cellSize;
            var z = this.solutionView.solution[this.solutionView.index].y* this.cellSize;
            var step = this.stepView.clone();
            step.position.set(x, 0, z);
            this.solutionView.add(step);
            this.solutionView.index++;
        }
        else {
            clearInterval(this.solutionView.interval);
        }
    },
    showSolution: function (solution) {
        clearInterval(this.solutionView.interval);
        for (var i = this.solutionView.children.length - 1; i >= 0; i--) {
            this.solutionView.remove(this.solutionView.children[i]);
        }
        var self=this;
        this.solutionView.solution = []
        this.solutionView.solution=solution.concat()
        this.solutionView.solution.reverse();
        this.solutionView.index = 0;
        this.solutionView.interval = setInterval(function(){ self.addStep() }, 50);

    }

})