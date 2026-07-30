import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import { OrbitControls, Sky, Text, Float, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, CloudRain, Cloud, Info, XCircle, Eye, EyeOff, Zap, Droplets, Thermometer, Wind, Activity,
  Play, Pause, FastForward, FlaskConical, Leaf, Bug, Sprout, BarChart3, TrendingUp,
  ChevronDown, ChevronUp, Gauge, Waves, SunDim, Snowflake, Maximize2, Minimize2
} from 'lucide-react';
import * as THREE from 'three';
import { healthStatusColor } from '../utils/mockData';

// ════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ════════════════════════════════════════════════════════════════

interface SimState {
  growthStage: number;      // 0–1
  soilPh: number;           // 4–9
  rainfallMm: number;       // 0–1200
  nitrogenPpm: number;      // 20–300
  temperature: number;      // 10–50
  windSpeed: number;        // 0–60
  diseasePressure: 'none' | 'low' | 'medium' | 'high';
  irrigationMode: 'off' | 'drip' | 'sprinkler' | 'flood';
  timelinePlaying: boolean;
  timelineDay: number;      // 0–180
  timelineSpeed: number;    // 1, 2, 5
}

const defaultSim: SimState = {
  growthStage: 0.7,
  soilPh: 6.5,
  rainfallMm: 800,
  nitrogenPpm: 140,
  temperature: 28,
  windSpeed: 14,
  diseasePressure: 'none',
  irrigationMode: 'off',
  timelinePlaying: false,
  timelineDay: 120,
  timelineSpeed: 1,
};

const plotData = [
  { id: 'p1', name: 'Plot A — Wheat Field', crop: 'Wheat', status: 'healthy', area: '3.5 ha', moisture: '42%', ndvi: '0.82', lastIrrigation: '2h ago' },
  { id: 'p2', name: 'Plot B — Maize Field', crop: 'Maize', status: 'water_stress', area: '4.0 ha', moisture: '18%', ndvi: '0.61', lastIrrigation: '28h ago' },
  { id: 'p3', name: 'Plot C — Tomato Garden', crop: 'Tomato', status: 'disease', area: '2.5 ha', moisture: '35%', ndvi: '0.44', lastIrrigation: '5h ago' },
  { id: 'p4', name: 'Plot D — Cotton Field', crop: 'Cotton', status: 'healthy', area: '2.5 ha', moisture: '38%', ndvi: '0.79', lastIrrigation: '6h ago' },
];

const telemetryData = [
  { label: 'Soil Temp', value: '24.5°C', icon: Thermometer, color: 'text-amber-400' },
  { label: 'Wind', value: '14.2 km/h', icon: Wind, color: 'text-blue-400' },
  { label: 'Humidity', value: '68%', icon: Droplets, color: 'text-cyan-400' },
  { label: 'Health', value: '87/100', icon: Activity, color: 'text-emerald-400' },
];

const GROWTH_PHASES = [
  { day: 0, label: 'Sowing', emoji: '🌱' },
  { day: 20, label: 'Germination', emoji: '🌿' },
  { day: 55, label: 'Vegetative', emoji: '🌾' },
  { day: 90, label: 'Flowering', emoji: '🌸' },
  { day: 130, label: 'Fruiting', emoji: '🍅' },
  { day: 165, label: 'Harvest', emoji: '🧺' },
];

// ════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════════

const noise2D = (x: number, y: number): number => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

const smoothNoise = (x: number, y: number, scale: number, octaves: number): number => {
  let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise2D(x * frequency / scale, y * frequency / scale) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / maxValue;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Frontend mirror of backend yield logic, augmented with sim params */
export const calculateYield = (sim: SimState, cropType: string) => {
  const baseYields: Record<string, number> = { wheat: 4.5, maize: 5.2, tomato: 22.0, cotton: 2.8 };
  const basePrices: Record<string, number> = { wheat: 24500, maize: 18900, tomato: 15000, cotton: 62000 };
  const base = baseYields[cropType.toLowerCase()] || 3.5;
  const price = basePrices[cropType.toLowerCase()] || 20000;

  const phFactor = Math.max(0.5, 1 - Math.abs(6.5 - sim.soilPh) * 0.12);
  const rainfallFactor = Math.max(0.4, 1 - Math.abs(800 - sim.rainfallMm) * 0.0005);
  const nitrogenFactor = clamp(1 + (sim.nitrogenPpm - 140) * 0.001, 0.6, 1.25);
  const growthFactor = Math.min(1, sim.growthStage * 1.15);
  const diseaseFactor = sim.diseasePressure === 'none' ? 1 : sim.diseasePressure === 'low' ? 0.88 : sim.diseasePressure === 'medium' ? 0.7 : 0.45;
  const tempFactor = Math.max(0.5, 1 - Math.abs(25 - sim.temperature) * 0.025);
  const irrigFactor = sim.irrigationMode === 'off' ? (sim.rainfallMm > 500 ? 1 : 0.7) : 1.08;

  const yieldPerHa = base * phFactor * rainfallFactor * nitrogenFactor * growthFactor * diseaseFactor * tempFactor * irrigFactor;
  const totalYield = yieldPerHa * 12.5;
  const revenue = totalYield * (price / 10);
  const riskScore = clamp(
    (sim.diseasePressure === 'high' ? 40 : sim.diseasePressure === 'medium' ? 25 : sim.diseasePressure === 'low' ? 10 : 0) +
    (Math.abs(sim.soilPh - 6.5) > 1.5 ? 20 : 0) +
    (sim.rainfallMm < 300 || sim.rainfallMm > 1000 ? 20 : 0) +
    (sim.temperature > 40 || sim.temperature < 15 ? 15 : 0) +
    (sim.nitrogenPpm < 60 ? 15 : 0), 0, 100
  );
  return { yieldPerHa: +yieldPerHa.toFixed(2), totalYield: +totalYield.toFixed(1), revenue: Math.round(revenue), riskScore };
};

const riskLabel = (score: number) => score < 20 ? 'Low' : score < 45 ? 'Medium' : score < 70 ? 'High' : 'Critical';
const riskColor = (score: number) => score < 20 ? '#10B981' : score < 45 ? '#F59E0B' : score < 70 ? '#EF4444' : '#DC2626';

/** Compute plant visual color from simulation */
const plantColor = (baseColor: string, sim: SimState): string => {
  const c = new THREE.Color(baseColor);
  // Nitrogen deficit → yellowish chlorosis
  if (sim.nitrogenPpm < 80) c.lerp(new THREE.Color('#c4b54a'), (80 - sim.nitrogenPpm) / 80);
  // Disease → brownish
  if (sim.diseasePressure === 'medium') c.lerp(new THREE.Color('#7a5c3a'), 0.25);
  if (sim.diseasePressure === 'high') c.lerp(new THREE.Color('#5a3a2a'), 0.45);
  // Drought
  if (sim.rainfallMm < 300 && sim.irrigationMode === 'off') c.lerp(new THREE.Color('#8a7a4a'), 0.3);
  // Frost
  if (sim.temperature < 12) c.lerp(new THREE.Color('#b0c4d8'), 0.3);
  return '#' + c.getHexString();
};

// ════════════════════════════════════════════════════════════════
// 3D COMPONENTS — TERRAIN & ENVIRONMENT
// ════════════════════════════════════════════════════════════════

/** Procedural terrain with rolling hills and color variation */
const ProceduralTerrain = ({ sim }: { sim: SimState }) => {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(130, 130, 96, 96);
    const pos = geo.attributes.position.array as Float32Array;
    const colors = new Float32Array(pos.length);
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i], y = pos[i + 1];
      const dist = Math.sqrt(x * x + y * y);
      const flattenFactor = clamp((dist - 28) / 18, 0, 1);
      pos[i + 2] = smoothNoise(x, y, 28, 4) * 3.5 * flattenFactor;
      // Color variation
      const g = 0.18 + smoothNoise(x + 200, y + 200, 15, 3) * 0.12;
      colors[i] = 0.12 + noise2D(x * 0.3, y * 0.3) * 0.06;
      colors[i + 1] = g;
      colors[i + 2] = 0.04 + noise2D(x * 0.5, y * 0.7) * 0.03;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Drought soil tinting
  const soilDrought = sim.rainfallMm < 400 && sim.irrigationMode === 'off';

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow geometry={geometry}>
      <meshStandardMaterial
        vertexColors
        roughness={0.95}
        color={soilDrought ? '#4a4028' : '#ffffff'}
      />
    </mesh>
  );
};

