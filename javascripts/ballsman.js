﻿$(function () {

    // get the DOM element to attach to
    // - assume we've got jQuery to hand
    var $container = $('#container');

    // set the scene size
    var WIDTH = $container.innerWidth(),
        HEIGHT = WIDTH * (9 / 16);

    // set some camera attributes
    var VIEW_ANGLE = 45,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 10,
        FAR = 1500;

    /* STATS */

    stats = new Stats();
    $("#header").before(stats.domElement);


    /* RENDERER */

    // create a WebGL renderer, camera
    // and a scene
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFShadowMap;
    // to antialias the shadow
    renderer.shadowMapSoft = true;

    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);

    // attach the render-supplied DOM element
    $container.append(renderer.domElement);


    /* CAMERA */
    var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

    camera.position.z = 1700;


    /* SCENE */
    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 750, 1500);


    /* CONTROLS */

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
    


    /************
     * MATERIALS
     ***********/

    // create the sphere's material
    var shininess = 200,
        sphereColors = [0xCC1111, 0xCCCC11, 0x11CC11],
        sphereMaterials = []
    ;

    for (var i = 0; i < 3; i++) {
        var sphereMaterial = new THREE.MeshPhongMaterial(
        {
            color: sphereColors[i],
            transparent: true,
            specular: 0x555555, shininess: shininess
        });

        sphereMaterials.push(sphereMaterial);
    }


    var planeTexture = THREE.ImageUtils.loadTexture("images/plane.png");
    planeTexture.wrapS = planeTexture.wrapT = THREE.MirroredRepeatWrapping;
    planeTexture.repeat.set(25, 25);

    var planeMaterial = new THREE.MeshLambertMaterial(
    {
        name: "planeMaterial",
        color: 0xCCCCCC,
        map: planeTexture
    });



    /************
     * MESHES
     ***********/


    /** Plane **/

    var plane0 = function initPlane() {
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

    //plane0.rotation.x = -Math.PI/2;

    // add the plane to the scene
    scene.add(plane0);


    /** Spheres **/

    var spheres = function initSpheres() {
        var radius = 50,
            segments = 32,
            rings = segments
        ;

        var arr = [];
        var sphere = {};

        // 0
        sphere = new THREE.Mesh(
            new THREE.SphereGeometry(radius, segments, rings),
            sphereMaterials[0]
        );
        sphere.name = "sphere0";
        sphere.castShadow = true;
        sphere.receiveShadow = false;

        sphere.position.x = -150;
        sphere.position.z = radius;

        arr.push(sphere);

        // 1
        sphere = new THREE.Mesh(
            new THREE.SphereGeometry(radius, segments, rings),
            sphereMaterials[1]
        );
        sphere.name = "sphere1";
        sphere.castShadow = true;
        sphere.receiveShadow = false;

        sphere.position.x = 0;
        sphere.position.z = radius;

        arr.push(sphere);

        // 2
        sphere = new THREE.Mesh(
            new THREE.SphereGeometry(radius, segments, rings),
            sphereMaterials[2]
        );
        sphere.name = "sphere2";
        sphere.castShadow = true;
        sphere.receiveShadow = false;

        sphere.position.x = 150;
        sphere.position.z = radius;

        arr.push(sphere);

        return arr;
    }();

    // add the spheres to the scene
    spheres.forEach(function (o, i) { scene.add(o); })



    /************
     * CAMERA
     ***********/

    // and the camera
    scene.add(camera);



    /************
     * LIGHTS
     ***********/

    // ambient
    var ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    // create a point light
    var spotLight = new THREE.SpotLight(0xEEEEEE);

    spotLight.castShadow = true;

    spotLight.shadowCameraNear = 600;
    spotLight.shadowCameraFar = 1500;
    spotLight.shadowCameraFov = 120;

    //spotLight.shadowCameraVisible = true;

    spotLight.shadowMapWidth = spotLight.shadowMapHeight = 2048;

    spotLight.shadowDarkness = 0.1;

    // set its position
    spotLight.position.x = -150;
    spotLight.position.y = 500;
    spotLight.position.z = 500;

    scene.add(spotLight);

    // create a point light
    var spotLight2 = new THREE.SpotLight(0x555555);

    spotLight2.shadowCameraNear = 600;
    spotLight2.shadowCameraFar = 1500;
    spotLight2.shadowCameraFov = 120;

    //spotLight2.shadowCameraVisible = true;

    spotLight2.shadowMapWidth = spotLight2.shadowMapHeight = 756;

    spotLight2.shadowDarkness = 0.1;

    // set its position
    spotLight2.position.x = 0;
    spotLight2.position.y = -500;
    spotLight2.position.z = 1;

    scene.add(spotLight2);



    sphereLights = [];
    spheres.forEach(function (o, i) {
        var light = new THREE.PointLight(o.material.color.getHex());
        light.position.x = o.position.x;
        light.position.y = o.position.y;
        light.position.z = o.position.z;
        light.intensity = 0;

        sphereLights.push(light);

        scene.add(light);
    });



    // init my objects

    function update(time) {

        window.requestAnimationFrame(update);

        //controls.update();

        //spotLight.position.x = Math.cos(time / 900) * 50 - 25;
        //spotLight.position.y = Math.cos(time / 900) * 50 - 25 + 600;

        //spherespotLight.position = spotLight.position;

        stats.update();
        renderer.render(scene, camera);
    };

    ledState = [false, false, false];

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

            if (ledState[id] == true) {
                ledState[id] = false;
                sphereLights[id].intensity = .1;
                o.material.emissive = new THREE.Color(0);
            } else {
                ledState[id] = true;
                sphereLights[id].intensity = .8;
                o.material.emissive = o.material.color;
            }
        }

    }, false);

    __marg = 1500 - 900;
    camera.position.z = 900;
    animation.animate({
        duration: 4000,
        delta: animation.makeEaseOut(animation.elastic),
        step: function (d) {
            camera.position.z = 1500 - __marg * d;
        }
    });
    //animation.animate({
    //    duration: 3500,
    //    delta: animation.makeEaseOut(animation.elastic),
    //    step: function (d) {
    //        camera.position.y = d * 1080 - 960;
    //        camera.position.x = d * 1080 - 960;
    //    }
    //});

    threeleds.init();

    threeleds.valueChange = function(val, old){
        val = (val*(150/255))/100;
        sphereLights[0].intensity = val;
        spheres[0].material.emissive.setRGB(val, 0, 0);
    };

    onWindowResize();
});