
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

        camera = new THREE.PerspectiveCamera(60, w / h, 1, 1500);
        camera.position.y = 150;
        camera.position.z = 250;

        scene = new THREE.Scene();

        _terrain = createTerrain(scene);

        /* RENDERER */
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(w, h);
        renderer.sortObjects = false;
        container.append(renderer.domElement);

        /* STATS */
        stats = new Stats();
        container.before(stats.domElement);
        /* CONTROLS */
        controls = new THREE.TrackballControls(camera, container[0]);

        window.addEventListener('resize', onWindowResize, false);
        //container.on( 'mousemove', onMouseMove, false );

    }


    /*********
     * Terrain generation
     *********/
    function createTerrain(scene) {
        var size=400, resolution=10,
            terrainCfg = {
                size: { x: size, y: size, z: 100 },
                res: { x: resolution, y: resolution, z: 50 } // resolution
        },

            materials = [
                new THREE.MeshNormalMaterial({ wireframe: true }),
                new THREE.MeshNormalMaterial(),
                new THREE.MeshPhongMaterial()
            ],

            planeGeom = new THREE.PlaneGeometry(
                // size
                terrainCfg.size.x, terrainCfg.size.y,
                // nb segments
                terrainCfg.res.x-1, terrainCfg.res.y-1
            ),
            data = generateHeight(terrainCfg.res.x, terrainCfg.res.y)
        ;

        planeGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

        for (var i = 0, l = planeGeom.vertices.length; i < l; i++) {

            planeGeom.vertices[i].y = data[i] * 1;

        }

        _planeMesh = new THREE.Mesh(planeGeom, materials[0]);

        scene.add(_planeMesh);


        scene.add(new THREE.Mesh(new THREE.IcosahedronGeometry(), materials[1]));


        
        var brics = [],
            bricGeom, bric,
            _w = terrainCfg.res.x-1,
            _h = terrainCfg.res.y-1,
            face
        ;
        bricGeom = new THREE.CubeGeometry(30, 30, 30);
        for (var j = _w; j > 0; j--) {
            for (var i = _h; i > 0; i--) {

                face = planeGeom.faces[(j * _w) - i];
                console.log(face);
                bric = new THREE.Mesh(bricGeom.clone(), materials[1]);

                bric.position = face.centroid.clone();

                brics.push(bric);

                scene.add( bric );
            };
        };
        
        return brics;
    }



    function onWindowResize() {

        var w = container.innerWidth(),
            h = w * (9 / 16);

        camera.aspect = w / h;
        camera.animateProjectionMatrix();

        renderer.setSize(w, h);
        animate();
    }

    function onMouseMove() {
        animate();
    }

    window._timeThatsEnough = Date.now + 10 * 1000;

    function animate() {
        if (Date.now > window._timeThatsEnough) return;

        requestAnimationFrame(animate);

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

        renderer.render(scene, camera);

        controls.update();
        stats.update();
    }

    function generateHeight(width, height) {

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

});