/** Instanced grass blades scattered across open ground */
const GrassField = ({ sim }: { sim: SimState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 600;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 95;
      const z = (Math.random() - 0.5) * 95;
      // skip areas where plots are
      if (Math.abs(x) < 22 && Math.abs(z) < 22) continue;
      dummy.position.set(x, 0.08, z);
      dummy.rotation.set(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.15);
      dummy.scale.set(0.4 + Math.random() * 0.6, 0.3 + Math.random() * 0.8, 1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  const grassColor = useMemo(() => {
    if (sim.rainfallMm < 300) return '#4a5a28';
    if (sim.temperature < 12) return '#5a7a6a';
    return '#2d5016';
  }, [sim.rainfallMm, sim.temperature]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[0.2, 0.5]} />
      <meshStandardMaterial color={grassColor} side={THREE.DoubleSide} roughness={0.8} />
    </instancedMesh>
  );
};

/** Puddles that appear in wet conditions */
const Puddles = ({ sim }: { sim: SimState }) => {
  const visible = sim.rainfallMm > 700 || sim.irrigationMode === 'flood';
  const puddles = useMemo(() => {
    const result: [number, number, number, number][] = [];
    for (let i = 0; i < 12; i++) {
      result.push([
        (Math.random() - 0.5) * 70,
        (Math.random() - 0.5) * 70,
        0.6 + Math.random() * 1.2,
        Math.random() * Math.PI
      ]);
    }
    return result;
  }, []);

  if (!visible) return null;
  return (
    <group>
      {puddles.map(([x, z, r, rot], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, rot]} position={[x, 0.02, z]}>
          <circleGeometry args={[r, 16]} />
          <meshStandardMaterial color="#3b6faa" transparent opacity={0.35} metalness={0.6} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
};

// ════════════════════════════════════════════════════════════════
// 3D COMPONENTS — PLANTS & PLOTS
// ════════════════════════════════════════════════════════════════

/** Growth-stage-aware plant with crop-specific geometry */
const GrowthPlant = ({ position, baseColor, type, sim }: {
  position: [number, number, number]; baseColor: string; type: string; sim: SimState
}) => {
  const ref = useRef<THREE.Group>(null);
  const swayOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  const swaySpeed = useMemo(() => 0.25 + Math.random() * 0.35, []);
  const heightSeed = useMemo(() => 0.85 + Math.random() * 0.3, []);

  const growth = sim.growthStage;
  const windAmp = clamp(sim.windSpeed / 30, 0.02, 0.25);
  const h = heightSeed * growth; // height scales with growth
  const color = plantColor(baseColor, sim);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.rotation.z = Math.sin(t * swaySpeed + swayOffset) * windAmp;
    ref.current.rotation.x = Math.cos(t * swaySpeed * 0.6 + swayOffset) * windAmp * 0.5;
  });

  if (growth < 0.05) return null; // not sown yet

  const lc = type.toLowerCase();

  if (lc === 'wheat') {
    return (
      <group ref={ref} position={position}>
        <mesh position={[0, h * 0.4, 0]}>
          <cylinderGeometry args={[0.025, 0.045, h * 0.8, 6]} />
          <meshStandardMaterial color={color} roughness={0.65} />
        </mesh>
        {growth > 0.4 && (
          <mesh position={[0.07, h * 0.45, 0]} rotation={[0, 0, 0.6]}>
            <boxGeometry args={[0.22, 0.02, 0.05]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        )}
        {growth > 0.5 && (
          <mesh position={[-0.05, h * 0.32, 0.04]} rotation={[0, 0.4, -0.5]}>
            <boxGeometry args={[0.18, 0.02, 0.04]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        )}
        {growth > 0.65 && (
          <mesh position={[0, h * 0.85, 0]}>
            <sphereGeometry args={[0.08 + growth * 0.05, 8, 6]} />
            <meshStandardMaterial color="#c4a94a" roughness={0.5} emissive="#c4a94a" emissiveIntensity={0.04} />
          </mesh>
        )}
      </group>
    );
  }

  if (lc === 'maize') {
    return (
      <group ref={ref} position={position}>
        <mesh position={[0, h * 0.42, 0]}>
          <cylinderGeometry args={[0.04, 0.06, h * 0.85, 6]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        {growth > 0.35 && (
          <>
            <mesh position={[0.1, h * 0.5, 0]} rotation={[0, 0, 0.5]}>
              <boxGeometry args={[0.3, 0.025, 0.06]} />
              <meshStandardMaterial color={color} roughness={0.55} />
            </mesh>
            <mesh position={[-0.08, h * 0.38, 0.04]} rotation={[0, 0.3, -0.45]}>
              <boxGeometry args={[0.25, 0.025, 0.05]} />
              <meshStandardMaterial color={color} roughness={0.55} />
            </mesh>
          </>
        )}
        {growth > 0.6 && (
          <mesh position={[0.06, h * 0.7, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.18, 6]} />
            <meshStandardMaterial color="#d4a840" roughness={0.5} />
          </mesh>
        )}
        {growth > 0.8 && (
          <mesh position={[0, h * 0.92, 0]}>
            <coneGeometry args={[0.06, 0.12, 6]} />
            <meshStandardMaterial color="#e8d4a0" roughness={0.4} />
          </mesh>
        )}
      </group>
    );
  }

  if (lc === 'tomato') {
    return (
      <group ref={ref} position={position}>
        <mesh position={[0, h * 0.35, 0]}>
          <cylinderGeometry args={[0.035, 0.055, h * 0.7, 6]} />
          <meshStandardMaterial color={color} roughness={0.65} />
        </mesh>
        {growth > 0.3 && (
          <mesh position={[0, h * 0.65, 0]}>
            <dodecahedronGeometry args={[0.14 + growth * 0.06, 0]} />
            <meshStandardMaterial color={color} roughness={0.4} emissive={color} emissiveIntensity={0.06} />
          </mesh>
        )}
        {growth > 0.45 && (
          <mesh position={[0.1, h * 0.5, 0.06]}>
            <dodecahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
        )}
        {/* Fruit appears at fruiting stage */}
        {growth > 0.7 && (
          <>
            <mesh position={[0.08, h * 0.55, -0.05]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color={growth > 0.85 ? '#e53e3e' : '#6aaa3a'} roughness={0.3} />
            </mesh>
            <mesh position={[-0.06, h * 0.48, 0.07]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color={growth > 0.9 ? '#dc2626' : '#7aaa44'} roughness={0.3} />
            </mesh>
          </>
        )}
      </group>
    );
  }

  // Cotton / default
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, h * 0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.06, h * 0.7, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {growth > 0.35 && (
        <mesh position={[0, h * 0.65, 0]}>
          <dodecahedronGeometry args={[0.12 + growth * 0.05, 0]} />
          <meshStandardMaterial color={color} roughness={0.4} emissive={color} emissiveIntensity={0.05} />
        </mesh>
      )}
      {/* Cotton bolls */}
      {growth > 0.75 && (
        <>
          <mesh position={[0.09, h * 0.7, 0.04]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#f0ebe0" roughness={0.3} />
          </mesh>
          <mesh position={[-0.05, h * 0.6, -0.06]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#ede8d8" roughness={0.35} />
          </mesh>
        </>
      )}
    </group>
  );
};

/** Farm Plot with dense crop rows, soil simulation, and selection */
const FarmPlot3D = ({ position, size, status, name, crop, onClick, selected, isInspecting, sim }: any) => {
  const color = healthStatusColor(status);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const plants = useMemo(() => {
    const result: any[] = [];
    const rows = 8, perRow = 12, padding = 1.2;
    const rowSp = (size[0] - padding * 2) / (rows - 1);
    const plantSp = (size[2] - padding * 2) / (perRow - 1);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < perRow; j++) {
        const x = -size[0] / 2 + padding + rowSp * i + (Math.random() - 0.5) * 0.15;
        const z = -size[2] / 2 + padding + plantSp * j + (Math.random() - 0.5) * 0.15;
        result.push(
          <GrowthPlant
            key={`${i}-${j}`}
            position={[x, size[1] / 2, z]}
            baseColor={color}
            type={crop}
            sim={sim}
          />
        );
      }
    }
    return result;
  }, [size, color, crop, sim.growthStage, sim.diseasePressure, sim.nitrogenPpm, sim.rainfallMm, sim.temperature, sim.irrigationMode, sim.windSpeed]);

  const soilColor = useMemo(() => {
    let c = new THREE.Color(status === 'water_stress' ? '#5a4a30' : status === 'disease' ? '#4a3528' : '#3d4a28');
    if (sim.rainfallMm < 300 && sim.irrigationMode === 'off') c.lerp(new THREE.Color('#6a5a3a'), 0.4);
    if (sim.rainfallMm > 900) c.lerp(new THREE.Color('#2a3a20'), 0.3);
    if (sim.temperature < 12) c.lerp(new THREE.Color('#8a9aaa'), 0.25);
    return '#' + c.getHexString();
  }, [status, sim.rainfallMm, sim.irrigationMode, sim.temperature]);

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* Soil */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={soilColor} roughness={0.92} metalness={0.03} />
      </mesh>
      {/* Border glow */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[size[0] + 0.15, size[1] + 0.02, size[2] + 0.15]} />
        <meshBasicMaterial
          color={selected ? '#3B82F6' : hovered ? '#10B981' : '#1a2a1a'}
          wireframe transparent
          opacity={selected ? 0.8 : hovered ? 0.5 : 0.15}
        />
      </mesh>
      {selected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size[0] * 0.55, size[0] * 0.58, 32]} />
          <meshBasicMaterial color="#3B82F6" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
      {plants}
      {/* Flood water level */}
      {sim.irrigationMode === 'flood' && (
        <mesh position={[0, size[1] / 2 + 0.06, 0]}>
          <boxGeometry args={[size[0] - 0.5, 0.08, size[2] - 0.5]} />
          <meshStandardMaterial color="#3b6faa" transparent opacity={0.3} metalness={0.5} roughness={0.1} />
        </mesh>
      )}
      {isInspecting && (
        <Float speed={2} floatIntensity={0.3} position={[0, 2.8, 0]}>
          <Text fontSize={0.7} color="white" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000">
            {name}
          </Text>
        </Float>
      )}
    </group>
  );
};

// ════════════════════════════════════════════════════════════════
// 3D COMPONENTS — VEHICLES & SENSORS
// ════════════════════════════════════════════════════════════════

const Drone = ({ visible, windSpeed }: { visible: boolean; windSpeed: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const propRefs = useRef<THREE.Mesh[]>([]);
  const wobble = clamp(windSpeed / 40, 0, 0.5);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.position.x = Math.sin(t * 0.4) * 22;
    groupRef.current.position.z = Math.cos(t * 0.4) * 22;
    groupRef.current.position.y = 7 + Math.sin(t * 1.5) * 0.3 + Math.sin(t * 3) * wobble * 0.2;
    groupRef.current.rotation.y = -t * 0.4 + Math.PI / 2;
    groupRef.current.rotation.z = Math.sin(t * 2.5) * wobble * 0.15;
    propRefs.current.forEach((p) => { if (p) p.rotation.y += 0.8; });
  });

  if (!visible) return null;

  const arms: [number, number, number][] = [[0.6, 0.05, 0.6], [-0.6, 0.05, 0.6], [0.6, 0.05, -0.6], [-0.6, 0.05, -0.6]];

  return (
    <group ref={groupRef}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.15, 0.5]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
      </mesh>
      {arms.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh><cylinderGeometry args={[0.03, 0.03, 0.85, 6]} /><meshStandardMaterial color="#475569" metalness={0.4} /></mesh>
          <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.06, 0.06, 0.08, 8]} /><meshStandardMaterial color="#1e293b" metalness={0.7} /></mesh>
          <mesh position={[0, 0.14, 0]} ref={(el) => { if (el) propRefs.current[i] = el; }}>
            <cylinderGeometry args={[0.25, 0.25, 0.01, 16]} /><meshBasicMaterial color="#94a3b8" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.12, 0.1]}><sphereGeometry args={[0.06, 8, 8]} /><meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} /></mesh>
      <pointLight color="#ef4444" intensity={2} distance={4} position={[0, -0.05, 0.3]} />
      <pointLight color="#10B981" intensity={1.5} distance={3} position={[0, -0.05, -0.3]} />
      <spotLight position={[0, -0.2, 0]} angle={0.4} penumbra={0.5} intensity={3} distance={12} color="#10B981" />
    </group>
  );
};

