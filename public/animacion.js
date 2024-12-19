import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

// Elementos de la simulación
let escena, camara, renderer;
let textureLoader;
let controls;
const clock = new THREE.Clock();

// Elementos de la interfaz de usuario
const gui = new GUI();
let elementosUI;
let carpetaJuego;
let selectorColocar;
let botonTerminar;

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
let cubos = [];
let bolas = [];

// Variables para contar cuantos elementos hay en la plataforma
let cubesOnFloor = 0;
let ballsOnFloor = 0;

// Variable para almacenar el objeto que representa al suelo
let suelo;

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
let infoCubos, infoBolas;
let infoJuego;

// Variables para controlar el juego
let jugando = false;
let faseJuego;

let nCubos, nBolas;

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
    escena = new THREE.Scene();

    // Creación de la cámara
    camara = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    escena.background = new THREE.Color(0xbfd1e5);
    camara.position.set(-14, 8, 16);

    // Creación del renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // TextureLoader para cargar texturas
    textureLoader = new THREE.TextureLoader();

    // Creación de controles de tipo orbital
    controls = new OrbitControls(camara, renderer.domElement);
    controls.target.set(0, 2, 0);
    controls.update();

    //Luces
    const ambientLight = new THREE.AmbientLight(0x707070);
    escena.add(ambientLight);

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

    escena.add(light);

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
    suelo = createBoxWithPhysics(
        40,
        1,
        40,
        0,
        pos,
        quat,
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    suelo.receiveShadow = true;

    // Texturización del suelo
    textureLoader.load(
        "grid.png",
        function(texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(40, 40);
            suelo.material.map = texture;
            suelo.material.needsUpdate = true;
        }
    );
    cubos.push(suelo);
}

// Función que inicializa los elementos de la interfaz de usuario
function initGUI() {
    // Objeto que almacena los elementos de la interfaz de usuario
    elementosUI = {
        "Disparo con botón izquierdo": false,
        "Colocar cubos": true,
        "Número de cubos": 10,
        "Dificultad": "Fácil",
        "Empezar juego": empezarJuego,
        "Terminar juego": terminarJuego
    }

    // Selector para seleccionar si se colocan cubos o se lanzan bolas
    selectorColocar = gui.add(elementosUI, "Colocar cubos", true);

    // Selector para seleccioanar si se puede disparar/colocar cubos con el botón izquierdo del ratón
    gui.add(elementosUI, "Disparo con botón izquierdo", false);

    // Botón para terminar el juego
    botonTerminar = gui.add(elementosUI, "Terminar juego");
    botonTerminar.hide();   // Oculto desde el principio

    // Carpeta que contiene elementos de la UI para configurar el juego
    carpetaJuego = gui.addFolder("Juego");
    // Selector numérico para seleccionar el número de cubos que se deben colocar
    carpetaJuego.add(elementosUI, "Número de cubos", 10, 30, 1);
    // Selector de dificultad del juego
    carpetaJuego.add(elementosUI, "Dificultad", ["Fácil", "Normal", "Dificil"]);
    // Botón para empezar el juego
    carpetaJuego.add(elementosUI, "Empezar juego");
}

