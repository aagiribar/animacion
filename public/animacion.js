import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

// Elementos de la simulación
let scene, camera, renderer;
let textureLoader;
let controls;
const clock = new THREE.Clock();

// Elementos de la interfaz de usuario
const gui = new GUI();
let UIelements;
let gameFolder;
let placeSelector;
let endButton;

// Mundo físico con Ammo
let physicsWorld;
const gravityConstant = 7.8;
let collisionConfiguration;
let dispatcher;
let broadphase;
let solver;
const margin = 0.05

const pos = new THREE.Vector3();
const quat = new THREE.Quaternion();

//Variables temporales para actualizar transformación en el bucle
let transformAux1;
let tempBtVec3_1;

// Variables para almacenar los objetos de la simulación
let rigidBodies = [];
let cubes = [];
let balls = [];

// Variables para contar cuantos elementos hay en la plataforma
let cubesOnFloor = 0;
let ballsOnFloor = 0;

// Variable para almacenar el objeto que representa al suelo
let floor;

// Raycaster
const mouseCoords = new THREE.Vector2()
let raycaster = new THREE.Raycaster();

// Material para las bolas lanzadas
const ballMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });

//Inicialización ammo
Ammo().then(function (AmmoLib) {
    Ammo = AmmoLib;
  
    init();
    animationLoop();
});

// Elementos de inforación en pantalla
let info;
let infoCubes, infoBalls;
let infoGame;

// Variables para controlar el juego
let playing = false;
let gamePhase;

let nCubes, nBalls;

// Objeto que almacena los uniforms para los fragment shaders
let uniforms = {
    u_time: {
        type: "f",
        value: 1.0
    },
    u_resolution: {
        type: "v2",
        value: new THREE.Vector2()
    },
    u_mouse: {
        type: "v2",
        value: new THREE.Vector2()
    }
}

// Función que inicializa la simulación
function init() {
    // Elementos gráficos
    initGraphics();
    // Elementos del mundo físico
    initPhysics();
    // Objetos
    createObjects();
    // Interacción
    initInput();
    // Información en pantalla
    initInfo();
    // Interfaz de usuario
    initGUI();
}

// Función que inicializa los elementos gráficos
function initGraphics() {
    // Creación de la escena
    scene = new THREE.Scene();

    // Creación de la cámara
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    scene.background = new THREE.Color(0xbfd1e5);
    camera.position.set(-14, 8, 16);

    // Creación del renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Almacena el valor de la resolución en uniforms por primera vez
    saveResolutionToUniforms();

    // TextureLoader para cargar texturas
    textureLoader = new THREE.TextureLoader();

    // Creación de controles de tipo orbital
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2, 0);
    controls.update();

    //Luces
    const ambientLight = new THREE.AmbientLight(0x707070);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-10, 18, 5);
    light.castShadow = true;
    const d = 14;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;

    light.shadow.camera.near = 2;
    light.shadow.camera.far = 50;

    light.shadow.mapSize.x = 1024;
    light.shadow.mapSize.y = 1024;

    scene.add(light);

    //Redimensión de la ventana
    window.addEventListener("resize", onWindowResize);
}

// Función que inicializa las físicas de la simulación
function initPhysics() {
    // Colisiones
    collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    // Gestor de colisiones convexas y cóncavas
    dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    // Colisión fase amplia
    broadphase = new Ammo.btDbvtBroadphase();
    // Resuelve resricciones de reglas físicas como fuerzas, gravedad, etc.
    solver = new Ammo.btSequentialImpulseConstraintSolver();
    // Crea en mundo físico
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(
        dispatcher,
        broadphase,
        solver,
        collisionConfiguration
    );
    // Establece gravedad
    physicsWorld.setGravity(new Ammo.btVector3(0, -gravityConstant, 0));

    transformAux1 = new Ammo.btTransform();
    tempBtVec3_1 = new Ammo.btVector3(0, 0, 0);
}