const Tractor = () => {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.x = Math.sin(t * 0.15) * 18;
    ref.current.position.z = -5 + Math.cos(t * 0.15) * 3;
    ref.current.rotation.y = Math.cos(t * 0.15) * 0.15 + Math.PI / 2;
  });

  return (
    <group ref={ref} position={[0, 0, -5]}>
      <mesh position={[0, 0.6, 0]} castShadow><boxGeometry args={[1.4, 0.8, 2.4]} /><meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.3} /></mesh>
      <mesh position={[0, 1.3, -0.3]} castShadow><boxGeometry args={[1.2, 0.9, 1.4]} /><meshStandardMaterial color="#b91c1c" roughness={0.3} metalness={0.4} /></mesh>
      <mesh position={[0, 1.3, 0.41]}><planeGeometry args={[1.0, 0.7]} /><meshStandardMaterial color="#93c5fd" metalness={0.8} roughness={0.1} transparent opacity={0.7} /></mesh>
      {[-0.7, 0.7].map((x, i) => (
        <mesh key={`fw${i}`} position={[x, 0.25, 0.9]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.25, 0.25, 0.15, 12]} /><meshStandardMaterial color="#1f2937" roughness={0.8} /></mesh>
      ))}
      {[-0.75, 0.75].map((x, i) => (
        <mesh key={`rw${i}`} position={[x, 0.4, -0.8]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.45, 0.45, 0.2, 12]} /><meshStandardMaterial color="#1f2937" roughness={0.8} /></mesh>
      ))}
      <mesh position={[0.5, 1.2, 0.6]}><cylinderGeometry args={[0.04, 0.04, 0.6, 6]} /><meshStandardMaterial color="#374151" metalness={0.5} /></mesh>
      <pointLight position={[0, 0.6, 1.3]} color="#fbbf24" intensity={2} distance={8} />
    </group>
  );
};

