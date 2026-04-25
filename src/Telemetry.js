import * as THREE from 'three';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
                timestamp: serverTimestamp(),
                sessionId: this.sessionId,
                sceneId: this.currentSceneId,
                gaze: {
                    x: lookDirection.x,
                    y: lookDirection.y,
                    z: lookDirection.z
                }
            };

            // Enviar a Firestore
            try {
                await addDoc(collection(db, 'telemetry'), data);
                console.log('GAZE_FOCUS guardado en Firestore');
            } catch (e) {
                console.warn('Error al guardar telemetría (¿Faltan credenciales?):', e.message);
            }

            await new Promise(resolve => setTimeout(resolve, this.interval));
        }
    }
}
