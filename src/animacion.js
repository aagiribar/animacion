import { initGUI, initInfo, updateObjectsOnFloor } from "./modules/gui.js";
import { initGraphics, scene, camera, renderer, clock } from "./modules/simObjects.js";
import { initPhysics, updatePhysics } from "./modules/world.js";
import { createObjects } from "./modules/gameObjects.js";
import { initInput } from "./modules/input.js";
import { playing, checkGame } from "./modules/game.js";

//Inicialización ammo
Ammo().then(function (AmmoLib) {
    Ammo = AmmoLib;
  
    init();
    animationLoop();
});

/**
 * Función que inicializa la simulación, creando los elementos gráficos, físicos, los objetos del juego,
 * la interacción del usuario, la información en pantalla y la interfaz gráfica.
 */
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

/**
 * Función que implementa el bucle de animación de la simulación.
 * En cada iteración se actualizan los objetos físicos, los contadores de objetos encima de la plataforma,
 * se comprueba el estado del juego si se está jugando y se renderiza la escena.
 */
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