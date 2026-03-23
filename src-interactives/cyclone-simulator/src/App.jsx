import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, RotateCcw, Info, Wind, Layers, CloudRain, 
  Map as MapIcon, FastForward 
} from 'lucide-react';

// --- Meteorological Math & Helper Functions ---

const lerp = (a, b, t) => a + (b - a) * t;

const getQuadBezierPoint = (t, p0, p1, p2) => {
  const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
  const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
  return { x, y };
};

const getQuadBezierTangent = (t, p0, p1, p2) => {
  const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
  const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: dx / len, y: dy / len };
};

const keyframes = [
  {
    p: 0,
    L: { x: 0.5, y: 0.5 },
    T: { x: 0.5, y: 0.5 },
    coldEnd: { x: 0.0, y: 0.5 },
    coldCtrl: { x: 0.25, y: 0.5 },
    warmEnd: { x: 1.0, y: 0.5 },
    warmCtrl: { x: 0.75, y: 0.5 },
    occCtrl: { x: 0.5, y: 0.5 },
    pressure: 1010,
    desc: "Stationary Front Stage: Cold air to the north and warm air to the south flow parallel to the boundary in opposite directions. There is no active weather development yet."
  },
  {
    p: 20,
    L: { x: 0.5, y: 0.45 },
    T: { x: 0.5, y: 0.45 },
    coldEnd: { x: 0.0, y: 0.6 },
    coldCtrl: { x: 0.3, y: 0.6 },
    warmEnd: { x: 1.0, y: 0.4 },
    warmCtrl: { x: 0.7, y: 0.35 },
    occCtrl: { x: 0.5, y: 0.45 },
    pressure: 1004,
    desc: "Incipient Wave Stage: A perturbation (kink) forms on the front. A localized low-pressure center develops. Cold air starts pushing south (cold front), and warm air pushes north (warm front)."
  },
  {
    p: 50,
    L: { x: 0.55, y: 0.35 },
    T: { x: 0.55, y: 0.35 },
    coldEnd: { x: 0.1, y: 0.9 },
    coldCtrl: { x: 0.35, y: 0.7 },
    warmEnd: { x: 0.9, y: 0.25 },
    warmCtrl: { x: 0.8, y: 0.45 },
    occCtrl: { x: 0.55, y: 0.35 },
    pressure: 992,
    desc: "Mature Stage (Open Wave): The cyclone is fully developed with well-defined cold and warm fronts. A clear 'warm sector' exists between them. Central pressure drops rapidly, creating strong winds."
  },
  {
    p: 80,
    L: { x: 0.6, y: 0.25 },
    T: { x: 0.68, y: 0.45 },
    coldEnd: { x: 0.25, y: 1.0 },
    coldCtrl: { x: 0.45, y: 0.8 },
    warmEnd: { x: 1.0, y: 0.3 },
    warmCtrl: { x: 0.9, y: 0.5 },
    occCtrl: { x: 0.62, y: 0.35 },
    pressure: 988,
    desc: "Occluded Stage: The faster-moving cold front catches up to the warm front, lifting the warm air completely off the ground near the center. This forms an occluded front. The storm reaches peak intensity."
  },
  {
    p: 100,
    L: { x: 0.65, y: 0.2 },
    T: { x: 0.85, y: 0.6 },
    coldEnd: { x: 0.4, y: 1.0 },
    coldCtrl: { x: 0.65, y: 0.9 },
    warmEnd: { x: 1.0, y: 0.45 },
    warmCtrl: { x: 0.95, y: 0.55 },
    occCtrl: { x: 0.7, y: 0.3 },
    pressure: 998,
    desc: "Dissipation Stage: The low-pressure center is entirely surrounded by cold air. Cut off from its warm air energy source (the temperature gradient), the cyclone slowly weakens and spins down."
  }
];

const getInterpolatedState = (progress) => {
  let kf1 = keyframes[0], kf2 = keyframes[keyframes.length - 1];
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (progress >= keyframes[i].p && progress <= keyframes[i + 1].p) {
      kf1 = keyframes[i];
      kf2 = keyframes[i + 1];
      break;
    }
  }

  const t = (progress - kf1.p) / (kf2.p - kf1.p || 1);
  const state = { desc: progress < 90 ? kf1.desc : keyframes[4].desc };

  ['L', 'T', 'coldEnd', 'coldCtrl', 'warmEnd', 'warmCtrl', 'occCtrl'].forEach(key => {
    state[key] = {
      x: lerp(kf1[key].x, kf2[key].x, t),
      y: lerp(kf1[key].y, kf2[key].y, t)
    };
  });

  state.pressure = lerp(kf1.pressure, kf2.pressure, t);
  return state;
};

