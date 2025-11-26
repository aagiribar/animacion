import * as THREE from "three";
import { rigidBodies } from "./gameObjects.js";

// Mundo físico con Ammo
export let physicsWorld;
const gravityConstant = 7.8;
let collisionConfiguration;
let dispatcher;
let broadphase;
let solver;

export const margin = 0.05

export const pos = new THREE.Vector3();
export const quat = new THREE.Quaternion();

//Variables temporales para actualizar transformación en el bucle
let transformAux1;
let tempBtVec3_1;

// Función que inicializa las físicas de la simulación
export function initPhysics() {
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

// Función que actualiza las físicas de la simulación
// deltaTime: Diferencia de tiempo con respecto a la actualización anterior
export function updatePhysics(deltaTime) {
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