const Sensor = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + Math.sin(clock.elapsedTime * 2 + position[0]) * 0.3;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.05, 0.05, 0.8, 6]} /><meshStandardMaterial color="#6b7280" metalness={0.5} /></mesh>
      <mesh ref={ref} position={[0, 0.9, 0]}><sphereGeometry args={[0.15, 12, 12]} /><meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.5} metalness={0.3} roughness={0.2} /></mesh>
      <pointLight position={[0, 0.9, 0]} color="#10B981" intensity={0.8} distance={3} />
    </group>
  );
};

// ════════════════════════════════════════════════════════════════
// 3D COMPONENTS — BUILDINGS & INFRASTRUCTURE
// ════════════════════════════════════════════════════════════════

const WaterTank = () => (
  <group position={[32, 0, 32]}>
    <mesh position={[0, 2, 0]} castShadow><cylinderGeometry args={[2.5, 2.5, 4, 16]} /><meshStandardMaterial color="#6366F1" roughness={0.3} metalness={0.5} /></mesh>
    <mesh position={[0, 4.1, 0]}><cylinderGeometry args={[2.6, 2.6, 0.2, 16]} /><meshStandardMaterial color="#4f46e5" metalness={0.6} /></mesh>
    {[0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2;
      return <mesh key={i} position={[Math.cos(a) * 2, 0.5, Math.sin(a) * 2]}><cylinderGeometry args={[0.12, 0.12, 1, 6]} /><meshStandardMaterial color="#374151" /></mesh>;
    })}
    <mesh position={[2.5, 1, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.15, 0.15, 3, 8]} /><meshStandardMaterial color="#3b82f6" metalness={0.4} /></mesh>
  </group>
);

/** Warehouse with solar panels on roof */
const EnhancedWarehouse = ({ position, color = '#475569' }: { position: [number, number, number]; color?: string }) => (
  <group position={position}>
    <mesh position={[0, 2.5, 0]} castShadow><boxGeometry args={[8, 5, 12]} /><meshStandardMaterial color={color} roughness={0.7} metalness={0.2} /></mesh>
    <mesh position={[0, 5.5, 0]} castShadow><boxGeometry args={[9, 0.5, 13]} /><meshStandardMaterial color="#334155" roughness={0.5} metalness={0.3} /></mesh>
    <mesh position={[0, 1.5, 6.01]}><boxGeometry args={[3, 3, 0.1]} /><meshStandardMaterial color="#1e293b" /></mesh>
    {[-2.5, 2.5].map((x, i) => (
      <mesh key={i} position={[x, 3.5, 6.01]}><boxGeometry args={[1.2, 0.8, 0.1]} /><meshStandardMaterial color="#93c5fd" metalness={0.7} roughness={0.1} transparent opacity={0.5} /></mesh>
    ))}
    {/* Solar panels on roof */}
    {[-2.5, 0, 2.5].map((x, i) => (
      <group key={`sp${i}`} position={[x, 5.9, i * 3 - 3]} rotation={[-0.3, 0, 0]}>
        <mesh><boxGeometry args={[2.2, 0.06, 1.4]} /><meshStandardMaterial color="#1a2744" metalness={0.85} roughness={0.15} /></mesh>
        <mesh position={[0, 0.035, 0]}><boxGeometry args={[2.1, 0.01, 1.3]} /><meshStandardMaterial color="#2a3a6a" metalness={0.9} roughness={0.1} /></mesh>
      </group>
    ))}
    <pointLight position={[0, 2, 7]} color="#fbbf24" intensity={1} distance={6} />
  </group>
);

