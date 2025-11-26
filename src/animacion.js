import { initGUI, UIelements, gameFolder, placeSelector, endButton, initInfo, updateObjectsOnFloor, infoGame, cubesOnFloor, ballsOnFloor, info } from "./modules/gui.js";
import { initGraphics, scene, camera, renderer, textureLoader, clock } from "./modules/simObjects.js";
import { initPhysics, pos, quat, margin, physicsWorld, updatePhysics } from "./modules/world.js";
import { createObjects, cubes, createBoxWithPhysics, ballMaterial, createRigidBody, balls } from "./modules/gameObjects.js";
import { initInput } from "./modules/input.js";
import { playing, checkGame } from "./modules/game.js";

//Inicialización ammo
Ammo().then(function (AmmoLib) {
    Ammo = AmmoLib;
  
    init();
    animationLoop();
});

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

// Bucle principal de la aplicación
function animationLoop() {
    requestAnimationFrame(animationLoop);

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