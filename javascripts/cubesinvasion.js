
var camera, cameraTarget, scene, renderer, gui, controls={},
    player0, 
    nbSegX = 40,
    nbSegY = 20
;
var loopMove = false, loopRender = true;

var material0, material1, material2,
    force = [2.5,2,2,1.5,2.5,3],
    array = [],
    ball;

THREE.Vector3.Zero = new THREE.Vector3( 0, 0, 0 );



function initScene() {

    scene = new THREE.Scene();
    //scene.fog = new THREE.Fog( 0x000000, 0, 2000 );

    var aspect = window.innerWidth / window.innerHeight;

    camera = new THREE.PerspectiveCamera( 70, aspect, 1, 10000 );

    camera.position.set(0, 50, 130);

    cameraTarget = new THREE.Vector3(0,0,0);

    camera.lookAt( cameraTarget );
    scene.add( camera );

    // Wireframe
    material0 = new THREE.MeshBasicMaterial( {
        color: 0x33b5e5,
        wireframe: true,
        opacity: 0.0,
        transparent: false
    } );

    // Lambert
    /*
    material1 = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        specular: 0xffffff,
        shininess: 200,
        vertexColors: THREE.FaceColors
    });
    */

    textureCube = function(){

        var r = "../images/";
        var urls = [
            r + "posz.jpg",
            r + "posz.jpg",
            r + "posz.jpg",
            r + "posz.jpg",
            r + "posz.jpg",
            r + "posz.jpg"
        ];
        var t = THREE.ImageUtils.loadTextureCube( urls );
        t.format = THREE.RGBFormat;

        return t;
    };
    material1 = new THREE.MeshPhongMaterial( { ambient: 0xffffff, color: 0xffffff,
        specular: 0x888888, shininess: 30, envMap:textureCube(), 
        combine: THREE.MixOperation, reflectivity: 0.35, vertexColors: THREE.VertexColors
    });

    // Basic
    material2 = new THREE.MeshBasicMaterial( {
        color: 0xffffff,
        vertexColors: THREE.FaceColors
    } );

    // from GLSL
    material3 = new THREE.ShaderMaterial({
        vertexShader:   document.getElementById('vertexshader').innerHTML,
        fragmentShader: document.getElementById('fragmentshader').innerHTML
    });


    var radius = 70,
        nbRowsToSkip = 3
    ;

    // create the blue print
    // ball = THREE.SceneUtils.createMultiMaterialObject(
    ball = new THREE.Mesh(
        new THREE.SphereGeometry( radius, nbSegX, nbSegY ),
        material1.clone()
    );
    ball.geometry.segmentsWidth = nbSegX;
    ball.geometry.segmentsHeight = nbSegY;
    ball.castShadow = false;
    ball.receiveShadow = true;
    ball.dynamic = true;
    scene.add(ball);


    // create the play board out of it
    var vs = ball.geometry.vertices,
        fs = ball.geometry.faces, f,
        w, h, f, hex,
        nbFaces = fs.length,
        min = Math.round((nbSegX) * nbRowsToSkip),
        max = nbFaces - min,
        coverage = max-min,
        circumference = 2*Math.PI * radius,
        mesh
    ;

    blocks = [];

    for( var i = max-1; i >= min; i-- ){

        f = fs[i];
        
        w = ((vs[f.a].distanceTo(vs[f.b]))+(vs[f.c].distanceTo(vs[f.d])))/2;
        h = ((vs[f.a].distanceTo(vs[f.d]))+(vs[f.b].distanceTo(vs[f.c])))/2;

        mesh = new THREE.Mesh(
            createCube(w, h, 10 + 5 * Math.random()*0.005, 2),
            ball.material
        );
        mesh.castShadow = false;
        mesh.receiveShadow = false;

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

        hex = Math.random() * 0x008800 + 0x008800;
        mesh.geometry.faces.map(
            function(f){
                f.color.setHex(hex);
            }
        );

        //ball.add( mesh );

        blocks.push( {
            mesh: THREE.GeometryUtils.merge(ball.geometry, mesh),
            state: 0
        });
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
    light0.castShadow = false;
    light0.shadowCameraVisible = false;
    light0.shadowCameraNear = 170;
    light0.shadowCameraFar = 400;
    light0.shadowCameraLeft = -120;
    light0.shadowCameraRight = 120;
    light0.shadowCameraTop = 120;
    light0.shadowCameraBottom = -120;
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

        renderer.shadowMapEnabled = false;
        renderer.shadowMapSoft = true;
    
        container = document.getElementById( 'container' );

        container.appendChild( renderer.domElement );
        has_gl = true;

        window.addEventListener('resize', onWindowResize, false);

        initPlayers();

        return;
    }
    catch (e) {
        // need webgl
        alert("WebGL is needed!");
        return e;
    }

    function createCube(width, height, depth, materialIndex){
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

        buildPlane( 'z', 'y', - 1, - 1, geo.depth, geo.height, width_half, materialIndex ); // px   RIGHT
        buildPlane( 'z', 'y',   1, - 1, geo.depth, geo.height, - width_half, materialIndex ); //nx  LEFT
        buildPlane( 'x', 'z',   1,   1, geo.width, geo.depth, height_half, materialIndex ); //py    TOP
        buildPlane( 'x', 'z',   1, - 1, geo.width, geo.depth, - height_half, materialIndex ); //ny  BOTTOM
        //buildPlane( 'x', 'y',   1, - 1, geo.width, geo.height, depth_half, materialIndex ); //pz  FRONT
        buildPlane( 'x', 'y', - 1, - 1, geo.width, geo.height, - depth_half, materialIndex ); //nz  BACK

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
}

function initPlayers(){
    Player = function(){

        this.mesh = new THREE.Mesh(
            new THREE.CubeGeometry(1, 30, 1, 1, 1, 1),
            new THREE.MeshBasicMaterial( { color: 0xff1111 } )
        );

        ball.add(this.mesh);

        this.ballFaceId = 110;
        this.prevBallFaceId = 0;
        this.prevBallFaceColor = new THREE.Color(0x008800);

        this.moveTo = function(faceId){
            var bf = ball.geometry.faces[faceId];

            new TWEEN.Tween( this.mesh.position )
                .to( bf.centroid , 400)
                .easing( TWEEN.Easing.Quintic.Out )
                .onUpdate( function(){
                    player0.mesh.position = this;
                })
                .start()
            ;

            //this.prevBallFaceColor = ball.geometry.faces[blocks[this.faceId].mesh.faces[4]].color;

            blocks[faceId].mesh.faces.map(
                function(f){
                    ball.geometry.faces[f.id].color.setHSV(0, 0.93, 1);
                }
            );
            ball.geometry.colorsNeedUpdate = true;

            this.mesh.position = bf.centroid;
            this.mesh.rotation = 
                (new THREE.Vector3(0, 1, 0) )
                .cross( bf.normal )
            ;

            this.ballFaceId = faceId;
        };
    };

    player0 = new Player();

    player0.moveTo( 166 );

}


function initGui() {

    gui = new dat.GUI({autoPlace: false});


    gui.add(player0, "ballFaceId", 0, nbSegX*nbSegY)
        .listen()
        .onChange(function(v){
            player0.moveTo(v);
        })
    ;


    document.getElementById("gui").appendChild(gui.domElement);

/*
    gui = new xgui({ width: 200, height: 300 });

    document.getElementById("gui").appendChild(gui.getDomElement());

    var nbRow = 0, hRow = 15;

    nbRow++;
    new gui.Label( { x: 20, y: nbRow*hRow, text: "move" } );
    new gui.CheckBox( { x: 75, y: nbRow*hRow, selected: loopMove } )
        .value.bind(window, "loopMove");

    nbRow++;
    new gui.Label( { x: 20, y: nbRow*hRow, text: "render" } );
    new gui.CheckBox( { x: 75, y: nbRow*hRow, selected: loopRender } )
        .value.bind(window, "loopRender");

    nbRow++;
    new gui.Label( { x: 20, y: nbRow*hRow, text: "controls" } );
    new gui.CheckBox( { x: 75, y: nbRow*hRow, selected: controls.enabled } )
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
*/
}

function initControls() {

    controls = new THREE.TrackballControls(camera, container);
    controls.target.set(0.0, 0.0, 0.1);
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

    

window.onload = function () {

    if( !( typeof initScene() === "undefined" ) ) return;

    initGui();

    initControls();

    loop();

    var tweenEntrance0 = new TWEEN.Tween(ball.rotation)
        .to(new THREE.Vector3( 0.5, 0.0,-0.2 ), 1000)
        .easing( TWEEN.Easing.Bounce.Out )
        .start()
    ;


    
    // Test Tween
    window.addEventListener( 'keydown', function(e){

        //console.log(e.keyCode);
        
        switch(e.keyCode){

            case 69:
                blocks.map(function(o,i,a){ if(Math.random()>0.3){

                    var f = ball.geometry.faces[o.mesh.faces[4].id];
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
                break;
        
            case 65:
                player0.moveTo( player0.ballFaceId - 1 );
                break;
        
            case 68:
                player0.moveTo( player0.ballFaceId + 1 );
                break;
        
            case 87:
                player0.moveTo( player0.ballFaceId - ball.geometry.segmentsWidth );
                break;
        
            case 83:
                player0.moveTo( player0.ballFaceId + ball.geometry.segmentsWidth );
                break;

        }

    }, false );

};