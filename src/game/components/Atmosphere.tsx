/**
 * Ambient world detail: clouds, fireflies, falling leaves.
 * Everything is GPU-cheap — sprites/particles on simple meshes, animated on CPU.
 */
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export function Clouds({ count = 16 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const clouds = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        x: (Math.random() - 0.5) * 140,
        z: (Math.random() - 0.5) * 140,
        y: 28 + Math.random() * 8,
        s: 4 + Math.random() * 6,
        speed: 0.4 + Math.random() * 0.6,
        seed: i,
      })),
    [count],
  );

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((c, i) => {
      c.position.x += clouds[i].speed * dt;
      if (c.position.x > 80) c.position.x = -80;
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]}>
          <boxGeometry args={[c.s, 1.2, c.s * 0.6]} />
          <meshLambertMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export function Fireflies({ count = 60 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = 1 + Math.random() * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const attr = ref.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const t = clock.getElapsedTime();
    for (let i = 0; i < attr.count; i++) {
      const y = 1 + Math.sin(t * 0.8 + i) * 0.4 + 2 + (i % 4);
      attr.setY(i, y);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial size={0.18} color="#fbbf24" transparent opacity={0.9} sizeAttenuation />
    </points>
  );
}
