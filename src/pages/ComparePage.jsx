import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMapStore } from '../store/mapStore';
import { loadAllCountries, loadCountryProfile, loadFlows } from '../utils/dataLoader';
import { isoToName, formatTIV } from '../utils/formatters';
import { ArrowLeftRight, Check, AlertCircle, BarChart3, Globe, ExternalLink, ChevronDown } from 'lucide-react';

export default function ComparePage() {
  const { yearRange } = useMapStore();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL state
  const [exporter, setExporter] = useState(searchParams.get('a') || 'USA');
  const [importer, setImporter] = useState(searchParams.get('b') || 'SAU');
  const [yearStart, setYearStart] = useState(searchParams.get('yearStart') ? parseInt(searchParams.get('yearStart')) : 1950);
  const [yearEnd, setYearEnd] = useState(searchParams.get('yearEnd') ? parseInt(searchParams.get('yearEnd')) : 2023);
  const [expandReverseFlows, setExpandReverseFlows] = useState(false);
  
  // Data state
  const [countries, setCountries] = useState({});
  const [exporterProfile, setExporterProfile] = useState(null);
  const [importerProfile, setImporterProfile] = useState(null);
  const [flows, setFlows] = useState([]);
  const [reverseFlows, setReverseFlows] = useState([]);
  
  // Load all countries on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const countryData = await loadAllCountries();
        setCountries(countryData);
      } catch (error) {
        console.error('Failed to load countries:', error);
      }
    };
    loadData();
  }, []);
  
  // Update URL when selections change
  useEffect(() => {
    setSearchParams({ a: exporter, b: importer, yearStart, yearEnd });
  }, [exporter, importer, yearStart, yearEnd, setSearchParams]);
  
  // Load profiles when selections change
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const expProfile = await loadCountryProfile(exporter);
        const impProfile = await loadCountryProfile(importer);
        setExporterProfile(expProfile);
        setImporterProfile(impProfile);
      } catch (error) {
        console.error('Failed to load profiles:', error);
      }
    };
    loadProfiles();
  }, [exporter, importer]);
  
  // Load flows when selections or year range changes
  useEffect(() => {
    const loadBilateralFlows = async () => {
      try {
        const allFlows = await loadFlows(null, null, [], 0, []);
        
        // Filter for bilateral flows (exporter -> importer)
        const bilateral = allFlows.filter(
          f => f.supplier_iso === exporter && f.recipient_iso === importer && f.year >= yearStart && f.year <= yearEnd
        ).sort((a, b) => b.year - a.year);
        
        // Filter for reverse flows (importer -> exporter)
        const reverse = allFlows.filter(
          f => f.supplier_iso === importer && f.recipient_iso === exporter && f.year >= yearStart && f.year <= yearEnd
        ).sort((a, b) => b.year - a.year);
        
        setFlows(bilateral);
        setReverseFlows(reverse);
      } catch (error) {
        console.error('Failed to load flows:', error);
      }
    };
    loadBilateralFlows();
  }, [exporter, importer, yearStart, yearEnd]);
  
  // Calculate global totals for share percentages
  const globalStats = useMemo(() => {
    let totalExports = 0;
    let totalImports = 0;
    
    Object.values(countries).forEach(country => {
      totalExports += country.total_exported_tiv || 0;
      totalImports += country.total_imported_tiv || 0;
    });
    
    return { totalExports, totalImports };
  }, [countries]);
  
  // Calculate share percentages
  const exporterShare = useMemo(() => {
    if (!exporterProfile || globalStats.totalExports === 0) return '0%';
    return ((exporterProfile.total_exported_tiv / globalStats.totalExports) * 100).toFixed(1) + '%';
  }, [exporterProfile, globalStats]);
  
  const importerShare = useMemo(() => {
    if (!importerProfile || globalStats.totalImports === 0) return '0%';
    return ((importerProfile.total_imported_tiv / globalStats.totalImports) * 100).toFixed(1) + '%';
  }, [importerProfile, globalStats]);
  
  // Get primary categories
  const exporterPrimaryCategory = useMemo(() => {
    if (!exporterProfile?.exports_by_category) return 'N/A';
    const categories = Object.entries(exporterProfile.exports_by_category);
    if (categories.length === 0) return 'N/A';
    return categories.reduce((best, cur) => cur[1] > best[1] ? cur : best)[0];
  }, [exporterProfile]);
  
  const importerPrimaryCategory = useMemo(() => {
    if (!importerProfile?.imports_by_category) return 'N/A';
    const categories = Object.entries(importerProfile.imports_by_category);
    if (categories.length === 0) return 'N/A';
    return categories.reduce((best, cur) => cur[1] > best[1] ? cur : best)[0];
  }, [importerProfile]);
  
  // Convert countries object to sorted array for dropdowns
  const countriesList = useMemo(() => {
    return Object.entries(countries)
      .map(([iso, data]) => ({ iso, name: data.name || isoToName(iso) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [countries]);
  
  const handleSwap = () => {
    setExporter(importer);
    setImporter(exporter);
  };
  
  const TradeLogsTable = ({ data, title }) => {
    const source = title.includes('->') ? exporter : importer;
    const target = title.includes('->') ? importer : exporter;
    
    return (
      <div className="glass-card p-6 rounded-3xl flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-lg text-text-primary font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" /> {title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-text-muted font-mono uppercase tracking-wider">
            <div className="flex gap-2 items-center">
              <span>Filtered by Year:</span>
              <input 
                type="number" 
                value={yearStart} 
                onChange={(e) => setYearStart(parseInt(e.target.value))}
                className="w-16 bg-background border border-border rounded px-2 py-1 text-text-primary"
                min="1950"
                max="2023"
              />
              <span>to</span>
              <input 
                type="number" 
                value={yearEnd} 
                onChange={(e) => setYearEnd(parseInt(e.target.value))}
                className="w-16 bg-background border border-border rounded px-2 py-1 text-text-primary"
                min="1950"
                max="2023"
              />
            </div>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="py-12 text-center">
            <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-50" />
            <p className="text-sm text-text-muted">
              No recorded transfers between <strong>{isoToName(source)}</strong> and <strong>{isoToName(target)}</strong> in the SIPRI dataset.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface text-text-muted border-b border-border">
                <tr>
                  <th className="p-4">Military System Type</th>
                  <th className="p-4">Volume / Quantity</th>
                  <th className="p-4">Delivery Status</th>
                  <th className="p-4">Primary Treaty Monitor Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background/20">
                {data.map((flow, idx) => (
                  <tr key={idx} className="hover:bg-surface/50 transition-all duration-150">
                    <td className="p-4 text-text-primary font-semibold font-sans">{flow.designation}</td>
                    <td className="p-4 font-bold text-accent">{flow.quantity}</td>
                    <td className="p-4 text-text-muted">Completed ({flow.year})</td>
                    <td className="p-4 text-text-muted flex items-center gap-2">
                      <a href="https://sipri.org" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center gap-1">
                        SIPRI Database
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs text-accent font-semibold tracking-widest uppercase flex items-center gap-2 mb-1">
            <ArrowLeftRight className="w-4 h-4" /> Bilateral Comparison Sandbox
          </span>
          <h1 className="text-3xl md:text-4xl text-text-primary">Bilateral Trade Compare</h1>
          <p className="text-sm text-text-muted mt-1">Isolate export volumes, weapon categories, and delivery statuses between nation states.</p>
        </div>

        {/* Global Year Sync Indicator */}
        <div className="bg-surface px-4 py-2.5 rounded-xl border border-border flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent animate-spin" style={{ animationDuration: '40s' }} />
          <span className="text-xs font-mono">Store Timeline: <strong className="text-accent">{yearRange[0]} - {yearRange[1]}</strong></span>
        </div>
      </div>

      {/* Selectors Panel */}
      <div className="glass p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Exporter Select */}
        <div className="flex-1 w-full flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Select Exporter</label>
          <select 
            value={exporter}
            onChange={(e) => setExporter(e.target.value)}
            className="w-full bg-background border border-border text-text-primary p-3 rounded-xl focus:border-accent outline-none text-sm transition-all"
          >
            {countriesList.map(c => (
              <option key={c.iso} value={c.iso}>{c.name} ({c.iso})</option>
            ))}
          </select>
        </div>

        {/* Swap button */}
        <button
          onClick={handleSwap}
          className="w-10 h-10 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent hover:bg-accent/25 transition-all shrink-0"
          title="Swap exporter and importer"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        {/* Importer Select */}
        <div className="flex-1 w-full flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Select Importer</label>
          <select 
            value={importer}
            onChange={(e) => setImporter(e.target.value)}
            className="w-full bg-background border border-border text-text-primary p-3 rounded-xl focus:border-accent outline-none text-sm transition-all"
          >
            {countriesList.map(c => (
              <option key={c.iso} value={c.iso}>{c.name} ({c.iso})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Side-by-Side Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Exporter Profiler */}
        <div className="glass-card p-6 rounded-3xl flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-accent uppercase tracking-widest font-mono">Exporter Profile</span>
            <span className="text-xs font-mono text-text-muted">{exporter} Code</span>
          </div>
          <div>
            <h2 className="text-2xl text-text-primary">{exporterProfile?.name || isoToName(exporter)}</h2>
            <p className="text-xs text-text-muted mt-1">National conventional arms trade exports summary.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/40 border border-border/80 p-4 rounded-xl flex flex-col gap-1">
              <span className="text-xs text-text-muted">Total Exports (TIV)</span>
              <span className="text-xl text-accent font-mono font-bold">{exporterProfile ? formatTIV(exporterProfile.total_exported_tiv) : 'N/A'}</span>
            </div>
            <div className="bg-background/40 border border-border/80 p-4 rounded-xl flex flex-col gap-1">
              <span className="text-xs text-text-muted">Global Trade Share</span>
              <span className="text-xl text-text-primary font-mono font-semibold">{exporterShare}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <span className="text-text-muted uppercase tracking-wider font-semibold font-mono">Trade Specifics</span>
            <div className="flex justify-between border-b border-border py-1.5">
              <span className="text-text-muted">Primary Export Category</span>
              <span className="text-text-primary font-medium">{exporterPrimaryCategory}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-text-muted">International Export Sanction Status</span>
              <span className="text-text-primary font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-400" /> None
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Importer Profiler */}
        <div className="glass-card p-6 rounded-3xl flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 uppercase tracking-widest font-mono">Importer Profile</span>
            <span className="text-xs font-mono text-text-muted">{importer} Code</span>
          </div>
          <div>
            <h2 className="text-2xl text-text-primary">{importerProfile?.name || isoToName(importer)}</h2>
            <p className="text-xs text-text-muted mt-1">National conventional arms trade imports summary.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/40 border border-border/80 p-4 rounded-xl flex flex-col gap-1">
              <span className="text-xs text-text-muted">Total Imports (TIV)</span>
              <span className="text-xl text-yellow-500 font-mono font-bold">{importerProfile ? formatTIV(importerProfile.total_imported_tiv) : 'N/A'}</span>
            </div>
            <div className="bg-background/40 border border-border/80 p-4 rounded-xl flex flex-col gap-1">
              <span className="text-xs text-text-muted">Global Trade Share</span>
              <span className="text-xl text-text-primary font-mono font-semibold">{importerShare}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <span className="text-text-muted uppercase tracking-wider font-semibold font-mono">Trade Specifics</span>
            <div className="flex justify-between border-b border-border py-1.5">
              <span className="text-text-muted">Primary Import Category</span>
              <span className="text-text-primary font-medium">{importerPrimaryCategory}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-text-muted">International Import Restrictions</span>
              <span className="text-text-primary font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-400" /> None
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bilateral Transfer Log (Exporter -> Importer) */}
      <TradeLogsTable 
        data={flows} 
        title={`Active Trade Return Logs (${exporter} -> ${importer})`}
      />
      
      {/* Reverse Flows Collapsible Section */}
      <div className="glass-card p-6 rounded-3xl flex flex-col gap-4">
        <button
          onClick={() => setExpandReverseFlows(!expandReverseFlows)}
          className="flex items-center justify-between hover:opacity-80 transition-opacity"
        >
          <h3 className="text-lg text-text-primary font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-yellow-500" /> Return Flows ({importer}{' -> '}{exporter})
          </h3>
          <ChevronDown 
            className={`w-5 h-5 text-text-muted transition-transform ${expandReverseFlows ? 'rotate-180' : ''}`}
          />
        </button>
        
        {expandReverseFlows && (
          <div className="mt-4">
            <TradeLogsTable 
              data={reverseFlows}
              title={`Return Flows Detail (${importer} -> ${exporter})`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
