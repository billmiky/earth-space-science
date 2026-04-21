import React, { useEffect, useRef, useState } from 'react';
import { Info, Wind, Layers, Settings, Play, Pause } from 'lucide-react';

const WIND_DEFS = [
  // Surface wind climatology:
  // Trades = easterlies (E -> W), Westerlies = westerlies (W -> E), Polar winds = easterlies (E -> W)
  { type: 'NE Trades', l1: 28, l2: 2, zonalDir: -1, arc: 0.45, color: '#f87171', count: 6 },
  { type: 'SE Trades', l1: -28, l2: -2, zonalDir: -1, arc: 0.45, color: '#f87171', count: 6 },
  { type: 'Westerlies N', l1: 32, l2: 58, zonalDir: 1, arc: 0.5, color: '#f87171', count: 5 },
  { type: 'Westerlies S', l1: -32, l2: -58, zonalDir: 1, arc: 0.5, color: '#f87171', count: 5 },
  { type: 'Polar N', l1: 85, l2: 62, zonalDir: -1, arc: 0.65, color: '#60a5fa', count: 3 },
  { type: 'Polar S', l1: -85, l2: -62, zonalDir: -1, arc: 0.65, color: '#60a5fa', count: 3 },
];

const CELLS = [
  { type: 'HadleyN', lat1: 0, lat2: 30, riseAt: 0, sinkAt: 30 },
  { type: 'FerrelN', lat1: 30, lat2: 60, riseAt: 60, sinkAt: 30 },
  { type: 'PolarN', lat1: 60, lat2: 90, riseAt: 60, sinkAt: 90 },
  { type: 'HadleyS', lat1: -30, lat2: 0, riseAt: 0, sinkAt: -30 },
  { type: 'FerrelS', lat1: -60, lat2: -30, riseAt: -60, sinkAt: -30 },
  { type: 'PolarS', lat1: -90, lat2: -60, riseAt: -60, sinkAt: -90 }
];

const LABELS = [
  { text: 'Equatorial low', lat: 0, side: 1, type: 'pressure' },
  { text: 'Subtropical high', lat: 30, side: 1, type: 'pressure' },
  { text: 'Subtropical high', lat: -30, side: 1, type: 'pressure' },
  { text: 'Subpolar low', lat: 60, side: 1, type: 'pressure' },
  { text: 'Subpolar low', lat: -60, side: 1, type: 'pressure' },
  { text: 'Polar high', lat: 85, side: 1, type: 'pressure' },
  { text: 'Polar high', lat: -85, side: 1, type: 'pressure' },
  { text: 'Hadley cell', lat: 15, side: -1, type: 'cell' },
  { text: 'Hadley cell', lat: -15, side: -1, type: 'cell' },
  { text: 'Ferrel cell', lat: 45, side: -1, type: 'cell' },
  { text: 'Ferrel cell', lat: -45, side: -1, type: 'cell' },
  { text: 'Polar cell', lat: 75, side: -1, type: 'cell' },
  { text: 'Polar cell', lat: -75, side: -1, type: 'cell' },
];

const ZONE_INFO = {
  Equatorial: {
    title: 'Equatorial Low (Doldrums)',
    desc: 'Intense solar heating at the equator causes warm, moist air to rise, creating a continuous low-pressure zone. This region experiences heavy precipitation, towering clouds, and calm, unpredictable surface winds.'
  },
  TradeWinds: {
    title: 'Trade Winds & Hadley Cell',
    desc: 'Surface air moves from the subtropical highs back towards the equator, deflected westward by the Coriolis effect. The Hadley cell is the massive vertical loop of rising equatorial air and sinking subtropical air.'
  },
  Subtropical: {
    title: 'Subtropical High (Horse Latitudes)',
    desc: "At roughly 30° latitude, cool air from the upper atmosphere sinks, creating stable high-pressure systems. This sinking air inhibits cloud formation, leading to clear skies and many of Earth's major deserts."
  },
  Westerlies: {
    title: 'Westerlies & Ferrel Cell',
    desc: 'Surface air moving poleward from the subtropical highs is deflected eastward. The Ferrel cell is a secondary circulation feature driven by the adjacent Hadley and Polar cells, acting like an idle gear.'
  },
  Subpolar: {
    title: 'Subpolar Low (Polar Front)',
    desc: 'Warm air from the westerlies collides with freezing air from the poles. The warmer air is forced to rise over the cold dense air, creating a turbulent zone of low pressure and frequent storm systems.'
  },
  Polar: {
    title: 'Polar Easterlies & Polar Cell',
    desc: 'Extremely cold, dense air sinks at the poles (forming a Polar High) and flows equatorward, being deflected westward by the Coriolis effect. The Polar cell completes the global circulation system.'
  }
};

