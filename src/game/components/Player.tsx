/**
 * Third-person player controller.
 * Physics: per-frame velocity + gravity + ground snap to voxel height.
 * Camera: spring-arm orbit, mouse-driven, pointer-lock enabled.
 * Visuals: voxel-style hoodie character (Tarith).
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { groundAt } from "./World";
import type { InputState } from "../hooks/useInput";
import { POIS } from "../data/locations";
import { useGame } from "../store";

interface Props {
  input: React.MutableRefObject<InputState>;
}

const SPEED_WALK = 4.5;
const SPEED_RUN = 8.0;
const JUMP_VEL = 7.2;
const GRAVITY = -22;

export function Player({ input }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();
  const openPOI = useGame((s) => s.openPOI);
  const setNearby = useGame((s) => s.setNearby);
  const paused = useGame((s) => s.paused);

  const state = useMemo(
    () => ({
      pos: new THREE.Vector3(0, 4, 6),
      vel: new THREE.Vector3(),
      onGround: false,
      bob: 0,
      cameraDist: 6,
      lastInteract: false,
    }),
    [],
  );

  // Click on canvas → request pointer lock for camera control.
  useEffect(() => {
    const el = gl.domElement;
    const onClick = () => {
      if (!input.current.locked && !paused) {
        el.requestPointerLock?.();
      }
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [gl, input, paused]);

  useFrame((_, dt) => {
    if (paused) return;
    dt = Math.min(dt, 0.05); // clamp to keep physics stable on hiccups
    const i = input.current;

    // Movement vector in camera-yaw space
    const forward = (i.forward ? 1 : 0) - (i.back ? 1 : 0);
    const strafe = (i.right ? 1 : 0) - (i.left ? 1 : 0);
    const sprint = i.sprint;
    const speed = sprint ? SPEED_RUN : SPEED_WALK;

    const yaw = i.yaw;
    const dirX = Math.sin(yaw) * forward + Math.cos(yaw) * strafe;
    const dirZ = Math.cos(yaw) * forward - Math.sin(yaw) * strafe;
    const mag = Math.hypot(dirX, dirZ);
    if (mag > 0.001) {
      state.vel.x = (dirX / mag) * speed;
      state.vel.z = (dirZ / mag) * speed;
      // Face direction of motion
      const targetYaw = Math.atan2(dirX, dirZ);
      if (groupRef.current) {
        const cur = groupRef.current.rotation.y;
        groupRef.current.rotation.y = lerpAngle(cur, targetYaw, 0.2);
      }
    } else {
      state.vel.x *= 0.7;
      state.vel.z *= 0.7;
    }

    // Gravity & jump
    state.vel.y += GRAVITY * dt;
    if (i.jump && state.onGround) {
      state.vel.y = JUMP_VEL;
      state.onGround = false;
    }

    // Integrate
    state.pos.x += state.vel.x * dt;
    state.pos.y += state.vel.y * dt;
    state.pos.z += state.vel.z * dt;

    // Clamp inside world disc
    const r = Math.hypot(state.pos.x, state.pos.z);
    if (r > 58) {
      state.pos.x = (state.pos.x / r) * 58;
      state.pos.z = (state.pos.z / r) * 58;
    }

    // Ground collision (voxel column sample)
    const g = groundAt(state.pos.x, state.pos.z);
    if (state.pos.y <= g + 0.0) {
      state.pos.y = g;
      state.vel.y = 0;
      state.onGround = true;
    } else {
      state.onGround = false;
    }

    // Walk bob
    if (state.onGround && mag > 0.001) {
      state.bob += dt * (sprint ? 14 : 9);
    }

    if (groupRef.current) {
      groupRef.current.position.copy(state.pos);
      // Apply bob to the visible mesh, not the root (keeps physics clean)
      const head = groupRef.current.children[0] as THREE.Object3D | undefined;
      if (head) head.position.y = Math.sin(state.bob) * 0.06;
    }

    // Camera: spring-arm behind player
    const camYaw = i.yaw;
    const camPitch = i.pitch;
    const targetCamPos = new THREE.Vector3(
      state.pos.x - Math.sin(camYaw) * Math.cos(camPitch) * state.cameraDist,
      state.pos.y + 2.4 + Math.sin(-camPitch) * state.cameraDist * 0.6,
      state.pos.z - Math.cos(camYaw) * Math.cos(camPitch) * state.cameraDist,
    );
    camera.position.lerp(targetCamPos, 0.15);
    camera.lookAt(state.pos.x, state.pos.y + 1.4, state.pos.z);

    // Dynamic FOV (sprint feel)
    const cam = camera as THREE.PerspectiveCamera;
    const targetFov = sprint && mag > 0.001 ? 78 : 70;
    cam.fov += (targetFov - cam.fov) * 0.08;
    cam.updateProjectionMatrix();

    // POI proximity & interaction
    let nearest: { id: string; d: number } | null = null;
    for (const p of POIS) {
      const dx = p.position[0] - state.pos.x;
      const dz = p.position[2] - state.pos.z;
      const d = Math.hypot(dx, dz);
      if (d < 3.5 && (!nearest || d < nearest.d)) nearest = { id: p.id, d };
    }
    setNearby((nearest?.id as never) ?? null);

    if (i.interact && !state.lastInteract && nearest) {
      openPOI(nearest.id as never);
    }
    state.lastInteract = i.interact;
  });

  return (
    <group ref={groupRef} position={[0, 4, 6]}>
      {/* All character parts share a wrapper to inherit yaw rotation from group */}
      <group>
        <TarithVoxel />
      </group>
    </group>
  );
}