// Función que crea los objetos iniciales de la simulación
function createObjects() {
    // Suelo
    pos.set(0, -0.5, 0);
    quat.set(0, 0, 0, 1);

    // Creación del suelo
    floor = createBoxWithPhysics(
        40,
        1,
        40,
        0,
        pos,
        quat,
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    floor.receiveShadow = true;

    // Texturización del suelo
    textureLoader.load(
        "grid.png",
        function(texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(40, 40);
            floor.material.map = texture;
            floor.material.needsUpdate = true;
        }
    );
    cubes.push(floor);
}

// Función que inicializa los elementos de la interfaz de usuario
function initGUI() {
    // Objeto que almacena los elementos de la interfaz de usuario
    UIelements = {
        "Disparo con botón izquierdo": false,
        "Colocar cubos": true,
        "Número de cubos": 10,
        "Dificultad": "Fácil",
        "Empezar juego": startGame,
        "Terminar juego": endGame
    }

    // Selector para seleccionar si se colocan cubos o se lanzan bolas
    placeSelector = gui.add(UIelements, "Colocar cubos", true);

    // Selector para seleccioanar si se puede disparar/colocar cubos con el botón izquierdo del ratón
    gui.add(UIelements, "Disparo con botón izquierdo", false);

    // Botón para terminar el juego
    endButton = gui.add(UIelements, "Terminar juego");
    endButton.hide();   // Oculto desde el principio

    // Carpeta que contiene elementos de la UI para configurar el juego
    gameFolder = gui.addFolder("Juego");
    // Selector numérico para seleccionar el número de cubos que se deben colocar
    gameFolder.add(UIelements, "Número de cubos", 10, 30, 1);
    // Selector de dificultad del juego
    gameFolder.add(UIelements, "Dificultad", ["Fácil", "Normal", "Dificil"]);
    // Botón para empezar el juego
    gameFolder.add(UIelements, "Empezar juego");
}

// Función para inicializar los elementos de interacción de la simulación
function initInput() {
    // EventListener para gestionar las pulsaciones con el ratón
    document.addEventListener("mousedown", function(event) {
        // Se dispara según el modo de disparo seleccioando
        if ((event.button == 2 && !UIelements["Disparo con botón izquierdo"] || UIelements["Disparo con botón izquierdo"])) {
            //Coordenadas del puntero
            mouseCoords.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );
    
            // Intersección, define rayo
            raycaster.setFromCamera(mouseCoords, camera);

            // Se detectan las intersecciones con el rayo
            const intersecciones = raycaster.intersectObjects(cubes);

            // Se coloca un cubo en la posición de la plataforma pulsada
            if (UIelements["Colocar cubos"]) {
                if (intersecciones.length > 0) {
                    
                    // Se selecciona un color aleatorio para el cubo
                    var c = new THREE.Color();
                    c.set( THREE.MathUtils.randInt(0, Math.pow(2, 24) - 1));

                    pos.set(intersecciones[0].point.x, intersecciones[0].point.y + 2, intersecciones[0].point.z);
                    quat.set(0, 0, 0, 1);
                    
                    // Se crea el cubo de dimensiones y masa aleatorias
                    let object = createBoxWithPhysics(
                        THREE.MathUtils.randInt(1, 4), 
                        THREE.MathUtils.randInt(1, 4), 
                        THREE.MathUtils.randInt(1, 4), 
                        THREE.MathUtils.randInt(1, 2), 
                        pos, 
                        quat, 
                        new THREE.ShaderMaterial({
                            uniforms: uniforms, 
                            fragmentShader: getCubeShader()
                        })
                    );
                    object.castShadow = true;
                    object.receiveShadow = true;
                    cubes.push(object);
                }
            }
            // Se dispara una bola
            else {
                if (!playing || nBalls > 0) {
                    // Crea bola como cuerpo rígido y la lanza según coordenadas de ratón
                    const ballMass = 35;
                    const ballRadius = 0.4;
                    const ball = new THREE.Mesh(
                        new THREE.SphereGeometry(ballRadius, 14, 10),
                        ballMaterial
                    );
                    ball.castShadow = true;
                    ball.receiveShadow = true;
    
                    //Ammo
                    //Estructura geométrica de colisión esférica
                    const ballShape = new Ammo.btSphereShape(ballRadius);
                    ballShape.setMargin(margin);
                    pos.copy(raycaster.ray.direction);
                    pos.add(raycaster.ray.origin);
                    quat.set(0, 0, 0, 1);
                    const ballBody = createRigidBody(ball, ballShape, ballMass, pos, quat);

                    pos.copy(raycaster.ray.direction);
                    pos.multiplyScalar(24);
                    ballBody.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z));

                    balls.push(ball);

                    if (playing) {
                        nBalls--;
                    }
                }
            }
        }
    });
}

// Función para inicializar los elementos de información en pantalla
function initInfo() {
    info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '30px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.style.color = '#000';
    info.style.fontWeight = 'bold';
    info.style.backgroundColor = 'transparent';
    info.style.zIndex = '1';
    info.style.fontFamily = 'Monospace';
    document.body.appendChild(info);

    infoCubes = document.createElement("div");
    infoCubes.innerHTML = "Cubos en la plataforma: " + cubesOnFloor;
    info.appendChild(infoCubes);

    infoBalls = document.createElement("div");
    infoBalls.innerHTML = "Bolas en la plataforma: " + ballsOnFloor;
    info.appendChild(infoBalls);

    infoGame = document.createElement("div");
}

