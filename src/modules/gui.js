import { GUI } from "lil-gui";
import { startGame, endGame } from "/animacion.js";

// Elementos de la interfaz de usuario
const gui = new GUI();
export let UIelements;
export let gameFolder;
export let placeSelector;
export let endButton;

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