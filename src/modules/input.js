import * as THREE from "three";
import { uiElements } from "./gui.js";
import { firstPersonCamera, orbitalCamera } from "./simObjects.js";
import { cubes, createBoxWithPhysics, createBall } from "./gameObjects.js";
import { pos, quat } from "./world.js";
import { playing, nBalls, decrementNBalls } from "./game.js";
import { InputController } from "./classes/InputController.js";

// Raycaster
const mouseCoords = new THREE.Vector2()
let raycaster = new THREE.Raycaster();

// Controlador de inputs
export const inputController = new InputController();

// Variables para el estado de los botones del ratón
let leftButtonPressed = false;
let rightButtonPressed = false;

/**
 * Función que comprueba el estado de los controles de la simulación
 */
export function checkInput() {
    const currentInput = inputController.getCurrent();
    if (uiElements["Colocar cubos"]) {

        // Si se pulsa el botón derecho del ratón, coloca un cubo
        if (currentInput.rightButton && !rightButtonPressed) {
            rightButtonPressed = true;

            // Coordenadas del puntero
            mouseCoords.set(
                (currentInput.clientX / window.innerWidth) * 2 - 1,
                -(currentInput.clientY / window.innerHeight) * 2 + 1
            );

            // Intersección, define rayo
            raycaster.setFromCamera(mouseCoords, orbitalCamera);

            // Se detectan las intersecciones con el rayo
            const intersections = raycaster.intersectObjects(cubes);

            // Se coloca un cubo en la posición de la plataforma pulsada
            if (intersections.length > 0) {

                // Se selecciona un color aleatorio para el cubo
                var c = new THREE.Color();
                c.set(THREE.MathUtils.randInt(0, Math.pow(2, 24) - 1));

                pos.set(intersections[0].point.x, intersections[0].point.y + 2, intersections[0].point.z);
                quat.set(0, 0, 0, 1);

                // Se crea el cubo de dimensiones y masa aleatorias
                let object = createBoxWithPhysics(
                    THREE.MathUtils.randInt(1, 4),
                    THREE.MathUtils.randInt(1, 4),
                    THREE.MathUtils.randInt(1, 4),
                    THREE.MathUtils.randInt(1, 2),
                    pos,
                    quat,
                    new THREE.MeshPhongMaterial({ color: c })
                );
                object.castShadow = true;
                object.receiveShadow = true;
                cubes.push(object);
            }
        }
        else if (!currentInput.rightButton) {
            rightButtonPressed = false;
        }
    }
    else {
        // Se dispara una bola
        if (currentInput.leftButton && !leftButtonPressed) {
            leftButtonPressed = true;

            if (!playing || nBalls > 0) {
                // Intersección, define rayo
                raycaster.setFromCamera(mouseCoords, firstPersonCamera);

                // Crea bola como cuerpo rígido y la lanza según coordenadas de ratón
                const ballMass = 35;
                const ballRadius = 0.4;
                createBall(ballMass, ballRadius, raycaster.ray.direction, raycaster.ray.origin);

                if (playing) {
                    decrementNBalls();
                }
            }
        }
        else if (!currentInput.leftButton) {
            leftButtonPressed = false;
        }
    }
}