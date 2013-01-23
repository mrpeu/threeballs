
$(function () {

    var camera, scene, renderer, stats,

    geometry, root,

    mouseX = 0, mouseY = 0;

    init();
    animate();

    function init() {

        container = $('#container');

        var w = container.innerWidth(),
            h = w * (9 / 16);

        camera = new THREE.PerspectiveCamera( 60, w / h, 1, 1500 );
        camera.position.z = 250;

        scene = new THREE.Scene();

        _terrain = createTerrain(scene);

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( w, h );
        renderer.sortObjects = false;
        container.append( renderer.domElement );

        stats = new Stats();
        container.before(stats.domElement);

        /* CONTROLS */        
        controls = new THREE.TrackballControls(camera, container[0]);

        window.addEventListener( 'resize', onWindowResize, false );

    }


    /*********
     * Terrain generation
     *********/
    function createTerrain(scene){
        var terrainCfg = {
                size: {x: 250, y: 250, z: 100},
                res: {x: 25, y: 25, z: 50} // resolution
            },

            materials = [
                new THREE.MeshNormalMaterial({wireframe: true}),
                new THREE.MeshNormalMaterial()
            ],

            plane = new THREE.Mesh( 
                new THREE.PlaneGeometry(
                    // size
                    terrainCfg.size.x,terrainCfg.size.y,
                    // nb segments
                    terrainCfg.res.x, terrainCfg.res.y
                ),
                materials[0] 
            )
        ;

        scene.add(plane);

        var terrain = [],
            bric,
            _w = terrainCfg.res.x,
            _h = terrainCfg.res.y
        ;
        for (var j = _w-1; j >= 0; j--) {
            for (var i = _h-1; i >= 0; i--) {

                var vertices = [
                    plane.geometry.vertices[(j*(_w+1))+i+0],
                    plane.geometry.vertices[(j*(_w+1))+i+1],
                    plane.geometry.vertices[(j*(_w+1))+i+(_w+2)],
                    plane.geometry.vertices[(j*(_w+1))+i+(_w+1)]
                ];

                var extrusion = (
                    new THREE.Shape(vertices)
                ).extrude({
                    amount: Math.random() * terrainCfg.res.z,
                    bevelEnabled: true,
                    bevelThickness: .1,
                    bevelSize: .1,
                    bevelSegments: 1
                });

                bric = new THREE.Mesh( extrusion, materials[1] );

                terrain.push(bric);

                scene.add( bric );
            };
        };

        return terrain;
    }



    function onWindowResize() {

        var w = container.innerWidth(),
            h = w * (9 / 16);

        camera.aspect = w / h;
        camera.animateProjectionMatrix();

        renderer.setSize( w, h );

    }

    //

    function animate() {
        requestAnimationFrame( animate );

        /*
        var time = Date.now() * 0.001;

        var rx = Math.sin( time * 0.7 ) * 0.2;
        var ry = Math.sin( time * 0.3 ) * 0.1;
        var rz = Math.sin( time * 0.2 ) * 0.1;

        camera.lookAt( scene.position );

        root.traverse( function ( object ) {

            if(object==root) return;
            object.rotation.x = rx;
            object.rotation.y = ry;
            object.rotation.z = rz;

        } );
        */

        renderer.render( scene, camera );
        
        controls.update();
        stats.update();
    }

});