import * as THREE from 'three';

export class Telemetry {
    constructor(viewer) {
        this.viewer = viewer;
        this.interval = 500; // 500ms requirement
        this.sessionId = Math.random().toString(36).substring(7);
        this.currentSceneId = 'start';
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.loop();
        console.log('Telemetría iniciada:', this.sessionId);
    }

    stop() {
        this.isRunning = false;
    }

    setScene(sceneId) {
        this.currentSceneId = sceneId;
    }

    async loop() {
        while (this.isRunning) {
            const lookDirection = new THREE.Vector3();
            this.viewer.camera.getWorldDirection(lookDirection);

            const data = {
                timestamp: Date.now(),
                sessionId: this.sessionId,
                sceneId: this.currentSceneId,
                gaze: {
                    x: lookDirection.x,
                    y: lookDirection.y,
                    z: lookDirection.z
                }
            };

            // Aquí enviaremos a Firestore
            console.log('GAZE_FOCUS:', data);
            
            // Disparar evento para que el main lo envíe a Firestore
            window.dispatchEvent(new CustomEvent('telemetry-update', { detail: data }));

            await new Promise(resolve => setTimeout(resolve, this.interval));
        }
    }
}
