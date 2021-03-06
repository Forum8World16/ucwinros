var systemVariables = {};
var modelData = {};
var cubeSize = 4;

var container, stats;
var scene = new THREE.Scene();
var camera, controls, renderer;
var raycaster;
var mouse = new THREE.Vector2(), INTERSECTED;
var radius = 100;
var objects = [];
var transformControl;

init();
animate();
function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.x = 30;
    camera.position.y = 100;
    camera.position.z = -30;

    //                controls = new THREE.TrackballControls( camera );
    controls = new THREE.OrbitControls( camera );
    //                controls = new THREE.FirstPersonControls( camera );
    //                controls = new THREE.EditorControls(camera);
    //                controls = new THREE.FlyControls(camera);

    //                controls.movementSpeed = 70;
    //                controls.lookSpeed = 0.05;
    //                controls.noFly = false;
    //                controls.lookVertical = false;


    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;

    //camera.up.set( 0, 1, 0 );

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    
    scene.add( new THREE.AmbientLight( 0x505050 ) );
    var light = new THREE.SpotLight( 0xffffff, 1.5 );
    light.position.set( 80, 200, -50 );
    //light.shadowCameraVisible  = true;
    light.castShadow = true;
    //light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( -20, 100, 30, 1000 ) );

    light.shadow.bias = - 0.00001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;


    //Create a DirectionalLight and turn on shadows for the light
    //                var light = new THREE.DirectionalLight( 0xffffff, 1.5, 10000 );
    //                light.position.set( -200, 1000, 300 ); 			//default; light shining from top
    //                light.castShadow = true;            // default false
    //                light.shadowCameraVisible  = true;

    //Set up shadow properties for the light
    //                light.shadow.mapSize.width = 2048;  // default
    //                light.shadow.mapSize.height = 2048; // default
    //                light.shadow.camera.near = 0.5;       // default
    //                light.shadow.camera.far = 5000      // default


    scene.add( light );

    //add ground plane
    var groundGeometry = new THREE.Mesh(
        new THREE.PlaneGeometry(
            cubeSize*64,
            cubeSize*64,
            64,
            64
        ),
        new THREE.MeshLambertMaterial({
            color: 0x8E8474,
            side: THREE.DoubleSide
        })
    );
    groundGeometry.receiveShadow = true;
    groundGeometry.rotateOnAxis(new THREE.Vector3(1,0,0),Math.PI/2);
    groundGeometry.z= -2;

    scene.add(groundGeometry);

    var helper = new THREE.GridHelper( 1000, 250 );
    helper.position.y = 0.1;
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    scene.add( helper );

    var axis = new THREE.AxisHelper();
    axis.position.set( -500, -500, -500 );
    scene.add( axis );

    var geometry = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
    //                for ( var i = 0; i < 200; i ++ ) {
    //                    var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0x00ffff } ) );
    //                    object.position.x = Math.round(Math.random() * 10 - 5)*cubeSize;
    //                    object.position.y = Math.round(Math.random() * 6 - 3)*cubeSize;
    //                    object.position.z = Math.round(Math.random() * 8 - 4)*cubeSize;
    //                    //object.rotation.x = Math.random() * 2 * Math.PI;
    //                    //object.rotation.y = Math.random() * 2 * Math.PI;
    //                    //object.rotation.z = Math.random() * 2 * Math.PI;
    //                    //object.scale.x = Math.random() * 2 + 1;
    //                    //object.scale.y = Math.random() * 2 + 1;
    //                    //object.scale.z = Math.random() * 2 + 1;
    //                    object.castShadow = true;
    //                    object.receiveShadow = true;
    //                    scene.add( object );
    //                    objects.push( object );
    //                }


    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.sortObjects = false;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild( renderer.domElement );
    var dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
    dragControls.addEventListener( 'dragstart', function ( event ) { controls.enabled = false; } );
    dragControls.addEventListener( 'dragend', function ( event ) { 
        console.log(event);
        var tempObj = event['object'];
        movModel(tempObj.userData,tempObj.position.x,tempObj.position.y,tempObj.position.z);
        controls.enabled = true;
    } );
    
    /*
    var info = document.createElement( 'div' );
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = 'ProtoMode Web Editor';
    container.appendChild( info );
    */

    /*
    stats = new Stats();
    container.appendChild( stats.dom );
    */

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener('keyup', handleKeyUp, false);
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
function animate() {
    requestAnimationFrame( animate );
    render();
    //stats.update();
}
function handleKeyUp(event) {
    if (event.keyCode === 68) { //d
        //delete
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( objects );
        if ( intersects.length > 0 ) {
            delModel(intersects[ 0 ].object.userData);
        }
    }
    if (event.keyCode === 65) { //a
        //add
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( scene.children);
        if ( intersects.length > 0 ) {
            addModel(snap(intersects[ 0 ].point.x),snap(-intersects[ 0 ].point.z),snap(intersects[ 0 ].point.y));
        }
    }
    if (event.keyCode === 67) { //c
        //change color
    }
}

