import { db } from './config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface TelemetryData {
    session_id: string;
    timestamp: any; // serverTimestamp
    event_type: 'GAZE_FOCUS' | 'SESSION_START' | 'SESSION_END' | 'SCENE_CHANGE';
    scene_id: string;
    parameters: {
        movement_type: 'gyro' | 'touch';
        gaze: { x: number; y: number; z: number };
    };
}

export class TelemetryService {
    private static instance: TelemetryService;
    private sessionId: string;
    private currentSceneId: string = 'start';
    private interval: number = 500;
    private isRunning: boolean = false;
    private timerId: NodeJS.Timeout | null = null;

    private constructor() {
        this.sessionId = Math.random().toString(36).substring(7);
    }

    public static getInstance(): TelemetryService {
        if (!TelemetryService.instance) {
            TelemetryService.instance = new TelemetryService();
        }
        return TelemetryService.instance;
    }

    public start(sceneId: string) {
        this.currentSceneId = sceneId;
        if (this.isRunning) return;
        this.isRunning = true;
        this.loop();
        console.log('Telemetry started:', this.sessionId);
    }

    public stop() {
        this.isRunning = false;
        if (this.timerId) clearTimeout(this.timerId);
    }

    public setScene(sceneId: string) {
        this.currentSceneId = sceneId;
    }

    private async loop() {
        if (!this.isRunning) return;

        // Note: The actual camera direction will be passed from the Viewer
        // This is a placeholder for the logic. In implementation, we trigger this from the viewer's update loop or an event.
        
        this.timerId = setTimeout(() => this.loop(), this.interval);
    }

    public async logGaze(gaze: { x: number; y: number; z: number }, movementType: 'gyro' | 'touch') {
        const data: TelemetryData = {
            session_id: this.sessionId,
            timestamp: serverTimestamp(),
            event_type: 'GAZE_FOCUS',
            scene_id: this.currentSceneId,
            parameters: {
                movement_type: movementType,
                gaze: gaze
            }
        };

        try {
            await addDoc(collection(db, 'telemetry'), data);
        } catch (e) {
            console.warn('Telemetry error:', e);
        }
    }

    // sendBeacon for closing tab (simplified for Firestore)
    // Firestore SDK doesn't support sendBeacon directly, so we use a fallback if needed
    // or just ensure we flush data.
    public async logSessionEnd() {
        const data = {
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            event_type: 'SESSION_END',
            scene_id: this.currentSceneId
        };
        
        // Use sendBeacon to a cloud function if available, 
        // or just try a firestore call before unload.
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            // navigator.sendBeacon('/api/telemetry-beacon', blob); // Example endpoint
        }
    }
}
