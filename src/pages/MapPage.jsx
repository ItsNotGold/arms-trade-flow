import React, { useEffect, lazy, Suspense } from 'react';
import { useMapStore } from '../store/mapStore';
import { Globe, Layers, Sliders, ShieldAlert, ArrowRight, Crosshair, Activity, Camera } from 'lucide-react';
import LoadingSpinner from '../components/Loading/LoadingSpinner';
import { loadFlows } from '../utils/dataLoader';
import FilterPanel from '../components/Filters/FilterPanel.jsx';
import TimelineBar from '../components/Timeline/TimelineBar.jsx';
import SearchBar from '../components/Search/SearchBar.jsx';

import GlobeView from '../components/Globe/GlobeView';
import FlowDetailCard from '../components/Panels/FlowDetailCard';
import WeaponSystemCard from '../components/Panels/WeaponSystemCard';
import CountryPanel from '../components/Panels/CountryPanel';
import html2canvas from 'html2canvas';

const FlatMapView = lazy(() => import('../components/FlatMap/FlatMapView'));
const ChordView = lazy(() => import('../components/Chord/ChordView'));

export default function MapPage() {
  const {
    activeView,
    setActiveView,
    yearRange,
    setYearRange,
    activeWeaponCategories,
    setActiveWeaponCategories,
    minTiv,
    setMinTiv,
    selectedBlocs,
    focusedCountry,
    setFocusedCountry,
    setArcs,
    arcs,
    selectedFlow,
    setSelectedFlow,
    selectedWeapon,
    setSelectedWeapon,
    // retained for possible future use
  } = useMapStore();

  // Sync URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const years = params.get('years');
    if (years) {
      const [start, end] = years.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) setYearRange([start, end]);
    }
    const categories = params.get('categories');
    if (categories) setActiveWeaponCategories(categories.split(',').filter(Boolean));
    const min = params.get('minTiv');
    if (min) setMinTiv(Number(min));
    const view = params.get('view');
    if (view) setActiveView(view);
    const country = params.get('country');
    if (country) setFocusedCountry(country);
  }, []);

  // Update URL on changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('years', `${yearRange[0]}-${yearRange[1]}`);
    if (activeWeaponCategories.length) params.set('categories', activeWeaponCategories.join(','));
    params.set('minTiv', minTiv);
    params.set('view', activeView);
    if (focusedCountry) params.set('country', focusedCountry);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [yearRange, activeWeaponCategories, minTiv, activeView, focusedCountry]);

  // Load flows
  useEffect(() => {
    loadFlows(yearRange[0], yearRange[1], activeWeaponCategories, minTiv, selectedBlocs)
      .then((data) => setArcs(data || []))
      .catch((err) => console.error('Failed to load flows', err));
  }, [yearRange, activeWeaponCategories, minTiv, selectedBlocs]);

  // Export PNG (optional)
  const handleExportImage = async () => {
    const container = document.getElementById('globe-container');
    if (!container) return;
    const canvas = await html2canvas(container);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `arms-trade-${yearRange[0]}-${yearRange[1]}-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="relative w-full h-screen bg-background flex flex-col">
      {/* Fixed filter overlay */}
      <FilterPanel />

      {/* Search bar - only show for globe and flat maps */}
      {(activeView === 'globe' || activeView === 'flat') && <SearchBar />}

      {/* Main visualization area */}
      <div className="absolute inset-0 pb-[80px]">
        {activeView === 'globe' && <GlobeView arcs={arcs} onArcClick={(arc) => setSelectedFlow(arc)} />}
        {activeView === 'flat' && (
          <Suspense fallback={<LoadingSpinner />}> 
            <FlatMapView arcs={arcs} onArcClick={(arc) => setSelectedFlow(arc)} />
          </Suspense>
        )}
        {activeView === 'chord' && (
          <Suspense fallback={<LoadingSpinner />}> 
            <ChordView arcs={arcs} />
          </Suspense>
        )}
      </div>

      {/* View selector bar - fixed above timeline */}
      <div className="fixed bottom-[72px] right-4 flex bg-surface p-1 rounded-xl border border-border shadow-lg gap-1 z-20">
        {['globe', 'flat', 'chord'].map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-3 py-1 rounded text-xs transition-colors focus:outline-none ${activeView === view ? 'bg-accent text-white font-medium' : 'text-text-muted hover:text-text-primary'}`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* Timeline Bar */}
      <TimelineBar />

      {/* Country detail panel — slides in from right when a country is clicked */}
      <CountryPanel />

      {/* Flow detail card — floats above timeline when an arc is clicked */}
      {selectedFlow && <FlowDetailCard flow={selectedFlow} onClose={() => setSelectedFlow(null)} />}
      {selectedWeapon && <WeaponSystemCard weaponName={selectedWeapon} onClose={() => setSelectedWeapon(null)} />}
    </div>
  );
}