// Función para crear un cubo con físicas
// sx, sy, sz: Dimensiones del cubo
// mass: Masa del cubo
// pos: Vector con la posición del cubo
// quat: Cuaternión para determinar la rotación del cubo
// material: Material del cubo
function createBoxWithPhysics(sx, sy, sz, mass, pos, quat, material) {
    // Se crea el cubo como objeto de Three.js
    const object = new THREE.Mesh(
        new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1),
        material
    );

    // Estructura geométrica de colisión
    const shape = new Ammo.btBoxShape(
        new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5)
    );
    // Margen para colisiones
    shape.setMargin(margin);

    createRigidBody(object, shape, mass, pos, quat)

    return object;

}

// Función que crea un objeto rígido con físicas
// object: Objeto de Three.js
// physicsShape: Forma física de Ammo
// mass: Masa del objeto
// pos: Vector con la posición del objeto
// quat: Cuaternión para determinar la rotación del objeto
// vel: Velocidad del objeto
// angVel: Velocidad angular del objeto
function createRigidBody(object, physicsShape, mass, pos, quat, vel, angVel) {
    //Posición
    if (pos) {
        object.position.copy(pos);
    } else {
        pos = object.position;
    }

    //Cuaternión, es decir orientación
    if (quat) {
        object.quaternion.copy(quat);
    } else {
        quat = object.quaternion;
    }

    //Matriz de transformación
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    const motionState = new Ammo.btDefaultMotionState(transform);
    
    //Inercia inicial y parámetros de rozamiento, velocidad
    const localInertia = new Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);
    
    //Crea el cuerpo
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
        mass,
        motionState,
        physicsShape,
        localInertia
    );
    const body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(0.5);

    if (vel) {
        body.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z));
    }

    if (angVel) {
        body.setAngularVelocity(new Ammo.btVector3(angVel.x, angVel.y, angVel.z));
    }

    //Enlaza primitiva gráfica con física
    object.userData.physicsBody = body;
    object.userData.collided = false;

    scene.add(object);
    //Si tiene masa
    if (mass > 0) {
        rigidBodies.push(object);
        // Disable deactivation
        body.setActivationState(4);
    }
    //Añadido al universo físico
    physicsWorld.addRigidBody(body);

    return body;
}

// Función a la que se llama cuando ocurre una redimensión de la ventana
function onWindowResize() {
    // Se modifica la relación de aspecto de la camara
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  
    // Se actualiza el tamaño del render
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Se almacena la resolución de la ventana en el objeto uniforms
    saveResolutionToUniforms();
}

// Evento de ratón
document.onmousemove = function (evt) {
    uniforms.u_mouse.value.x = evt.pageX / window.innerWidth;
    uniforms.u_mouse.value.y = evt.pageY / window.innerHeight;
};

function saveResolutionToUniforms() {
    uniforms.u_resolution.value.x = renderer.domElement.width;
    uniforms.u_resolution.value.y = renderer.domElement.height;
}

// Función que actualiza los contadores de objetos sobre la plataforma
function updateObjectsOnFloor() {
    // Actualización del contador de cubos
    cubesOnFloor = 0;
    for (let i = 1; i < cubes.length; i++) {
        const cubo = cubes[i];
        
        if(cubo.position.y > -1) {
            cubesOnFloor++;
        }
    }

    // Actualización del contador de bolas
    ballsOnFloor = 0;
    for(let i = 0; i < balls.length; i++) {
        const bola = balls[i];

        if(bola.position.y > -1) {
            ballsOnFloor++;
        }
    }
    
    // Se actualiza la información en pantalla
    updateInfo();
}

// Función que actualiza los elementos de información en pantalla relativos a los objetos situados sobre la plataforma
function updateInfo() {
    infoCubes.innerHTML = "Cubos en la plataforma: " + cubesOnFloor;
    infoBalls.innerHTML = "Bolas en la plataforma: " + ballsOnFloor;
}

