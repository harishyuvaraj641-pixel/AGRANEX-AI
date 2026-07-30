import React, { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Cloud, Thermometer, Droplet, Activity, Map, Layers, Download, Calendar, Info, RefreshCw, Maximize2, Minimize2, Box, Eye, Radio, Sparkles, Navigation, ShieldAlert, Search, Plus, MapPin, Trash2 } from 'lucide-react';
import { APIProvider, Map as GoogleMapsContainer, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useStore } from '../store/useStore';
import { jsPDF } from 'jspdf';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

// 12 Months NDVI trend data
const ndviTrendData = [
  { month: 'Jan', ndvi: 0.65, moisture: 0.48 },
  { month: 'Feb', ndvi: 0.68, moisture: 0.44 },
  { month: 'Mar', ndvi: 0.72, moisture: 0.40 },
  { month: 'Apr', ndvi: 0.78, moisture: 0.38 },
  { month: 'May', ndvi: 0.82, moisture: 0.52 },
  { month: 'Jun', ndvi: 0.85, moisture: 0.60 },
  { month: 'Jul', ndvi: 0.81, moisture: 0.58 },
  { month: 'Aug', ndvi: 0.76, moisture: 0.50 },
  { month: 'Sep', ndvi: 0.79, moisture: 0.46 },
  { month: 'Oct', ndvi: 0.74, moisture: 0.42 },
  { month: 'Nov', ndvi: 0.69, moisture: 0.45 },
  { month: 'Dec', ndvi: 0.66, moisture: 0.47 },
];

const timelineDates = [
  { label: 'Jan 2026', value: 0 },
  { label: 'Mar 2026', value: 1 },
  { label: 'May 2026', value: 2 },
  { label: 'Jul 2026', value: 3 }
];

// ════════════════════════════════════════════════════════════════
// 3D SATELLITE REALTIME MAP COMPONENTS
// ════════════════════════════════════════════════════════════════

interface SatelliteProps {
  selectedIndex: 'ndvi' | 'ndwi' | 'evi' | 'smi';
  timelineVal: number;
}

function OrbitingSatellite({ onUpdatePos }: { onUpdatePos?: (pos: { alt: number; speed: number; angle: number }) => void }) {
  const satRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.4;
    const radius = 18;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = 14 + Math.sin(t * 2) * 1.5;

    if (satRef.current) {
      satRef.current.position.set(x, y, z);
      satRef.current.lookAt(0, 0, 0);
    }

    if (beamRef.current && satRef.current) {
      beamRef.current.position.set(x / 2, y / 2, z / 2);
      beamRef.current.lookAt(0, 0, 0);
      beamRef.current.rotateX(Math.PI / 2);
    }

    if (onUpdatePos && Math.floor(clock.getElapsedTime() * 10) % 5 === 0) {
      onUpdatePos({
        alt: Math.round(786 + Math.sin(t) * 4),
        speed: 7.52,
        angle: Math.round((t * 57.2958) % 360)
      });
    }
  });

  return (
    <>
      {/* Scanning Cone Beam */}
      <mesh ref={beamRef}>
        <coneGeometry args={[6, 22, 32, 1, true]} />
        <meshBasicMaterial
          color="#10B981"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Orbiting Satellite Object */}
      <group ref={satRef}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
          {/* Main Bus Body */}
          <mesh castShadow>
            <boxGeometry args={[1.4, 0.9, 0.9]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Gold Thermal Foil */}
          <mesh position={[0, 0.46, 0]}>
            <boxGeometry args={[1.2, 0.05, 0.8]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Solar Array Left */}
          <mesh position={[-2.2, 0, 0]}>
            <boxGeometry args={[2.8, 0.06, 0.9]} />
            <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.1} emissive="#1d4ed8" />
          </mesh>

          {/* Solar Array Right */}
          <mesh position={[2.2, 0, 0]}>
            <boxGeometry args={[2.8, 0.06, 0.9]} />
            <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Multispectral Sensor Optics */}
          <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.35, 0.3, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.05} />
          </mesh>

          {/* Status LED Beacon */}
          <mesh position={[0, 0.5, 0.4]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#10B981" />
          </mesh>

          {/* Satellite HTML Label Tag */}
          <Html position={[0, 1.2, 0]} center distanceFactor={25}>
            <div className="bg-slate-900/90 text-emerald-400 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-mono whitespace-nowrap shadow-lg flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Sentinel-2A (MSI)
            </div>
          </Html>
        </Float>
      </group>
    </>
  );
}

function Terrain3D({ selectedIndex, timelineVal }: SatelliteProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate 3D grid heightmap geometry and vertex color overlay based on index
  const { geometry, colors } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(24, 24, 48, 48);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const count = pos.count;
    const colorArr = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);

      // Realistic terrain elevation contours
      let vy = Math.sin(vx * 0.2) * Math.cos(vz * 0.2) * 1.2 + Math.sin(vx * 0.5) * 0.4;
      
      // Plot boundary terraces
      if (vx > -8 && vx < 8 && vz > -8 && vz < 8) {
        vy += 0.3;
      }
      pos.setY(i, vy);

      // Map vertex colors based on selected index and farm plot health values
      let normVal = 0.5 + Math.sin(vx * 0.3) * Math.cos(vz * 0.3) * 0.25;
      
      // East Plot C Disease Hotspot (vx ~ 4, vz ~ 4)
      if (vx > 2 && vx < 7 && vz > 2 && vz < 7) {
        normVal -= 0.35;
      }

      const timelineBoost = (timelineVal - 1) * 0.06;
      normVal = Math.max(0.1, Math.min(0.95, normVal + timelineBoost));

      let r = 0, g = 0, b = 0;
      if (selectedIndex === 'ndvi' || selectedIndex === 'evi') {
        if (normVal < 0.35) { r = 0.9; g = 0.2; b = 0.2; }
        else if (normVal < 0.65) { r = 0.9; g = 0.7; b = 0.2; }
        else { r = 0.06; g = 0.72; b = 0.5; }
      } else {
        if (normVal < 0.35) { r = 0.62; g = 0.43; b = 0.31; }
        else if (normVal < 0.65) { r = 0.39; g = 0.74; b = 0.9; }
        else { r = 0.08; g = 0.27; b = 0.62; }
      }

      colorArr[i * 3] = r;
      colorArr[i * 3 + 1] = g;
      colorArr[i * 3 + 2] = b;
    }

    geo.computeVertexNormals();
    return { geometry: geo, colors: colorArr };
  }, [selectedIndex, timelineVal]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      meshRef.current.geometry.attributes.color.needsUpdate = true;
    }
  }, [colors]);

  return (
    <group>
      {/* Main 3D Terrain Grid */}
      <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial vertexColors roughness={0.6} metalness={0.1} wireframe={false} />
      </mesh>

      {/* Wireframe Overlay for High-Tech Sensor Grid effect */}
      <mesh geometry={geometry} position={[0, 0.02, 0]}>
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.06} />
      </mesh>

      {/* Farm Plot 3D Pins */}
      <Html position={[-6, 2.5, -6]} center distanceFactor={30}>
        <div className="bg-slate-900/90 text-white border border-slate-700/80 px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 shadow-xl backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Plot A (Wheat) — NDVI 0.85
        </div>
      </Html>

      <Html position={[6, 2.5, -6]} center distanceFactor={30}>
        <div className="bg-slate-900/90 text-white border border-slate-700/80 px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 shadow-xl backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          Plot B (Maize) — Moisture 62%
        </div>
      </Html>

      <Html position={[5, 3.2, 5]} center distanceFactor={30}>
        <div className="bg-red-950/90 text-red-300 border border-red-500/60 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-2 shadow-2xl backdrop-blur-md animate-bounce">
          <ShieldAlert size={14} className="text-red-400" />
          East Plot C — Stress Alert (0.44)
        </div>
      </Html>

      <Html position={[-6, 2.5, 6]} center distanceFactor={30}>
        <div className="bg-slate-900/90 text-white border border-slate-700/80 px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 shadow-xl backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Plot D (Cotton) — NDVI 0.72
        </div>
      </Html>
    </group>
  );
}

