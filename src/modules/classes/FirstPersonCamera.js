import { InputController } from "./InputController.js";
import * as THREE from "three";

export class FirstPersonCamera {
    constructor(camera) {
        this.camera_ = camera;
        this.input_ = new InputController();
        this.rotation_ = new THREE.Quaternion();
        this.translation_ = new THREE.Vector3();
        this.phi_ = 0;
        this.phiSpeed_ = 5;
        this.theta_ = 0;
        this.thetaSpeed_ = 8;
    }

    update(timeElapsed) {
        this.updateRotation_(timeElapsed);
        this.updateCamera_(timeElapsed);
        this.input_.update();
    }

    updateCamera_(timeElapsed) {
        this.camera_.quaternion.copy(this.rotation_);
    }

    updateRotation_(timeElapsed) {
        const xh = this.input_.current_.mouseXDelta / window.innerWidth;
        const yh = this.input_.current_.mouseYDelta / window.innerHeight;

        this.phi_ += -xh * this.phiSpeed_;
        this.theta_ = clamp(this.theta_ + -yh * this.thetaSpeed_, -Math.PI / 3, Math.PI / 3);

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
        const qz = new THREE.Quaternion();
        qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta_);

        const q = new THREE.Quaternion();
        q.multiply(qx);
        q.multiply(qz);

        this.rotation_.copy(q);
    }
}

function clamp(x, a, b) {
    return Math.min(Math.max(x, a), b);
}