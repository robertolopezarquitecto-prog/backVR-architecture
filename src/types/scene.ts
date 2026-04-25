export interface ScenePortal {
  id: string;
  position: { x: number; y: number; z: number };
  label: string;
}

export interface SceneConfig {
  id: string;
  name: string;
  urlLow: string;
  urlHigh: string;
  portals: ScenePortal[];
}
