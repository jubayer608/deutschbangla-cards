"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Ambient WebGL backdrop for the landing hero.
 *
 * Instanced-style floating letter tiles (D-E-U-T-S-C-H + umlauts) drawn as
 * lightweight canvas textures on planes, plus soft particle dust. Everything
 * is decoration: headline + CTAs live in DOM above and stay crisp without it.
 *
 * Perf / safety rules:
 * - DPR capped at 1.5 (mobile renders nothing — static CSS gradient instead)
 * - Rendering pauses when the hero scrolls out of view (IntersectionObserver)
 * - Never mounts when prefers-reduced-motion is set or WebGL is unavailable
 */
const TILE_CHARS = ["D", "E", "U", "T", "S", "C", "H", "Ä", "Ö", "Ü", "ß", "A1"];

const TILE_INKS = ["#047857", "#0f766e", "#b45309", "#065f46"];
const TILE_WASH = ["#d1fae5", "#ccfbf1", "#fef3c7", "#a7f3d0"];

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeTileTexture(char: string, ink: string, wash: string): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");

  roundRect(ctx, 8, 8, size - 16, size - 16, 60);
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "rgba(255,255,255,0.96)");
  grad.addColorStop(1, wash);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = ink;
  ctx.globalAlpha = 0.28;
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = ink;
  ctx.font = `800 ${char.length > 1 ? 110 : 150}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(char, size / 2, size / 2 + 8);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

interface TileConfig {
  x: number;
  y: number;
  z: number;
  scale: number;
  phase: number;
  speed: number;
  rz: number;
  texture: THREE.CanvasTexture;
}

function LetterTiles() {
  const group = useRef<THREE.Group>(null);

  const tiles = useMemo<TileConfig[]>(() => {
    // Deterministic pseudo-random spread so SSR-off first paint is stable.
    let seed = 42;
    const rand = () => {
      seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    return TILE_CHARS.map((char, i) => ({
      x: -7.5 + (i / (TILE_CHARS.length - 1)) * 15 + (rand() - 0.5) * 2.2,
      y: -3.2 + rand() * 6.4,
      z: -3.5 + rand() * 4,
      scale: 1.05 + rand() * 0.75,
      phase: rand() * Math.PI * 2,
      speed: 0.35 + rand() * 0.45,
      rz: (rand() - 0.5) * 0.5,
      texture: makeTileTexture(char, TILE_INKS[i % TILE_INKS.length], TILE_WASH[i % TILE_WASH.length]),
    }));
  }, []);

  useEffect(() => {
    return () => {
      tiles.forEach((t) => t.texture.dispose());
    };
  }, [tiles]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.children.forEach((child, i) => {
      const cfg = tiles[i];
      if (!cfg) return;
      child.position.y = cfg.y + Math.sin(t * cfg.speed + cfg.phase) * 0.35;
      child.rotation.z = cfg.rz + Math.sin(t * cfg.speed * 0.7 + cfg.phase) * 0.08;
    });
    // Pointer parallax (lerped so it feels weighty, not twitchy)
    const px = state.pointer.x;
    const py = state.pointer.y;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, px * 0.32, 0.045);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -py * 0.22, 0.045);
    // Gentle scroll-linked drift: tiles sink as the hero leaves the viewport
    if (typeof window !== "undefined") {
      g.position.y = -Math.min(window.scrollY, 900) * 0.0011;
    }
  });

  return (
    <group ref={group}>
      {tiles.map((cfg, i) => (
        <mesh key={i} position={[cfg.x, cfg.y, cfg.z]} rotation={[0, 0, cfg.rz]} scale={cfg.scale}>
          <planeGeometry args={[1.15, 1.15]} />
          <meshBasicMaterial map={cfg.texture} transparent opacity={0.9} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function Dust({ count = 140 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    let seed = 7;
    const rand = () => {
      seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * 18;
      arr[i * 3 + 1] = (rand() - 0.5) * 9;
      arr[i * 3 + 2] = -4 + rand() * 5;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    const p = points.current;
    if (!p) return;
    p.rotation.z = state.clock.elapsedTime * 0.018;
    p.position.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.3;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        color="#10b981"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function webglAvailable(): boolean {
  try {
    if (typeof window === "undefined" || !window.WebGLRenderingContext) return false;
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

export default function HeroScene() {
  const [enabled, setEnabled] = useState(false);
  const [inView, setInView] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smallScreen = window.matchMedia("(max-width: 639px)").matches;
    if (reducedMotion || smallScreen || !webglAvailable()) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {enabled && (
        <Canvas
          dpr={[1, 1.5]}
          frameloop={inView ? "always" : "never"}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "low-power",
            stencil: false,
            depth: true,
          }}
          camera={{ position: [0, 0, 10], fov: 48 }}
          style={{ position: "absolute", inset: 0 }}
        >
          <LetterTiles />
          <Dust />
        </Canvas>
      )}
    </div>
  );
}
