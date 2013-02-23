
var camera, cameraTarget, scene, renderer, gui, controls={};
var loopMove = false, loopRender = true;

var material0, material1, material2,
    force = [2.5,2,2,1.5,2.5,3],
    array = [],
    ball;


function initScene() {

    container = document.getElementById( 'container' );

    scene = new THREE.Scene();
    //scene.fog = new THREE.Fog( 0x000000, 0, 2000 );

    var aspect = window.innerWidth / window.innerHeight;

    camera = new THREE.PerspectiveCamera( 70, aspect, 1, 10000 );

    camera.position.set(0, 50, 130);

    cameraTarget = new THREE.Vector3(0,0,0);

    camera.lookAt( cameraTarget );
    scene.add( camera );


    material0 = new THREE.MeshBasicMaterial( {
        color: 0x33b5e5,
        wireframe: true,
        opacity: 0.0,
        transparent: false
    } );

    material1 = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        transparent: false,
        specular: 0xffffff,
        shininess: 200
    });

    var materials = (function(){
        var a=[];
        for (var i=0; i<6; i++) {
          var img = new Image();
          img.src = 'images/' + i + '.png';
          var tex = new THREE.Texture(img);
          img.tex = tex;

          img.onload = function() {
              this.tex.needsUpdate = true;
          };

          var mat = new THREE.MeshBasicMaterial({color: 0xffffff, map: tex});
          a.push(mat);
        }
        return a;
    })();
    material2 = new THREE.MeshFaceMaterial( materials );

    material3 = new THREE.ShaderMaterial({
        vertexShader:   $('#vertexshader').text(),
        fragmentShader: $('#fragmentshader').text()
    });


    var radius = 70;
    var nbSegX = 41,
        nbSegY = 21;

    // create the blue print
    ball = new THREE.Mesh(
        new THREE.SphereGeometry( radius, nbSegX, nbSegY ),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            vertexColors: THREE.FaceColors
        })
    );
    ball.dynamic = true;
    scene.add(ball);


    // create the play board out of it
    var vs = ball.geometry.vertices,
        fs = ball.geometry.faces, f,
        nbFaces = fs.length,
        nbRowsToSkip = 3,
        min = Math.round((nbSegX) * nbRowsToSkip),
        max = nbFaces - min,
        coverage = max-min,
        circumference = 2*Math.PI * radius,
        mesh
    ;

    blocks = [];

    for( var i = max-1; i > min; i-- ){
        f = fs[i];
        
        var w = ((vs[f.a].distanceTo(vs[f.b]))+(vs[f.c].distanceTo(vs[f.d])))/2,
            h = ((vs[f.a].distanceTo(vs[f.d]))+(vs[f.b].distanceTo(vs[f.c])))/2

        mesh = new THREE.Mesh(
            createCube(w, h, 10 + 5 * Math.random()*0.005),
            ball.material.clone()
        );
        mesh.dynamic = true;
        mesh.position = f.centroid;

        // add some noise
        ['a','b', 'c', 'd'].map(
            function(letter){
                this.dimensions.map(
                    function(dimension){
                        this.vs[this.mf[letter]][dimension] -= -Math.random()*1.25;
                    },
                    this
                );
            },
            {mf: mesh.geometry.faces[4], vs: mesh.geometry.vertices, dimensions: ['x','y','z']}
        );

        mesh.lookAt(scene.position);

        //ball.add( mesh );
        blocks.push(THREE.GeometryUtils.merge(ball.geometry, mesh));

        blocks[blocks.length-1].faces.map(
            function(o){
                o.color.setHex(Math.random() * 0x008800 + 0x008800);
            }
        );
    }
    /*
    blocks.map(function(o,i,a){
        var row=10;
        if(o.mesh.id>=41*row++&&o.mesh.id<41*row){
            var m = o.mesh.material;
                c = m.color.getHSV();
            o.mesh.material.color.setHSV(0.05,c.s,c.v);
        }
    })
    */

    light0 = new THREE.DirectionalLight( 0xffffff );
    light0.position.set( -200, 0, 200 );
    scene.add( light0 );

    light1 = new THREE.DirectionalLight( 0xffffff );
    light1.position.set( 200, 0, 200 );
    scene.add( light1 );

    light2 = new THREE.DirectionalLight( 0xffffff );
    light2.position.set( -200, 0, -200 );
    scene.add( light2 );

    light3 = new THREE.DirectionalLight( 0xffffff );
    light3.position.set( 200, 0, -200 );
    scene.add( light3 );

    try {
        // renderer
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setClearColorHex( 0x000000, 1 );
        renderer.setSize( window.innerWidth, window.innerHeight );
    
        container.appendChild( renderer.domElement );
        has_gl = true;

        window.addEventListener('resize', onWindowResize, false);
    }
    catch (e) {
        // need webgl
        alert("WebGL is needed!");
        return;
    }
}

