/**
 * JSX intrinsic augmentation for React Three Fiber v9 + React 19.
 * Without this, <mesh />, <group />, etc. trip the TS strict check.
 */
import type { ThreeElements } from "@react-three/fiber";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

export {};
