import type { Vector3 } from "three";

export interface Hotspot {
  id: string;
  element: HTMLElement;
  position: Vector3;
  label: string;
}
