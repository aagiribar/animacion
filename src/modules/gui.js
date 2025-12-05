import { GUI } from "lil-gui";
import { startGame, endGame } from "./game.js";
import { cubes, balls } from "./gameObjects.js";
import { firstPersonControls } from "./simObjects.js";

// Elementos de la interfaz de usuario
const gui = new GUI();
export let uiElements;
let gameFolder;
let placeCubesSelector;
let endButton;
let mouseFolder;

// Variables para contar cuantos elementos hay en la plataforma
export let cubesOnFloor = 0;
export let ballsOnFloor = 0;

// Elementos de inforación en pantalla
export let info;
let infoCubes, infoBalls;
export let infoGame;

/**
 * Función que inicializa los elementos de la interfaz de usuario
 */
export function initGUI() {
    // Objeto que almacena los elementos de la interfaz de usuario
    uiElements = {
        "Colocar cubos": true,
        "Número de cubos": 10,
        "Dificultad": "Fácil",
        "Empezar juego": startGame,
        "Terminar juego": endGame,
        "Sensibilidad horizontal": 15,
        "Sensibilidad vertical": 18
    }

    // Selector para seleccionar si se colocan cubos o se lanzan bolas
    placeCubesSelector = gui.add(uiElements, "Colocar cubos", true);

    // Botón para terminar el juego
    endButton = gui.add(uiElements, "Terminar juego");
    endButton.hide();   // Oculto desde el principio

    // Carpeta que contiene elementos de la UI para configurar el juego
    gameFolder = gui.addFolder("Juego");

    // Selector numérico para seleccionar el número de cubos que se deben colocar
    gameFolder.add(uiElements, "Número de cubos", 10, 30, 1);
    // Selector de dificultad del juego
    gameFolder.add(uiElements, "Dificultad", ["Fácil", "Normal", "Dificil"]);
    // Botón para empezar el juego
    gameFolder.add(uiElements, "Empezar juego");

    // Carpeta que contiene selectores para cambiar la sensibilidad del ratón
    mouseFolder = gui.addFolder("Ratón");

    // Selectores de sensibilidad del ratón
    mouseFolder.add(uiElements, "Sensibilidad horizontal", 1, 25, 1).onChange((value) => {
        firstPersonControls.setHorizontalSensitivity(value);
    });
    mouseFolder.add(uiElements, "Sensibilidad vertical", 1, 25, 1).onChange((value) => {
        firstPersonControls.setVerticalSensitivity(value);
    });
}

/**
 * Función que inicializa los elementos de información en pantalla
 */
export function initInfo() {
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

/**
 * Función que actualiza los contadores de objetos sobre la plataforma
 */
export function updateObjectsOnFloor() {
    // Actualización del contador de cubos
    cubesOnFloor = 0;
    for (let i = 1; i < cubes.length; i++) {
        const cube = cubes[i];

        if (cube.position.y > -1) {
            cubesOnFloor++;
        }
    }

    // Actualización del contador de bolas
    ballsOnFloor = 0;
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];

        if (ball.position.y > -1) {
            ballsOnFloor++;
        }
    }

    // Se actualiza la información en pantalla
    updateInfo();
}

/**
 * Función que actualiza los elementos de información en pantalla relativos a los objetos situados sobre la plataforma
 */
function updateInfo() {
    infoCubes.innerHTML = "Cubos en la plataforma: " + cubesOnFloor;
    infoBalls.innerHTML = "Bolas en la plataforma: " + ballsOnFloor;
}

/**
 * Función que muestra la carpeta de configuración del juego
 */
export function showGameFolder() {
    gameFolder.show();
}

/**
 * Función que esconde la carpeta de configuración del juego
 */
export function hideGameFolder() {
    gameFolder.hide();
}


/**
 * Función que muestra el botón para terminar el juego
 */
export function showEndButton() {
    endButton.show();
}

/**
 * Función que esconde el botón para terminar el juego
 */
export function hideEndButton() {
    endButton.hide();
}

/**
 * Función que muestra el selector para colocar cubos
 */
export function showPlaceCubesSelector() {
    placeCubesSelector.show();
}

/**
 * Función que esconde el selector para colocar cubos
 */
export function hidePlaceCubesSelector() {
    placeCubesSelector.hide();
}

/**
 * Función que actualiza el valor del selector para colocar cubos
 */
export function updatePlaceCubesSelector() {
    placeCubesSelector.updateDisplay();
}

/**
 * Función que muestra la carpeta de selección de sensibilidad del ratón
 */
export function showMouseFolder() {
    mouseFolder.show();
}

/**
 * Función que esconde la carpeta de selección de sensibilidad del ratón
 */
export function hideMouseFolder() {
    mouseFolder.hide();
}

/**
 * Función que añade un elementos al elemento info
 * @param {*} element Elemento a añadir
 */
export function appendToInfo(element) {
    info.appendChild(element);
}