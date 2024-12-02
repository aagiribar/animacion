import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let escena, camara, renderer;
let textureLoader;
let controls;
const clock = new THREE.Clock();

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

let rigidBodies = [];

//Inicialización ammo
Ammo().then(function (AmmoLib) {
    Ammo = AmmoLib;
  
    init();
    animationLoop();
});

function init() {
    // Elementos gráficos
    initGraphics();
    // Elementos del mundo físico
    initPhysics();
    // Objetos
    createObjects();
}

function initGraphics() {
    escena = new THREE.Scene();

    camara = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    escena.background = new THREE.Color(0xbfd1e5);
    camara.position.set(-14, 8, 16);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    textureLoader = new THREE.TextureLoader();

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

function createObjects() {
    // Suelo
    pos.set(0, -0.5, 0);
    quat.set(0, 0, 0, 1);

    const suelo = createBoxWithPhysics(
        40,
        1,
        40,
        0,
        pos,
        quat,
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    suelo.receiveShadow = true;
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
}

function createBoxWithPhysics(sx, sy, sz, mass, pos, quat, material) {
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

function onWindowResize() {
    camara.aspect = window.innerWidth / window.innerHeight;
    camara.updateProjectionMatrix();
  
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

function animationLoop() {
    requestAnimationFrame(animationLoop);

    const deltaTime = clock.getDelta();
    updatePhysics(deltaTime);

    renderer.render(escena, camara);
}

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