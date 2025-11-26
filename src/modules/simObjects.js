import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Elementos de la simulación
export let scene, camera, renderer;
let controls;

export const clock = new THREE.Clock();

// Función que inicializa los elementos gráficos
export function initGraphics() {
    // Creación de la escena
    scene = new THREE.Scene();

    // Creación de la cámara
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    scene.background = new THREE.Color(0xbfd1e5);
    camera.position.set(-14, 8, 16);

    // Creación del renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Creación de controles de tipo orbital
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2, 0);
    controls.update();

    //Luces
    const ambientLight = new THREE.AmbientLight(0x707070);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-10, 18, 5);
    light.castShadow = true;
    const d = 14;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;

    light.shadow.camera.near = 2;
    light.shadow.camera.far = 50;

    light.shadow.mapSize.x = 1024;
    light.shadow.mapSize.y = 1024;

    scene.add(light);

    //Redimensión de la ventana
    window.addEventListener("resize", onWindowResize);
}

// Función a la que se llama cuando ocurre una redimensión de la ventana
function onWindowResize() {
    // Se modifica la relación de aspecto de la camara
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Se actualiza el tamaño del render
    renderer.setSize(window.innerWidth, window.innerHeight);
}