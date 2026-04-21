import React, { useState, useEffect } from 'react';
import { Sun, Droplets, Map as MapIcon, Wind, CheckCircle2, Info } from 'lucide-react';

const AIR_MASSES = {
  cA: { id: 'cA', label: 'Continental Arctic (cA)', temp: 'Very Cold', moisture: 'Dry' },
  cP: { id: 'cP', label: 'Continental Polar (cP)', temp: 'Cold', moisture: 'Dry' },
  cT: { id: 'cT', label: 'Continental Tropical (cT)', temp: 'Warm/Hot', moisture: 'Dry' },
  mP: { id: 'mP', label: 'Maritime Polar (mP)', temp: 'Cold/Cool', moisture: 'Humid' },
  mT: { id: 'mT', label: 'Maritime Tropical (mT)', temp: 'Warm/Hot', moisture: 'Humid' }
};

const REGIONS = [
  {
    id: 'arctic', name: 'Arctic Basin & Greenland', x: 75, y: 23, lat: '80° N',
    surface: 'Land/Ice', insolation: 'Very Low', insolationAngle: 15,
    physicsExplanation: 'At extreme high latitudes, sunlight hits the surface at a very low, glancing angle. The solar energy is spread over a huge area and much is reflected by ice (high albedo).',
    surfaceExplanation: 'The surface is covered in solid ice and frozen land. Very little evaporation can occur, leading to extremely low humidity.',
    correctTemp: 'Very Cold', correctMoisture: 'Dry', correctMass: 'cA'
  },
  {
    id: 'canada', name: 'Central & Northern Canada', x: 44, y: 58, lat: '60° N',
    surface: 'Land', insolation: 'Low', insolationAngle: 35,
    physicsExplanation: 'At high latitudes, sunlight arrives at a low angle, spreading its energy over a larger area, resulting in low surface temperatures.',
    surfaceExplanation: 'This massive expanse of land has a low heat capacity and cools rapidly in winter. It lacks the continuous moisture source of an ocean.',
    correctTemp: 'Cold', correctMoisture: 'Dry', correctMass: 'cP'
  },
  {
    id: 'n_pacific', name: 'North Pacific Ocean', x: 19, y: 68, lat: '50° N',
    surface: 'Ocean', insolation: 'Low/Medium', insolationAngle: 45,
    physicsExplanation: 'Mid-to-high latitudes receive indirect sunlight. The ocean waters here are cold due to currents and lower solar intensity.',
    surfaceExplanation: 'The vast ocean provides an infinite source of water for evaporation, heavily saturating the air above it with moisture.',
    correctTemp: 'Cold/Cool', correctMoisture: 'Humid', correctMass: 'mP'
  },
  {
    id: 'n_atlantic', name: 'North Atlantic Ocean', x: 78, y: 68, lat: '50° N',
    surface: 'Ocean', insolation: 'Low/Medium', insolationAngle: 45,
    physicsExplanation: 'Similar to the North Pacific, the higher latitude means sunlight is less direct, keeping the overall air temperature cool to cold.',
    surfaceExplanation: 'The open ocean acts as a massive humidifier, constantly evaporating water into the cool air mass resting above it.',
    correctTemp: 'Cold/Cool', correctMoisture: 'Humid', correctMass: 'mP'
  },
  {
    id: 'sw_us', name: 'Southwestern US / Northern Mexico', x: 39, y: 83, lat: '30° N',
    surface: 'Land', insolation: 'High', insolationAngle: 75,
    physicsExplanation: 'Located near the tropics, this region receives highly direct, intense sunlight. The solar energy is concentrated, leading to high temperatures.',
    surfaceExplanation: 'The dry, desert land surface has very little water to evaporate. Without water to absorb heat through evaporation, the land superheats the air.',
    correctTemp: 'Warm/Hot', correctMoisture: 'Dry', correctMass: 'cT'
  },
  {
    id: 'gulf', name: 'Gulf of Mexico & Caribbean', x: 50, y: 89, lat: '20° N',
    surface: 'Ocean', insolation: 'High', insolationAngle: 85,
    physicsExplanation: 'Near the equator, sunlight hits the Earth almost directly (at a steep angle). This intense, concentrated solar radiation deeply heats the surface.',
    surfaceExplanation: 'The very warm ocean waters evaporate rapidly, pumping massive amounts of water vapor and latent heat into the air mass.',
    correctTemp: 'Warm/Hot', correctMoisture: 'Humid', correctMass: 'mT'
  },
  {
    id: 's_pacific', name: 'Subtropical Pacific', x: 28, y: 89, lat: '20° N',
    surface: 'Ocean', insolation: 'High', insolationAngle: 80,
    physicsExplanation: 'Lower latitudes receive intense, direct insolation. This strong solar heating warms the surface waters significantly.',
    surfaceExplanation: 'The warm ocean surface allows for high rates of evaporation, creating a deeply humid and unstable lower atmosphere.',
    correctTemp: 'Warm/Hot', correctMoisture: 'Humid', correctMass: 'mT'
  }
];

