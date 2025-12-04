import { initGUI, initInfo, uiElements, updateObjectsOnFloor } from "./modules/gui.js";
import { 
    initGraphics, 
    scene, 
    orbitalCamera, 
    renderer, 
    clock, 
    orbitControls, 
    firstPersonCamera, 
    firstPersonControls 
} from "./modules/simObjects.js";
import { initPhysics, updatePhysics } from "./modules/world.js";
import { createObjects } from "./modules/gameObjects.js";
import { checkInput } from "./modules/input.js";
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

    // Se comprueba el estado de los controles
    checkInput();

    // Se renderiza la escena con la cámara que corresponda
    if (uiElements["Colocar cubos"]) {
        // Actualiza el control orbital
        orbitControls.update();

        // Se renderiza la escena con la cámara órbital
        renderer.render(scene, orbitalCamera);
    }
    else {
        // Actualiza el control de primera persona
        firstPersonControls.update(deltaTime);

        // Se renderiza la escena con la cámara en primera personal
        renderer.render(scene, firstPersonCamera);
    }
}