function createCube(width, height, depth){
    var geo, widthSegments, heightSegments, depthSegments;

    geo = new THREE.Geometry({dynamic: true});

    var scope = geo;

    geo.width = width || 1;
    geo.height = height || 1;
    geo.depth = depth || 1;

    geo.widthSegments = widthSegments || 1;
    geo.heightSegments = heightSegments || 1;
    geo.depthSegments = depthSegments || 1;

    var width_half = geo.width / 2;
    var height_half = geo.height / 2;
    var depth_half = geo.depth / 2;

    buildPlane( 'z', 'y', - 1, - 1, geo.depth, geo.height, width_half, 1 ); // px   RIGHT
    buildPlane( 'z', 'y',   1, - 1, geo.depth, geo.height, - width_half, 1 ); //nx  LEFT
    buildPlane( 'x', 'z',   1,   1, geo.width, geo.depth, height_half, 1 ); //py    TOP
    buildPlane( 'x', 'z',   1, - 1, geo.width, geo.depth, - height_half, 1 ); //ny  BOTTOM
    //buildPlane( 'x', 'y',   1, - 1, geo.width, geo.height, depth_half, 1 ); //pz  FRONT
    buildPlane( 'x', 'y', - 1, - 1, geo.width, geo.height, - depth_half, 1 ); //nz  BACK

    THREE.Geometry.prototype.computeCentroids.call(geo);
    THREE.Geometry.prototype.mergeVertices.call(geo);


    function buildPlane( u, v, udir, vdir, width, height, depth, materialIndex ) {

        var w, ix, iy,
        gridX = scope.widthSegments,
        gridY = scope.heightSegments,
        width_half = width / 2,
        height_half = height / 2,
        offset = scope.vertices.length;

        if ( ( u === 'x' && v === 'y' ) || ( u === 'y' && v === 'x' ) ) {

            w = 'z';

        } else if ( ( u === 'x' && v === 'z' ) || ( u === 'z' && v === 'x' ) ) {

            w = 'y';
            gridY = scope.depthSegments;

        } else if ( ( u === 'z' && v === 'y' ) || ( u === 'y' && v === 'z' ) ) {

            w = 'x';
            gridX = scope.depthSegments;

        }

        var gridX1 = gridX + 1,
        gridY1 = gridY + 1,
        segment_width = width / gridX,
        segment_height = height / gridY,
        normal = new THREE.Vector3();

        normal[ w ] = depth > 0 ? 1 : - 1;

        for ( iy = 0; iy < gridY1; iy ++ ) {

            for ( ix = 0; ix < gridX1; ix ++ ) {

                var vector = new THREE.Vector3();
                vector[ u ] = ( ix * segment_width - width_half ) * udir;
                vector[ v ] = ( iy * segment_height - height_half ) * vdir;
                vector[ w ] = depth;

                scope.vertices.push( vector );

            }

        }

        for ( iy = 0; iy < gridY; iy++ ) {

            for ( ix = 0; ix < gridX; ix++ ) {

                var a = ix + gridX1 * iy;
                var b = ix + gridX1 * ( iy + 1 );
                var c = ( ix + 1 ) + gridX1 * ( iy + 1 );
                var d = ( ix + 1 ) + gridX1 * iy;

                var plane = new THREE.Face4( a + offset, b + offset, c + offset, d + offset );
                plane.normal.copy( normal );
                plane.vertexNormals.push( normal.clone(), normal.clone(), normal.clone(), normal.clone() );
                plane.materialIndex = materialIndex;

                scope.faces.push( plane );
                scope.faceVertexUvs[ 0 ].push( [
                            new THREE.Vector2( ix / gridX, 1 - iy / gridY ),
                            new THREE.Vector2( ix / gridX, 1 - ( iy + 1 ) / gridY ),
                            new THREE.Vector2( ( ix + 1 ) / gridX, 1- ( iy + 1 ) / gridY ),
                            new THREE.Vector2( ( ix + 1 ) / gridX, 1 - iy / gridY )
                        ] );

            }

        }

    }

    return geo;
}


