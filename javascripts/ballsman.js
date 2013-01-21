

/************
 * BMCORE
 ***********/

bmcore = {
    init: function (opt) {

        $.extend(this, opt);

        return this;
    },

    update: function (t) {
    }
};




$(function () {

    // get the DOM element to attach to
    // - assume we've got jQuery to hand
    var $container = $('#container');

    // set the scene size
    var WIDTH = $container.innerWidth(),
        HEIGHT = WIDTH * (9 / 16);

    // set some camera attributes
    var FOV = 60,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 10,
        FAR = 1500,

        SPHERERADIUS = 250;

    /* statsPanel */

    statsPanel = new Stats();
    $("#title").before(statsPanel.domElement);

    bmcore.init({
        sphereradius: SPHERERADIUS
    });


    /************
     * RENDERER
     ***********/

    // create a WebGL renderer, camera
    // and a scene
    var renderer = new THREE.WebGLRenderer({ antialias: true });

    var UseFloatTextures = renderer.context.getExtension('OES_texture_float') != null;

    // enable shadowmap
    //if (UseFloatTextures) {
    //    renderer.shadowMapEnabled = true;
    //    renderer.shadowMapType = THREE.PCFShadowMap;
    //    // to antialias the shadow
    //    renderer.shadowMapSoft = true;
    //}

    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);

    // attach the render-supplied DOM element
    $container.append(renderer.domElement);



    /************
     * SCENE
     ***********/

    var scene = new THREE.Scene();
    //scene.fog = new THREE.Fog(0x000000, 750, 1500);




    /************
     * CAMERA
     ***********/

    var camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);

    camera.position.z = bmcore.sphereradius * 2;

    scene.add(camera);




    /************
     * CONTROLS
     ***********/

    // init the mouse control

    controls = new THREE.TrackballControls(camera, $container[0]);
    controls.target.set(0, 0, 0);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.15;

    controls.keys = [65, 83, 68];

    controls.enabled = true;

    // init the control panel

    controlPanel = new dat.GUI({ autoPlace: false });
    $("#title").before(controlPanel.domElement);
    
    controlPanel.addFolder("Mouse control")
        .add(controls, 'enabled');
    //controlPanel.closed = true;




    /************
     * MATERIALS
     ***********/

    // create the sphere's material
    var shininess = 200,
        sphereColors = [0xFFFFFF, 0x11CC11]
    ;

    var matOpt = {
        color: sphereColors[0],
        transparent: true,
        specular: sphereColors[0], shininess: shininess,

        wireframe: true
    };

    sphereMaterial = UseFloatTextures ?
        new THREE.MeshPhongMaterial(matOpt) :
        new THREE.MeshLambertMaterial(matOpt)
    ;


    var planeTexture = THREE.ImageUtils.loadTexture("images/plane.png");
    planeTexture.wrapS = planeTexture.wrapT = THREE.MirroredRepeatWrapping;
    planeTexture.repeat.set(25, 25);

    var planeMaterial = new THREE.MeshLambertMaterial(
    //var planeMaterial = new THREE.MeshNormalMaterial(
    {
        name: "planeMaterial",
        map: planeTexture,
        transparent: true,
        opacity: 0.25,
        color: 0xCECECE,
        side: THREE.DoubleSide
    });




    /************
     * LIGHTS
     ***********/

    /* ambient */
    var ambientLight = new THREE.AmbientLight(0x222222);

    /* spot */
    var spotLight = new THREE.SpotLight(0x444444);

    //spotLight.castShadow = true;

    //spotLight.shadowCameraNear = 600;
    //spotLight.shadowCameraFar = 1500;
    //spotLight.shadowCameraFov = 120;
    //spotLight.shadowCameraVisible = true;
    //spotLight.shadowMapWidth = spotLight.shadowMapHeight = 2048;
    //spotLight.shadowDarkness = 0.1;

    // set its position
    spotLight.position.x = 500;
    spotLight.position.y = 500;
    spotLight.position.z = 500;


    /* spot */
    var spotLight2 = new THREE.SpotLight(0x444444);

    //spotLight2.shadowCameraNear = 600;
    //spotLight2.shadowCameraFar = 1500;
    //spotLight2.shadowCameraFov = 120;
    //spotLight2.shadowCameraVisible = true;
    //spotLight2.shadowMapWidth = spotLight2.shadowMapHeight = 756;
    //spotLight2.shadowDarkness = 0.1;

    // set its position
    spotLight2.position.x = -500;
    spotLight2.position.y = -500;
    spotLight2.position.z = 500;



    scene.add(ambientLight);
    scene.add(spotLight);
    scene.add(spotLight2);



    /************
     * MESHES
     ***********/


    /** Plane **/

    var plane = function initPlane() {
        var width = 2000,
            height = width,
            wSegments = 50,
            hSegments = wSegments
        ;

        var plane = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height, wSegments, hSegments),
            planeMaterial
        );

        plane.receiveShadow = true;

        return plane;
    }();

    //plane.rotation.x = -Math.PI/2;


    /** Sphere **/

    var sphere = function initSphere() {
        var radius = SPHERERADIUS,
            segments = 64,
            rings = segments/2
        ;

        var arr = [];
        var sphere = {};

        // 0
        sphere = new THREE.Mesh(
            new THREE.SphereGeometry(radius, segments, rings),
            sphereMaterial
        );
        sphere.name = "sphere0";
        sphere.castShadow = true;
        sphere.receiveShadow = false;


        return sphere;
    }();


    var siz = 150, res = 5,
        cubeGeometry = new THREE.CubeGeometry(
        siz, siz, siz,
        res, res, res
    );
    for (var i = 0; i < cubeGeometry.faces.length; i++) {

        cubeGeometry.faces[i].color.setHex(Math.random() * 0xffffff);

    }

    cube = new THREE.Mesh(
        cubeGeometry,
        new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors })
    );

    scene.add(cube);
    scene.add(plane);
    scene.add(sphere);


    function update(time) {

        window.requestAnimationFrame(update);

        bmcore.update(time);

        controls.update();

        //spotLight.position.x = Math.cos(time / 900) * 50 - 25;
        //spotLight.position.y = Math.cos(time / 900) * 50 - 25 + 600;

        statsPanel.update();
        renderer.render(scene, camera);
    };

    // draw!
    update();



    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {
        /*
        var w = $container.innerWidth(), h = $container.innerHeight()
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    
        renderer.setSize(w, h);
        */

        var w = $container.width();

        camera.updateProjectionMatrix();

        renderer.setSize(w, w * (9 / 16));
    }

    container.addEventListener("click", function onContainerClick(event) {

        /* find intersections */

        var mouse = function getMouseCoordinates() {
            //var x = event.clientX,
            //    y = event.clientY,
            //    w = window.innerWidth,
            //    h = window.innerHeight
            //;
            var x = event.clientX - $container.offset().left,
                y = event.clientY - $container.offset().top,
                w = $container.width(),
                h = $container.height()
            ;

            return {
                x: (x / w) * 2 - 1,
                y: -(y / h) * 2 + 1
            };
        }();

        var vector = new THREE.Vector3(mouse.x, mouse.y, 1),
            projector = new THREE.Projector()
        ;

        projector.unprojectVector(vector, camera);

        raycaster = new THREE.Raycaster(camera.position, vector.subSelf(camera.position).normalize());

        var intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0
            && intersects[0].object.material.name != "planeMaterial") {

            var o = intersects[0].object,
                id = o.name.charAt(o.name.length - 1) * 1
            ;

            console.log("Click on sphere (%s)", id);
        }

    }, false);



    onWindowResize();
});