import * as THREE from "three";
import { pos, quat, margin, physicsWorld } from "./world.js";
import { scene } from "./simObjects.js";

// Variables para almacenar los objetos de la simulación
export let rigidBodies = [];
export let cubes = [];
export let balls = [];

// Variable para almacenar el objeto que representa al suelo
let floor;

// Material para las bolas lanzadas
const ballMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });

// Cargador de texturas
let textureLoader;

/**
 * Función que crea los objetos iniciales de la simulación, incluyendo el suelo texturizado.
 */
export function createObjects() {
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

    // TextureLoader para cargar texturas
    textureLoader = new THREE.TextureLoader();

    // Texturización del suelo
    textureLoader.load(
        "grid.png",
        function (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(40, 40);
            floor.material.map = texture;
            floor.material.needsUpdate = true;
        }
    );
    cubes.push(floor);
}

/**
 * Función que crea un cubo con físicas
 * @param {Number} sx Dimensión del cubo en X 
 * @param {Number} sy Dimensión del cubo en Y
 * @param {Number} sz Dimensión del cubo en Z
 * @param {Number} mass Masa del cubo
 * @param {THREE.Vector3} pos Posición del cubo
 * @param {THREE.Vector3} quat Cuaternión del cubo
 * @param {THREE.Material} material Material del cubo
 * @returns Objeto de Three.js que representa el cubo
 */
export function createBoxWithPhysics(sx, sy, sz, mass, pos, quat, material) {
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

/**
 * Función que crea un objeto rígido con físicas
 * @param {THREE.Object3D} object Objeto de Three.js
 * @param {*} physicsShape Forma física de Ammo
 * @param {Number} mass Masa del objeto
 * @param {THREE.Vector3} pos Posición del objeto
 * @param {THREE.Vector3} quat Cuaternión del objeto
 * @param {Number} vel Velocidad del objeto
 * @param {Number} angVel Velocidad angular del objeto
 * @returns Objeto rígido de Ammo
 */
export function createRigidBody(object, physicsShape, mass, pos, quat, vel, angVel) {
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

/**
 * Función que crea una bola lanzada desde la cámara
 * @param {Number} mass Masa de la bola
 * @param {Number} radius Radio de la bola
 * @param {*} rayDirection Dirección del rayo del raycaster
 * @param {*} rayOrigin Origin del rayo del raycaster
 */
export function createBall(mass, radius, rayDirection, rayOrigin) {
    const ball = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 14, 10),
        ballMaterial
    );
    ball.castShadow = true;
    ball.receiveShadow = true;

    //Ammo
    //Estructura geométrica de colisión esférica
    const ballShape = new Ammo.btSphereShape(radius);
    ballShape.setMargin(margin);
    pos.copy(rayDirection);
    pos.add(rayOrigin);
    quat.set(0, 0, 0, 1);
    const ballBody = createRigidBody(ball, ballShape, mass, pos, quat);

    pos.copy(rayDirection);
    pos.multiplyScalar(24);
    ballBody.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z));

    balls.push(ball);
}