function initGui() {

    gui = new xgui({ width: 200, height: 300 });

    document.getElementById("gui").appendChild(gui.getDomElement());

    var nbRow = 0, hRow = 15;

    nbRow++;
    new gui.Label( { x: 20, y: nbRow*hRow, text: "move" } );
    new gui.CheckBox( { x: 75, y: nbRow*hRow, value: loopMove } )
        .value.bind(window, "loopMove");

    nbRow++;
    new gui.Label( { x: 20, y: nbRow*hRow, text: "render" } );
    new gui.CheckBox( { x: 75, y: nbRow*hRow, value: loopRender } )
        .value.bind(window, "loopRender");

    nbRow++;
    new gui.Label( { x: 20, y: nbRow*hRow, text: "controls" } );
    new gui.CheckBox( { x: 75, y: nbRow*hRow, value: controls.enabled } )
        .value.bind(controls, "enabled");

    nbRow++;
    new gui.Label( {x: 20, y: (++nbRow+1)*hRow, text: "camera"});
    var camTrackPad =new gui.TrackPad( {x: 75, y: nbRow*hRow, min: -100, max: 100, value1: camera.position.x, value2: camera.position.y } );
    camTrackPad.value1.bind(camera.position, "x")
    camTrackPad.value2.bind(camera.position, "y");
    nbRow += 5;

    new gui.Label( { x: 20, y: nbRow*hRow, text: "z:"});
    new gui.HSlider( { x: 75, y: nbRow*hRow, value: camera.position.z, min: -200, max:200 } )
        .value.bind(camera.position, "z");
}

function initControls() {

    controls = new THREE.TrackballControls(camera, container);
    controls.target.set(0, 0, 0);

    controls.noZoom = true;
    controls.noPan = true;

    controls.keys = [65, 83, 68];
}


function onWindowResize() {
    // notify the renderer of the size change
    renderer.setSize( window.innerWidth, window.innerHeight );
    // update the camera
    camera.aspect   = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}


var time, delta, oldTime;

function loop() {

    time = new Date().getTime();
    delta = time - oldTime;
    oldTime = time;

    if (isNaN(delta) || delta > 1000 || delta == 0 ) {
        delta = 1000/60;
    }

    TWEEN.update();

    controls.update();

    if( loopMove ){

        var k = 4000;
        ball.rotation.y += delta/k;
        ball.rotation.x += delta/(2*k);

    }

    if( loopRender ){

        camera.lookAt( cameraTarget );

        if (has_gl) {
            renderer.render( scene, camera );
        }
    }

    requestAnimationFrame( loop );
}

    

$(function () {

    initScene();

    if(typeof renderer == "undefined")
        alert("No renderer ready");

    initGui();

    initControls();

    loop();


    
    // Test Tween
    window.addEventListener( 'keyup', function(event){

        if(event.keyCode == 65){

            blocks.map(function(o,i,a){ if(Math.random()>0.3){

                var f = ball.geometry.faces[o.faces[4].id];
                    c = f.color.getHSV();

                new TWEEN.Tween({ color: f.color, h: 5, s: Math.random()*100, v: c.v })
                    .to({ h:c.h*100, s:c.s*100, c:c.v }, 2000)
                    .easing( TWEEN.Easing.Quartic.Out )
                    .onUpdate( function(){
                        this.color.setHSV(this.h/100, this.s/100, this.v);

                        ball.geometry.colorsNeedUpdate = true;
                    })
                    .start();
            }});

        }

    }, false );
    

});