const ZONE_BANDS = {
  Equatorial: [0, 10],
  TradeWinds: [10, 25],
  Subtropical: [25, 35],
  Westerlies: [35, 55],
  Subpolar: [55, 65],
  Polar: [65, 90]
};

const surfaceArrows = [];
WIND_DEFS.forEach(def => {
  for (let i = 0; i < def.count; i++) {
    const t = def.count > 1 ? i / (def.count - 1) : 0.5;
    surfaceArrows.push({ ...def, xRatio: -0.6 + t * 1.2, offsetTime: Math.random() });
  }
});

const cellParticles = [];
CELLS.forEach(cell => {
  [1, -1].forEach(side => {
    for (let i = 0; i < 6; i++) cellParticles.push({ cell, side, offsetTime: i / 6 });
  });
});

const projectToGlobe = (cx, cy, R, latDeg, lonDeg) => {
  const lat = latDeg * Math.PI / 180;
  const lon = lonDeg * Math.PI / 180;
  return {
    x: cx + R * Math.cos(lat) * Math.sin(lon),
    y: cy - R * Math.sin(lat)
  };
};

export default function App() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const timeRef = useRef(0);

  const [showWinds, setShowWinds] = useState(true);
  const [showCells, setShowCells] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [hoverZone, setHoverZone] = useState(null);

  const stateRef = useRef({ showWinds, showCells, showLabels, playing, speed, hoverZone });
  useEffect(() => {
    stateRef.current = { showWinds, showCells, showLabels, playing, speed, hoverZone };
  }, [showWinds, showCells, showLabels, playing, speed, hoverZone]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let animId;
    const render = () => {
      if (stateRef.current.playing) timeRef.current += 0.003 * stateRef.current.speed;
      drawFrame(timeRef.current);
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const drawFrame = (time) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { showWinds, showCells, showLabels, hoverZone } = stateRef.current;
    const dpr = window.devicePixelRatio || 1;
    const lW = canvas.width / dpr, lH = canvas.height / dpr;
    const cx = lW / 2, cy = lH / 2;
    const R = Math.min(lW * 0.35, lH * 0.4);

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, lW, lH);

    const grad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(1, '#1e3a8a');
    ctx.shadowColor = '#60a5fa';
    ctx.shadowBlur = 25;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (hoverZone) drawHighlight(ctx, cx, cy, R, hoverZone);

    [0, 30, -30, 60, -60].forEach(lat => {
      const rad = lat * Math.PI / 180;
      const y = cy - R * Math.sin(rad);
      const w = R * Math.cos(rad);
      ctx.beginPath();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.moveTo(cx - w, y);
      ctx.lineTo(cx + w, y);
      ctx.stroke();
      ctx.setLineDash([]);
      if (showLabels && lat !== 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.abs(lat)}°`, cx - w - 8, y + 3);
      }
    });
    if (showLabels) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('0°', cx - R - 8, cy + 3);
    }

    renderClouds(ctx, cx, cy, R);
    if (showCells) { drawCellPaths(ctx, cx, cy, R); drawCellParticles(ctx, cx, cy, R, time); }
    if (showWinds) surfaceArrows.forEach(a => drawSurfaceWind(ctx, cx, cy, R, a, time));
    if (showLabels) renderLabels(ctx, cx, cy, R);
    ctx.restore();
  };

  const drawHighlight = (ctx, cx, cy, R, zone) => {
    const [minL, maxL] = ZONE_BANDS[zone];
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(cx - R, cy - R * Math.sin(maxL * Math.PI / 180), R * 2, R * Math.sin(maxL * Math.PI / 180) - R * Math.sin(minL * Math.PI / 180));
    if (minL !== 0 || maxL !== 0) {
      ctx.fillRect(cx - R, cy - R * Math.sin(-minL * Math.PI / 180), R * 2, R * Math.sin(-minL * Math.PI / 180) - R * Math.sin(-maxL * Math.PI / 180));
    }
    ctx.restore();
  };

  const renderClouds = (ctx, cx, cy, R) => {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    const cloud = (x, y, s) => {
      ctx.beginPath();
      ctx.arc(x, y, 8 * s, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(x + 8 * s, y - 4 * s, 10 * s, Math.PI, Math.PI * 2);
      ctx.arc(x + 16 * s, y, 8 * s, Math.PI * 1.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();
    };
    for (let i = -4; i <= 4; i++) cloud(cx + i * 35 - 12, cy, 0.8);
    const y60N = cy - R * Math.sin(60 * Math.PI / 180);
    const y60S = cy - R * Math.sin(-60 * Math.PI / 180);
    for (let i = -2; i <= 2; i++) { cloud(cx + i * 35 - 12, y60N, 0.6); cloud(cx + i * 35 - 12, y60S, 0.6); }
  };

  const getCellPos = (cell, side, t, cx, cy, R) => {
    const H = 40;
    const angleDiff = Math.abs(cell.riseAt * Math.PI / 180 - cell.sinkAt * Math.PI / 180);
    const L1 = H, L2 = (R + H) * angleDiff, L3 = H, L4 = R * angleDiff;
    const Ltot = L1 + L2 + L3 + L4;
    let d = (t % 1) * Ltot, r, lat, color;
    if (d < L1) { r = R + (d / L1) * H; lat = cell.riseAt; color = '#ef4444'; }
    else if (d < L1 + L2) { r = R + H; lat = cell.riseAt + (cell.sinkAt - cell.riseAt) * (d - L1) / L2; color = '#a855f7'; }
    else if (d < L1 + L2 + L3) { r = R + H - ((d - L1 - L2) / L3) * H; lat = cell.sinkAt; color = '#3b82f6'; }
    else { r = R; lat = cell.sinkAt + (cell.riseAt - cell.sinkAt) * (d - L1 - L2 - L3) / L4; color = cell.type.includes('Polar') ? '#3b82f6' : '#ef4444'; }
    const rad = lat * Math.PI / 180;
    return { x: cx + side * r * Math.cos(rad), y: cy - r * Math.sin(rad), color };
  };

  const drawCellPaths = (ctx, cx, cy, R) => {
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    CELLS.forEach(cell => [1, -1].forEach(side => {
      ctx.beginPath();
      for (let t = 0; t <= 1.01; t += 0.02) {
        const p = getCellPos(cell, side, t, cx, cy, R);
        t === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }));
  };

  const drawCellParticles = (ctx, cx, cy, R, time) => {
    cellParticles.forEach(p => {
      const t = (time * 0.15 + p.offsetTime) % 1;
      const pos = getCellPos(p.cell, p.side, t, cx, cy, R);
      const posNext = getCellPos(p.cell, p.side, (t + 0.005) % 1, cx, cy, R);
      const angle = Math.atan2(posNext.y - pos.y, posNext.x - pos.x);
      const size = 6;
      ctx.fillStyle = pos.color;
      ctx.beginPath();
      ctx.moveTo(pos.x + size * Math.cos(angle), pos.y + size * Math.sin(angle));
      ctx.lineTo(pos.x + size * Math.cos(angle + 2.5), pos.y + size * Math.sin(angle + 2.5));
      ctx.lineTo(pos.x + size * Math.cos(angle - 2.5), pos.y + size * Math.sin(angle - 2.5));
      ctx.closePath();
      ctx.shadowColor = pos.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  };

  const drawSurfaceWind = (ctx, cx, cy, R, arrow, time) => {
    const lonStart = arrow.xRatio * 70;
    const lonShift = arrow.zonalDir * (14 + arrow.arc * 14);
    const lonEnd = Math.max(-80, Math.min(80, lonStart + lonShift));

    const p1 = projectToGlobe(cx, cy, R, arrow.l1, lonStart);
    const p2 = projectToGlobe(cx, cy, R, arrow.l2, lonEnd);
    const midLat = (arrow.l1 + arrow.l2) / 2;
    const midLon = lonStart + (lonEnd - lonStart) * 0.55;
    const cp = projectToGlobe(cx, cy, R, midLat, midLon);

    ctx.beginPath();
    ctx.strokeStyle = arrow.color + '22';
    ctx.lineWidth = 1.5;
    ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(cp.x, cp.y, p2.x, p2.y);
    ctx.stroke();

    const t = (time * 0.3 + arrow.offsetTime) % 1;
    const px = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * cp.x + t * t * p2.x;
    const py = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * cp.y + t * t * p2.y;
    const dx = 2 * (1 - t) * (cp.x - p1.x) + 2 * t * (p2.x - cp.x);
    const dy = 2 * (1 - t) * (cp.y - p1.y) + 2 * t * (p2.y - cp.y);
    const angle = Math.atan2(dy, dx);

    ctx.fillStyle = arrow.color;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - 7 * Math.cos(angle - Math.PI/6), py - 7 * Math.sin(angle - Math.PI/6));
    ctx.lineTo(px - 7 * Math.cos(angle + Math.PI/6), py - 7 * Math.sin(angle + Math.PI/6));
    ctx.closePath();
    ctx.fill();
  };

  const renderLabels = (ctx, cx, cy, R) => {
    ctx.font = '12px sans-serif';
    ctx.textBaseline = 'middle';
    LABELS.forEach(lb => {
      const y = cy - R * Math.sin(lb.lat * Math.PI / 180);
      const x = cx + lb.side * (R + (lb.type === 'pressure' ? 25 : 65));
      ctx.fillStyle = lb.type === 'pressure' ? '#cbd5e1' : '#93c5fd';
      ctx.textAlign = lb.side === 1 ? 'left' : 'right';
      ctx.fillText(lb.text, x, y);
    });
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const R = Math.min(rect.width * 0.35, rect.height * 0.4);
    const dist = Math.hypot(e.clientX - rect.left - cx, e.clientY - rect.top - cy);
    if (dist < R + 50) {
      const absLat = Math.abs(Math.asin(Math.max(-1, Math.min(1, (cy - (e.clientY - rect.top)) / R))) * 180 / Math.PI);
      if (absLat < 10) setHoverZone('Equatorial');
      else if (absLat < 25) setHoverZone('TradeWinds');
      else if (absLat < 35) setHoverZone('Subtropical');
      else if (absLat < 55) setHoverZone('Westerlies');
      else if (absLat < 65) setHoverZone('Subpolar');
      else setHoverZone('Polar');
    } else setHoverZone(null);
  };

  return (
    <div className="flex flex-row w-full bg-slate-950 text-slate-200 overflow-hidden font-sans" style={{height: '580px'}}>
      <div ref={containerRef} className="flex-1 relative border-r border-slate-800 cursor-crosshair" onMouseMove={handleMouseMove} onMouseLeave={() => setHoverZone(null)}>
        <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
        {!hoverZone && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/60 px-4 py-2 rounded-full border border-slate-700/50 backdrop-blur-sm pointer-events-none text-xs text-slate-400 flex items-center gap-2">
            <Info size={14} /> Hover over latitudes to explore
          </div>
        )}
      </div>

      <div className="w-52 flex-none flex flex-col bg-slate-900 shadow-2xl z-10 h-full">
        <div className="p-3 border-b border-slate-800">
          <h1 className="text-base font-bold text-white flex items-center gap-2"><Wind size={14} className="text-blue-400" /> Global Circulation</h1>
          <p className="text-xs text-slate-400">Interactive Atmospheric Model</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          <div className="space-y-2 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Layers size={12} /> Display</h2>
            <Toggle label="Surface Winds" checked={showWinds} onChange={setShowWinds} color="bg-red-500" />
            <Toggle label="Atmospheric Cells" checked={showCells} onChange={setShowCells} color="bg-blue-500" />
            <Toggle label="Pressure Labels" checked={showLabels} onChange={setShowLabels} color="bg-slate-400" />
          </div>
          <div className="space-y-2 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Settings size={12} /> Speed</h2>
              <button onClick={() => setPlaying(!playing)} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors">
                {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>
            </div>
            <input type="range" min="0.1" max="3" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>
          <div className="flex-1">
            {hoverZone ? (
              <div className="bg-blue-900/20 p-3 rounded-xl border border-blue-500/30">
                <h3 className="text-xs font-bold text-blue-300 mb-2 border-b border-blue-500/20 pb-1">{ZONE_INFO[hoverZone].title}</h3>
                <p className="text-xs leading-relaxed text-slate-300">{ZONE_INFO[hoverZone].desc}</p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-4 text-slate-500">
                <Info size={16} className="opacity-50 mb-2" />
                <p className="text-xs">Hover over the globe to explore circulation zones.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Toggle = ({ label, checked, onChange, color }) => (
  <label className="flex items-center justify-between cursor-pointer group">
    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
    <div className={`w-9 h-5 rounded-full transition-colors relative ${checked ? color : 'bg-slate-700'}`}>
      <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-4' : ''}`} />
    </div>
  </label>
);
