import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FirstPersonCamera } from "./classes/FirstPersonCamera.js";

// Elementos de la simulación
export let scene, orbitalCamera, firstPersonCamera, renderer;

// Controles de la cámara
export let orbitControls, firstPersonControls;

// Reloj para medir el tiempo entre frames
export const clock = new THREE.Clock();

/**
 * Función que inicializa la escena, cámara, renderer, controles y luces.
 */
export function initGraphics() {
    // Creación de la escena
    scene = new THREE.Scene();

    // Creación de la cámara órbital
    orbitalCamera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    scene.background = new THREE.Color(0xbfd1e5);
    orbitalCamera.position.set(-14, 8, 16);

    // Creación de la cámara en primera persona
    firstPersonCamera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    firstPersonCamera.position.set(0, 2, 0);

    // Creación del renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Creación de controles de tipo orbital
    orbitControls = new OrbitControls(orbitalCamera, renderer.domElement);
    orbitControls.target.set(0, 5, 0);
    orbitControls.update();

    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.20;
    orbitControls.enablePan = false;

    // Creación de controles de tipo primera persona
    firstPersonControls = new FirstPersonCamera(firstPersonCamera);

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

    // Carga de la textura del fondo de estrellas
    const cubeTexture = new THREE.CubeTextureLoader().load([
        new URL("/px.png", import.meta.url),
        new URL("/nx.png", import.meta.url),
        new URL("/py.png", import.meta.url),
        new URL("/ny.png", import.meta.url),
        new URL("/pz.png", import.meta.url),
        new URL("/nz.png", import.meta.url),
    ]);

    scene.background = cubeTexture;

    //Redimensión de la ventana
    window.addEventListener("resize", onWindowResize);
}

/**
 * Función que maneja la redimensión de la ventana.
 */
function onWindowResize() {
    // Se modifica la relación de aspecto de la camara
    orbitalCamera.aspect = window.innerWidth / window.innerHeight;
    orbitalCamera.updateProjectionMatrix();

    // Se actualiza el tamaño del render
    renderer.setSize(window.innerWidth, window.innerHeight);
}