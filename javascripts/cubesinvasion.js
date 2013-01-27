
$(function () {

    var camera, scene, renderer, stats,

    geometry, root,

    mouseX = 0, mouseY = 0;

    init();
    animate();

    function init() {

        container = $('#container');

        var w = container.innerWidth()-8,
            h = w * (9 / 16);

        camera = new THREE.PerspectiveCamera(60, w / h, 1, 1500);
        camera.position.y = 150;
        camera.position.z = 250;

        scene = new THREE.Scene();

        _terrain = new THREE.Terrain(scene);

        scene.add(_terrain.mesh);

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

    

});