const InsolationDiagram = ({ angle }) => (
  <div className="relative w-full h-32 bg-sky-50 rounded-lg overflow-hidden border border-sky-100 flex items-end justify-center pb-2">
    <div className="absolute top-2 left-2 text-xs font-semibold text-sky-700 flex items-center">
      <Sun size={14} className="mr-1" /> Sun Angle: {angle}°
    </div>
    <div className="absolute bottom-0 w-full h-8 bg-emerald-600 rounded-t-[50%] opacity-80" style={{ transform: 'scaleX(1.5)' }}></div>
    <div className="relative w-full h-full">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-yellow-400 opacity-70"
          style={{ width: '4px', height: '100px', left: `${30 + i * 10}%`, top: '-20px', transformOrigin: 'bottom center', transform: `rotate(${90 - angle}deg)` }}
        >
          <div className="absolute bottom-0 left-[-4px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-yellow-400"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function App() {
  const [activeRegion, setActiveRegion] = useState(null);
  const [deducedTemp, setDeducedTemp] = useState('');
  const [deducedMoisture, setDeducedMoisture] = useState('');
  const [finalMass, setFinalMass] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedRegions, setCompletedRegions] = useState([]);

  // Notify the parent page of our rendered height so the iframe auto-resizes
  useEffect(() => {
    const sendHeight = () => {
      const root = document.getElementById('root');
      const h = root ? root.getBoundingClientRect().height : document.body.offsetHeight;
      window.parent.postMessage(
        { type: 'iframeResize', height: Math.ceil(h) },
        '*'
      );
    };
    // Small delay to let layout settle before measuring
    const timer = setTimeout(sendHeight, 100);
    const ro = new ResizeObserver(sendHeight);
    ro.observe(document.getElementById('root') || document.body);
    return () => { clearTimeout(timer); ro.disconnect(); };
  }, []);

  const handleRegionClick = (region) => {
    setActiveRegion(region);
    setDeducedTemp('');
    setDeducedMoisture('');
    setFinalMass('');
    setShowSuccess(false);
  };

  const checkCompletion = (temp, moisture, mass, region) => {
    if (temp === region.correctTemp && moisture === region.correctMoisture && mass === region.correctMass) {
      setShowSuccess(true);
      if (!completedRegions.includes(region.id)) {
        setCompletedRegions(prev => [...prev, region.id]);
      }
    } else {
      setShowSuccess(false);
    }
  };

  const updateDeduction = (type, value) => {
    const newTemp = type === 'temp' ? value : deducedTemp;
    const newMoist = type === 'moisture' ? value : deducedMoisture;
    const newMass = type === 'mass' ? value : finalMass;
    setDeducedTemp(newTemp);
    setDeducedMoisture(newMoist);
    setFinalMass(newMass);
    if (newTemp && newMoist && newMass) {
      checkCompletion(newTemp, newMoist, newMass, activeRegion);
    }
  };

  return (
    <div className="bg-slate-100 p-3 font-sans text-slate-800">
      <header className="max-w-6xl mx-auto mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center mb-2">
          <Wind className="mr-3 text-blue-500" size={32} />
          Air Mass Origins Lab
        </h1>
        <p className="text-slate-600">
          Investigate how <strong>global surface temperatures</strong>, <strong>insolation intensity</strong> (sunlight angle), and <strong>surface types</strong> (land vs. ocean) combine to create different types of air masses. Select a source region on the map to begin.
        </p>
        <div className="mt-4 flex items-center text-sm font-medium text-emerald-600">
          <CheckCircle2 size={16} className="mr-1" />
          Regions Analyzed: {completedRegions.length} / {REGIONS.length}
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="lg:col-span-7 sm:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-200 p-4">
            <h2 className="font-semibold flex items-center text-slate-700">
              <MapIcon size={18} className="mr-2" />
              Source Regions Map (North America)
            </h2>
          </div>
          <div className="relative w-full h-[380px] bg-[#aad3df] overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-90">
              <img src="https://tile.openstreetmap.org/2/0/0.png" alt="NW Map Tile" className="w-full h-full object-cover pointer-events-none" />
              <img src="https://tile.openstreetmap.org/2/1/0.png" alt="NE Map Tile" className="w-full h-full object-cover pointer-events-none" />
              <img src="https://tile.openstreetmap.org/2/0/1.png" alt="SW Map Tile" className="w-full h-full object-cover pointer-events-none" />
              <img src="https://tile.openstreetmap.org/2/1/1.png" alt="SE Map Tile" className="w-full h-full object-cover pointer-events-none" />
            </div>
            {REGIONS.map((region) => {
              const isActive = activeRegion?.id === region.id;
              const isCompleted = completedRegions.includes(region.id);
              return (
                <button
                  key={region.id}
                  onClick={() => handleRegionClick(region)}
                  title={region.name}
                  style={{ left: `${region.x}%`, top: `${region.y}%`, touchAction: 'manipulation' }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-transparent border-none cursor-pointer transition-all duration-300
                    ${isActive ? 'z-20' : 'z-10'}`}
                >
                  <div className={`rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                    ${isActive ? 'w-9 h-9 bg-blue-600 shadow-lg shadow-blue-500/50 ring-4 ring-blue-200' : `w-6 h-6 hover:scale-110 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-700'}`}`}>
                    {isCompleted ? <CheckCircle2 size={14} className="text-white" /> : <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className={`absolute top-full mt-2 whitespace-nowrap px-2 py-1 bg-slate-800 text-white text-xs rounded pointer-events-none transition-opacity ${isActive ? 'opacity-100 z-30' : 'opacity-0'}`}>
                    {region.name}
                  </span>
                </button>
              );
            })}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded shadow-md text-xs border border-slate-200 z-10">
              <div className="font-bold mb-2">Latitude Zones</div>
              <div className="flex items-center gap-2 mb-1"><div className="w-8 border-t-2 border-dashed border-blue-400"></div> Polar / Arctic (60°+)</div>
              <div className="flex items-center gap-2 mb-1"><div className="w-8 border-t-2 border-dashed border-green-400"></div> Mid-Latitudes (30°–60°)</div>
              <div className="flex items-center gap-2"><div className="w-8 border-t-2 border-dashed border-red-400"></div> Tropical (0°–30°)</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 sm:col-span-5 flex flex-col gap-4">
          {!activeRegion && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 h-full flex flex-col items-center justify-center text-center text-slate-500">
              <MapIcon size={48} className="mb-4 text-slate-300" />
              <h3 className="text-xl font-medium mb-2 text-slate-700">Select a Region</h3>
              <p>Click on a marker on the map to investigate the physical properties of that area and determine what kind of air mass originates there.</p>
            </div>
          )}
          {activeRegion && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-800 text-white p-4">
                  <h2 className="text-xl font-bold">{activeRegion.name}</h2>
                  <div className="text-slate-300 text-sm flex items-center mt-1">
                    <MapIcon size={14} className="mr-1" /> Latitude: {activeRegion.lat}
                  </div>
                </div>
                <div className="p-5 grid grid-cols-1 gap-5">
                  <div className="border border-amber-100 bg-amber-50/50 rounded-lg p-4">
                    <h3 className="font-bold text-amber-900 flex items-center mb-3">
                      <Sun size={18} className="mr-2 text-amber-500" /> Insolation & Temperature
                    </h3>
                    <InsolationDiagram angle={activeRegion.insolationAngle} />
                    <div className="mt-3 text-sm text-amber-800">
                      <p className="mb-2"><strong>Intensity:</strong> {activeRegion.insolation}</p>
                      <p className="leading-relaxed">{activeRegion.physicsExplanation}</p>
                    </div>
                  </div>
                  <div className="border border-blue-100 bg-blue-50/50 rounded-lg p-4">
                    <h3 className="font-bold text-blue-900 flex items-center mb-3">
                      <Droplets size={18} className="mr-2 text-blue-500" /> Surface & Moisture
                    </h3>
                    <div className="mt-2 text-sm text-blue-800">
                      <p className="mb-2"><strong>Surface Type:</strong> {activeRegion.surface}</p>
                      <p className="leading-relaxed">{activeRegion.surfaceExplanation}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-indigo-200 overflow-hidden border-t-4 border-t-indigo-500">
                <div className="p-5">
                  <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
                    <Info size={20} className="mr-2 text-indigo-500" /> Construct Your Explanation
                  </h3>
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <p className="text-sm font-medium text-slate-700 mb-3">
                        1. Based on the insolation intensity at {activeRegion.lat}, this air mass will be:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Very Cold', 'Cold', 'Cold/Cool', 'Warm/Hot'].map(t => (
                          <button key={t} onClick={() => updateDeduction('temp', t)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border
                              ${deducedTemp === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <p className="text-sm font-medium text-slate-700 mb-3">
                        2. Based on the {activeRegion.surface.toLowerCase()} surface, this air mass will be:
                      </p>
                      <div className="flex gap-2">
                        {['Dry', 'Humid'].map(m => (
                          <button key={m} onClick={() => updateDeduction('moisture', m)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border
                              ${deducedMoisture === m ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                      <p className="text-sm font-medium text-indigo-900 mb-3">
                        3. Therefore, the air mass originating here is a:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.values(AIR_MASSES).map(mass => (
                          <button key={mass.id} onClick={() => updateDeduction('mass', mass.id)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-all border
                              ${finalMass === mass.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.02]' : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-100'}`}>
                            {mass.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {finalMass && deducedTemp && deducedMoisture && (
                    <div className={`mt-6 p-4 rounded-lg border flex items-start ${showSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      {showSuccess ? (
                        <>
                          <CheckCircle2 className="text-green-600 mt-0.5 mr-3 flex-shrink-0" size={20} />
                          <div>
                            <p className="font-bold text-green-800">Excellent Explanation!</p>
                            <p className="text-sm text-green-700 mt-1">
                              Because of the <strong>{activeRegion.insolation.toLowerCase()} insolation</strong>, the air is <strong>{activeRegion.correctTemp.toLowerCase()}</strong>.
                              Because it forms over <strong>{activeRegion.surface.toLowerCase()}</strong>, it is <strong>{activeRegion.correctMoisture.toLowerCase()}</strong>.
                              This creates a <strong>{AIR_MASSES[activeRegion.correctMass].label}</strong> air mass.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Info className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
                          <div>
                            <p className="font-bold text-red-800">Not quite right.</p>
                            <p className="text-sm text-red-700 mt-1">Review the Physics and Surface data above. Does a {activeRegion.surface.toLowerCase()} surface make air dry or humid? Does {activeRegion.insolation.toLowerCase()} sunlight make it hot or cold?</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
