
var camera, cameraTarget, scene, renderer, gui, autoMove, autoRender=true;

var material0, material1,
    force = [2.5,2,2,1.5,2.5,3],
    array = [],
    ball;


function initScene() {

    container = document.getElementById( 'container' );

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x000000, 0, 2000 );

    var aspect = window.innerWidth / window.innerHeight;

    camera = new THREE.PerspectiveCamera( 65, aspect, 1, 10000 );

    camera.position.set(0, 50, 130);

    cameraTarget = new THREE.Vector3(0,0,0);

    camera.lookAt( cameraTarget );
    scene.add( camera );


    var cubeSide = 5;
    var cubeGeometry = new THREE.CubeGeometry( cubeSide, cubeSide, cubeSide );

    //material0 = new THREE.MeshBasicMaterial( {vertexColors: THREE.VertexColors} );
    material0 = new THREE.MeshLambertMaterial({
        color: 0xff8800,
        transparent: false,
        specular: 0xffffff,
        shininess: 100
    });

    material1 = new THREE.MeshBasicMaterial( {
        color: 0x33b5e5,
        wireframe: true,
        opacity: 0.0,
        transparent: false
    } );


    var radius = 70;
    var nbSegX = 41,
        nbSegY = 20;

    // container
    ball = new THREE.Mesh(
        new THREE.SphereGeometry( radius, nbSegX, nbSegY ),
        material1
    );
    scene.add(ball);

    var vs = ball.geometry.vertices, v,
        nbVertices = vs.length,
        nbRowsToSkip = 5,
        min = Math.round((nbSegX+1) * nbRowsToSkip),//Math.round(nbSegY *.1)*nbSegX,
        max = nbVertices - min,
        coverage = max-min,
        circumference = 2*Math.PI * radius,
        mesh
    ;

    for( var iv = max-1; iv > min; iv-- ){
        v = vs[iv];
        
        mesh = new THREE.Mesh(
            cubeGeometry.clone(),
            material0.clone()
        );

        mesh.material.color.setHSV(iv/(max-min), 0.5, 0.7);
        mesh.position.set( v.x, v.y, v.z);

        var msg = "",
            nb = Math.sin( (iv/(nbSegX)) * (Math.PI/nbSegY) )
        ;
        /*
        for(var i=nb*10;i>0;i--)
            msg+='.';
        console.log(msg, nb);
        */
        mesh.scale.set(
            circumference/coverage * Math.sin( (iv/(nbSegX)) * (Math.PI/nbSegY) ) * 2,
            circumference/coverage * Math.cos( (iv/(nbSegX)) * (Math.PI/nbSegX) ) * 2,
            1
        );

        mesh.lookAt(scene.position);

        ball.add( mesh );
    }

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 0, 1 );
    scene.add( light );

    try {
        // renderer
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setClearColorHex( 0x000000, 1 );
        renderer.setSize( window.innerWidth, window.innerHeight );
    
        container.appendChild( renderer.domElement );
        has_gl = true;

        window.addEventListener('resize', onWindowResize, false);

        render();
    }
    catch (e) {
        // need webgl
        alert("WebGL is needed!");
        return;
    }

}


function initGui() {

    gui = new xgui({backgroundColor: "#fed980", frontColor: "#bb6900"});

    document.getElementById("gui").appendChild(gui.getDomElement());

    var nbRow = 0, hRow = 15;

    new gui.Label( {x: 100, y: nbRow*hRow, text: "Camera"} );
    var range = 500;

    new gui.Label( {x: 20, y: (++nbRow+1)*hRow, text: "X & Y"});
    var camTrackPad =new gui.TrackPad( {x: 75, y: nbRow*hRow, min: -100, max: 100, value1: camera.position.x, value2: camera.position.y } );
    camTrackPad.value1.bind(camera.position, "x")
    camTrackPad.value2.bind(camera.position, "y");
    nbRow += 5;

    new gui.Label( { x: 20, y: nbRow*hRow, text: "Z"});
    new gui.HSlider( { x: 75, y: nbRow*hRow, value: camera.position.z, min: -range/2, max:range/2 } )
        .value.bind(camera.position, "z");

    nbRow++;
    nbRow++;
    new gui.Label( { x: 20, y: nbRow*hRow, text: "move" } );
    new gui.CheckBox( { x: 75, y: nbRow*hRow, value: autoMove } )
        .value.bind(window, "autoMove");

    nbRow++;
    new gui.Label( { x: 20, y: nbRow*hRow, text: "render" } );
    new gui.CheckBox( { x: 75, y: nbRow*hRow, value: autoRender } )
        .value.bind(window, "autoRender");
}


function onWindowResize() {
    // notify the renderer of the size change
    renderer.setSize( window.innerWidth, window.innerHeight );
    // update the camera
    camera.aspect   = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}


var time, delta, oldTime;

function render() {

    time = new Date().getTime();
    delta = time - oldTime;
    oldTime = time;

    if (isNaN(delta) || delta > 1000 || delta == 0 ) {
        delta = 1000/60;
    }

        if(autoMove){
            ball.rotation.y += delta/1000;
            ball.rotation.x += delta/2000;
        }

    if(autoRender){

        camera.lookAt( cameraTarget );

        if (has_gl) {
            renderer.render( scene, camera );
        }
    }

    requestAnimationFrame( render );
}

    

$(function () {

    initScene();

    initGui();

});