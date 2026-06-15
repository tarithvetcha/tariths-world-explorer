/**
 * Sky + lighting driven by useGame().timeOfDay (0..1).
 * Auto-cycles slowly; UI can override.
 */
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useGame } from "../store";

export function SkyAndSun() {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const setTime = useGame((s) => s.setTimeOfDay);
  const paused = useGame((s) => s.paused);

  useFrame((_, dt) => {
    if (!paused) {
      const cur = useGame.getState().timeOfDay;
      // Full day = 4 minutes; gives a chill, noticeable cycle without being distracting.
      setTime((cur + dt / 240) % 1);
    }
    const t = useGame.getState().timeOfDay;
    const angle = t * Math.PI * 2 - Math.PI / 2;
    const sunY = Math.sin(angle);
    const sunX = Math.cos(angle);

    if (sunRef.current) {
      sunRef.current.position.set(sunX * 40, sunY * 40, 20);
      sunRef.current.intensity = Math.max(0, sunY) * 1.2 + 0.05;
      const dayColor = new THREE.Color("#fff7d6");
      const sunsetColor = new THREE.Color("#fb923c");
      const nightColor = new THREE.Color("#1e293b");
      let target;
      if (sunY > 0.3) target = dayColor;
      else if (sunY > -0.05) target = sunsetColor;
      else target = nightColor;
      sunRef.current.color.copy(target);
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = Math.max(0.15, sunY * 0.7 + 0.2);
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <hemisphereLight ref={hemiRef} args={["#cfe9ff", "#1f2937", 0.6]} />
      <directionalLight
        ref={sunRef}
        position={[20, 30, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-near={1}
        shadow-camera-far={120}
      />
    </>
  );
}

export function SkyDome() {
  // Procedural sky based on time of day
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(() => {
    const t = useGame.getState().timeOfDay;
    const angle = t * Math.PI * 2 - Math.PI / 2;
    const sunY = Math.sin(angle);
    if (!matRef.current) return;
    let top: THREE.Color, bot: THREE.Color;
    if (sunY > 0.3) { top = new THREE.Color("#6cb4ff"); bot = new THREE.Color("#cfe9ff"); }
    else if (sunY > -0.05) { top = new THREE.Color("#2b1d4a"); bot = new THREE.Color("#fb923c"); }
    else { top = new THREE.Color("#020617"); bot = new THREE.Color("#0f172a"); }
    matRef.current.uniforms.uTop.value.copy(top);
    matRef.current.uniforms.uBot.value.copy(bot);
  });

  return (
    <mesh ref={ref} scale={[400, 400, 400]}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial
        ref={matRef}
        side={2 /* BackSide */}
        uniforms={{
          uTop: { value: new THREE.Color("#6cb4ff") },
          uBot: { value: new THREE.Color("#cfe9ff") },
        }}
        vertexShader={`
          varying vec3 vWorld;
          void main(){ vWorld = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
        `}
        fragmentShader={`
          varying vec3 vWorld;
          uniform vec3 uTop;
          uniform vec3 uBot;
          void main(){
            float t = clamp(normalize(vWorld).y * 0.5 + 0.5, 0.0, 1.0);
            vec3 col = mix(uBot, uTop, t);
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}