// Función que inicializa el juego
function startGame() {
    // Se esconden algunos elementos de la interfaz de usuario
    gameFolder.hide();
    placeSelector.hide();

    // Se indica que se está jugando
    playing = true;
    // Se especifica que el juego se encuentra en la primera fase del juego
    gamePhase = 0;
    // Se configura la simulación para colocar cubos
    UIelements["Colocar cubos"] = true;
    // Se cambia el color del elemento de información a negro
    infoGame.style.color = "#000";

    // Se obtiene el número de cubos seleccionados en la UI
    nCubes = UIelements["Número de cubos"];

    // Si en la plataforma se encuentran más cubos de los seleccionados
    // se juega con ese número de cubos
    if (cubesOnFloor > nCubes) {
        nCubes = cubesOnFloor;
    }

    // Se configura la dificulatad seleccionada
    switch (UIelements["Dificultad"]) {
        case "Fácil":
            nBalls = Math.floor(nCubes * 0.75);
            break;
        case "Normal":
            nBalls = Math.floor(nCubes * 0.50);
            break;
        case "Dificil":
            nBalls = Math.floor(nCubes * 0.33);
            break;
        default:
            nBalls = Math.floor(nCubes * 0.75);
            break;
    };

    info.appendChild(infoGame);
}

// Función que finaliza el juego
function endGame() {
    // Se indica que ya no se está jugando
    playing = false;
    // Se esconde el botón de terminar juego
    endButton.hide();

    // Se actualizan y muestran los elementos de la UI que estaban ocultos
    placeSelector.updateDisplay();
    placeSelector.show();
    gameFolder.show();
}

// Función que comprueba el estado del juego
function checkGame() {
    // Fase inicial: colocación de cubos
    if (gamePhase == 0) {
        // Se muestran cuantos cubos faltan por colocar
        infoGame.innerHTML = "Cubos pendientes de colocar: " + (nCubes - cubesOnFloor);
        if ((nCubes - cubesOnFloor) <= 0) {
            // Si se han colocado todos los cubos, avanza a la siguiente fase
            gamePhase = 1;
            UIelements["Colocar cubos"] = false;
        }
    }
    // Fase intermedia: lanzamiento de bolas
    else if (gamePhase == 1) {
        // Se muestran cuantas bolas le quedan al jugador
        infoGame.innerHTML = "Bolas disponibles: " + nBalls;

        if((nBalls <= 0 && ballsOnFloor == 0) || cubesOnFloor == 0) {
            // Si ya no hay bolas disponibles ni están sobre la plataforma o
            // no quedan cubos en la plataforma,
            // se avanza a la siguiente fase
            gamePhase = 2;
        }
    }
    // Fase final: fin del juego
    else if(gamePhase == 2) {
        // Se muestra el botón de terminar juego
        endButton.show();

        // Si no hay cubos en la plataforma el jugador gana
        if (cubesOnFloor == 0) {
            infoGame.innerHTML = "Has ganado";
            infoGame.style.color = "green";
        }
        // Se hay cubos en la plataforma el jugador pierde
        else {
            infoGame.innerHTML = "Has perdido";
            infoGame.style.color = "red";
        }
    }
}

function getCubeShader() {
    return `
    #ifdef GL_ES
    precision mediump float;
    #endif

    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;

    void main() {
	    vec2 st = gl_FragCoord.xy/u_resolution;
	    gl_FragColor = vec4(st.x,st.y,0.0,1.0);
    }
    `
}

// Bucle principal de la aplicación
function animationLoop() {
    requestAnimationFrame(animationLoop);

    // Incrementa el tiempo
    uniforms.u_time.value += 0.005;

    // Se actualiza el estado de los objetos físicos
    const deltaTime = clock.getDelta();
    updatePhysics(deltaTime);
    // Se actualizan los contadores de objetos encima de la plataforma
    updateObjectsOnFloor();

    // Si se está jugando se comprueba el estado del juego
    if(playing) {
        checkGame();
    }

    // Se renderiza la escana
    renderer.render(scene, camera);
}

// Función que actualiza las físicas de la simulación
// deltaTime: Diferencia de tiempo con respecto a la actualización anterior
function updatePhysics(deltaTime) {
    // Avanza la simulación en función del tiempo
    physicsWorld.stepSimulation(deltaTime, 10);
  
    // Actualiza cuerpos rígidos
    for (let i = 0, il = rigidBodies.length; i < il; i++) {
      const objThree = rigidBodies[i];
      const objPhys = objThree.userData.physicsBody;
      //Obtiene posición y rotación
      const ms = objPhys.getMotionState();
      //Actualiza la correspondiente primitiva gráfica asociada
      if (ms) {
        ms.getWorldTransform(transformAux1);
        const p = transformAux1.getOrigin();
        const q = transformAux1.getRotation();
        objThree.position.set(p.x(), p.y(), p.z());
        objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
  
        objThree.userData.collided = false;
      }
    }
  }