// --- Layer Toggle Subcomponent ---
function LayerToggle({ active, onClick, icon, label, color }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
        active
          ? 'border-blue-200 bg-blue-50/50 shadow-sm'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-md ${active ? color : 'bg-slate-100 text-slate-400'}`}>
          {icon}
        </div>
        <span className={`text-sm font-medium ${active ? 'text-slate-800' : 'text-slate-500'}`}>
          {label}
        </span>
      </div>
      <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${active ? 'bg-blue-500' : 'bg-slate-200'}`}>
        <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform duration-300 ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
    </button>
  );
}

// --- Main App Component ---
export default function App() {
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [layers, setLayers] = useState({
    airMasses: true,
    precipitation: true,
    fronts: true,
    winds: true,
    isobars: true,
  });

  const animRef = useRef();
  const lastTimeRef = useRef();
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const animate = useCallback((time) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      if (isPlaying) {
        setProgress((prev) => {
          let next = prev + deltaTime * 0.005;
          if (next > 100) {
            setIsPlaying(false);
            return 100;
          }
          return next;
        });
      }
    }
    lastTimeRef.current = time;
    animRef.current = requestAnimationFrame(animate);
  }, [isPlaying]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  // Observe canvas resize so the drawing effect re-fires with real dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setCanvasSize({ w: width, h: height });
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (width === 0 || height === 0) return;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const state = getInterpolatedState(progress);
    const scale = (pt) => ({ x: pt.x * width, y: pt.y * height });
    const L = scale(state.L);
    const T = scale(state.T);
    const coldEnd = scale(state.coldEnd);
    const coldCtrl = scale(state.coldCtrl);
    const warmEnd = scale(state.warmEnd);
    const warmCtrl = scale(state.warmCtrl);
    const occCtrl = scale(state.occCtrl);

    ctx.clearRect(0, 0, width, height);

    // 1. Air Masses
    if (layers.airMasses) {
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      ctx.moveTo(T.x, T.y);
      ctx.quadraticCurveTo(warmCtrl.x, warmCtrl.y, warmEnd.x, warmEnd.y);
      if (warmEnd.y < height) ctx.lineTo(width, height);
      ctx.lineTo(coldEnd.x, height);
      ctx.lineTo(coldEnd.x, coldEnd.y);
      ctx.quadraticCurveTo(coldCtrl.x, coldCtrl.y, T.x, T.y);
      ctx.fillStyle = '#ffedd5';
      ctx.fill();

      const drawAirMassLabel = (text, desc, x, y, color) => {
        ctx.fillStyle = color;
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
        ctx.font = '13px sans-serif';
        ctx.fillText(desc, x, y + 24);
      };

      if (progress < 5) {
        drawAirMassLabel('cP', 'Continental Polar', width * 0.5, height * 0.25, '#0284c7');
        drawAirMassLabel('mT', 'Maritime Tropical', width * 0.5, height * 0.75, '#c2410c');
      } else {
        const cpX = Math.max(50, Math.min(coldEnd.x - 60, width * 0.2));
        const cpY = Math.max(50, Math.min(L.y + 100, height * 0.5));
        drawAirMassLabel('cP', 'Continental Polar', cpX, cpY, '#0284c7');

        const mtX = Math.min(width - 80, T.x + (warmEnd.x - T.x) * 0.4);
        const mtY = Math.min(height - 50, Math.max(T.y + 120, warmEnd.y + 60));
        drawAirMassLabel('mT', 'Maritime Tropical', mtX, mtY, '#c2410c');

        const mpX = Math.min(width - 80, warmEnd.x - 80);
        const mpY = Math.max(50, T.y - 100);
        drawAirMassLabel('mP', 'Maritime Polar', mpX, mpY, '#0369a1');
      }
    }

    // 2. Precipitation
    if (layers.precipitation) {
      const drawPrecipBand = (p0, p1, p2, widthLimit, side, fillStyle) => {
        ctx.beginPath();
        const steps = 30;
        const pts = [];
        const offsetPts = [];

        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const pt = getQuadBezierPoint(t, p0, p1, p2);
          pts.push(pt);
          const tan = getQuadBezierTangent(t, p0, p1, p2);
          const nx = -tan.y * side;
          const ny = tan.x * side;
          const taper = Math.sin(t * Math.PI);
          const currentWidth = widthLimit * (0.3 + 0.7 * taper);
          offsetPts.push({ x: pt.x + nx * currentWidth, y: pt.y + ny * currentWidth });
        }

        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i <= steps; i++) ctx.lineTo(pts[i].x, pts[i].y);
        for (let i = steps; i >= 0; i--) ctx.lineTo(offsetPts[i].x, offsetPts[i].y);
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
      };

      if (progress < 5) {
        drawPrecipBand(coldEnd, L, warmEnd, 40, -1, 'rgba(74, 222, 128, 0.4)');
      } else {
        drawPrecipBand(T, warmCtrl, warmEnd, 90, -1, 'rgba(74, 222, 128, 0.5)');
        drawPrecipBand(T, coldCtrl, coldEnd, 30, 1, 'rgba(22, 163, 74, 0.7)');

        const intensity = Math.sin((progress / 100) * Math.PI);
        if (progress > 10) {
          ctx.beginPath();
          ctx.ellipse(L.x - 10, L.y - 10, 60 * intensity + 20, 45 * intensity + 20, Math.PI / 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(74, 222, 128, 0.6)';
          ctx.fill();
        }

        if (progress > 55) {
          drawPrecipBand(L, occCtrl, T, 60, 1, 'rgba(74, 222, 128, 0.6)');
          drawPrecipBand(L, occCtrl, T, 60, -1, 'rgba(74, 222, 128, 0.6)');
        }
      }
    }

    // 3. Isobars
    if (layers.isobars) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1;
      const intensity = Math.sin((progress / 100) * Math.PI);
      const numIsobars = 3 + Math.floor(intensity * 5);
      for (let i = 1; i <= numIsobars; i++) {
        ctx.beginPath();
        const radiusX = i * 40 * (1 - intensity * 0.2);
        const radiusY = i * 35 * (1 - intensity * 0.3);
        ctx.ellipse(L.x, L.y, radiusX, radiusY, Math.PI / 8, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    // 4. Fronts
    if (layers.fronts) {
      const drawSymbol = (x, y, angle, type) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        if (type === 'cold') {
          ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.lineTo(0, 14);
          ctx.fillStyle = '#2563eb';
        } else if (type === 'warm') {
          ctx.arc(0, 0, 8, Math.PI, 0);
          ctx.fillStyle = '#dc2626';
        } else if (type === 'occluded-cold') {
          ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.lineTo(0, 14);
          ctx.fillStyle = '#9333ea';
        } else if (type === 'occluded-warm') {
          ctx.arc(0, 0, 8, Math.PI, 0);
          ctx.fillStyle = '#9333ea';
        }
        ctx.fill();
        ctx.restore();
      };

      const drawFrontPath = (p0, p1, p2, color, symbolType, symbolSpacing = 40, isOccluded = false) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
        ctx.stroke();

        const steps = 30;
        let lastDist = 0;
        let occludedToggle = false;

        for (let i = 1; i < steps; i++) {
          const t = i / steps;
          const pt = getQuadBezierPoint(t, p0, p1, p2);
          const prevPt = getQuadBezierPoint((i - 1) / steps, p0, p1, p2);
          const dist = Math.sqrt(Math.pow(pt.x - prevPt.x, 2) + Math.pow(pt.y - prevPt.y, 2));
          lastDist += dist;

          if (lastDist > symbolSpacing) {
            const tangent = getQuadBezierTangent(t, p0, p1, p2);
            let angle = Math.atan2(tangent.y, tangent.x);
            if (symbolType === 'cold') angle += Math.PI / 2;
            else if (symbolType === 'warm') angle -= Math.PI / 2;
            else if (isOccluded) angle += Math.PI / 2;

            let currentSym = symbolType;
            if (isOccluded) {
              currentSym = occludedToggle ? 'occluded-cold' : 'occluded-warm';
              occludedToggle = !occludedToggle;
            }
            drawSymbol(pt.x, pt.y, angle, currentSym);
            lastDist = 0;
          }
        }
      };

      if (progress < 5) {
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(coldEnd.x, coldEnd.y);
        ctx.lineTo(warmEnd.x, warmEnd.y);
        ctx.stroke();
      } else {
        drawFrontPath(T, coldCtrl, coldEnd, '#2563eb', 'cold', 50);
        drawFrontPath(T, warmCtrl, warmEnd, '#dc2626', 'warm', 50);
        if (progress > 55) {
          drawFrontPath(L, occCtrl, T, '#9333ea', 'occluded', 35, true);
        }
      }

      if (progress > 5) {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 4;
        ctx.strokeText('L', L.x, L.y - 15);
        ctx.fillText('L', L.x, L.y - 15);
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px sans-serif';
        ctx.fillText(`${Math.round(state.pressure)} mb`, L.x, L.y + 10);
      }
    }

    // 5. Wind Vectors
    if (layers.winds) {
      ctx.strokeStyle = 'rgba(75, 85, 99, 0.4)';
      ctx.fillStyle = 'rgba(75, 85, 99, 0.6)';
      ctx.lineWidth = 1.5;

      const gridSpacing = 40;
      for (let x = gridSpacing / 2; x < width; x += gridSpacing) {
        for (let y = gridSpacing / 2; y < height; y += gridSpacing) {
          let dx = x - L.x;
          let dy = y - L.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          let windAngle = 0;
          let windSpeed = 0;

          if (progress < 10) {
            windAngle = y < L.y ? Math.PI : 0;
            windSpeed = 10;
          } else {
            const angleToLow = Math.atan2(dy, dx);
            windAngle = angleToLow - Math.PI / 2 - 0.35;
            const intensity = Math.sin((progress / 100) * Math.PI);
            windSpeed = (dist < 300) ? (dist / 300) * 20 * intensity + 5 : 5;
            if (dist < 40) windSpeed = dist / 8;
          }

          if (windSpeed > 2) {
            const arrowLen = Math.min(windSpeed, 25);
            const endX = x + Math.cos(windAngle) * arrowLen;
            const endY = y + Math.sin(windAngle) * arrowLen;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            const headAngle = Math.PI / 6;
            const headLen = 4;
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - headLen * Math.cos(windAngle - headAngle), endY - headLen * Math.sin(windAngle - headAngle));
            ctx.lineTo(endX - headLen * Math.cos(windAngle + headAngle), endY - headLen * Math.sin(windAngle + headAngle));
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }
  }, [progress, layers, canvasSize]);

  const handleProgressChange = (e) => {
    setProgress(parseFloat(e.target.value));
    setIsPlaying(false);
  };

  const toggleLayer = (layer) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden">

      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shadow-lg z-10 shrink-0">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-800 text-white">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <CloudRain className="w-6 h-6 text-blue-400" />
            Mid-Latitude Cyclone
          </h1>
          <p className="text-xs text-slate-400 mt-1">Interactive Cyclogenesis Model</p>
        </div>

        {/* Playback */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Timeline</h2>
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => { setProgress(0); setIsPlaying(false); lastTimeRef.current = undefined; }}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition transform hover:scale-105"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            <button
              onClick={() => { setProgress(100); setIsPlaying(false); }}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition"
              title="Skip to End"
            >
              <FastForward className="w-5 h-5" />
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleProgressChange}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
            <span>Stationary</span>
            <span>Mature</span>
            <span>Dissipating</span>
          </div>
        </div>

        {/* Layers */}
        <div className="p-6 border-b border-slate-100 flex-1 overflow-y-auto">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Display Layers</h2>
          <div className="space-y-3">
            <LayerToggle active={layers.airMasses} onClick={() => toggleLayer('airMasses')}
              icon={<MapIcon className="w-4 h-4" />} label="Air Masses (Temperature)"
              color="bg-orange-100 text-orange-700" />
            <LayerToggle active={layers.precipitation} onClick={() => toggleLayer('precipitation')}
              icon={<CloudRain className="w-4 h-4" />} label="Clouds & Precipitation"
              color="bg-green-100 text-green-700" />
            <LayerToggle active={layers.fronts} onClick={() => toggleLayer('fronts')}
              icon={<Layers className="w-4 h-4" />} label="Frontal Boundaries"
              color="bg-blue-100 text-blue-700" />
            <LayerToggle active={layers.winds} onClick={() => toggleLayer('winds')}
              icon={<Wind className="w-4 h-4" />} label="Wind Vectors"
              color="bg-slate-200 text-slate-700" />
            <LayerToggle active={layers.isobars} onClick={() => toggleLayer('isobars')}
              icon={<Layers className="w-4 h-4" />} label="Isobars (Pressure)"
              color="bg-slate-200 text-slate-700" />
          </div>
        </div>

        {/* Info Box */}
        <div className="p-6 bg-blue-50/50">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Current Stage</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {getInterpolatedState(progress).desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative bg-slate-100 cursor-crosshair">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Legend */}
        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20 text-sm hidden sm:block">
          <h4 className="font-bold text-slate-700 mb-3 text-xs uppercase tracking-wider border-b pb-1">Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-1 bg-blue-600 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-blue-600"></div>
              </div>
              <span className="text-slate-600 font-medium text-xs">Cold Front</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-1 bg-red-600 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[8px] w-4 h-2 bg-red-600 rounded-t-full"></div>
              </div>
              <span className="text-slate-600 font-medium text-xs">Warm Front</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-1 bg-purple-600 relative">
                <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent border-t-purple-600"></div>
                <div className="absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-[7px] w-3 h-1.5 bg-purple-600 rounded-t-full"></div>
              </div>
              <span className="text-slate-600 font-medium text-xs">Occluded Front</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-8 h-3 flex items-center justify-center">
                <div className="w-full h-0.5 bg-slate-400"></div>
              </div>
              <span className="text-slate-600 font-medium text-xs">Isobar</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-8 h-3 flex bg-green-400/50 border border-green-500/20 rounded-sm"></div>
              <span className="text-slate-600 font-medium text-xs">Precipitation</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-8 text-center font-bold text-slate-400 text-xs">cP/mT</div>
              <span className="text-slate-600 font-medium text-xs">Air Masses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
