import React, { useEffect, useState, useMemo } from 'react';
import SkeletonBox from '../../components/Loading/SkeletonBox';
import { X, Navigation, Crosshair, Share2 } from 'lucide-react';
import { useMapStore } from '../../store/mapStore';
import { loadCountryProfile } from '../../utils/dataLoader';
import { formatTIV, isoToName, categoryColor } from '../../utils/formatters';
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function CountryPanel() {
  const { focusedCountry, setFocusedCountry, yearRange, activeWeaponCategories, minTiv, activeView } = useMapStore();

  const handleShare = () => {
    const params = new URLSearchParams();
    params.set('years', `${yearRange[0]}-${yearRange[1]}`);
    if (activeWeaponCategories.length) params.set('categories', activeWeaponCategories.join(','));
    params.set('minTiv', minTiv);
    params.set('view', activeView);
    if (focusedCountry) params.set('country', focusedCountry);
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      // Simple toast could be added; using alert for now
      alert('Shareable link copied to clipboard');
    }).catch(() => {
      alert('Failed to copy link');
    });
  };
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('exports');
  const [breakdownMode, setBreakdownMode] = useState('exports');

  useEffect(() => {
    if (focusedCountry) {
      setProfile(null); // reset profile while loading
      loadCountryProfile(focusedCountry).then(data => {
        setProfile(data);
        setActiveTab('exports'); // reset tab on country change
      }).catch(err => {
        console.error('[CountryPanel] Error loading profile:', err);
      });
    } else {
      setProfile(null);
    }
  }, [focusedCountry]);

  const yearlyData = useMemo(() => {
    if (!profile) return [];
    const map = {};
    const ys = yearRange[0];
    const ye = yearRange[1];

    (profile.yearly_exports || []).forEach(d => {
      if (d.year >= ys && d.year <= ye) {
        map[d.year] = { year: d.year, exports: d.tiv, imports: 0 };
      }
    });

    (profile.yearly_imports || []).forEach(d => {
      if (d.year >= ys && d.year <= ye) {
        if (!map[d.year]) map[d.year] = { year: d.year, exports: 0, imports: 0 };
        map[d.year].imports = d.tiv;
      }
    });

    return Object.values(map).sort((a, b) => a.year - b.year);
  }, [profile, yearRange]);

  const breakdownData = useMemo(() => {
    if (!profile) return [];
    const obj = breakdownMode === 'exports' ? profile.exports_by_category : profile.imports_by_category;
    if (!obj) return [];
    return Object.entries(obj)
      .filter(([k, v]) => v > 0)
      .map(([k, v]) => ({ name: k, value: v }))
      .sort((a, b) => b.value - a.value);
  }, [profile, breakdownMode]);

  const renderPartners = (partners = [], type) => {
    if (!partners.length) return <div className="text-text-muted text-sm py-4">No data available</div>;
    const max = Math.max(...partners.map(p => p.tiv));
    
    return (
      <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
        {partners.slice(0, 10).map(p => (
          <div 
            key={p.iso} 
            className="group cursor-pointer"
            onClick={() => setFocusedCountry(p.iso)}
          >
            <div className="flex justify-between text-sm mb-1 text-text-primary group-hover:text-accent transition-colors">
              <span className="truncate pr-2 flex items-center gap-2">
                <span>{isoToName(p.iso)}</span>
              </span>
              <span className="whitespace-nowrap font-medium text-text-muted group-hover:text-text-primary">
                {formatTIV(p.tiv)}
              </span>
            </div>
            <div className="w-full bg-[#1e2330] rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${type === 'exports' ? 'bg-blue-500' : 'bg-orange-500'}`} 
                style={{ width: `${(p.tiv / max) * 100}%` }} 
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleFocusGlobe = () => {
    window.dispatchEvent(new CustomEvent('recenterGlobe'));
  };

  if (!focusedCountry && !profile) return null;

  // Show skeleton while loading profile
  if (!profile) {
    return (
      <div className="absolute top-[64px] right-0 h-[calc(100vh-64px)] w-[380px] bg-[#0d101e]/95 backdrop-blur-xl border-l border-[#1e2330] z-40 flex flex-col p-6">
        <SkeletonBox height="2rem" className="mb-4" />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <SkeletonBox height="1.5rem" />
          <SkeletonBox height="1.5rem" />
        </div>
        <SkeletonBox height="150px" className="mb-4" />
        <SkeletonBox height="200px" className="mb-4" />
        <SkeletonBox height="2rem" />
      </div>
    );
  }

  // Import dependency score
  const maxImport = profile?.top_import_partners?.[0]?.tiv || 0;
  const totalImport = profile?.total_imported_tiv || 1;
  const depScore = (maxImport / totalImport) * 100;
  
  let depColor = 'text-green-400';
  if (depScore > 60) depColor = 'text-red-400';
  else if (depScore >= 40) depColor = 'text-amber-400';

  const isVisible = !!(focusedCountry && profile);

  return (
    <div 
      className={`absolute top-[64px] right-0 h-[calc(100vh-64px)] w-[380px] bg-[#0d101e]/95 backdrop-blur-xl border-l border-[#1e2330] z-40 transform transition-transform duration-300 ease-out shadow-2xl flex flex-col ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {profile && (
        <>
          {/* Header */}
      <div className="p-6 pb-4 shrink-0">
                  <button 
            onClick={() => setFocusedCountry(null)}
            className="absolute top-4 right-4 text-text-muted hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {/* Share button */}
          <button 
            onClick={handleShare}
            className="absolute top-4 right-12 text-text-muted hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            title="Copy shareable link"
          >
            <Share2 className="w-5 h-5" />
          </button>
        
        <h2 className="text-3xl font-bold text-white mb-1 pr-8 leading-tight">{profile.name}</h2>
        <div className="text-sm text-text-muted uppercase tracking-wider font-semibold mb-6">
          {profile.iso} • {profile.region || 'Unknown Region'}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="bg-[#1e2330]/50 p-3 rounded-xl border border-[#2d3a52]/50">
            <div className="text-xs text-text-muted mb-1">Total Exports</div>
            <div className="text-lg font-bold text-blue-400">{formatTIV(profile.total_exported_tiv)}</div>
          </div>
          <div className="bg-[#1e2330]/50 p-3 rounded-xl border border-[#2d3a52]/50">
            <div className="text-xs text-text-muted mb-1">Total Imports</div>
            <div className="text-lg font-bold text-orange-400">{formatTIV(profile.total_imported_tiv)}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 shrink-0">
        <div className="flex gap-6 border-b border-[#1e2330]">
          {['exports', 'imports', 'breakdown'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize tracking-wide transition-colors relative ${
                activeTab === tab ? 'text-white' : 'text-text-muted hover:text-gray-300'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent rounded-t-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col p-6">
        {activeTab === 'exports' && (
          <div className="flex-1 flex flex-col h-full">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2 shrink-0">Top Recipients</h3>
            {renderPartners(profile.top_export_partners, 'exports')}
          </div>
        )}

        {activeTab === 'imports' && (
          <div className="flex-1 flex flex-col h-full">
            {profile.top_import_partners?.length > 0 && (
              <div className="shrink-0 mb-4 bg-surface p-3 rounded-lg border border-border">
                <div className="text-xs text-text-muted">Dependency Score</div>
                <div className={`text-sm font-medium ${depColor}`}>
                  {depScore.toFixed(1)}% of imports come from {isoToName(profile.top_import_partners[0].iso)}
                </div>
              </div>
            )}
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2 shrink-0">Top Suppliers</h3>
            {renderPartners(profile.top_import_partners, 'imports')}
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className="flex flex-col h-full">
            <div className="flex gap-2 mb-4 shrink-0 bg-[#1e2330] p-1 rounded-lg self-start">
              <button
                onClick={() => setBreakdownMode('exports')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${breakdownMode === 'exports' ? 'bg-[#3b82f6] text-white' : 'text-text-muted hover:text-white'}`}
              >
                Exports
              </button>
              <button
                onClick={() => setBreakdownMode('imports')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${breakdownMode === 'imports' ? 'bg-[#f97316] text-white' : 'text-text-muted hover:text-white'}`}
              >
                Imports
              </button>
            </div>
            
            {!breakdownData.length ? (
              <div className="text-text-muted text-sm flex-1 flex items-center justify-center">No category data available</div>
            ) : (
              <div className="flex-1 min-h-[220px]" style={{ minHeight: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={breakdownData} 
                      innerRadius={60} 
                      outerRadius={85} 
                      paddingAngle={2} 
                      dataKey="value"
                      stroke="none"
                    >
                      {breakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={categoryColor(entry.name)} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ background: '#0a0c10', border: '1px solid #1e2330', borderRadius: '8px' }}
                      itemStyle={{ fontSize: '12px', fontWeight: '500' }}
                      formatter={(value) => formatTIV(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Yearly Trend Chart */}
        <div className="mt-auto shrink-0 pt-6 border-t border-[#1e2330]">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Yearly Trend</h3>
          <div className="h-[120px] w-full" style={{ minHeight: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlyData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="year" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8} 
                  minTickGap={20}
                />
                <RechartsTooltip 
                  contentStyle={{ background: '#0a0c10', border: '1px solid #1e2330', borderRadius: '6px', fontSize: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  formatter={(value, name) => [formatTIV(value), name === 'exports' ? 'Exports' : 'Imports']}
                />
                <Area type="monotone" dataKey="exports" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.2} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="imports" stroke="#f97316" strokeWidth={2} fill="#f97316" fillOpacity={0.2} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Focus Button */}
        <button 
          onClick={handleFocusGlobe}
          className="mt-6 shrink-0 w-full py-3 bg-[#1e2330] hover:bg-[#2d3a52] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-border"
        >
          <Crosshair className="w-4 h-4 text-accent" />
          Focus on Map
          </button>
        </div>
      </>)}
    </div>
  );
}
