/**
 * JSX intrinsic augmentation for React Three Fiber v9 + React 19.
 * R3F v9 no longer auto-augments JSX; we wire it here.
 */
import type { ThreeElements } from "@react-three/fiber";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

export {};