/** Animated wind turbine */
const WindTurbine = () => {
  const bladeRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (bladeRef.current) bladeRef.current.rotation.z = clock.elapsedTime * 1.8;
  });
  return (
    <group position={[-36, 0, -32]}>
      {/* Tower */}
      <mesh position={[0, 8, 0]}><cylinderGeometry args={[0.25, 0.5, 16, 8]} /><meshStandardMaterial color="#d4d4d8" metalness={0.5} roughness={0.3} /></mesh>
      {/* Nacelle */}
      <mesh position={[0, 16.2, 0]}><boxGeometry args={[1.2, 0.8, 0.8]} /><meshStandardMaterial color="#e4e4e7" metalness={0.4} roughness={0.3} /></mesh>
      {/* Hub + Blades */}
      <group ref={bladeRef} position={[0, 16.2, 0.5]}>
        <mesh><cylinderGeometry args={[0.25, 0.25, 0.3, 8]} /><meshStandardMaterial color="#a1a1aa" metalness={0.5} /></mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos((i * Math.PI * 2) / 3) * 3.2, Math.sin((i * Math.PI * 2) / 3) * 3.2, 0.05]} rotation={[0, 0, (i * Math.PI * 2) / 3 + Math.PI / 2]}>
            <boxGeometry args={[0.35, 6, 0.04]} /><meshStandardMaterial color="#f4f4f5" metalness={0.3} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ════════════════════════════════════════════════════════════════
// 3D COMPONENTS — WATER & IRRIGATION
// ════════════════════════════════════════════════════════════════

const AnimatedWaterCanal = ({ visible }: { visible: boolean }) => {
  const waterRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (waterRef.current) {
      const geo = waterRef.current.geometry as THREE.PlaneGeometry;
      const pos = geo.attributes.position.array as Float32Array;
      const t = clock.elapsedTime;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 2] = Math.sin(pos[i] * 0.5 + t * 2) * 0.03 + Math.cos(pos[i + 1] * 0.8 + t * 1.5) * 0.02;
      }
      geo.attributes.position.needsUpdate = true;
    }
  });
  if (!visible) return null;

  return (
    <group>
      {/* Canal walls */}
      <mesh position={[0, -0.05, 0]}><boxGeometry args={[1.5, 0.3, 55]} /><meshStandardMaterial color="#1e3a5f" roughness={0.8} /></mesh>
      <mesh position={[0, -0.05, 0]}><boxGeometry args={[55, 0.3, 1.5]} /><meshStandardMaterial color="#1e3a5f" roughness={0.8} /></mesh>
      {/* Animated water surface */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <planeGeometry args={[54, 1.2, 32, 4]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.55} metalness={0.4} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <planeGeometry args={[1.2, 54, 4, 32]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.5} metalness={0.4} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

/** Sprinkler spray particles */
const SprinklerEffect = ({ active }: { active: boolean }) => {
  const ref = useRef<THREE.Points>(null);
  const count = 800;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 8;
      const plotIdx = Math.floor(Math.random() * 4);
      const offsets = [[-12, -12], [12, -12], [-12, 12], [12, 12]];
      p[i * 3] = offsets[plotIdx][0] + Math.cos(angle) * radius;
      p[i * 3 + 1] = Math.random() * 3;
      p[i * 3 + 2] = offsets[plotIdx][1] + Math.sin(angle) * radius;
    }
    return p;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current || !active) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const phase = (i / count) * Math.PI * 2;
      pos[i * 3 + 1] = Math.abs(Math.sin(t * 3 + phase)) * 3;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial color="#7dd3fc" size={0.06} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
};

/** Drip irrigation lines */
const DripLines = ({ active }: { active: boolean }) => {
  const ref = useRef<THREE.Points>(null);
  const count = 400;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const plotIdx = Math.floor(Math.random() * 4);
      const offsets = [[-12, -12], [12, -12], [-12, 12], [12, 12]];
      p[i * 3] = offsets[plotIdx][0] + (Math.random() - 0.5) * 16;
      p[i * 3 + 1] = Math.random() * 0.5;
      p[i * 3 + 2] = offsets[plotIdx][1] + (Math.random() - 0.5) * 16;
    }
    return p;
  }, []);

  useFrame(() => {
    if (!ref.current || !active) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= 0.03;
      if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 0.4 + Math.random() * 0.2;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial color="#60a5fa" size={0.04} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

// ════════════════════════════════════════════════════════════════
// 3D COMPONENTS — WEATHER EFFECTS
// ════════════════════════════════════════════════════════════════

const EnhancedRain = ({ active }: { active: boolean }) => {
  const rainRef = useRef<THREE.Points>(null);
  const lightningRef = useRef<THREE.PointLight>(null);
  const nextFlash = useRef(Math.random() * 5 + 3);
  const count = 800;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 90;
      p[i * 3 + 1] = Math.random() * 30;
      p[i * 3 + 2] = (Math.random() - 0.5) * 90;
    }
    return p;
  }, []);

  useFrame(({ clock }) => {
    if (!active) return;
    if (rainRef.current) {
      const pos = rainRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] -= 0.5;
        if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 25 + Math.random() * 5;
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
    // Lightning
    if (lightningRef.current) {
      const t = clock.elapsedTime;
      if (t > nextFlash.current) {
        lightningRef.current.intensity = 80;
        nextFlash.current = t + Math.random() * 8 + 4;
      } else {
        lightningRef.current.intensity = Math.max(0, lightningRef.current.intensity - 8);
      }
    }
  });

  if (!active) return null;
  return (
    <>
      <points ref={rainRef}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
        <pointsMaterial color="#93c5fd" size={0.1} transparent opacity={0.5} sizeAttenuation />
      </points>
      <pointLight ref={lightningRef} position={[0, 45, 0]} color="#e0e8ff" intensity={0} distance={200} />
    </>
  );
};

const FarmRoad = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -28]}><planeGeometry args={[3, 20]} /><meshStandardMaterial color="#4a4a3a" roughness={0.9} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[-28, 0.02, 0]}><planeGeometry args={[3, 20]} /><meshStandardMaterial color="#4a4a3a" roughness={0.9} /></mesh>
  </group>
);

const FarmFence = () => {
  const posts: [number, number, number][] = [];
  for (let i = -38; i <= 38; i += 4) {
    posts.push([i, 0.5, -38], [i, 0.5, 38], [-38, 0.5, i], [38, 0.5, i]);
  }
  return (
    <group>
      {posts.map((pos, i) => (
        <mesh key={i} position={pos}><cylinderGeometry args={[0.06, 0.06, 1, 4]} /><meshStandardMaterial color="#8B7355" roughness={0.9} /></mesh>
      ))}
    </group>
  );
};

// ════════════════════════════════════════════════════════════════
// MAIN 3D SCENE COMPOSITOR
// ════════════════════════════════════════════════════════════════