function lerpAngle(a: number, b: number, t: number) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

/**
 * Voxel character — original design, NOT a Steve/Alex copy.
 * Hoodie + backpack + headphones + brown skin tone + dark hair.
 */
export function TarithVoxel({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      {/* legs */}
      <mesh position={[-0.18, 0.4, 0]} castShadow>
        <boxGeometry args={[0.32, 0.8, 0.32]} />
        <meshLambertMaterial color="#1e3a8a" />
      </mesh>
      <mesh position={[0.18, 0.4, 0]} castShadow>
        <boxGeometry args={[0.32, 0.8, 0.32]} />
        <meshLambertMaterial color="#1e3a8a" />
      </mesh>
      {/* hoodie body */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.85, 0.9, 0.5]} />
        <meshLambertMaterial color="#0f172a" />
      </mesh>
      {/* hood */}
      <mesh position={[0, 1.7, -0.18]} castShadow>
        <boxGeometry args={[0.9, 0.35, 0.55]} />
        <meshLambertMaterial color="#0f172a" />
      </mesh>
      {/* head (skin) */}
      <mesh position={[0, 1.85, 0.05]} castShadow>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshLambertMaterial color="#a16207" />
      </mesh>
      {/* hair tuft */}
      <mesh position={[0, 2.12, 0.05]} castShadow>
        <boxGeometry args={[0.55, 0.12, 0.55]} />
        <meshLambertMaterial color="#1c1917" />
      </mesh>
      {/* eyes */}
      <mesh position={[-0.13, 1.9, 0.34]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      <mesh position={[0.13, 1.9, 0.34]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      {/* headphones */}
      <mesh position={[-0.32, 1.9, 0.05]} castShadow>
        <boxGeometry args={[0.1, 0.2, 0.2]} />
        <meshLambertMaterial color="#dc2626" />
      </mesh>
      <mesh position={[0.32, 1.9, 0.05]} castShadow>
        <boxGeometry args={[0.1, 0.2, 0.2]} />
        <meshLambertMaterial color="#dc2626" />
      </mesh>
      <mesh position={[0, 2.18, 0.05]}>
        <boxGeometry args={[0.65, 0.06, 0.06]} />
        <meshLambertMaterial color="#7f1d1d" />
      </mesh>
      {/* arms */}
      <mesh position={[-0.55, 1.15, 0]} castShadow>
        <boxGeometry args={[0.25, 0.85, 0.4]} />
        <meshLambertMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.55, 1.15, 0]} castShadow>
        <boxGeometry args={[0.25, 0.85, 0.4]} />
        <meshLambertMaterial color="#0f172a" />
      </mesh>
      {/* backpack */}
      <mesh position={[0, 1.15, -0.32]} castShadow>
        <boxGeometry args={[0.7, 0.7, 0.22]} />
        <meshLambertMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 1.15, -0.43]}>
        <boxGeometry args={[0.4, 0.4, 0.05]} />
        <meshLambertMaterial color="#facc15" />
      </mesh>
    </group>
  );
}