// Función para inicializar los elementos de interacción de la simulación
function initInput() {
    // EventListener para gestionar las pulsaciones con el ratón
    document.addEventListener("mousedown", function(event) {
        // Se dispara según el modo de disparo seleccioando
        if ((event.button == 2 && !elementosUI["Disparo con botón izquierdo"] || elementosUI["Disparo con botón izquierdo"])) {
            //Coordenadas del puntero
            mouseCoords.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );
    
            // Intersección, define rayo
            raycaster.setFromCamera(mouseCoords, camara);

            // Se detectan las intersecciones con el rayo
            const intersecciones = raycaster.intersectObjects(cubos);

            // Se coloca un cubo en la posición de la plataforma pulsada
            if (elementosUI["Colocar cubos"]) {
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
                        new THREE.MeshPhongMaterial({ color: c })
                    );
                    object.castShadow = true;
                    object.receiveShadow = true;
                    cubos.push(object);
                }
            }
            // Se dispara una bola
            else {
                if (!jugando || nBolas > 0) {
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

                    bolas.push(ball);

                    if (jugando) {
                        nBolas--;
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

    infoCubos = document.createElement("div");
    infoCubos.innerHTML = "Cubos en la plataforma: " + cubesOnFloor;
    info.appendChild(infoCubos);

    infoBolas = document.createElement("div");
    infoBolas.innerHTML = "Bolas en la plataforma: " + ballsOnFloor;
    info.appendChild(infoBolas);

    infoJuego = document.createElement("div");
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

    escena.add(object);
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
    camara.aspect = window.innerWidth / window.innerHeight;
    camara.updateProjectionMatrix();
  
    // Se actualiza el tamaño del render
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Función que actualiza los contadores de objetos sobre la plataforma
function updateObjectsOnFloor() {
    // Actualización del contador de cubos
    cubesOnFloor = 0;
    for (let i = 1; i < cubos.length; i++) {
        const cubo = cubos[i];
        
        if(cubo.position.y > -1) {
            cubesOnFloor++;
        }
    }

    // Actualización del contador de bolas
    ballsOnFloor = 0;
    for(let i = 0; i < bolas.length; i++) {
        const bola = bolas[i];

        if(bola.position.y > -1) {
            ballsOnFloor++;
        }
    }
    
    // Se actualiza la información en pantalla
    updateInfo();
}

// Función que actualiza los elementos de información en pantalla relativos a los objetos situados sobre la plataforma
function updateInfo() {
    infoCubos.innerHTML = "Cubos en la plataforma: " + cubesOnFloor;
    infoBolas.innerHTML = "Bolas en la plataforma: " + ballsOnFloor;
}

// Función que inicializa el juego
function empezarJuego() {
    // Se esconden algunos elementos de la interfaz de usuario
    carpetaJuego.hide();
    selectorColocar.hide();

    // Se indica que se está jugando
    jugando = true;
    // Se especifica que el juego se encuentra en la primera fase del juego
    faseJuego = 0;
    // Se configura la simulación para colocar cubos
    elementosUI["Colocar cubos"] = true;
    // Se cambia el color del elemento de información a negro
    infoJuego.style.color = "#000";

    // Se obtiene el número de cubos seleccionados en la UI
    nCubos = elementosUI["Número de cubos"];

    // Si en la plataforma se encuentran más cubos de los seleccionados
    // se juega con ese número de cubos
    if (cubesOnFloor > nCubos) {
        nCubos = cubesOnFloor;
    }

    // Se configura la dificulatad seleccionada
    switch (elementosUI["Dificultad"]) {
        case "Fácil":
            nBolas = Math.floor(nCubos * 0.75);
            break;
        case "Normal":
            nBolas = Math.floor(nCubos * 0.50);
            break;
        case "Dificil":
            nBolas = Math.floor(nCubos * 0.33);
            break;
        default:
            nBolas = Math.floor(nCubos * 0.75);
            break;
    };

    info.appendChild(infoJuego);
}

// Función que finaliza el juego
function terminarJuego() {
    // Se indica que ya no se está jugando
    jugando = false;
    // Se esconde el botón de terminar juego
    botonTerminar.hide();

    // Se actualizan y muestran los elementos de la UI que estaban ocultos
    selectorColocar.updateDisplay();
    selectorColocar.show();
    carpetaJuego.show();
}

// Función que comprueba el estado del juego
function comprobarJuego() {
    // Fase inicial: colocación de cubos
    if (faseJuego == 0) {
        // Se muestran cuantos cubos faltan por colocar
        infoJuego.innerHTML = "Cubos pendientes de colocar: " + (nCubos - cubesOnFloor);
        if ((nCubos - cubesOnFloor) <= 0) {
            // Si se han colocado todos los cubos, avanza a la siguiente fase
            faseJuego = 1;
            elementosUI["Colocar cubos"] = false;
        }
    }
    // Fase intermedia: lanzamiento de bolas
    else if (faseJuego == 1) {
        // Se muestran cuantas bolas le quedan al jugador
        infoJuego.innerHTML = "Bolas disponibles: " + nBolas;

        if((nBolas <= 0 && ballsOnFloor == 0) || cubesOnFloor == 0) {
            // Si ya no hay bolas disponibles ni están sobre la plataforma o
            // no quedan cubos en la plataforma,
            // se avanza a la siguiente fase
            faseJuego = 2;
        }
    }
    // Fase final: fin del juego
    else if(faseJuego == 2) {
        // Se muestra el botón de terminar juego
        botonTerminar.show();

        // Si no hay cubos en la plataforma el jugador gana
        if (cubesOnFloor == 0) {
            infoJuego.innerHTML = "Has ganado";
            infoJuego.style.color = "green";
        }
        // Se hay cubos en la plataforma el jugador pierde
        else {
            infoJuego.innerHTML = "Has perdido";
            infoJuego.style.color = "red";
        }
    }
}

// Bucle principal de la aplicación
function animationLoop() {
    requestAnimationFrame(animationLoop);

    // Se actualiza el estado de los objetos físicos
    const deltaTime = clock.getDelta();
    updatePhysics(deltaTime);
    // Se actualizan los contadores de objetos encima de la plataforma
    updateObjectsOnFloor();

    // Si se está jugando se comprueba el estado del juego
    if(jugando) {
        comprobarJuego();
    }

    // Se renderiza la escana
    renderer.render(escena, camara);
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