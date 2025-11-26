import { GUI } from "lil-gui";
import { startGame, endGame } from "./game.js";
import { cubes, balls } from "./gameObjects.js";

// Elementos de la interfaz de usuario
const gui = new GUI();
export let UIelements;
export let gameFolder;
export let placeSelector;
export let endButton;

// Variables para contar cuantos elementos hay en la plataforma
export let cubesOnFloor = 0;
export let ballsOnFloor = 0;

// Elementos de inforación en pantalla
export let info;
let infoCubes, infoBalls;
export let infoGame;

// Función que inicializa los elementos de la interfaz de usuario
export function initGUI() {
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

// Función para inicializar los elementos de información en pantalla
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

// Función que actualiza los contadores de objetos sobre la plataforma
export function updateObjectsOnFloor() {
    // Actualización del contador de cubos
    cubesOnFloor = 0;
    for (let i = 1; i < cubes.length; i++) {
        const cubo = cubes[i];

        if (cubo.position.y > -1) {
            cubesOnFloor++;
        }
    }

    // Actualización del contador de bolas
    ballsOnFloor = 0;
    for (let i = 0; i < balls.length; i++) {
        const bola = balls[i];

        if (bola.position.y > -1) {
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