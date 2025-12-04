import { InputController } from "./InputController.js";
import * as THREE from "three";

const KEYS = {
    'a': 65,
    's': 83,
    'w': 87,
    'd': 68,
};

export class FirstPersonCamera {
    constructor(camera) {
        this.camera_ = camera;
        this.input_ = new InputController();
        this.rotation_ = new THREE.Quaternion();
        this.translation_ = new THREE.Vector3(0, 2, 40);
        this.phi_ = 0;
        this.phiSpeed_ = 5;
        this.theta_ = 0;
        this.thetaSpeed_ = 8;
        this.xLimits_ = [[-45, -35], [35, 45]];
        this.zLimits_ = [[-45, -35], [35, 45]];
    }

    update(timeElapsed) {
        this.updateRotation_();
        this.updateCamera_();
        this.updateTranslation_(timeElapsed);
        this.input_.update();
    }

    updateCamera_() {
        this.camera_.quaternion.copy(this.rotation_);
        this.camera_.position.copy(this.translation_);
    }

    updateRotation_() {
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

    updateTranslation_(timeElapsed) {
        const actualTranslation = new THREE.Vector3();
        actualTranslation.copy(this.translation_);

        const forwardVelocity = (this.input_.key(KEYS.w) ? 1 : 0) + (this.input_.key(KEYS.s) ? -1 : 0);
        const strafeVelocity = (this.input_.key(KEYS.a) ? 1 : 0) + (this.input_.key(KEYS.d) ? -1 : 0);

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);

        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(qx);
        forward.multiplyScalar(forwardVelocity * timeElapsed * 10);

        const left = new THREE.Vector3(-1, 0, 0);
        left.applyQuaternion(qx);
        left.multiplyScalar(strafeVelocity * timeElapsed * 10);

        this.translation_.add(forward);
        this.translation_.add(left);
        
        if (!this.checkPointInPlatform_(this.translation_.x, this.translation_.z)) {
            this.translation_.copy(actualTranslation);
        }
    }

    checkPointInPlatform_(x, z) {
        if (x >= this.xLimits_[0][0] && x <= this.xLimits_[0][1] || x >= this.xLimits_[1][0] && x <= this.xLimits_[1][1]) {
            if (z >= this.zLimits_[0][0] && z <= this.zLimits_[1][1]) {
                return true;
            }
        }

        if (z >= this.zLimits_[0][0] && z <= this.zLimits_[0][1] || z >= this.zLimits_[1][0] && z <= this.zLimits_[1][1]) {
            if (x > this.xLimits_[0][1] && x < this.xLimits_[1][0]) {
                return true;
            }
        }

        return false;
    }
}

function clamp(x, a, b) {
    return Math.min(Math.max(x, a), b);
}