const FarmScene = ({
  timeOfDay, weather, layers, onSelectPlot, selectedPlotId, inspectMode, sim
}: any) => {
  const sunAngle = Math.PI * timeOfDay;
  const sunPosition: [number, number, number] = [Math.cos(sunAngle) * 100, Math.sin(sunAngle) * 100, 30];
  const ambientIntensity = timeOfDay > 0.85 || timeOfDay < 0.15 ? 0.12 : 0.45;
  const sunIntensity = Math.max(0.08, Math.sin(sunAngle) * 2.2);
  const isNight = timeOfDay > 0.82 || timeOfDay < 0.12;

  const fogColor = isNight ? '#050810' : weather === 'rain' ? '#2a3040' : '#8aaa88';
  const fogDensity = weather === 'rain' ? 0.012 : isNight ? 0.008 : 0.004;

  const plots = [
    { id: 'p1', name: 'Plot A — Wheat Field', crop: 'Wheat', status: 'healthy', position: [-12, 0.15, -12] as [number, number, number], size: [18, 0.3, 18] as [number, number, number] },
    { id: 'p2', name: 'Plot B — Maize Field', crop: 'Maize', status: 'water_stress', position: [12, 0.15, -12] as [number, number, number], size: [18, 0.3, 18] as [number, number, number] },
    { id: 'p3', name: 'Plot C — Tomato Garden', crop: 'Tomato', status: 'disease', position: [-12, 0.15, 12] as [number, number, number], size: [18, 0.3, 18] as [number, number, number] },
    { id: 'p4', name: 'Plot D — Cotton Field', crop: 'Cotton', status: 'healthy', position: [12, 0.15, 12] as [number, number, number], size: [18, 0.3, 18] as [number, number, number] },
  ];

  const sensorPositions: [number, number, number][] = [
    [-22, 0, -22], [22, 0, -22], [-22, 0, 22], [22, 0, 22],
    [-2, 0, -22], [-2, 0, 22], [-22, 0, -2], [22, 0, -2],
  ];

  return (
    <>
      <fogExp2 attach="fog" args={[fogColor, fogDensity]} />

      <Sky
        sunPosition={sunPosition}
        turbidity={weather === 'rain' ? 20 : weather === 'cloudy' ? 12 : 3}
        rayleigh={weather === 'rain' ? 0.5 : 2}
        mieCoefficient={weather === 'cloudy' ? 0.1 : 0.005}
      />

      {isNight && <Stars radius={120} depth={60} count={4000} factor={5} saturation={0} fade speed={1.5} />}

      <ambientLight intensity={ambientIntensity} color={isNight ? '#1a1a40' : '#ffffff'} />
      <directionalLight
        position={sunPosition} intensity={sunIntensity} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-far={200}
        shadow-camera-left={-50} shadow-camera-right={50}
        shadow-camera-top={50} shadow-camera-bottom={-50}
        color={timeOfDay < 0.2 ? '#ff8c42' : timeOfDay > 0.8 ? '#ff6b35' : '#ffffff'}
      />
      <hemisphereLight intensity={0.25} color="#87ceeb" groundColor="#2d5016" />

      {/* Terrain */}
      <ProceduralTerrain sim={sim} />
      <GrassField sim={sim} />
      <Puddles sim={sim} />

      {/* Plots */}
      {layers.plots && plots.map((p) => (
        <FarmPlot3D key={p.id} {...p} selected={selectedPlotId === p.id} isInspecting={inspectMode} onClick={() => onSelectPlot(p)} sim={sim} />
      ))}

      {/* Infrastructure */}
      <AnimatedWaterCanal visible={layers.irrigation} />
      {layers.sensors && sensorPositions.map((pos, i) => <Sensor key={i} position={pos} />)}
      {layers.buildings && (
        <>
          <EnhancedWarehouse position={[-32, 0, 28]} />
          <EnhancedWarehouse position={[32, 0, -30]} color="#3f4f5f" />
          <WaterTank />
          <WindTurbine />
        </>
      )}

      {/* Vehicles */}
      <Drone visible={layers.drone} windSpeed={sim.windSpeed} />
      <Tractor />

      {/* Weather */}
      <EnhancedRain active={weather === 'rain'} />

      {/* Irrigation effects */}
      <SprinklerEffect active={sim.irrigationMode === 'sprinkler'} />
      <DripLines active={sim.irrigationMode === 'drip'} />

      {/* Static elements */}
      <FarmRoad />
      <FarmFence />

      <OrbitControls minDistance={8} maxDistance={90} maxPolarAngle={Math.PI / 2.1} enableDamping dampingFactor={0.05} />
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// UI — SIMULATION PANEL
// ════════════════════════════════════════════════════════════════

const SimSlider = ({ label, value, min, max, step, unit, icon: Icon, color, onChange }: any) => (
  <div className="mb-3">
    <div className="flex justify-between text-[11px] mb-1">
      <span className="text-gray-400 flex items-center gap-1"><Icon size={11} className={color} />{label}</span>
      <span className={`font-medium ${color}`}>{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)}
      className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-500" />
  </div>
);

const SimToggle = ({ options, value, onChange, color = 'emerald' }: { options: { key: string; label: string }[]; value: string; onChange: (v: string) => void; color?: string }) => (
  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
    {options.map((o) => (
      <button key={o.key} onClick={() => onChange(o.key)}
        className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
          value === o.key
            ? `bg-${color}-500/20 text-${color}-400 border border-${color}-500/40`
            : 'bg-white/5 border border-white/5 text-gray-500 hover:bg-white/10'
        }`}
      >{o.label}</button>
    ))}
  </div>
);

const SimulationPanel = ({ sim, setSim, yieldResult }: { sim: SimState; setSim: (fn: (s: SimState) => SimState) => void; yieldResult: any }) => {
  const [expanded, setExpanded] = useState(true);
  const update = (key: keyof SimState, value: any) => setSim((s) => ({ ...s, [key]: value }));

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
      className="absolute bottom-4 right-4 w-[290px] glass-card shadow-2xl overflow-hidden z-10"
    >
      <button onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-3 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-colors">
        <h3 className="font-bold text-sm bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
          <FlaskConical size={14} /> Simulation Engine
        </h3>
        {expanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronUp size={14} className="text-gray-500" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden">
            <div className="p-4 space-y-4 max-h-[55vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>

              {/* Growth */}
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1"><Sprout size={10} /> Growth Stage</p>
                <SimSlider label="Growth" value={(sim.growthStage * 100).toFixed(0)} min={0} max={100} step={1} unit="%"
                  icon={Leaf} color="text-emerald-400"
                  onChange={(v: number) => update('growthStage', v / 100)} />
              </div>

              {/* Soil */}
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1"><FlaskConical size={10} /> Soil & Nutrients</p>
                <SimSlider label="Soil pH" value={sim.soilPh.toFixed(1)} min={4} max={9} step={0.1} unit=""
                  icon={Gauge} color="text-orange-400"
                  onChange={(v: number) => update('soilPh', v)} />
                <SimSlider label="Nitrogen" value={sim.nitrogenPpm} min={20} max={300} step={5} unit=" ppm"
                  icon={Zap} color="text-yellow-400"
                  onChange={(v: number) => update('nitrogenPpm', v)} />
              </div>

              {/* Climate */}
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1"><Thermometer size={10} /> Climate</p>
                <SimSlider label="Rainfall" value={sim.rainfallMm} min={0} max={1200} step={25} unit=" mm"
                  icon={Droplets} color="text-blue-400"
                  onChange={(v: number) => update('rainfallMm', v)} />
                <SimSlider label="Temperature" value={sim.temperature} min={10} max={50} step={1} unit="°C"
                  icon={sim.temperature < 15 ? Snowflake : sim.temperature > 38 ? SunDim : Thermometer}
                  color={sim.temperature < 15 ? 'text-cyan-400' : sim.temperature > 38 ? 'text-red-400' : 'text-amber-400'}
                  onChange={(v: number) => update('temperature', v)} />
                <SimSlider label="Wind Speed" value={sim.windSpeed} min={0} max={60} step={1} unit=" km/h"
                  icon={Wind} color="text-sky-400"
                  onChange={(v: number) => update('windSpeed', v)} />
              </div>

              {/* Stress */}
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1"><Bug size={10} /> Disease Pressure</p>
                <SimToggle options={[
                  { key: 'none', label: 'None' }, { key: 'low', label: 'Low' },
                  { key: 'medium', label: 'Med' }, { key: 'high', label: 'High' },
                ]} value={sim.diseasePressure} onChange={(v) => update('diseasePressure', v)} />
              </div>

              {/* Irrigation */}
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1"><Waves size={10} /> Irrigation</p>
                <SimToggle options={[
                  { key: 'off', label: 'Off' }, { key: 'drip', label: 'Drip' },
                  { key: 'sprinkler', label: 'Sprinkler' }, { key: 'flood', label: 'Flood' },
                ]} value={sim.irrigationMode} onChange={(v) => update('irrigationMode', v)} color="blue" />
              </div>

              {/* Yield Result */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1"><BarChart3 size={10} /> Predicted Yield</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: riskColor(yieldResult.riskScore) + '20', color: riskColor(yieldResult.riskScore) }}>
                    {riskLabel(yieldResult.riskScore)} Risk
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-lg font-bold text-emerald-400">{yieldResult.yieldPerHa}</p>
                    <p className="text-[9px] text-gray-500">tonnes/ha</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-400 flex items-center gap-0.5"><TrendingUp size={12} />₹{(yieldResult.revenue / 100000).toFixed(1)}L</p>
                    <p className="text-[9px] text-gray-500">est. revenue</p>
                  </div>
                </div>
                {/* Risk bar */}
                <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${100 - yieldResult.riskScore}%`, backgroundColor: riskColor(yieldResult.riskScore) }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════
// UI — SIMULATION TIMELINE
// ════════════════════════════════════════════════════════════════

const SimulationTimeline = ({ sim, setSim }: { sim: SimState; setSim: (fn: (s: SimState) => SimState) => void }) => {
  const currentPhase = GROWTH_PHASES.filter(p => p.day <= sim.timelineDay).pop() || GROWTH_PHASES[0];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[520px] glass-card px-5 py-3 shadow-2xl z-10"
    >
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => setSim(s => ({ ...s, timelinePlaying: !s.timelinePlaying }))}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            sim.timelinePlaying ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
          }`}>
          {sim.timelinePlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <div className="flex-1">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-gray-400">Day <span className="text-white font-bold">{sim.timelineDay}</span> / 180</span>
            <span className="text-emerald-400 font-medium">{currentPhase.emoji} {currentPhase.label}</span>
          </div>
          <div className="relative">
            <input type="range" min={0} max={180} step={1} value={sim.timelineDay}
              onChange={(e) => setSim(s => ({ ...s, timelineDay: +e.target.value, growthStage: Math.min(1, +e.target.value / 160) }))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-500 relative z-10" />
            {/* Phase markers */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 flex pointer-events-none">
              {GROWTH_PHASES.map((p, i) => (
                <div key={i} className="absolute w-0.5 h-3 -top-0.5 bg-white/20 rounded-full" style={{ left: `${(p.day / 180) * 100}%` }}>
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-gray-600 whitespace-nowrap">{p.emoji}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Speed control */}
        <div className="flex items-center gap-1">
          {[1, 2, 5].map(speed => (
            <button key={speed} onClick={() => setSim(s => ({ ...s, timelineSpeed: speed }))}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                sim.timelineSpeed === speed
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-white/5 border border-white/5 text-gray-500 hover:bg-white/10'
              }`}>
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ════════════════════════════════════════════════════════════════

export default function DigitalTwin() {
  const [timeOfDay, setTimeOfDay] = useState(0.45);
  const [weather, setWeather] = useState('clear');
  const [inspectMode, setInspectMode] = useState(false);
  const [layers, setLayers] = useState({ plots: true, irrigation: true, sensors: true, drone: true, buildings: true });
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const { sim, setSim } = useStore();
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Timeline auto-play
  useEffect(() => {
    if (!sim.timelinePlaying) return;
    const interval = setInterval(() => {
      setSim(prev => {
        const newDay = Math.min(180, prev.timelineDay + prev.timelineSpeed);
        if (newDay >= 180) return { ...prev, timelinePlaying: false, timelineDay: 180, growthStage: 1 };
        return { ...prev, timelineDay: newDay, growthStage: Math.min(1, newDay / 160) };
      });
    }, 100);
    return () => clearInterval(interval);
  }, [sim.timelinePlaying, sim.timelineSpeed]);

  const toggleLayer = (layer: keyof typeof layers) => setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  const timeLabel = timeOfDay < 0.15 ? '🌅 Dawn' : timeOfDay < 0.35 ? '☀️ Morning' : timeOfDay < 0.6 ? '🌤️ Midday' : timeOfDay < 0.8 ? '🌇 Evening' : '🌙 Night';
  const selectedData = selectedPlot ? plotData.find(p => p.id === selectedPlot.id) : null;

  const yieldResult = useMemo(() => calculateYield(sim, selectedPlot?.crop || 'wheat'), [sim, selectedPlot?.crop]);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold"><span className="gradient-text">Hyper-Realistic Digital Twin</span> 🌾</h1>
          <p className="text-gray-400 mt-1">Interactive farm simulation • Green Horizon Smart Farm</p>
        </div>
        <div className="flex items-center gap-2">
          {telemetryData.map((t, i) => (
            <div key={i} className="glass-card px-3 py-2 rounded-xl flex items-center gap-2">
              <t.icon size={14} className={t.color} />
              <span className="text-xs text-gray-400">{t.label}</span>
              <span className="text-sm font-semibold">{t.value}</span>
            </div>
          ))}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="btn-secondary flex items-center gap-2 py-2 px-4 text-xs font-semibold h-[38px] cursor-pointer"
            title="Toggle simulation fullscreen"
          >
            {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {isFullScreen ? 'Exit Full Screen' : 'Full Screen View'}
          </button>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className={`transition-all duration-500 ease-in-out ${
        isFullScreen 
          ? 'fixed inset-0 z-50 w-screen h-screen bg-[#080C14] border-0 rounded-none' 
          : 'relative w-full h-[82vh] rounded-2xl overflow-hidden border border-slate-200 dark:border-[rgba(255,255,255,0.08)] shadow-2xl shadow-emerald-500/5'
      } digital-twin-viewport`}>
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-[#080C14] flex-col gap-4 z-10">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="gradient-text font-semibold text-xl">Initializing Hyper-Realistic Twin...</p>
            <p className="text-gray-500 text-sm">Building 3D farm simulation environment</p>
          </div>
        }>
          <Canvas shadows camera={{ position: [45, 35, 45], fov: 40 }} gl={{ antialias: true, alpha: false }} dpr={[1, 1.5]}>
            <FarmScene
              timeOfDay={timeOfDay} weather={weather} layers={layers}
              selectedPlotId={selectedPlot?.id} onSelectPlot={setSelectedPlot}
              inspectMode={inspectMode} sim={sim}
            />
          </Canvas>
        </Suspense>

        {/* ── LIVE Badge (top-left) ── */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="glass-card rounded-full px-4 py-2 flex items-center gap-2 z-10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">LIVE SIMULATION</span>
          </div>
          <div className="glass-card rounded-full px-4 py-2 z-10">
            <span className="text-xs text-gray-400">Green Horizon Smart Farm • Coimbatore, TN</span>
          </div>
        </div>

        {/* ── Fullscreen Toggler (top-right next to Environment) ── */}
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="absolute top-4 right-[304px] z-20 glass-card p-2.5 text-gray-300 hover:text-white transition-colors shadow-2xl flex items-center justify-center"
          title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
        >
          {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        {/* ── Environment Controls (top-right) ── */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="absolute top-4 right-4 w-72 glass-card p-5 shadow-2xl z-10">
          <h3 className="font-bold text-sm mb-4 gradient-text flex items-center gap-2"><Zap size={14} /> Environment</h3>

          {/* Time of Day */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-400">Time of Day</span>
              <span className="text-emerald-400 font-medium">{timeLabel}</span>
            </div>
            <input type="range" min="0" max="1" step="0.01" value={timeOfDay} onChange={(e) => setTimeOfDay(+e.target.value)}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-500" />
            <div className="flex justify-between text-[9px] text-gray-600 mt-0.5"><span>🌅</span><span>☀️</span><span>🌙</span></div>
          </div>

          {/* Weather */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Weather</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'clear', icon: Sun, label: 'Clear' },
                { key: 'cloudy', icon: Cloud, label: 'Cloudy' },
                { key: 'rain', icon: CloudRain, label: 'Rain' },
              ].map(w => (
                <button key={w.key} onClick={() => setWeather(w.key)}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 text-xs transition-all duration-200 ${
                    weather === w.key ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10'
                  }`}>
                  <w.icon size={16} />{w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Layers */}
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-2">Layers</p>
            <div className="space-y-1">
              {Object.entries(layers).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-lg px-2 py-1 transition-colors">
                  <span className="text-sm capitalize text-gray-300">{key}</span>
                  <button onClick={() => toggleLayer(key as keyof typeof layers)}
                    className={`w-8 h-4 rounded-full transition-all duration-200 relative ${value ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform duration-200 ${value ? 'left-[18px]' : 'left-[2px]'}`} />
                  </button>
                </label>
              ))}
            </div>
          </div>

          {/* Inspect */}
          <button onClick={() => setInspectMode(!inspectMode)}
            className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 ${
              inspectMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
            }`}>
            {inspectMode ? <Eye size={14} /> : <EyeOff size={14} />}
            {inspectMode ? 'Inspect ON' : 'Inspect OFF'}
          </button>
        </motion.div>

        {/* ── Plot Info (bottom-left) ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="absolute bottom-4 left-4 w-80 glass-card p-5 shadow-2xl z-10">
          <AnimatePresence mode="wait">
            {selectedData ? (
              <motion.div key="selected" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-base">{selectedData.name}</h3>
                    <p className="text-emerald-400 text-sm">{selectedData.crop}</p>
                  </div>
                  <button onClick={() => setSelectedPlot(null)} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"><XCircle size={16} /></button>
                </div>
                <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-xl" style={{ backgroundColor: healthStatusColor(selectedData.status as any) + '15' }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: healthStatusColor(selectedData.status as any) }} />
                  <span className="text-sm font-medium capitalize">{selectedData.status.replace('_', ' ')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Area', value: selectedData.area },
                    { label: 'Moisture', value: selectedData.moisture },
                    { label: 'NDVI', value: selectedData.ndvi },
                    { label: 'Last Irrigated', value: selectedData.lastIrrigation },
                  ].map((m, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 px-3 py-2 rounded-lg">
                      <span className="text-gray-500 text-[9px] uppercase tracking-wider">{m.label}</span>
                      <p className="font-semibold text-sm mt-0.5">{m.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="summary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Info size={14} className="text-emerald-500" /> Farm Overview</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">
                    <p className="text-lg font-bold text-emerald-400">12.5</p>
                    <p className="text-[9px] text-gray-500 uppercase">Hectares</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">
                    <p className="text-lg font-bold text-blue-400">4</p>
                    <p className="text-[9px] text-gray-500 uppercase">Plots</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">
                    <p className="text-lg font-bold text-purple-400">87</p>
                    <p className="text-[9px] text-gray-500 uppercase">Health</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5">Health Legend</p>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { status: 'healthy', label: 'Healthy' },
                    { status: 'water_stress', label: 'Water Stress' },
                    { status: 'disease', label: 'Disease' },
                    { status: 'dead', label: 'Dead' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: healthStatusColor(s.status as any) }} />
                      {s.label}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 mt-3 italic">Click a plot to inspect • Use simulation panel to run what-if scenarios</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Simulation Panel (bottom-right) ── */}
        <SimulationPanel sim={sim} setSim={setSim} yieldResult={yieldResult} />

        {/* ── Simulation Timeline (bottom-center) ── */}
        <SimulationTimeline sim={sim} setSim={setSim} />
      </div>
    </div>
  );
}
