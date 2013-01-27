


/*********
 * Terrain generation
 *********/

/*
cfg: {
    size
    resolution
}
*/



THREE.Terrain = function(cfg){

    // default config
    this._cfg = {
        size: { x: 400, y: 400, z: 100 },
        resolution: { x: 10, y: 10, z: 50 },
        unitGeom: new THREE.CubeGeometry(30, 30, 30)
    };

    cfg = cfg || {};

    this.size = (typeof cfg.size === "undefined") ? this._cfg.size :
                (typeof cfg.size === "number") ? { x: size, y: size, z: this._cfg.size.z } :
                function () { throw new TypeError("cfg.size"); }()
    ;
    
    this.resolution = (typeof cfg.resolution === "undefined") ? this._cfg.resolution :
                (typeof cfg.resolution === "number") ? { x: resolution, y: resolution, z: this._cfg.resolution.z } :
                function () { throw new TypeError("cfg.resolution"); }()
    ;

    this.unitGeom = (typeof cfg.unitGeom === "undefined") ? this._cfg.unitGeom :
                    cfg.unitGeom;

    var materials = [
        new THREE.MeshNormalMaterial({ wireframe: true }),
        new THREE.MeshNormalMaterial(),
        new THREE.LineBasicMaterial({ color: 0xccff00 })
    ];

    this.planeGeom = new THREE.PlaneGeometry(
        // size
        this.size.x, this.size.y,
        // nb segments
        this.resolution.x - 1, this.resolution.y - 1
    );

    // generate a list of width*height random numbers
    this.generateHeight = function(width, height) {

        var size = width * height, data = new Float32Array(size),
        perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;

        for (var i = 0; i < size; i++) {

            data[i] = 0

        }

        for (var j = 0; j < 4; j++) {

            for (var i = 0; i < size; i++) {

                var x = i % width, y = ~~(i / width);
                data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75);

            }

            quality *= 5;

        }

        return data;
    }

    var data = this.generateHeight(this.resolution.x, this.resolution.y);

    this.planeGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    for (var i = 0, l = this.planeGeom.vertices.length; i < l; i++) {

        this.planeGeom.vertices[i].y = data[i] * 1;

    }

    this.mesh = new THREE.Mesh(this.planeGeom, materials[0]);


    var brics = [],
        bric,
        _w = this.resolution.x - 1,
        _h = this.resolution.y - 1,
        face,
        normalLength = 50,
        normalsGeom = new THREE.Geometry()
    ;

    for (var j = _w; j > 0; j--) {
        for (var i = _h; i > 0; i--) {

            face = this.planeGeom.faces[(j * _w) - i];
            console.log(
                face.centroid,
                this.planeGeom.vertices[face.a],
                this.planeGeom.vertices[face.b],
                this.planeGeom.vertices[face.c],
                this.planeGeom.vertices[face.d],
                face.normal
            );

            normalsGeom.vertices.push(
                face.centroid.clone()
            );
            normalsGeom.vertices.push(
                face.normal.clone()
            );

            //console.log(
            //    normalsGeom.vertices[normalsGeom.vertices.length - 2],

            //    normalsGeom.vertices[normalsGeom.vertices.length - 1]
            //);

            bric = new THREE.Mesh(this.unitGeom.clone(), materials[1]);

            bric.position = face.centroid.clone();

            brics.push(bric);

            this.mesh.add(bric);
        };
    };
    
    this.mesh.add( new THREE.Line(normalsGeom, materials[2], THREE.LinePieces) );

    return this;
}