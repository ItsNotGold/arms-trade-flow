import React, { useState } from 'react';
import { useMapStore } from '../../store/mapStore';
import { categoryColor } from '../../utils/formatters';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const WEAPON_CATEGORIES = [
  'Aircraft', 'Armoured vehicles', 'Artillery', 
  'Missiles', 'Ships', 'Sensors', 'Other'
];

const BLOCS_LIST = [
  'NATO', 'EU', 'BRICS', 'SCO', 'Arab League', 'ASEAN', 'African Union'
];

export default function FilterPanel() {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    yearRange,
    setYearRange,
    activeWeaponCategories,
    toggleWeaponCategory,
    minTiv,
    setMinTiv,
    selectedBlocs,
    toggleBloc,
    flowLimit,
    setFlowLimit,
    arcs
  } = useMapStore();

  // CSV export handler
  const handleExportCSV = () => {
    if (!arcs || !arcs.length) {
      alert('No data to export');
      return;
    }
    const header = ['Supplier','Supplier ISO','Recipient','Recipient ISO','Year','Category','Designation','Quantity','TIV'];
    const rows = arcs.map(a => [
      a.supplier_name,
      a.supplier_iso,
      a.recipient_name,
      a.recipient_iso,
      a.year,
      a.category,
      a.designation,
      a.quantity,
      a.tiv
    ]);
    const csvContent = [header, ...rows]
      .map(e => e.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `arms_data_${yearRange[0]}-${yearRange[1]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleYearChange = (index, value) => {
    const newRange = [...yearRange];
    newRange[index] = parseInt(value);
    // Enforce min <= max
    if (newRange[0] > newRange[1]) {
      if (index === 0) newRange[0] = newRange[1];
      else newRange[1] = newRange[0];
    }
    setYearRange(newRange);
  };

  const applyPreset = (preset) => {
    switch (preset) {
      case 'coldWar': setYearRange([1950, 1991]); break;
      case 'post911': setYearRange([2001, 2010]); break;
      case 'recent': setYearRange([2013, 2023]); break;
      default: break;
    }
  };

  if (!isExpanded) {
    return (
      <div className="absolute left-0 top-0 mt-4 ml-4 z-40 bg-[#0d101e]/85 backdrop-blur-md border border-[#1e2330] rounded-xl flex flex-col items-center py-4 gap-4 transition-all duration-300 w-14">
        <button onClick={() => setIsExpanded(true)} className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-colors">
          <Filter className="w-5 h-5" />
        </button>
        <button onClick={() => setIsExpanded(true)} className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-colors mt-auto">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-0 h-full w-[280px] bg-[#0d101e]/85 backdrop-blur-md border-r border-[#1e2330] z-40 flex flex-col transition-all duration-300 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1e2330] sticky top-0 bg-[#0d101e]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-text-primary">Filters</h2>
        </div>
        <button onClick={() => setIsExpanded(false)} className="p-1 hover:bg-white/10 rounded-md text-text-muted hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-8 pb-10">
        {/* 1. YEAR RANGE */}
        <div className="flex flex-col gap-4">
          <label className="text-xs font-semibold tracking-wide uppercase text-text-muted">Time Period</label>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-mono text-text-primary mb-1">
              <span>{yearRange[0]}</span>
              <span>{yearRange[1]}</span>
            </div>
            
            <div className="relative w-full h-8 flex items-center">
              <input
                type="range"
                min="1950"
                max="2023"
                value={yearRange[0]}
                onChange={(e) => handleYearChange(0, e.target.value)}
                className="absolute w-full h-1 bg-[#1e2330] rounded-lg appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto accent-accent"
                style={{ zIndex: yearRange[0] > 1980 ? 2 : 1 }}
              />
              <input
                type="range"
                min="1950"
                max="2023"
                value={yearRange[1]}
                onChange={(e) => handleYearChange(1, e.target.value)}
                className="absolute w-full h-1 bg-transparent rounded-lg appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto accent-accent"
                style={{ zIndex: 1 }}
              />
            </div>
            
            <div className="text-center mt-1">
              <span className="text-sm font-bold text-accent">{yearRange[0]} &ndash; {yearRange[1]}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <button onClick={() => applyPreset('coldWar')} className="text-xs py-1.5 px-3 bg-[#1e2330]/50 hover:bg-[#1e2330] rounded-md text-text-muted hover:text-white transition-colors text-left">
              Cold War (1950&ndash;1991)
            </button>
            <button onClick={() => applyPreset('post911')} className="text-xs py-1.5 px-3 bg-[#1e2330]/50 hover:bg-[#1e2330] rounded-md text-text-muted hover:text-white transition-colors text-left">
              Post-9/11 (2001&ndash;2010)
            </button>
            <button onClick={() => applyPreset('recent')} className="text-xs py-1.5 px-3 bg-[#1e2330]/50 hover:bg-[#1e2330] rounded-md text-text-muted hover:text-white transition-colors text-left">
              Recent Decade (2013&ndash;2023)
            </button>
          </div>
        </div>

        {/* 2. WEAPON CATEGORIES */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold tracking-wide uppercase text-text-muted">Weapon Categories</label>
          <div className="flex flex-col gap-2">
            {WEAPON_CATEGORIES.map(cat => {
              const isSelected = activeWeaponCategories.length === 0 || activeWeaponCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleWeaponCategory(cat)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                    isSelected ? 'bg-white/5 border border-white/10 text-white' : 'bg-transparent border border-transparent text-text-muted hover:bg-white/5'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColor(cat) }} />
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. MINIMUM FLOW SIZE */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold tracking-wide uppercase text-text-muted">Min. Flow Size (TIV)</label>
            <span className="text-xs font-mono text-accent">{minTiv}</span>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={minTiv}
            onChange={(e) => setMinTiv(parseInt(e.target.value))}
            className="w-full h-1 bg-[#1e2330] rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>

        {/* 4. GEOPOLITICAL BLOC */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold tracking-wide uppercase text-text-muted">Filter by Bloc</label>
          <div className="flex flex-wrap gap-2">
            {BLOCS_LIST.map(bloc => {
              const isSelected = selectedBlocs.includes(bloc);
              return (
                <button
                  key={bloc}
                  onClick={() => toggleBloc(bloc)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                    isSelected 
                      ? 'bg-accent/20 border-accent/50 text-accent border' 
                      : 'bg-[#1e2330]/50 border-transparent text-text-muted border hover:text-white'
                  }`}
                >
                  {bloc}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. FLOW LIMIT */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold tracking-wide uppercase text-text-muted">Number of Flows</label>
          <select
            id="flow-limit"
            value={flowLimit}
            onChange={e => setFlowLimit(Number(e.target.value))}
            className="bg-[#13161e] border border-[#1e2330] text-xs rounded px-2 py-1 text-[#e2e8f0] focus:outline-none"
          >
            {[20, 50, 100, 150, 200].map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={handleExportCSV}
          className="mt-4 w-full py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 border border-accent/20"
        >
          Export Data (CSV)
        </button>

      </div>
    </div>
  );
}
