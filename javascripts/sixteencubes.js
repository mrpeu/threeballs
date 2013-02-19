$(function () {

    var renderer, stats, scene, camera;


    function init(){
        // get the DOM element to attach to
        // - assume we've got jQuery to hand
        var $container = $('#container');

        // the scene size
        var WIDTH = $container.innerWidth(),
            HEIGHT = WIDTH * (9 / 16);

        // some camera attributes
        var VIEW_ANGLE = 30, NEAR = 1, FAR = 300;


        /* STATS */

        stats = new Stats();
        $("#header").before(stats.domElement);



        /* RENDERER */

        // create a WebGL renderer, camera
        // and a scene
        renderer = new THREE.WebGLRenderer({ antialias: true });

        // enable shadowmap
        renderer.shadowMapEnabled = true;
        renderer.shadowMapType = THREE.PCFShadowMap;
        // to antialias the shadow
        renderer.shadowMapSoft = true;

        // start the renderer
        renderer.setSize(WIDTH, HEIGHT);

        // attach the render-supplied DOM element
        $container.append(renderer.domElement);



        /* CAMERA */

        camera = new THREE.PerspectiveCamera(VIEW_ANGLE, WIDTH / HEIGHT, NEAR, FAR);


        /* SCENE */

        scene = new THREE.Scene();
        //scene.fog = new THREE.Fog(0x000000, 750, 1500);
        //scene.fog.color.setHSV( 0.6, 0, 1 );    


        /* CONTROLS */
        
        // TODO



        /* LIGHTS *

        var ambientLight = new THREE.AmbientLight( 0x606060 );
        scene.add( ambientLight );




        /* PLANE */




        /* CUBES */

        


        update();
    };





    function update(time) {

        window.requestAnimationFrame(update);

        //stats.update();
        renderer.render(scene, camera);
    };



    init();

});