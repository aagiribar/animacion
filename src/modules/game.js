import { 
    infoGame, 
    info, 
    cubesOnFloor, 
    ballsOnFloor,
    uiElements, 
    hideGameFolder,
    showGameFolder,
    hideEndButton,
    showEndButton,
    hidePlaceCubesSelector,
    showPlaceCubesSelector,
    updatePlaceCubesSelector,
} from "./gui.js";

// Variables para controlar el juego
export let playing = false;
let gamePhase;

// Número de cubos seleccionados para colocar
let nSelectedCubes;

// Número de bolas disponibles para lanzar
export let nBalls;

/**
 * Función que inicia el juego configurando las variables necesarias y ocultando los elementos de la UI correspondientes.
 */
export function startGame() {
    // Se esconden algunos elementos de la interfaz de usuario
    hideGameFolder();
    hidePlaceCubesSelector();

    // Se indica que se está jugando
    playing = true;
    // Se especifica que el juego se encuentra en la primera fase del juego
    gamePhase = 0;
    // Se configura la simulación para colocar cubos
    uiElements["Colocar cubos"] = true;
    // Se cambia el color del elemento de información a negro
    infoGame.style.color = "#000";

    // Se obtiene el número de cubos seleccionados en la UI
    nSelectedCubes = uiElements["Número de cubos"];

    // Si en la plataforma se encuentran más cubos de los seleccionados
    // se juega con ese número de cubos
    if (cubesOnFloor > nSelectedCubes) {
        nSelectedCubes = cubesOnFloor;
    }

    // Se configura la dificulatad seleccionada
    switch (uiElements["Dificultad"]) {
        case "Fácil":
            nBalls = Math.floor(nSelectedCubes * 0.75);
            break;
        case "Normal":
            nBalls = Math.floor(nSelectedCubes * 0.50);
            break;
        case "Dificil":
            nBalls = Math.floor(nSelectedCubes * 0.33);
            break;
        default:
            nBalls = Math.floor(nSelectedCubes * 0.75);
            break;
    };

    info.appendChild(infoGame);
}

/**
 * Función que finaliza el juego, mostrando los elementos de la UI correspondientes.
 */
export function endGame() {
    // Se indica que ya no se está jugando
    playing = false;
    // Se esconde el botón de terminar juego
    hideEndButton();

    // Se actualizan y muestran los elementos de la UI que estaban ocultos
    updatePlaceCubesSelector();
    showPlaceCubesSelector();
    showGameFolder();
}

/**
 * Función que comprueba el estado del juego y avanza entre las diferentes fases del mismo.
 */
export function checkGame() {
    // Fase inicial: colocación de cubos
    if (gamePhase == 0) {
        // Se muestran cuantos cubos faltan por colocar
        infoGame.innerHTML = "Cubos pendientes de colocar: " + (nSelectedCubes - cubesOnFloor);
        if ((nSelectedCubes - cubesOnFloor) <= 0) {
            // Si se han colocado todos los cubos, avanza a la siguiente fase
            gamePhase = 1;
            uiElements["Colocar cubos"] = false;
        }
    }
    // Fase intermedia: lanzamiento de bolas
    else if (gamePhase == 1) {
        // Se muestran cuantas bolas le quedan al jugador
        infoGame.innerHTML = "Bolas disponibles: " + nBalls;

        if ((nBalls <= 0 && ballsOnFloor == 0) || cubesOnFloor == 0) {
            // Si ya no hay bolas disponibles ni están sobre la plataforma o
            // no quedan cubos en la plataforma,
            // se avanza a la siguiente fase
            gamePhase = 2;
        }
    }
    // Fase final: fin del juego
    else if (gamePhase == 2) {
        // Se muestra el botón de terminar juego
        showEndButton();

        // Si no hay cubos en la plataforma el jugador gana
        if (cubesOnFloor == 0) {
            infoGame.innerHTML = "Has ganado";
            infoGame.style.color = "green";
        }
        // Se hay cubos en la plataforma el jugador pierde
        else {
            infoGame.innerHTML = "Has perdido";
            infoGame.style.color = "red";
        }
    }
}

/**
 * Función que decrementa el número de bolas disponibles para lanzar.
 */
export function decrementNBalls() {
    nBalls--;
}