function render() {
    controls.update();

    // find intersections
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( objects);//scene.children );
    if ( intersects.length > 0 ) {
        if ( INTERSECTED != intersects[ 0 ].object ) {
            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );
        }
    } else {
        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
    }

    renderer.render( scene, camera );
}









//vertical -14 to 0 degrees with 8 segments is 2 degrees
//horizontal is -45 to +45 with 128 segments is 0.01236847501413304424591591883181 radians
//                                              0.70866141732283464566929133858268 degrees
let _lidarRayCount = 91;
let _lidarLayerCount = 8;
let _lidarDistances = [];
let _lidarDevice = new THREE.Group();

function createLidarDevice() {
    _lidarDevice.position.y = 2;
    for(v=0;v<_lidarLayerCount;v++){
        let colorString = "hsl("+((360+80-v*30)%360)+",100%,50%)";
        let color = new THREE.Color(colorString);
        //let material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
        let material = new THREE.LineBasicMaterial( { 'color': color } );
        let lidarLayer = new THREE.Group();
        //_lidarDistances.push([]);
        let vAngle = -v*(14/360)*2*Math.PI/_lidarLayerCount;
        let vCosine = Math.cos(vAngle);
        for(i=0;i<_lidarRayCount;i++){
            let geometry = new THREE.Geometry();
            let hAngle = i*0.5*Math.PI/(_lidarRayCount-1)-0.25*Math.PI;
            geometry.vertices.push(new THREE.Vector3( 0.5*Math.cos(hAngle)*vCosine, 0.5*Math.sin(vAngle), 0.5*Math.sin(hAngle)*vCosine) );
            geometry.vertices.push(new THREE.Vector3( 5.0*Math.cos(hAngle)*vCosine, 5.0*Math.sin(vAngle), 5.0*Math.sin(hAngle)*vCosine) );
            lidarLayer.add(new THREE.Line( geometry, material ));
        }
        _lidarDevice.add(lidarLayer);
    }
    scene.add( _lidarDevice );
}
createLidarDevice();

function updateLidarDevice(vId,dists){
    let lidarLayer = _lidarDevice.children[vId-1].children;
    console.dir(lidarLayer);
    
    let vAngle = -(vId-1)*(14/360)*2*Math.PI/_lidarLayerCount;
    let vCosine = Math.cos(vAngle);
    for(i=0;i<_lidarRayCount;i++){
        let geometry = new THREE.Geometry();
        let hAngle = i*0.5*Math.PI/(_lidarRayCount-1)-0.25*Math.PI;
        lidarLayer[i].geometry.vertices[1].x = dists[i]*Math.cos(hAngle)*vCosine;
        lidarLayer[i].geometry.vertices[1].y = dists[i]*Math.sin(vAngle);
        lidarLayer[i].geometry.vertices[1].z = dists[i]*Math.sin(hAngle)*vCosine;
        lidarLayer[i].geometry.vertices.needsUpdate = true;
        lidarLayer[i].geometry.verticesNeedUpdate = true;
    }
}

var socket = io.connect('/');

socket.on('connect',function(){
    socket.emit('subscribe',"webclients");
});

