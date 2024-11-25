import * as THREE from "three";

let escena, camara, renderer

init()
animationLoop()

function init() {
    escena = new THREE.Scene();

    camara = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function animationLoop() {
    renderer.render(escena, camara);
}