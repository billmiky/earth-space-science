import React, { useState, useEffect, useMemo } from 'react';

// --- Configuration & Data ---

const COLORS = {
  red: '#ff2a2a',
  blue: '#2a75ff',
  cyan: '#00e5ff',
  yellow: '#ffea00',
  orange: '#ff8c00',
  green: '#00e640',
  purple: '#b300ff',
  pink: '#ff66cc',
  snowLight: '#4d94ff',
  snowMed: '#b366ff',
  snowHeavy: '#ff66cc'
};

// Geographic points for the tracks (Longitude, Latitude)
const TRACKS_2018 = [
  { id: 1, color: COLORS.red, points: [[-120, 32], [-105, 26], [-90, 28], [-75, 38], [-68, 48]] },
  { id: 2, color: COLORS.blue, points: [[-125, 45], [-115, 38], [-100, 35], [-85, 40], [-70, 48]] },
  { id: 3, color: COLORS.cyan, points: [[-122, 48], [-110, 42], [-95, 45], [-80, 40], [-65, 42]] },
  { id: 4, color: COLORS.yellow, points: [[-124, 42], [-105, 30], [-85, 35], [-75, 45], [-62, 48]] },
  { id: 5, color: COLORS.orange, points: [[-118, 35], [-100, 32], [-80, 38], [-65, 40]] },
  { id: 6, color: COLORS.green, points: [[-120, 40], [-105, 45], [-90, 40], [-70, 46], [-60, 45]] },
  { id: 7, color: COLORS.purple, points: [[-125, 38], [-110, 28], [-95, 30], [-80, 42], [-65, 45]] },
  { id: 8, color: COLORS.red, points: [[-110, 48], [-95, 42], [-80, 45], [-68, 50]] },
  { id: 9, color: COLORS.blue, points: [[-115, 30], [-95, 25], [-80, 30], [-70, 40]] },
  { id: 10, color: COLORS.cyan, points: [[-120, 36], [-105, 34], [-90, 38], [-75, 42], [-65, 38]] },
  { id: 11, color: COLORS.yellow, points: [[-128, 40], [-112, 44], [-98, 46], [-85, 38], [-72, 40]] },
  { id: 12, color: COLORS.purple, points: [[-118, 45], [-102, 38], [-88, 42], [-76, 35], [-68, 37]] },
];

const TRACKS_2019 = [
  { id: 1, color: COLORS.yellow, points: [[-125, 47], [-105, 45], [-85, 43], [-65, 46]] },
  { id: 2, color: COLORS.purple, points: [[-122, 42], [-100, 40], [-80, 41], [-65, 44]] },
  { id: 3, color: COLORS.cyan, points: [[-120, 38], [-100, 37], [-80, 38], [-65, 42]] },
  { id: 4, color: COLORS.red, points: [[-124, 34], [-105, 32], [-85, 36], [-68, 40]] },
  { id: 5, color: COLORS.green, points: [[-118, 30], [-95, 34], [-75, 38], [-65, 41]] },
  { id: 6, color: COLORS.orange, points: [[-115, 45], [-95, 48], [-75, 46], [-65, 48]] },
];

const CITIES = [
  { name: 'Seattle', coords: [-122.33, 47.60] },
  { name: 'Reno', coords: [-119.81, 39.52] },
  { name: 'Denver', coords: [-104.99, 39.73] },
  { name: 'Minneapolis', coords: [-93.26, 44.97] },
  { name: 'Kansas City', coords: [-94.57, 39.09] },
  { name: 'Dallas', coords: [-96.79, 32.77] },
  { name: 'Atlanta', coords: [-84.38, 33.74] },
  { name: 'New York', coords: [-74.00, 40.71] },
];

const SNOW_BLOBS = [
  // Heavy (Pink)
  { coords: [-120, 46], r: 40, color: COLORS.snowHeavy },
  { coords: [-112, 45], r: 50, color: COLORS.snowHeavy },
  { coords: [-105, 42], r: 35, color: COLORS.snowHeavy },
  { coords: [-95, 46], r: 60, color: COLORS.snowHeavy },
  { coords: [-75, 44], r: 45, color: COLORS.snowHeavy },
  // Medium (Purple)
  { coords: [-118, 44], r: 55, color: COLORS.snowMed },
  { coords: [-108, 40], r: 65, color: COLORS.snowMed },
  { coords: [-90, 44], r: 70, color: COLORS.snowMed },
  { coords: [-80, 43], r: 60, color: COLORS.snowMed },
  { coords: [-70, 42], r: 50, color: COLORS.snowMed },
  // Light (Blue)
  { coords: [-115, 39], r: 80, color: COLORS.snowLight },
  { coords: [-100, 38], r: 90, color: COLORS.snowLight },
  { coords: [-85, 39], r: 85, color: COLORS.snowLight },
  { coords: [-95, 41], r: 100, color: COLORS.snowLight },
];