socket.on('lidar2',function(data){
    console.dir(data);
    updateLidarDevice(data['vId'],data['dists']);
});


// socket.on('lidar',function(data){
//     console.dir(data);
// });


socket.on('addModel',function(data){
    addCube(data.modelId,data.x,data.y,data.z,data.s,data.r,data.g,data.b);
});

function addCube(id,ix,iy,iz,is,ir,ig,ib){
    if(modelData.hasOwnProperty(id)){
        //then first delete current model in scene
        console.log('deleting existing model ',id);
        var tempObj = scene.getObjectByProperty('userData',id);
        //objects.remove(tempObj);

        objects.splice( objects.indexOf(tempObj),1);
        scene.remove(tempObj);
    }
    console.log('add model ',id);
    var tempGeom = new THREE.BoxGeometry( is, is, is );
    var tempObj = new THREE.Mesh( tempGeom, new THREE.MeshLambertMaterial( { color: new THREE.Color( ir/256.0, ig/256.0, ib/256.0 ) } ) );
    tempObj.position.x = ix;
    tempObj.position.y = iz;
    tempObj.position.z = -iy;
    tempObj.castShadow = true;
    tempObj.receiveShadow = true;
    tempObj.userData = id;
    scene.add( tempObj );
    objects.push( tempObj );
    modelData[id] = [ix,iy,iz,is,ir,ig,ib];
}

socket.on('delModel',function(data){
    console.log('delete model ',data.modelId);
    var tempObj = scene.getObjectByProperty('userData',data.modelId);
    objects.remove( tempObj );
    scene.remove(tempObj);
});

socket.on('movModel',function(data){
    console.log('move model ',data.modelId);
    var tempObj = scene.getObjectByProperty('userData',data.modelId);
    console.log(tempObj);
    tempObj.position.x = data.x;
    tempObj.position.y = data.z;
    tempObj.position.z = -data.y;
});

socket.on('syncSystemVariables',function(data){
    Object.keys(data).forEach(function(key) {
        systemVariables[key] = data[key];
    });
});

socket.on('syncModelData',function(data){
    Object.keys(data).forEach(function(key) {
        modelData[key] = data[key];
    });
    //TODO: rebuild scene from scratch
});

//TODO: use somehow
function addModel(ix,iy,iz){
    //create cube at xyz with current id
    addCube(systemVariables['availableId'],ix,iy,iz,4,0,32,99);

    //emit function to add model to synchronize
    modelData[systemVariables['availableId']]=[ix,iy,iz,4,0,32,99];
    socket.emit('addModel',{
        'modelId':systemVariables['availableId'],
        'x':ix,
        'y':iy,
        'z':iz,
        's':4,
        'r':0,
        'g':32,
        'b':99
    });

    //increment id number available and emit new id number to synchronize
    systemVariables['availableId'] = systemVariables['availableId']+1;
    socket.emit('syncSystemVariables',systemVariables);
};

//TODO: use somehow
function delModel(id){
    //emit command to remove from all clients to synchronize
    socket.emit('delModel',{
        'modelId':id
    });

    //delete selected object from scene
    var tempObj = scene.getObjectByProperty('userData',id);
    scene.remove(tempObj);

    //remove id from modelData
    delete modelData[id];
};

function movModel(id,ix,iy,iz){
    console.log(id);
    console.dir(modelData);

    //get selected object id
    var tempObj = scene.getObjectByProperty('userData',id);

    //snap Model
    ix = snap(ix);
    iy = snap(iy);
    iz = snap(iz);
    tempObj.position.x = ix;
    tempObj.position.y = iy;
    tempObj.position.z = iz;

    //update modelData xyz for object id


    modelData[id][0]=ix;
    modelData[id][1]=iz;
    modelData[id][2]=-iy;

    //emit 'movModel' with data
    socket.emit('movModel',{
        'modelId':id,
        'x':ix,
        'y':-iz,
        'z':iy,
        's':modelData[id][3],
        'r':modelData[id][4],
        'g':modelData[id][5],
        'b':modelData[id][6]
    });
};


function snap(x){
    return (Math.round(x/cubeSize))*cubeSize;
};