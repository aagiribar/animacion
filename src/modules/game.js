import { gameFolder, placeSelector, infoGame, cubesOnFloor, UIelements, info, endButton, ballsOnFloor } from "./gui.js";

// Variables para controlar el juego
export let playing = false;
let gamePhase;

export let nCubes, nBalls;

// Función que inicializa el juego
export function startGame() {
    // Se esconden algunos elementos de la interfaz de usuario
    gameFolder.hide();
    placeSelector.hide();

    // Se indica que se está jugando
    playing = true;
    // Se especifica que el juego se encuentra en la primera fase del juego
    gamePhase = 0;
    // Se configura la simulación para colocar cubos
    UIelements["Colocar cubos"] = true;
    // Se cambia el color del elemento de información a negro
    infoGame.style.color = "#000";

    // Se obtiene el número de cubos seleccionados en la UI
    nCubes = UIelements["Número de cubos"];

    // Si en la plataforma se encuentran más cubos de los seleccionados
    // se juega con ese número de cubos
    if (cubesOnFloor > nCubes) {
        nCubes = cubesOnFloor;
    }

    // Se configura la dificulatad seleccionada
    switch (UIelements["Dificultad"]) {
        case "Fácil":
            nBalls = Math.floor(nCubes * 0.75);
            break;
        case "Normal":
            nBalls = Math.floor(nCubes * 0.50);
            break;
        case "Dificil":
            nBalls = Math.floor(nCubes * 0.33);
            break;
        default:
            nBalls = Math.floor(nCubes * 0.75);
            break;
    };

    info.appendChild(infoGame);
}

// Función que finaliza el juego
export function endGame() {
    // Se indica que ya no se está jugando
    playing = false;
    // Se esconde el botón de terminar juego
    endButton.hide();

    // Se actualizan y muestran los elementos de la UI que estaban ocultos
    placeSelector.updateDisplay();
    placeSelector.show();
    gameFolder.show();
}

// Función que comprueba el estado del juego
export function checkGame() {
    // Fase inicial: colocación de cubos
    if (gamePhase == 0) {
        // Se muestran cuantos cubos faltan por colocar
        infoGame.innerHTML = "Cubos pendientes de colocar: " + (nCubes - cubesOnFloor);
        if ((nCubes - cubesOnFloor) <= 0) {
            // Si se han colocado todos los cubos, avanza a la siguiente fase
            gamePhase = 1;
            UIelements["Colocar cubos"] = false;
        }
    }
    // Fase intermedia: lanzamiento de bolas
    else if (gamePhase == 1) {
        // Se muestran cuantas bolas le quedan al jugador
        infoGame.innerHTML = "Bolas disponibles: " + nBalls;

        if((nBalls <= 0 && ballsOnFloor == 0) || cubesOnFloor == 0) {
            // Si ya no hay bolas disponibles ni están sobre la plataforma o
            // no quedan cubos en la plataforma,
            // se avanza a la siguiente fase
            gamePhase = 2;
        }
    }
    // Fase final: fin del juego
    else if(gamePhase == 2) {
        // Se muestra el botón de terminar juego
        endButton.show();

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

export function decrementNBalls() {
    nBalls--;
}