// --- Projection & Math Helpers ---

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 550;

// Simple linear projection tailored to contiguous US
const project = (lon, lat) => {
  const lonMin = -128, lonMax = -65;
  const latMin = 24, latMax = 50;
  const x = ((lon - lonMin) / (lonMax - lonMin)) * MAP_WIDTH;
  const y = ((latMax - lat) / (latMax - latMin)) * MAP_HEIGHT;
  return [x, y];
};

// Catmull-Rom spline generator for smooth, exact curves
const catmullRom = (pts) => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]},${pts[0][1]} `;
  if (pts.length === 2) return d + `L ${pts[1][0]},${pts[1][1]}`;

  // Add virtual control points at the ends to calculate tangents
  const p = [
    [pts[0][0] - (pts[1][0] - pts[0][0]), pts[0][1] - (pts[1][1] - pts[0][1])],
    ...pts,
    [pts[pts.length - 1][0] + (pts[pts.length - 1][0] - pts[pts.length - 2][0]), pts[pts.length - 1][1] + (pts[pts.length - 1][1] - pts[pts.length - 2][1])]
  ];

  for (let i = 1; i < p.length - 2; i++) {
    const p0 = p[i - 1], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]} `;
  }
  return d;
};


// --- Components ---

export default function App() {
  const [season, setSeason] = useState('2018');
  const [mapPaths, setMapPaths] = useState([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [animateKey, setAnimateKey] = useState(0);

  // Fetch and parse US map GeoJSON
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
      .then(res => res.json())
      .then(data => {
        const paths = [];
        data.features.forEach(feature => {
          // Filter out non-contiguous states/territories to maintain bounds
          if (['Alaska', 'Hawaii', 'Puerto Rico'].includes(feature.properties.name)) return;
          
          let polygons = [];
          if (feature.geometry.type === 'Polygon') {
            polygons = [feature.geometry.coordinates];
          } else if (feature.geometry.type === 'MultiPolygon') {
            polygons = feature.geometry.coordinates;
          }

          const dStrings = polygons.map(polygon => {
            return polygon.map(ring => {
              return "M " + ring.map(coord => {
                const [x, y] = project(coord[0], coord[1]);
                return `${x},${y}`;
              }).join(" L ") + " Z";
            }).join(" ");
          });

          paths.push(<path key={feature.properties.name} d={dStrings.join(" ")} className="fill-[#415a29] stroke-[#2a3b1a] stroke-1" />);
        });
        setMapPaths(paths);
        setLoadingMap(false);
      })
      .catch(err => {
        console.error("Error loading map:", err);
        setLoadingMap(false);
      });
  }, []);

  // Trigger re-animation when season changes
  useEffect(() => {
    setAnimateKey(prev => prev + 1);
  }, [season]);

  const activeTracks = season === '2018' ? TRACKS_2018 : TRACKS_2019;
  const showCities = season === '2019';
  const showSnowfall = season === '2019';

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-white font-sans overflow-hidden">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center p-4 bg-slate-800 shadow-md z-10">
        <h1 className="text-xl font-bold tracking-wider uppercase text-blue-300">Storm Tracks Simulation</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setSeason('2018')}
            className={`px-4 py-2 rounded font-semibold transition-colors ${season === '2018' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            2018 - 2019 Season
          </button>
          <button 
            onClick={() => setSeason('2019')}
            className={`px-4 py-2 rounded font-semibold transition-colors ${season === '2019' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            2019 - 2020 Season
          </button>
        </div>
      </div>

      {/* Main Simulation Area */}
      <div className="flex-1 relative w-full h-full bg-[#1b263b] overflow-hidden flex items-center justify-center">
        
        {/* Subtle radial gradient background for globe effect */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%)'
        }}></div>

        {loadingMap && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#1b263b]/80">
            <span className="text-2xl animate-pulse font-light">Loading Satellite Data...</span>
          </div>
        )}

        {/* The Map SVG */}
        <svg 
          key={animateKey} // Force full re-render of SVG for animation reset
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} 
          className="w-full h-full max-w-6xl max-h-[85vh] drop-shadow-2xl z-0"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Arrowhead Markers */}
            {Object.entries(COLORS).map(([name, color]) => (
              <marker 
                key={name} 
                id={`arrow-${name}`} 
                viewBox="0 0 10 10" 
                refX="6" 
                refY="5" 
                markerWidth="4" 
                markerHeight="4" 
                orient="auto-start-reverse"
              >
                <path d="M 0 2 L 10 5 L 0 8 z" fill={color} />
              </marker>
            ))}

            {/* Drop Shadow for Tracks */}
            <filter id="track-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.6"/>
            </filter>

            {/* Blur for Snowfall */}
            <filter id="snow-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="15" />
            </filter>
          </defs>

          {/* Layer 1: Landmasses (GeoJSON) */}
          <g className="map-layer">
            {mapPaths}
          </g>

          {/* Layer 2: Snowfall Overlay (2019 only) */}
          {showSnowfall && (
            <g className="snowfall-layer mix-blend-screen" filter="url(#snow-blur)" style={{ opacity: 0.75 }}>
              {SNOW_BLOBS.map((blob, idx) => {
                const [cx, cy] = project(blob.coords[0], blob.coords[1]);
                return (
                  <circle key={`snow-${idx}`} cx={cx} cy={cy} r={blob.r} fill={blob.color} />
                );
              })}
            </g>
          )}

          {/* Layer 3: Storm Tracks */}
          <g className="tracks-layer" filter="url(#track-shadow)">
            {activeTracks.map((track, idx) => {
              const projectedPoints = track.points.map(p => project(p[0], p[1]));
              const pathData = catmullRom(projectedPoints);
              
              // Find matching color name for the marker reference
              const colorName = Object.keys(COLORS).find(k => COLORS[k] === track.color);

              return (
                <g key={`track-${track.id}`}>
                  {/* Outer border stroke for contrast */}
                  <path 
                    d={pathData} 
                    fill="none" 
                    stroke="#000" 
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="path-animate-base"
                  />
                  {/* Inner colored stroke with arrowhead */}
                  <path 
                    d={pathData} 
                    fill="none" 
                    stroke={track.color} 
                    strokeWidth="5"
                    strokeLinecap="round"
                    markerEnd={`url(#arrow-${colorName})`}
                    className="path-animate"
                    style={{ animationDelay: `${idx * 0.15}s` }}
                  />
                </g>
              );
            })}
          </g>

          {/* Layer 4: City Markers (2019 only) */}
          {showCities && (
            <g className="cities-layer">
              {CITIES.map(city => {
                const [cx, cy] = project(city.coords[0], city.coords[1]);
                const boxWidth = city.name.length * 7 + 10;
                return (
                  <g key={city.name} transform={`translate(${cx}, ${cy})`} className="fade-in">
                    <circle cx="0" cy="0" r="3" fill="#fff" stroke="#000" strokeWidth="1" />
                    <rect 
                      x={-boxWidth/2} 
                      y="-18" 
                      width={boxWidth} 
                      height="16" 
                      fill="#1a1a1a" 
                      stroke="#444" 
                      rx="2"
                    />
                    <text 
                      x="0" 
                      y="-6" 
                      fill="#ffffff" 
                      fontSize="10" 
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {city.name}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* HUD Overlay Legends */}
        <div className="absolute top-6 right-6 lg:right-12 z-20 pointer-events-none">
          {season === '2018' ? (
            <div className="bg-cyan-600 border-l-4 border-cyan-300 text-white p-3 shadow-lg fade-in">
              <h2 className="text-xl font-bold uppercase tracking-wide m-0">Winter Storm Tracks</h2>
              <p className="text-right text-sm font-semibold opacity-90 m-0">2018-2019 Season</p>
            </div>
          ) : (
            <div className="bg-slate-100 text-slate-800 p-3 shadow-lg rounded-sm fade-in absolute right-0 top-0 w-64 border border-slate-300">
              <div className="flex justify-between items-end border-b-2 border-slate-300 pb-1 mb-2">
                <h2 className="text-lg font-bold text-blue-900 m-0 leading-none">Seasonal Snowfall</h2>
                <span className="text-xs font-bold text-slate-600 bg-white px-1">2019-2020</span>
              </div>
              <div className="flex items-center text-xs font-bold text-slate-600 mt-2">
                <span className="w-10">Snow</span>
                <span className="mx-2">Lighter</span>
                <div className="flex-1 h-3 flex bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-sm"></div>
                <span className="ml-2">Heavier</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* CSS for animations since we need precise SVG dash stroke control */}
      <style dangerouslySetInnerHTML={{__html: `
        .path-animate-base, .path-animate {
          stroke-dasharray: 1500;
          stroke-dashoffset: 1500;
          animation: drawPath 2s ease-out forwards;
        }
        @keyframes drawPath {
          to { stroke-dashoffset: 0; }
        }
        .fade-in {
          opacity: 0;
          animation: fadeIn 1s ease-in forwards;
          animation-delay: 1.5s;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}} />

    </div>
  );
}