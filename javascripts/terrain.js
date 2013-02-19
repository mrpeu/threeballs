


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
        size: { x: 400, y: 400, z: 5 },
        resolution: { x: 10, y: 10 }
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

    this.materials = [
        new THREE.MeshNormalMaterial({ wireframe: true }),
        new THREE.MeshNormalMaterial(),
        new THREE.LineBasicMaterial({ color: 0xccff00 })
    ];


    var geoType = 0,
        geo,
        geo2
    ;

    switch(geoType){
        case 0:
            geo = new THREE.PlaneGeometry(
                // size
                this.size.x, this.size.y,
                // nb segments
                this.resolution.x - 1, this.resolution.y - 1
            );
            geo2 = geo.clone();
            geo2.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, this.size.z));
        break;

        case 1:
            geo = new THREE.CubeGeometry(
                // size
                this.size.x, this.size.y, this.size.y,
                // nb segments
                this.resolution.x - 1, this.resolution.y - 1, this.resolution.y - 1
            );
            geo2 = geo.clone();
            geo2.applyMatrix(new THREE.Matrix4().makeScale(scaleFactor, scaleFactor, scaleFactor));
        break;

        case 2:
            geo = new THREE.SphereGeometry(
                // size
                this.size.x,
                // nb segments
                this.resolution.x - 1, this.resolution.y - 1
            );

            var scaleFactor = 1.1;
            geo2 = geo.clone();
            geo2.applyMatrix(new THREE.Matrix4().makeScale(scaleFactor, scaleFactor, scaleFactor));
        break;
    }


    geo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    this.mesh = new THREE.Mesh(geo, this.materials[0]);


    var _w = this.resolution.x - 1,
        _h = this.resolution.y - 1,
        face,
        someFaces = new THREE.Geometry()
    ;


    var id;
    for (var j = _w; j > 0; j--) {
        for (var i = _h; i > 0; i--) {

            id = (j * _w) - i;

            someFaces.vertices.push( geo.vertices[id+0] );
            someFaces.vertices.push( geo.vertices[id+1] );
            someFaces.vertices.push( geo.vertices[id-_w+0] );
            someFaces.vertices.push( geo.vertices[id-_w+1] );

            if(id==1){
                for(var a=3; a>=0; a--){
                    var c = new THREE.CubeGeometry(10,10,10),
                        v = someFaces.vertices[someFaces.vertices.length-a-1]
                    ;
                    c.applyMatrix( new THREE.Matrix4().makeTranslation( v.x, v.y, v.z ) );
                    this.mesh.add(new THREE.Mesh(c, this.materials[1]));
                }
            }

            console.log(
                geo.vertices[id+0],
                geo.vertices[id+1],
                geo.vertices[id+2],
                geo.vertices[id+3]
            );

            someFaces.faces.push( new THREE.Face4( someFaces.vertices.length-4, someFaces.vertices.length-3, someFaces.vertices.length-2, someFaces.vertices.length-1));
        }
    }
    someFaces.computeFaceNormals();
    someFaces.computeVertexNormals();

    this.mesh.add( new THREE.Mesh(someFaces, this.materials[1]) );

    return this;
}