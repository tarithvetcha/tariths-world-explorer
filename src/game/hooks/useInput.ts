/**
 * Keyboard/mouse input. Pointer-lock based for AAA feel.
 * Exposes a ref-based snapshot so render loops can read without re-rendering React.
 */
import { useEffect, useRef } from "react";

export interface InputState {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
  interact: boolean;
  yaw: number; // radians, accumulated from mouse X
  pitch: number; // radians, accumulated from mouse Y (clamped)
  locked: boolean;
}

export function useInput() {
  const ref = useRef<InputState>({
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    interact: false,
    yaw: 0,
    pitch: -0.25,
    locked: false,
  });

  useEffect(() => {
    const s = ref.current;
    const down = (e: KeyboardEvent) => {
      const k = e.code;
      if (k === "KeyW" || k === "ArrowUp") s.forward = true;
      else if (k === "KeyS" || k === "ArrowDown") s.back = true;
      else if (k === "KeyA" || k === "ArrowLeft") s.left = true;
      else if (k === "KeyD" || k === "ArrowRight") s.right = true;
      else if (k === "Space") s.jump = true;
      else if (k === "ShiftLeft" || k === "ShiftRight") s.sprint = true;
      else if (k === "KeyE" || k === "Enter") s.interact = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = e.code;
      if (k === "KeyW" || k === "ArrowUp") s.forward = false;
      else if (k === "KeyS" || k === "ArrowDown") s.back = false;
      else if (k === "KeyA" || k === "ArrowLeft") s.left = false;
      else if (k === "KeyD" || k === "ArrowRight") s.right = false;
      else if (k === "Space") s.jump = false;
      else if (k === "ShiftLeft" || k === "ShiftRight") s.sprint = false;
      else if (k === "KeyE" || k === "Enter") s.interact = false;
    };
    const move = (e: MouseEvent) => {
      if (!s.locked) return;
      s.yaw -= e.movementX * 0.0025;
      s.pitch -= e.movementY * 0.0025;
      const limit = Math.PI / 2.2;
      if (s.pitch > limit) s.pitch = limit;
      if (s.pitch < -limit) s.pitch = -limit;
    };
    const lockChange = () => {
      s.locked = !!document.pointerLockElement;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("mousemove", move);
    document.addEventListener("pointerlockchange", lockChange);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("mousemove", move);
      document.removeEventListener("pointerlockchange", lockChange);
    };
  }, []);

  return ref;
}