function OrbitRing() {
  const lineObject = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const radius = 18;
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * radius, 14, Math.sin(theta) * radius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: 0x10B981, transparent: true, opacity: 0.35 });
    return new THREE.LineLoop(geo, mat);
  }, []);

  return <primitive object={lineObject} />;
}

function Satellite3DCanvas({ selectedIndex, timelineVal }: SatelliteProps) {
  const [telemetry, setTelemetry] = useState({ alt: 786, speed: 7.52, angle: 142 });

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-slate-950">
      {/* R3F Canvas */}
      <Canvas camera={{ position: [18, 16, 22], fov: 42 }}>
        <color attach="background" args={['#040711']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[20, 30, 15]} intensity={1.3} castShadow />
        <pointLight position={[-10, 15, -10]} intensity={0.5} color="#3b82f6" />
        
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        
        <Suspense fallback={null}>
          <Terrain3D selectedIndex={selectedIndex} timelineVal={timelineVal} />
          <OrbitingSatellite onUpdatePos={setTelemetry} />
          <OrbitRing />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={12}
          maxDistance={50}
          autoRotate={false}
        />
      </Canvas>

      {/* Realtime Live Telemetry Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none space-y-2">
        <div className="bg-slate-900/80 dark:bg-slate-900/90 text-white backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl text-xs flex items-center gap-3 shadow-xl">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Radio size={14} className="animate-pulse" /> LIVE TELEMETRY
          </div>
          <div className="h-3 w-px bg-white/20" />
          <div className="text-gray-300">Alt: <span className="text-white font-mono">{telemetry.alt} km</span></div>
          <div className="text-gray-300">Speed: <span className="text-white font-mono">{telemetry.speed} km/s</span></div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex justify-between items-center text-[11px] text-gray-400 bg-slate-900/85 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
        <span className="flex items-center gap-1.5"><Sparkles size={13} className="text-emerald-400" /> Interactive 3D Orbit & Topography Mode</span>
        <span className="text-gray-300 font-mono">3D Orbit Angle: {telemetry.angle}°</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ════════════════════════════════════════════════════════════════

export const SEARCH_LOCATIONS = [
  { label: 'Green Horizon Farm (Coimbatore)', lat: 10.9856, lng: 76.9664, desc: 'Coimbatore, India' },
  { label: 'Punjab Grain Fields (Ludhiana)', lat: 30.9010, lng: 75.8573, desc: 'Punjab, India' },
  { label: 'Iowa Corn Valley (Des Moines)', lat: 41.5868, lng: -93.6250, desc: 'Iowa, USA' },
  { label: 'Napa Grape Plots (California)', lat: 38.2976, lng: -122.2869, desc: 'California, USA' },
  { label: 'Nile Delta Plot (Egypt)', lat: 30.8358, lng: 31.0786, desc: 'Nile Delta, Egypt' },
];

export const calculateLocationIntel = (lat: number, lng: number) => {
  const absLat = Math.abs(lat);
  let baseTemp = 34 - (absLat * 0.45); 
  baseTemp += Math.sin(lng * 0.1) * 3;
  const temperature = parseFloat(Math.max(8, Math.min(42, baseTemp)).toFixed(1));

  const phBase = 6.2 + Math.cos(lat * 5) * 0.9;
  const soilPh = parseFloat(Math.max(4.2, Math.min(8.5, phBase)).toFixed(1));

  const moistureBase = 55 + Math.sin(lng * 8) * 20;
  const soilMoisture = Math.round(Math.max(10, Math.min(95, moistureBase)));
  const organicCarbon = parseFloat((0.8 + Math.abs(Math.sin(lat * lng)) * 1.5).toFixed(2));

  const cropsList = [
    { name: 'Wheat', optimalTemp: 20, optimalPh: 6.5, desc: 'High-gluten cereal crop' },
    { name: 'Maize', optimalTemp: 26, optimalPh: 6.2, desc: 'Warm-season grain' },
    { name: 'Tomato', optimalTemp: 23, optimalPh: 6.0, desc: 'High-value fresh produce' },
    { name: 'Cotton', optimalTemp: 32, optimalPh: 7.2, desc: 'Tropical fiber cash crop' },
  ];

  const scoredCrops = cropsList.map(c => {
    const tempDiff = Math.abs(c.optimalTemp - temperature);
    const phDiff = Math.abs(c.optimalPh - soilPh);
    const score = Math.max(20, Math.round(100 - (tempDiff * 2.8) - (phDiff * 18)));
    return { name: c.name, score, desc: c.desc };
  }).sort((a, b) => b.score - a.score);

  const fireRisk = Math.round(Math.max(5, Math.min(98, (temperature * 2.2) - (soilMoisture * 0.4))));
  const droughtRisk = Math.round(Math.max(5, Math.min(98, 100 - soilMoisture)));
  const floodRisk = Math.round(Math.max(5, Math.min(98, (soilMoisture * 1.1) + (absLat < 15 ? 15 : 0))));

  const CHEMICAL_PLANTS = [
    { name: 'Agranex Bio-Chemical Complex', lat: 10.988, lng: 76.969 },
    { name: 'Premier Dyeing & Textile Zone', lat: 10.982, lng: 76.962 },
    { name: 'Ludhiana Heavy Agrochemicals', lat: 30.912, lng: 75.862 },
    { name: 'Punjab Organic Solvents Corp', lat: 30.895, lng: 75.850 },
    { name: 'Des Moines Industrial Fertilizers', lat: 41.595, lng: -93.635 },
    { name: 'Nile Delta Salinity Dye Factory', lat: 30.840, lng: 31.082 },
  ];

  let nearestAlert: string | null = null;
  let minDistance = Infinity;

  CHEMICAL_PLANTS.forEach(p => {
    const dy = (p.lat - lat) * 111;
    const dx = (p.lng - lng) * 111 * Math.cos(lat * Math.PI / 180);
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < minDistance) {
      minDistance = dist;
      if (dist < 2.5) {
        nearestAlert = `⚠️ HAZARD WARNING: "${p.name}" located ${dist.toFixed(2)}km away. Runoff risk: ${dist < 1.0 ? 'CRITICAL' : 'HIGH'}. Monitor chemical runoff and soil pH closely.`;
      }
    }
  });

  let closestLoc = 'Custom Location';
  let minD = Infinity;
  SEARCH_LOCATIONS.forEach(loc => {
    const d = Math.sqrt(Math.pow(loc.lat - lat, 2) + Math.pow(loc.lng - lng, 2));
    if (d < 0.05 && d < minD) {
      minD = d;
      closestLoc = loc.label;
    }
  });

  return {
    name: closestLoc,
    lat,
    lng,
    temperature,
    soilPh,
    soilMoisture,
    organicCarbon,
    bestCrops: scoredCrops,
    nearbyChemicalAlert: nearestAlert,
    disasterRisks: { flood: floodRisk, drought: droughtRisk, fire: fireRisk }
  };
};

export default function SatelliteIntelligence() {
  const { activeLocation, setActiveLocation } = useStore();
  const [selectedIndex, setSelectedIndex] = useState<'ndvi' | 'ndwi' | 'evi' | 'smi'>('ndvi');
  const [timelineVal, setTimelineVal] = useState<number>(3); // Default to Jul 2026
  const [isRefreshing, setIsRefreshing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number, value: number } | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | '2d' | 'google'>('google');

  // Global Geocoding Search States
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSuggestions, setGlobalSuggestions] = useState<any[]>([]);
  const [showGlobalDropdown, setShowGlobalDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Search autocomplete with Nominatim (Debounced)
  useEffect(() => {
    if (!globalSearchQuery.trim()) {
      setGlobalSuggestions([]);
      return;
    }

    const coordParts = globalSearchQuery.split(',').map(s => parseFloat(s.trim()));
    if (coordParts.length === 2 && !isNaN(coordParts[0]) && !isNaN(coordParts[1])) {
      setGlobalSuggestions([{
        label: `Coordinates: ${coordParts[0]}, ${coordParts[1]}`,
        lat: coordParts[0],
        lng: coordParts[1],
        desc: 'Custom Coordinate Target'
      }]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(globalSearchQuery)}`);
        const data = await response.json();
        if (data) {
          const results = data.map((item: any) => ({
            label: item.display_name.split(',')[0],
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            desc: item.display_name
          }));
          setGlobalSuggestions(results);
        }
      } catch (err) {
        console.error('Nominatim Geocoding API fail, fallback to mock search locations', err);
        const localMatched = SEARCH_LOCATIONS.filter(loc =>
          loc.label.toLowerCase().includes(globalSearchQuery.toLowerCase())
        );
        setGlobalSuggestions(localMatched.map(l => ({
          label: l.label,
          lat: l.lat,
          lng: l.lng,
          desc: l.desc
        })));
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [globalSearchQuery]);

  const handleGlobalSearchSelect = (loc: any) => {
    setActiveLocation(calculateLocationIntel(loc.lat, loc.lng));
    setViewMode('google');
    setGlobalSearchQuery(loc.label);
    setShowGlobalDropdown(false);
  };

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearchQuery) return;

    const coordParts = globalSearchQuery.split(',').map(s => parseFloat(s.trim()));
    if (coordParts.length === 2 && !isNaN(coordParts[0]) && !isNaN(coordParts[1])) {
      setActiveLocation(calculateLocationIntel(coordParts[0], coordParts[1]));
      setViewMode('google');
      return;
    }

    const matched = SEARCH_LOCATIONS.find(loc =>
      loc.label.toLowerCase().includes(globalSearchQuery.toLowerCase())
    );
    if (matched) {
      handleGlobalSearchSelect({
        label: matched.label,
        lat: matched.lat,
        lng: matched.lng,
        desc: matched.desc
      });
    } else if (globalSuggestions.length > 0) {
      handleGlobalSearchSelect(globalSuggestions[0]);
    }
  };

  // Auto-switch viewMode to 'google' when coordinates are set externally (e.g. from VoiceFAB query)
  useEffect(() => {
    if (activeLocation) {
      setViewMode('google');
    }
  }, [activeLocation]);

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

  // Generate 2D canvas heatmap grids based on selected index and timeline
  useEffect(() => {
    if (viewMode !== '2d') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridSize = 12;
    const cellSize = canvas.width / gridSize;

    const getGridValue = (i: number, j: number) => {
      let base = 0.5;
      if (i > 3 && i < 9 && j > 2 && j < 8) base += 0.25;
      if (i === 6 && j === 7) base -= 0.45;
      
      const indexOffset = selectedIndex === 'ndvi' ? 0.1 : selectedIndex === 'ndwi' ? -0.15 : selectedIndex === 'evi' ? 0.05 : -0.2;
      const timelineOffset = (timelineVal - 1) * 0.08;
      const noise = Math.sin(i * 0.5) * Math.cos(j * 0.5) * 0.12;
      return Math.max(0.05, Math.min(0.98, base + indexOffset + timelineOffset + noise));
    };

    const getColor = (val: number) => {
      if (selectedIndex === 'ndvi' || selectedIndex === 'evi') {
        if (val < 0.35) return `rgb(${Math.floor(220 + val * 50)}, ${Math.floor(60 + val * 40)}, ${Math.floor(60 + val * 40)})`;
        if (val < 0.65) return `rgb(${Math.floor(230 + val * 30)}, ${Math.floor(180 + val * 50)}, ${Math.floor(70 + val * 40)})`;
        return `rgb(${Math.floor(20 + (1 - val) * 40)}, ${Math.floor(150 + val * 105)}, ${Math.floor(80 + (1 - val) * 30)})`;
      } else {
        if (val < 0.3) return `rgb(160, 110, 80)`;
        if (val < 0.6) return `rgb(100, 190, 230)`;
        return `rgb(20, 70, 160)`;
      }
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const val = getGridValue(i, j);
        ctx.fillStyle = getColor(val);
        ctx.fillRect(i * cellSize, j * cellSize, cellSize - 1, cellSize - 1);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }, [selectedIndex, timelineVal, isRefreshing, viewMode]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const gridSize = 12;
    const gridX = Math.floor((x / rect.width) * gridSize);
    const gridY = Math.floor((y / rect.height) * gridSize);

    let base = 0.5;
    if (gridX > 3 && gridX < 9 && gridY > 2 && gridY < 8) base += 0.25;
    if (gridX === 6 && gridY === 7) base -= 0.45;
    const indexOffset = selectedIndex === 'ndvi' ? 0.1 : selectedIndex === 'ndwi' ? -0.15 : selectedIndex === 'evi' ? 0.05 : -0.2;
    const timelineOffset = (timelineVal - 1) * 0.08;
    const noise = Math.sin(gridX * 0.5) * Math.cos(gridY * 0.5) * 0.12;
    const finalVal = Math.max(0.05, Math.min(0.98, base + indexOffset + timelineOffset + noise));

    setHoveredCell({ x, y, value: finalVal });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const downloadSatelliteReport = () => {
    const doc = new jsPDF();
    doc.setFillColor(8, 12, 20);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(16, 185, 129);
    doc.setFontSize(22);
    doc.text('AGRANEX AI — SATELLITE HUB REPORT', 20, 30);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`Date of Observation: ${timelineDates[timelineVal].label}`, 20, 42);
    doc.text('Satellite Sensor Type: Sentinel-2 L2A Multispectral Instrument (MSI)', 20, 48);
    doc.text('Farm Name: Green Horizon Smart Farm', 20, 54);

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(20, 60, 190, 60);

    doc.setTextColor(16, 185, 129);
    doc.setFontSize(14);
    doc.text('Hyperspectral Analysis & Diagnostic Metrics', 20, 75);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`• Selected Index: ${selectedIndex.toUpperCase()}`, 25, 87);
    doc.text('• Average NDVI: 0.782 (Healthy Canopy)', 25, 95);
    doc.text('• Soil Moisture (NDWI): 0.420 (Adequate)', 25, 103);
    doc.text('• Cloud Cover Impact: 2.1% (Near-Zero Atmosphere Distortion)', 25, 111);
    doc.text('• Land Surface Temperature: 31.2°C', 25, 119);

    doc.line(20, 130, 190, 130);

    doc.setTextColor(16, 185, 129);
    doc.setFontSize(14);
    doc.text('AI Crop Health Diagnostic Summary', 20, 145);

    doc.setTextColor(230, 230, 230);
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(
      'Satellite observation indices confirm optimal vegetative health across 82% of total farm boundaries. ' +
      'However, localized spectral analysis shows a significant drop in NDVI value down to 0.44 inside East Plot C (Tomatoes), ' +
      'indicating early-stage crop stress or potential disease propagation. Immediate localized watering, nitrogen fertilization, and fungicide scans are highly recommended.',
      165
    );
    doc.text(splitText, 25, 157);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Report automatically compiled by AGRANEX Satellite Earth Observation Engine.', 20, 270);

    doc.save(`Agranex-Satellite-Report-${timelineDates[timelineVal].label.replace(' ', '-')}.pdf`);
  };

  const mapKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyC4665Tc3mwQgvwXsWpxT7DRbfB2KTUzsA";

  return (
    <APIProvider apiKey={mapKey} libraries={['marker']}>
      <div className="space-y-6 pb-12 w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="gradient-text">Satellite Intelligence Hub</span> 🛰️
            </h1>
            <p className="text-slate-600 dark:text-gray-400">Real-time 3D earth observation, hyperspectral indexing & Sentinel analytics</p>
          </div>

          {/* Global Search Bar & Actions Container */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto z-20">
            {/* Global Geocoding Search Input */}
            <form onSubmit={handleGlobalSearchSubmit} className="relative flex-1 sm:w-80">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search location globally (e.g. Coimbatore, Punjab)..."
                  value={globalSearchQuery}
                  onChange={(e) => {
                    setGlobalSearchQuery(e.target.value);
                    setShowGlobalDropdown(true);
                  }}
                  onFocus={() => setShowGlobalDropdown(true)}
                  onBlur={() => setTimeout(() => setShowGlobalDropdown(false), 200)}
                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                {isSearching && (
                  <div className="absolute right-3 top-2.5">
                    <RefreshCw size={14} className="animate-spin text-emerald-500" />
                  </div>
                )}
              </div>

              {/* suggestions dropdown */}
              {showGlobalDropdown && globalSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 z-50 mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto text-xs font-sans">
                  {globalSuggestions.map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleGlobalSearchSelect(loc)}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-white/5 flex flex-col gap-0.5 text-slate-700 dark:text-gray-300 border-b border-slate-100 dark:border-white/5 last:border-b-0"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <MapPin size={12} className="text-emerald-500" />
                        {loc.label}
                      </span>
                      <span className="text-[9px] text-slate-400 pl-4 truncate">{loc.desc} ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})</span>
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleRefresh}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer flex items-center justify-center"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-emerald-500' : 'text-slate-500 dark:text-gray-400'} />
              </button>
              <button 
                type="button"
                onClick={downloadSatelliteReport}
                className="btn-primary flex items-center gap-2 text-xs font-semibold py-2.5 px-4 cursor-pointer"
              >
                <Download size={15} /> Download Report
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Heatmap, Filters, 3D/2D View Toggle */}
          <div className="lg:col-span-6 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${
              isFullScreen 
                ? 'fixed inset-0 z-50 w-screen h-screen p-8 bg-slate-900 dark:bg-[#080C14] flex flex-col justify-center items-center rounded-none border-0' 
                : 'glass-card p-6 rounded-2xl relative overflow-hidden'
            }`}
          >
            <div className="flex justify-between items-center mb-4 w-full">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Map size={18} className="text-emerald-500" /> Earth Observation View
              </h3>
              
              <div className="flex items-center gap-2">
                {/* 2D vs 3D vs Google View Switcher */}
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`px-2 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                      viewMode === '3d'
                        ? 'bg-emerald-500 text-white shadow'
                        : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Box size={12} /> 3D Orbit
                  </button>
                  <button
                    onClick={() => setViewMode('2d')}
                    className={`px-2 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                      viewMode === '2d'
                        ? 'bg-emerald-500 text-white shadow'
                        : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Layers size={12} /> 2D Grid
                  </button>
                  <button
                    onClick={() => setViewMode('google')}
                    className={`px-2 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                      viewMode === 'google'
                        ? 'bg-emerald-500 text-white shadow'
                        : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Map size={12} /> Google Sat
                  </button>
                </div>

                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                  title={isFullScreen ? 'Exit Full Screen' : 'Full Screen View'}
                >
                  {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
              </div>
            </div>

            {/* Index selector tabs */}
            <div className="grid grid-cols-4 gap-1.5 mb-4 bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl border border-slate-200 dark:border-white/5 w-full">
              {[
                { key: 'ndvi', label: 'NDVI', tooltip: 'Normalized Difference Vegetation Index' },
                { key: 'ndwi', label: 'NDWI', tooltip: 'Normalized Difference Water Index' },
                { key: 'evi', label: 'EVI', tooltip: 'Enhanced Vegetation Index' },
                { key: 'smi', label: 'SMI', tooltip: 'Soil Moisture Index' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedIndex(tab.key as any)}
                  title={tab.tooltip}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    selectedIndex === tab.key
                      ? 'bg-emerald-500 text-white shadow'
                      : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 3D Realtime Map OR 2D Canvas Heatmap OR Google Satellite Map */}
            {viewMode === '3d' ? (
              <Satellite3DCanvas selectedIndex={selectedIndex} timelineVal={timelineVal} />
            ) : viewMode === '2d' ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 w-full flex justify-center bg-slate-900">
                <canvas 
                  ref={canvasRef} 
                  width={380} 
                  height={380} 
                  className="w-full max-w-[380px] h-auto cursor-crosshair"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setHoveredCell(null)}
                />
                <AnimatePresence>
                  {hoveredCell && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute bg-slate-900/90 border border-white/15 px-3 py-1.5 rounded-xl text-xs pointer-events-none shadow-2xl text-white"
                      style={{ left: Math.min(220, hoveredCell.x + 15), top: Math.min(300, hoveredCell.y + 15) }}
                    >
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">{selectedIndex.toUpperCase()} Cell Value</span>
                      <span className="text-sm font-bold text-emerald-400 mt-0.5">{hoveredCell.value.toFixed(3)}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <GoogleSatelliteMap selectedIndex={selectedIndex} timelineVal={timelineVal} />
            )}

            {/* Map Legend */}
            <div className="flex justify-between mt-4 text-[11px] text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-white/5 p-2.5 rounded-xl w-full">
              {selectedIndex === 'ndvi' || selectedIndex === 'evi' ? (
                <>
                  <span className="flex items-center gap-1.5 font-medium"><div className="w-2.5 h-2.5 rounded bg-red-500" /> Stressed (0.1 - 0.3)</span>
                  <span className="flex items-center gap-1.5 font-medium"><div className="w-2.5 h-2.5 rounded bg-amber-500" /> Moderate (0.4 - 0.7)</span>
                  <span className="flex items-center gap-1.5 font-medium"><div className="w-2.5 h-2.5 rounded bg-emerald-500" /> Dense (0.8+)</span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 font-medium"><div className="w-2.5 h-2.5 rounded bg-[rgb(160,110,80)]" /> Dry Soil</span>
                  <span className="flex items-center gap-1.5 font-medium"><div className="w-2.5 h-2.5 rounded bg-[rgb(100,190,230)]" /> Moist Soil</span>
                  <span className="flex items-center gap-1.5 font-medium"><div className="w-2.5 h-2.5 rounded bg-[rgb(20,70,160)]" /> Saturated</span>
                </>
              )}
            </div>

            {/* Timeline Slider */}
            <div className="mt-5 border-t border-slate-200 dark:border-white/5 pt-4 w-full">
              <label className="text-xs text-slate-600 dark:text-gray-400 flex items-center justify-between mb-2">
                <span>Spectral Observation Date</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{timelineDates[timelineVal].label}</span>
              </label>
              <input
                type="range" min="0" max="3" step="1"
                value={timelineVal}
                onChange={(e) => setTimelineVal(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-gray-500 mt-1">
                {timelineDates.map(d => (
                  <span key={d.value} className={timelineVal === d.value ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>{d.label}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Key Stats, Charts, and Hyperspectral Band profile */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Key KPI Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Current NDVI', value: '0.782', change: '↑ +0.024', color: 'text-emerald-600 dark:text-emerald-400', icon: Activity },
              { label: 'Soil Water Index', value: '0.420', change: '↓ -0.050', color: 'text-amber-600 dark:text-amber-400', icon: Droplet },
              { label: 'Atmosphere Loss', value: '2.1%', change: 'Clear sky', color: 'text-cyan-600 dark:text-cyan-400', icon: Cloud },
              { label: 'Surface Temp', value: '31.2°C', change: '↑ +2.1°C', color: 'text-red-600 dark:text-red-400', icon: Thermometer },
            ].map((k, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 rounded-xl text-center"
              >
                <span className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wider block font-semibold">{k.label}</span>
                <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{k.value}</p>
                <span className={`text-[10px] font-medium block mt-0.5 ${k.color}`}>{k.change}</span>
              </motion.div>
            ))}
          </div>

          {/* Vegetation Trend Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Biomass & Moisture Trends (12-Month)</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-0.5 bg-emerald-500" /> NDVI</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-0.5 bg-blue-500" /> NDWI</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ndviTrendData}>
                  <defs>
                    <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748B" axisLine={false} tickLine={false} domain={[0, 1]} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#10B981' }}
                  />
                  <Area type="monotone" dataKey="ndvi" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#ndviGrad)" />
                  <Area type="monotone" dataKey="moisture" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#moistureGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* AI Observation Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
            <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
              <Info size={15} /> Sentinel Intelligence Report Summary
            </h4>
            <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed">
              Biomass yield forecast for wheat fields is tracking <strong className="text-slate-900 dark:text-white">12.5% above</strong> the historical regional baseline. 
              The temporal index curve suggests Plot A is entering the optimal flowering phase. However, a significant localized moisture drop is observed 
              in East Plot C (Tomatoes), which coordinates with active early blight indicators.
              <strong className="text-emerald-600 dark:text-emerald-400 block mt-1.5">Automated Action recommendation: Dispense 420L irrigation cycle to Plot B and schedule soil testing.</strong>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  </APIProvider>
  );
}

// ════════════════════════════════════════════════════════════════
// GOOGLE MAP SATELLITE HUB COMPONENT
// ════════════════════════════════════════════════════════════════

function GoogleSatelliteMap({ selectedIndex, timelineVal }: SatelliteProps) {
  const { sim, setActiveLocation, activeLocation } = useStore();
  const farmCenter = { lat: 10.9856, lng: 76.9664 };

  const [mapZoom, setMapZoom] = useState(activeLocation ? 19 : 16);
  const [mapTilt, setMapTilt] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [customPlots, setCustomPlots] = useState<Array<{ id: string; name: string; crop: string; health: string; color: string; lat: number; lng: number; plantCount: number }>>([]);
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [plantCount, setPlantCount] = useState(12);
  const [clickedCoords, setClickedCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'generator' | 'intel'>('intel');

  // Derive target coordinates directly from activeLocation
  const currentCoords = useMemo(() => {
    return activeLocation ? { lat: activeLocation.lat, lng: activeLocation.lng } : farmCenter;
  }, [activeLocation?.lat, activeLocation?.lng]);

  // Compute location intelligence memoized on activeLocation's coordinates
  const aiIntel = useMemo(() => {
    return calculateLocationIntel(currentCoords.lat, currentCoords.lng);
  }, [currentCoords.lat, currentCoords.lng]);

  const locationName = useMemo(() => {
    return aiIntel.name;
  }, [aiIntel.name]);

  const dynamicFieldPath = useMemo(() => {
    const d = 0.0008; 
    return [
      { lat: currentCoords.lat + d, lng: currentCoords.lng - d },
      { lat: currentCoords.lat + d, lng: currentCoords.lng + d },
      { lat: currentCoords.lat - d, lng: currentCoords.lng + d },
      { lat: currentCoords.lat - d, lng: currentCoords.lng - d },
    ];
  }, [currentCoords.lat, currentCoords.lng]);

  // Safeguard: make sure activeLocation contains calculated telemetry on mount
  useEffect(() => {
    if (activeLocation && !activeLocation.bestCrops) {
      setActiveLocation(calculateLocationIntel(activeLocation.lat, activeLocation.lng));
    }
  }, [activeLocation, setActiveLocation]);

  // Map instance API controller
  const map = useMap();

  // Programmatically pan map ONLY when coordinates update from external voice commands or search redirects
  useEffect(() => {
    if (!map || !activeLocation) return;
    const center = map.getCenter();
    if (center) {
      const latDiff = Math.abs(center.lat() - activeLocation.lat);
      const lngDiff = Math.abs(center.lng() - activeLocation.lng);
      if (latDiff > 0.001 || lngDiff > 0.001) {
        map.panTo({ lat: activeLocation.lat, lng: activeLocation.lng });
      }
    }
  }, [map, activeLocation?.lat, activeLocation?.lng]);

  // Programmatically update map zoom
  useEffect(() => {
    if (!map) return;
    map.setZoom(mapZoom);
  }, [map, mapZoom]);

  // Programmatically update map tilt
  useEffect(() => {
    if (!map) return;
    map.setTilt(mapTilt);
  }, [map, mapTilt]);

  const suggestions = useMemo(() => {
    if (!searchQuery) return [];
    return SEARCH_LOCATIONS.filter(loc =>
      loc.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSearchSelect = (loc: typeof SEARCH_LOCATIONS[0]) => {
    setActiveLocation(calculateLocationIntel(loc.lat, loc.lng));
    setMapZoom(19);
    setSearchQuery(loc.label);
    setShowSearchDropdown(false);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    const coordParts = searchQuery.split(',').map(s => parseFloat(s.trim()));
    if (coordParts.length === 2 && !isNaN(coordParts[0]) && !isNaN(coordParts[1])) {
      setActiveLocation(calculateLocationIntel(coordParts[0], coordParts[1]));
      setMapZoom(17);
      return;
    }

    const matched = SEARCH_LOCATIONS.find(loc => 
      loc.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (matched) {
      handleSearchSelect(matched);
    }
  };

  const handleMapClick = (e: any) => {
    if (e.detail?.latLng) {
      setClickedCoords(e.detail.latLng);
    }
  };

  const handleAddHologram = () => {
    if (!clickedCoords) return;
    const newPlot = {
      id: `custom-plot-${Date.now()}`,
      name: `Projected ${selectedCrop} Patch`,
      crop: selectedCrop,
      health: 'healthy',
      color: selectedCrop === 'Wheat' ? '#10B981' : selectedCrop === 'Maize' ? '#F59E0B' : selectedCrop === 'Tomato' ? '#EF4444' : '#8B5CF6',
      lat: clickedCoords.lat,
      lng: clickedCoords.lng,
      plantCount: plantCount
    };
    setCustomPlots([...customPlots, newPlot]);
    setClickedCoords(null);
  };

  const handleDeletePlot = (id: string) => {
    setCustomPlots(customPlots.filter(p => p.id !== id));
  };

  const plots = useMemo(() => [
    {
      id: 'plot-a',
      name: 'North Sector - Wheat',
      crop: 'Wheat',
      health: 'healthy',
      color: '#10B981',
      path: [
        { lat: 10.9870, lng: 76.9645 },
        { lat: 10.9870, lng: 76.9675 },
        { lat: 10.9855, lng: 76.9675 },
        { lat: 10.9855, lng: 76.9645 }
      ]
    },
    {
      id: 'plot-b',
      name: 'East Sector - Maize',
      crop: 'Maize',
      health: 'water_stress',
      color: '#F59E0B',
      path: [
        { lat: 10.9855, lng: 76.9675 },
        { lat: 10.9855, lng: 76.9695 },
        { lat: 10.9840, lng: 76.9695 },
        { lat: 10.9840, lng: 76.9675 }
      ]
    },
    {
      id: 'plot-c',
      name: 'South Sector - Tomato',
      crop: 'Tomato',
      health: 'disease',
      color: '#EF4444',
      path: [
        { lat: 10.9840, lng: 76.9645 },
        { lat: 10.9840, lng: 76.9675 },
        { lat: 10.9825, lng: 76.9675 },
        { lat: 10.9825, lng: 76.9645 }
      ]
    },
    {
      id: 'plot-d',
      name: 'West Sector - Cotton',
      crop: 'Cotton',
      health: 'healthy',
      color: '#10B981',
      path: [
        { lat: 10.9855, lng: 76.9615 },
        { lat: 10.9855, lng: 76.9645 },
        { lat: 10.9840, lng: 76.9645 },
        { lat: 10.9840, lng: 76.9615 }
      ]
    }
  ], []);

  const activePlotOptions = useMemo(() => {
    return (plot: typeof plots[0]) => {
      let opacity = 0.35;
      let color = plot.color;

      if (selectedIndex === 'ndwi') {
        color = plot.health === 'water_stress' ? '#F59E0B' : '#3B82F6';
        opacity = 0.45;
      } else if (selectedIndex === 'smi') {
        color = plot.health === 'water_stress' ? '#b45309' : '#1d4ed8';
        opacity = 0.45;
      } else if (selectedIndex === 'evi') {
        color = plot.health === 'healthy' ? '#047857' : '#f59e0b';
        opacity = 0.4;
      }

      const variance = (timelineVal - 1) * 0.05;
      opacity = Math.max(0.15, Math.min(0.85, opacity + variance));

      return {
        fillColor: color,
        fillOpacity: opacity,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
      };
    };
  }, [selectedIndex, timelineVal]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map Container */}
      <div className="lg:col-span-2 relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-slate-900">
        <GoogleMapsContainer
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_git_agentskills_v1']}
          defaultCenter={farmCenter}
          defaultZoom={16}
          mapTypeId="satellite"
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
          onClick={handleMapClick}
        >
            {/* Render Base Plot Polygons */}
            {plots.map(plot => (
              <MapPolygon
                key={plot.id}
                paths={plot.path}
                options={activePlotOptions(plot)}
              />
            ))}

            {/* Render Draggable Bounding Polygon representing My Active Field */}
            <MapPolygon
              paths={dynamicFieldPath}
              options={{
                fillColor: '#06b6d4',
                fillOpacity: 0.18,
                strokeColor: '#06b6d4',
                strokeOpacity: 0.95,
                strokeWeight: 3.5,
              }}
            />

            {/* Render Draggable Bounding Box Centroid Anchor */}
            <AdvancedMarker
              position={currentCoords}
              draggable={true}
              onDragEnd={(e) => {
                if (e.latLng) {
                  const newLat = e.latLng.lat();
                  const newLng = e.latLng.lng();
                  setActiveLocation(calculateLocationIntel(newLat, newLng));
                }
              }}
            >
              <div className="flex flex-col items-center select-none cursor-grab active:cursor-grabbing transform -translate-y-1/2">
                <div className="w-16 h-16 rounded-full border border-cyan-400 bg-cyan-950/20 backdrop-blur-[2px] shadow-[0_0_15px_rgba(6,182,212,0.8)] overflow-hidden flex items-center justify-center relative">
                  <Canvas camera={{ position: [0, 1.8, 3.2], fov: 45 }}>
                    <ambientLight intensity={1.2} />
                    <directionalLight position={[2, 4, 2]} intensity={1.5} color="#06b6d4" />
                    
                    <AnimatedMapPlant cropType={selectedCrop} health={aiIntel.nearbyChemicalAlert ? 'disease' : 'healthy'} plantCount={plantCount} />
                    
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={3.0} />
                  </Canvas>
                </div>
                <div className="mt-1.5 bg-slate-950/95 text-cyan-400 text-[8px] font-black tracking-wider px-2 py-0.5 rounded border border-cyan-400/40 shadow flex items-center gap-1 uppercase select-none">
                  <span>🚜 Drag Anchor ({plantCount} Plants)</span>
                </div>
                <div className="absolute bottom-0 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[20px] border-b-cyan-500/10 opacity-60 blur-[1px]" style={{ transform: 'rotate(180deg) translateY(-2px)' }} />
              </div>
            </AdvancedMarker>

            {/* Render Base Markers for sectors */}
            {plots.map(plot => {
              const centroid = getCentroid(plot.path);
              const getDynamicHealth = () => {
                if (plot.id === 'plot-c') return sim.diseasePressure;
                if (plot.id === 'plot-b') return sim.irrigationMode === 'off' ? 'water_stress' : 'healthy';
                if (plot.id === 'plot-a') return sim.soilPh < 5.5 || sim.soilPh > 7.5 ? 'water_stress' : 'healthy';
                return 'healthy';
              };
              return (
                <AdvancedMarker
                  key={plot.id}
                  position={centroid}
                  title={plot.name}
                >
                  <MapHologramMarker cropType={plot.crop} health={getDynamicHealth()} plantCount={8} />
                </AdvancedMarker>
              );
            })}

            {/* Render Custom Click Position Marker */}
            {clickedCoords && (
              <AdvancedMarker
                position={clickedCoords}
                title="Target Coordinates Selected"
              >
                <div className="flex flex-col items-center transform -translate-x-1/2 -translate-y-full select-none pointer-events-none">
                  <div className="bg-cyan-500 text-white rounded-full p-1.5 shadow-[0_0_10px_rgba(6,182,212,0.8)] border border-white animate-bounce">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-950/90 text-cyan-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-cyan-400/30 mt-1 whitespace-nowrap">
                    Place Selected
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {/* Render Added Custom Crop Markers */}
            {customPlots.map(plot => (
              <AdvancedMarker
                key={plot.id}
                position={{ lat: plot.lat, lng: plot.lng }}
                title={plot.name}
              >
                <MapHologramMarker cropType={plot.crop} health={plot.health} plantCount={plot.plantCount} />
              </AdvancedMarker>
            ))}
          </GoogleMapsContainer>

          {/* Map ID & Satellite HUD indicator */}
          <div className="absolute top-4 left-4 bg-slate-900/90 text-white backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl text-xs space-y-1 shadow-xl pointer-events-none z-10">
            <div className="font-bold text-cyan-400 flex items-center gap-1.5 mb-0.5">
              🛰️ TELEMETRY SYSTEM OVERLAY
            </div>
            <div className="text-[10px] text-gray-400 font-mono">Center: {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}</div>
          </div>
        </div>

        {/* Dynamic Holographic & AI Intel Panel */}
        <div className="glass-card rounded-2xl p-5 border border-cyan-500/20 bg-slate-50/50 dark:bg-[#0b1329]/50 flex flex-col justify-between h-[540px] overflow-y-auto">
          <div className="space-y-4">
            {/* Search Bar */}
            <form onSubmit={handleManualSearch} className="relative">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search farms or 'lat, lng'..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showSearchDropdown && suggestions.length > 0 && (
                <div className="absolute z-30 w-full mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden text-xs">
                  {suggestions.map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSearchSelect(loc)}
                      className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/5 flex flex-col gap-0.5 text-slate-700 dark:text-gray-300"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">{loc.label}</span>
                      <span className="text-[9px] text-slate-400">{loc.desc} ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})</span>
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* Tilt/Slanting & Tab Selectors */}
            <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveSidebarTab('intel')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all ${
                  activeSidebarTab === 'intel'
                    ? 'bg-cyan-500 text-white shadow'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🧠 Location AI
              </button>
              <button
                type="button"
                onClick={() => setActiveSidebarTab('generator')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all ${
                  activeSidebarTab === 'generator'
                    ? 'bg-cyan-500 text-white shadow'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ✨ Crop Generator
              </button>
            </div>
            {/* TAB CONTENT: AI LOCATION INTEL */}
            {activeSidebarTab === 'intel' && (
              <div className="space-y-4">
                {/* Active location tag */}
                <div>
                  <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">AI Target Geography</div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-0.5 flex items-center gap-1.5 font-sans">
                    📍 {locationName}
                  </h4>
                  <p className="text-[9px] text-slate-500 dark:text-gray-400 font-mono mt-0.5">
                    Lat: {currentCoords.lat.toFixed(5)}, Lng: {currentCoords.lng.toFixed(5)}
                  </p>
                </div>

                {/* Industrial Proximity Warning Alert */}
                {aiIntel.nearbyChemicalAlert && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] rounded-xl font-medium animate-pulse space-y-1">
                    <p className="font-bold flex items-center gap-1">🚨 FACTORY HAZARD INCOMING</p>
                    <p className="leading-relaxed">{aiIntel.nearbyChemicalAlert}</p>
                  </div>
                )}

                {/* Weather & Soil specs */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <span className="text-[9px] text-slate-400 font-medium uppercase">AI Predicted Temp</span>
                    <p className="text-lg font-bold text-slate-800 dark:text-white mt-1 flex items-baseline gap-1">
                      {aiIntel.temperature}°C
                      <span className="text-[10px] font-normal text-cyan-400">Live</span>
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <span className="text-[9px] text-slate-400 font-medium uppercase">Simulated Soil pH</span>
                    <p className="text-lg font-bold text-orange-400 mt-1">{aiIntel.soilPh}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <span className="text-[9px] text-slate-400 font-medium uppercase">Soil Moisture</span>
                    <p className="text-lg font-bold text-blue-400 mt-1">{aiIntel.soilMoisture}%</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <span className="text-[9px] text-slate-400 font-medium uppercase">Organic Carbon</span>
                    <p className="text-lg font-bold text-emerald-400 mt-1">{aiIntel.organicCarbon}%</p>
                  </div>
                </div>

                {/* Recommended Crops list */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">🌾 Ranked Best Crop Recommendations</div>
                  <div className="space-y-1.5">
                    {aiIntel.bestCrops.map(crop => (
                      <div key={crop.name} className="p-2 bg-slate-100/50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 text-[11px] flex flex-col gap-1">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-slate-800 dark:text-white">Crop: {crop.name}</span>
                          <span className={`${crop.score > 80 ? 'text-emerald-400' : crop.score > 60 ? 'text-orange-400' : 'text-red-400'}`}>
                            {crop.score}% Suitability
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              crop.score > 80 ? 'bg-emerald-400' : crop.score > 60 ? 'bg-orange-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${crop.score}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400">{crop.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disaster Risk indicators */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">⚠️ Simulated Natural Disaster Risks</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'Flood Risk', val: aiIntel.disasterRisks.flood, color: 'bg-blue-500' },
                      { name: 'Drought Risk', val: aiIntel.disasterRisks.drought, color: 'bg-orange-500' },
                      { name: 'Wildfire', val: aiIntel.disasterRisks.fire, color: 'bg-red-500' },
                    ].map(r => (
                      <div key={r.name} className="p-2 rounded-xl bg-slate-100 dark:bg-black/15 text-center border border-slate-200 dark:border-white/5 text-[10px]">
                        <span className="text-slate-400 block mb-1">{r.name}</span>
                        <div className="w-full bg-slate-200 dark:bg-white/10 h-1 rounded-full overflow-hidden mb-1">
                          <div className={`h-full ${r.color}`} style={{ width: `${r.val}%` }} />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">{r.val}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CROP GENERATOR */}
            {activeSidebarTab === 'generator' && (
              <div className="space-y-4">
                {/* Slanting Toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setMapTilt(mapTilt === 45 ? 0 : 45)}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      mapTilt === 45
                        ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>📐 {mapTilt === 45 ? 'Slanting View: Active (45°)' : 'Flat View (0°)'}</span>
                  </button>
                </div>

                {/* Crop Projector Form */}
                <div className="border-t border-slate-200 dark:border-white/10 pt-4 space-y-3">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <span>✨ Hologram Generator Console</span>
                  </div>

                  {/* Coordinates status */}
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
                    {clickedCoords ? (
                      <div className="text-slate-800 dark:text-gray-200">
                        <p className="font-semibold text-cyan-400 text-[10px]">TARGET ACQUIRED</p>
                        <p className="font-mono mt-0.5 text-[10px]">
                          Lat: {clickedCoords.lat.toFixed(6)}, Lng: {clickedCoords.lng.toFixed(6)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-gray-400 text-[10px] text-center py-1">
                        🖱️ Click anywhere on map to set projection target
                      </p>
                    )}
                  </div>

                  {/* Crop Picker */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Crop Variety</label>
                    <div className="grid grid-cols-4 gap-1">
                      {['Wheat', 'Maize', 'Tomato', 'Cotton'].map(crop => (
                        <button
                          key={crop}
                          type="button"
                          onClick={() => setSelectedCrop(crop)}
                          className={`py-1 px-1 rounded-lg font-bold text-[10px] text-center border transition-all ${
                            selectedCrop === crop
                              ? 'bg-cyan-500/25 border-cyan-500 text-cyan-400 shadow'
                              : 'bg-white dark:bg-black/35 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400'
                          }`}
                        >
                          {crop}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plants Count Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>Number of Plants</span>
                      <span className="text-cyan-400">{plantCount} Units</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="40"
                      value={plantCount}
                      onChange={(e) => setPlantCount(parseInt(e.target.value))}
                      className="w-full accent-cyan-500 h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={handleAddHologram}
                    disabled={!clickedCoords}
                    className={`w-full py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      clickedCoords
                        ? 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-gray-600 border border-transparent cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Project Hologram Stalks</span>
                  </button>
                </div>

                {/* List of Custom Projects */}
                <div className="border-t border-slate-200 dark:border-white/10 pt-4 mt-4">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>📂 Custom Projections ({customPlots.length})</span>
                    {customPlots.length > 0 && (
                      <button
                        onClick={() => setCustomPlots([])}
                        className="text-[9px] text-red-400 hover:underline lowercase font-medium"
                      >
                        Clear all
                      </button>
                    )}
                  </h5>

                  <div className="space-y-2 max-h-[140px] overflow-y-auto">
                    {customPlots.map(plot => (
                      <div
                        key={plot.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-100/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-[11px] group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: plot.color }} />
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white">🌾 {plot.crop} ({plot.plantCount} Plants)</p>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                              {plot.lat.toFixed(5)}, {plot.lng.toFixed(5)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeletePlot(plot.id)}
                          className="p-1 rounded text-red-500 hover:bg-red-500/10 opacity-60 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {customPlots.length === 0 && (
                      <p className="text-center py-4 text-[10px] text-slate-400 dark:text-gray-500 font-medium">
                        No custom fields generated. Click the map to start!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

// Custom component to render polygon in @vis.gl/react-google-maps
function MapPolygon({ paths, options }: { paths: google.maps.LatLngLiteral[], options: google.maps.PolygonOptions }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const polygon = new google.maps.Polygon({
      paths,
      ...options,
    });

    polygon.setMap(map);

    return () => {
      polygon.setMap(null);
    };
  }, [map, paths, options]);

  return null;
}

// Simple helper to find centroid of a rectangle/polygon
function getCentroid(paths: google.maps.LatLngLiteral[]) {
  let lat = 0;
  let lng = 0;
  paths.forEach(p => {
    lat += p.lat;
    lng += p.lng;
  });
  return { lat: lat / paths.length, lng: lng / paths.length };
}

// ════════════════════════════════════════════════════════════════
// 3D MAP HOLOGRAM OVERLAY COMPONENTS
// ════════════════════════════════════════════════════════════════

function MapHologramMarker({ cropType, health, plantCount = 1 }: { cropType: string; health: string; plantCount?: number }) {
  return (
    <div className="relative w-16 h-20 flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-[85%] pointer-events-none select-none">
      {/* 3D Hologram Plant Canvas */}
      <div className="w-14 h-14 bg-cyan-950/20 backdrop-blur-[2px] rounded-full border border-cyan-400/20 shadow-[0_0_10px_rgba(6,182,212,0.3)] overflow-hidden">
        <Canvas camera={{ position: [0, 1.8, 3.2], fov: 45 }}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[2, 4, 2]} intensity={1.5} color="#06b6d4" />
          
          <AnimatedMapPlant cropType={cropType} health={health} plantCount={plantCount} />
          
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={3.0} />
        </Canvas>
      </div>

      {/* Futuristic Crop Label Tag */}
      <div className="mt-1 bg-slate-950/90 text-white text-[8px] font-black tracking-wider px-2 py-0.5 rounded border border-cyan-400/30 shadow-[0_0_5px_rgba(6,182,212,0.4)] uppercase flex items-center gap-1">
        <span>🌾 {cropType}</span>
        <span className="w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: getHealthColor(health) }} />
      </div>

      {/* Projector beam overlay effect */}
      <div className="absolute bottom-0 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[20px] border-b-cyan-500/10 opacity-60 blur-[1px] pointer-events-none" style={{ transform: 'rotate(180deg) translateY(-2px)' }} />
    </div>
  );
}

function getHealthColor(health: string) {
  if (health === 'disease' || health === 'high' || health === 'medium') return '#ef4444';
  if (health === 'water_stress' || health === 'low') return '#f59e0b';
  return '#10b981';
}

function AnimatedMapPlant({ cropType, health, plantCount }: { cropType: string; health: string; plantCount: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = -0.55 + Math.sin(t * 3) * 0.02;
  });

  const holoColor = useMemo(() => {
    if (health === 'disease' || health === 'high' || health === 'medium') return '#EF4444';
    if (health === 'water_stress' || health === 'low') return '#F59E0B';
    return '#06B6D4';
  }, [health]);

  // Lay out mini stalks based on plantCount (clamped to max 12 to maintain WebGL performance)
  const renderCount = Math.min(12, plantCount);
  const positions = useMemo(() => {
    if (renderCount <= 1) return [[0, 0]];
    
    const coords: [number, number][] = [];
    const cols = Math.ceil(Math.sqrt(renderCount));
    const spacing = 0.28 / cols;
    const offset = (cols - 1) * spacing / 2;
    
    let count = 0;
    for (let r = 0; r < cols && count < renderCount; r++) {
      for (let c = 0; c < cols && count < renderCount; c++) {
        coords.push([r * spacing - offset, c * spacing - offset]);
        count++;
      }
    }
    return coords;
  }, [renderCount]);

  return (
    <group ref={ref} position={[0, -0.55, 0]}>
      {positions.map(([ox, oz], idx) => (
        <group key={idx} position={[ox, 0, oz]}>
          {/* Central Stalk */}
          <mesh>
            <cylinderGeometry args={[0.015, 0.03, 0.9, 5]} />
            <meshBasicMaterial color={holoColor} wireframe transparent opacity={0.7} />
          </mesh>
          
          {/* Leaves/Grain head */}
          {cropType.toLowerCase() === 'wheat' ? (
            Array.from({ length: 4 }).map((_, i) => (
              <mesh key={i} position={[Math.sin(i * 1.5) * 0.03, 0.15 + i * 0.08, Math.cos(i * 1.5) * 0.03]}>
                <coneGeometry args={[0.025, 0.1, 4]} />
                <meshBasicMaterial color={holoColor} wireframe transparent opacity={0.8} />
              </mesh>
            ))
          ) : cropType.toLowerCase() === 'tomato' ? (
            Array.from({ length: 2 }).map((_, i) => (
              <mesh key={i} position={[Math.sin(i * 3.1) * 0.08, 0.08 + i * 0.14, Math.cos(i * 3.1) * 0.08]}>
                <sphereGeometry args={[0.05, 5, 5]} />
                <meshBasicMaterial color={holoColor} wireframe transparent opacity={0.8} />
              </mesh>
            ))
          ) : (
            Array.from({ length: 3 }).map((_, i) => (
              <group key={i} position={[0, 0.08 + i * 0.12, 0]} rotation={[0.4, i * 1.2, 0.2]}>
                <mesh position={[0, 0.12, 0]}>
                  <coneGeometry args={[0.05, 0.2, 4]} />
                  <meshBasicMaterial color={holoColor} wireframe transparent opacity={0.7} />
                </mesh>
              </group>
            ))
          )}
        </group>
      ))}
    </group>
  );
}
