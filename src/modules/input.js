import * as THREE from "three";
import { uiElements } from "./gui.js";
import { camera } from "./simObjects.js";
import { cubes, createBoxWithPhysics, createBall } from "./gameObjects.js";
import { pos, quat } from "./world.js";
import { playing, nBalls, decrementNBalls } from "./game.js";

// Raycaster
const mouseCoords = new THREE.Vector2()
let raycaster = new THREE.Raycaster();

/**
 * Función para inicializar los elementos de interacción de la simulación
 */
export function initInput() {
    // EventListener para gestionar las pulsaciones con el ratón
    document.addEventListener("mousedown", function (event) {
        // Se dispara según el modo de disparo seleccioando
        if (event.button == 2) {
            //Coordenadas del puntero
            mouseCoords.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );

            // Intersección, define rayo
            raycaster.setFromCamera(mouseCoords, camera);

            // Se detectan las intersecciones con el rayo
            const intersections = raycaster.intersectObjects(cubes);

            // Se coloca un cubo en la posición de la plataforma pulsada
            if (uiElements["Colocar cubos"]) {
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
            // Se dispara una bola
            else {
                if (!playing || nBalls > 0) {
                    // Crea bola como cuerpo rígido y la lanza según coordenadas de ratón
                    const ballMass = 35;
                    const ballRadius = 0.4;
                    createBall(ballMass, ballRadius, raycaster.ray.direction, raycaster.ray.origin);

                    if (playing) {
                        decrementNBalls();
                    }
                }
            }
        }
    });
}