
$(function () {

    var camera, scene, renderer, geometry, material, mesh;

    init();
    animate();

    function init() {

        var $container = $('#container');
        var w = $container.innerWidth(),
            h = w * (9 / 16);

        /* SCENE */
        scene = new THREE.Scene();

        /* CAMERA */
        camera = new THREE.PerspectiveCamera(50, w / h, 1, 1000);
        camera.position.z = 750;
        scene.add(camera);

        /* MATERIAL */
        material = new THREE.MeshNormalMaterial();

        /* MODEL */
        geometry = new THREE.CubeGeometry(25, 25, 25);
        mesh = new THREE.Mesh(geometry, material);
    	
        var nb = 10, x=0;
        for(var i=0; i<nb; i++){
            mesh = mesh.clone();
            x = Math.cos(360/i)*360;
            mesh.position.x = x;
        	scene.add(mesh);
        }

        /* RENDERER */
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(w, h);

        $container.append(renderer.domElement);

        /* STATS */
        stats = new Stats();
        $container.before(stats.domElement);


        /* CONTROLS */        
        controls = new THREE.TrackballControls(camera, $container[0]);
        controls.target.set(0, 0, 0);
        controls.enabled = true;
    }
    

    function animate() {

        requestAnimationFrame(animate);
        render();

    }

    function render() {

        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.02;

        renderer.render(scene, camera);

    }

});