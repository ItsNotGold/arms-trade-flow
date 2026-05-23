import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as topojson from 'topojson-client';
import { useMapStore } from '../../store/mapStore';
import { GEO_DATA } from '../../utils/dataLoader';
import { isoToName, nameToIso, categoryColor, formatTIV } from '../../utils/formatters';
import CategoryLegend from './CategoryLegend';
import LoadingSpinner from '../Loading/LoadingSpinner';
import ErrorBanner from '../Loading/ErrorBanner';
import EmptyState from '../Loading/EmptyState';

// Map from world-atlas natural-earth names → our ISO alpha-3 codes
// (world-atlas@2 countries-110m.json uses numeric IDs only, no iso_a3 property)
const GEO_NAME_TO_ISO = {
  'United States of America': 'USA',
  'Russia': 'RUS',
  'China': 'CHN',
  'France': 'FRA',
  'United Kingdom': 'GBR',
  'Germany': 'DEU',
  'Saudi Arabia': 'SAU',
  'South Korea': 'KOR',
  'S. Korea': 'KOR',
  'India': 'IND',
  'Australia': 'AUS',
  'Brazil': 'BRA',
  'Argentina': 'ARG',
  'South Africa': 'ZAF',
  'Ukraine': 'UKR',
  'Sweden': 'SWE',
  'Switzerland': 'CHE',
  'Turkey': 'TUR',
  'Spain': 'ESP',
  'Italy': 'ITA',
  'Netherlands': 'NLD',
  'Norway': 'NOR',
  'Belgium': 'BEL',
  'Japan': 'JPN',
  'Poland': 'POL',
  'Czechia': 'CZE',
  'Czech Rep.': 'CZE',
  'Israel': 'ISR',
  'Iran': 'IRN',
  'Iraq': 'IRQ',
  'Pakistan': 'PAK',
  'Indonesia': 'IDN',
  'Malaysia': 'MYS',
  'Egypt': 'EGY',
  'Algeria': 'DZA',
  'Morocco': 'MAR',
  'Libya': 'LBY',
  'Nigeria': 'NGA',
  'Syria': 'SYR',
  'Jordan': 'JOR',
  'Kuwait': 'KWT',
  'Qatar': 'QAT',
  'United Arab Emirates': 'ARE',
  'Yemen': 'YEM',
  'Afghanistan': 'AFG',
  'Kazakhstan': 'KAZ',
  'Uzbekistan': 'UZB',
  'Turkmenistan': 'TKM',
  'Vietnam': 'VNM',
  'Thailand': 'THA',
  'Philippines': 'PHL',
  'Myanmar': 'MMR',
  'Singapore': 'SGP',
  'Taiwan': 'TWN',
  'Dem. Rep. Congo': 'COD',
  'Somalia': 'SOM',
  'Kenya': 'KEN',
  'Sudan': 'SDN',
  'Ethiopia': 'ETH',
  'Eritrea': 'ERI',
  'Angola': 'AGO',
  'Zimbabwe': 'ZWE',
  'Botswana': 'BWA',
  'Mozambique': 'MOZ',
  'Tanzania': 'TZA',
  'Uganda': 'UGA',
  'Rwanda': 'RWA',
  'Cameroon': 'CMR',
  'Mali': 'MLI',
  'Senegal': 'SEN',
  'Chad': 'TCD',
  'Romania': 'ROU',
  'Bulgaria': 'BGR',
  'Serbia': 'SRB',
  'Croatia': 'HRV',
  'Slovakia': 'SVK',
  'Austria': 'AUT',
  'Finland': 'FIN',
  'Portugal': 'PRT',
  'Denmark': 'DNK',
  'Greece': 'GRC',
  'Hungary': 'HUN',
  'Belarus': 'BLR',
  'Chile': 'CHL',
  'Colombia': 'COL',
  'Peru': 'PER',
  'Ecuador': 'ECU',
  'Venezuela': 'VEN',
  'Mexico': 'MEX',
  'Cuba': 'CUB',
  'Honduras': 'HND',
  'El Salvador': 'SLV',
  'Nicaragua': 'NIC',
  'Bolivia': 'BOL',
  'Uruguay': 'URY',
  'Paraguay': 'PRY',
  'Bangladesh': 'BGD',
  'New Zealand': 'NZL',
  'Ireland': 'IRL',
  'Canada': 'CAN',
  'North Korea': 'PRK',
  'N. Korea': 'PRK',
  'Oman': 'OMN',
  'Bahrain': 'BHR',
  'Indonesia': 'IDN',
  'Sri Lanka': 'LKA',
  'Cyprus': 'CYP',
  'Lebanon': 'LBN',
  'Tunisia': 'TUN',
  'Ghana': 'GHA',
  'Ivory Coast': 'CIV',
  "Côte d'Ivoire": 'CIV',
  'South Sudan': 'SSD',
  'Central African Rep.': 'CAF',
  'Dem. Rep. Congo': 'COD',
  'Congo': 'COG',
  'Zambia': 'ZMB',
  'Namibia': 'NAM',
  'Niger': 'NER',
  'Guinea': 'GIN',
  'Burkina Faso': 'BFA',
  'Benin': 'BEN',
  'Togo': 'TGO',
  'Gabon': 'GAB',
  'Macedonia': 'MKD',
  'N. Macedonia': 'MKD',
  'North Macedonia': 'MKD',
  'Bosnia and Herz.': 'BIH',
  'Kosovo': 'XKX',
  'Albania': 'ALB',
  'Montenegro': 'MNE',
  'Slovenia': 'SVN',
  'Estonia': 'EST',
  'Latvia': 'LVA',
  'Lithuania': 'LTU',
  'Luxembourg': 'LUX',
  'Iceland': 'ISL',
  'Georgia': 'GEO',
  'Armenia': 'ARM',
  'Azerbaijan': 'AZE',
  'Moldova': 'MDA',
  'Kyrgyzstan': 'KGZ',
  'Tajikistan': 'TJK',
  'Mongolia': 'MNG',
  'Nepal': 'NPL',
  'Laos': 'LAO',
  'Cambodia': 'KHM',
  'Brunei': 'BRN',
  'Papua New Guinea': 'PNG',
  'Fiji': 'FJI',
};

// Historical ISO codes mapping to modern countries or their primary successors
const HISTORICAL_ISO_TO_MODERN = {
  'SUN': 'RUS',  // Soviet Union → Russia
  'CSK': 'CZE',  // Czechoslovakia → Czech Republic
  'YUG': 'SRB',  // Yugoslavia → Serbia (primary successor)
  'YMD': 'YEM',  // Yemen (Democratic Republic) → Yemen
  'GDR': 'DEU',  // East Germany → Germany
  'VDR': 'VNM',  // Vietnam (Democratic Republic) → Vietnam
  'RVN': 'VNM',  // South Vietnam → Vietnam
};

const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function GlobeView({ arcs = [], onArcClick, onCountryClick }) {
  const globeRef = useRef();
  const [countries, setCountries] = useState([]);
  const [hoverD, setHoverD] = useState(null);
  const [hoverArc, setHoverArc] = useState(null);
  
  const { isLoadingGeo, setLoadingGeo, loadErrorGeo, setErrorGeo, focusedCountry, setFocusedCountry, activeWeaponCategories, resetFilters, flowLimit } = useMapStore();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    GEO_DATA().then(topology => {
      if (topology && topology.objects && topology.objects.countries) {
        const geojson = topojson.feature(topology, topology.objects.countries);
        setCountries(geojson.features);
      } else if (topology && topology.features) {
        setCountries(topology.features);
      }
    }).catch(err => console.error("Failed to load map data", err));
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      
      // Enable auto-rotation at 0.3 degrees/second
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.3;
      
      // Stop rotation on user interaction (mouse down, touch start)
      try {
        const renderer = globeRef.current.renderer();
        const canvas = renderer ? renderer.domElement : null;
        
        if (canvas) {
          const stopRotation = () => {
            controls.autoRotate = false;
          };
          
          canvas.addEventListener('mousedown', stopRotation);
          canvas.addEventListener('touchstart', stopRotation);
          
          return () => {
            canvas.removeEventListener('mousedown', stopRotation);
            canvas.removeEventListener('touchstart', stopRotation);
          };
        }
      } catch (error) {
        console.warn('Could not set up auto-rotation listeners:', error);
      }
    }
  }, []);

  // Build centroid map: ISO → {lat, lng}
  // Uses GEO_NAME_TO_ISO as primary lookup since world-atlas has no iso_a3 properties
  const countryCentroids = useMemo(() => {
    const map = {};
    countries.forEach(f => {
      const geoName = f.properties?.name || '';
      const iso = GEO_NAME_TO_ISO[geoName] || nameToIso(geoName);
      if (!iso) return;

      let pts = [];
      if (f.geometry.type === 'Polygon') pts = f.geometry.coordinates[0];
      else if (f.geometry.type === 'MultiPolygon') pts = f.geometry.coordinates[0][0];
      
      if (pts && pts.length) {
        let lngSum = 0, latSum = 0;
        pts.forEach(p => { lngSum += p[0]; latSum += p[1]; });
        map[iso] = { lat: latSum / pts.length, lng: lngSum / pts.length };
      }
    });
    return map;
  }, [countries]);

  const [prevArcCount, setPrevArcCount] = useState(0);

  const { processedArcs, showTruncated } = useMemo(() => {
    if (!Object.keys(countryCentroids).length || !arcs.length) {
      return { processedArcs: [], showTruncated: false };
    }
    // Apply weapon category filter if set
    let filtered = arcs;
    if (activeWeaponCategories && activeWeaponCategories.length) {
      filtered = filtered.filter(a => activeWeaponCategories.includes(a.category));
    }
    
    // Aggregate by pair, sum TIV, track category totals, and store raw records
    // Apply historical country code mapping to modern equivalents
    const pairMap = {};
    filtered.forEach(a => {
      // Map historical country codes to modern equivalents
      const supplierIso = HISTORICAL_ISO_TO_MODERN[a.supplier_iso] || a.supplier_iso;
      const recipientIso = HISTORICAL_ISO_TO_MODERN[a.recipient_iso] || a.recipient_iso;
      
      const key = `${supplierIso}-${recipientIso}`;
      if (!pairMap[key]) {
        pairMap[key] = {
          supplier_iso: supplierIso,
          recipient_iso: recipientIso,
          totalTiv: 0,
          categoryMap: {},
          records: [],
        };
      }
      pairMap[key].totalTiv += a.tiv;
      pairMap[key].categoryMap[a.category] = (pairMap[key].categoryMap[a.category] || 0) + a.tiv;
      pairMap[key].records.push(a);
    });
    
    const uniquePairsCount = Object.keys(pairMap).length;

    // Convert to array, pick dominant category, sort by total TIV, limit 200
    let sorted = Object.values(pairMap)
      .map(p => {
        const dominantCat = Object.entries(p.categoryMap).reduce((best, cur) => cur[1] > best[1] ? cur : best)[0];
        return {
          supplier_iso: p.supplier_iso,
          recipient_iso: p.recipient_iso,
          tiv: p.totalTiv,
          category: dominantCat,
          records: p.records,
        };
      })
      .sort((a, b) => b.tiv - a.tiv)
      .slice(0, flowLimit);
    
    const maxTiv = Math.max(...sorted.map(a => a.tiv), 0);
    const maxLog = Math.log10(maxTiv + 1) || 1;
    
    // Create base arcs and glow arcs
    const result = [];
    sorted.forEach(arc => {
      const start = countryCentroids[arc.supplier_iso];
      const end = countryCentroids[arc.recipient_iso];
      if (!start || !end) return;
      
      const logTiv = Math.log10(arc.tiv + 1);
      const intensity = logTiv / maxLog;
      const base = {
        ...arc,
        startLat: start.lat, startLng: start.lng,
        endLat: end.lat, endLng: end.lng,
        altitude: 0.15 + intensity * (0.6 - 0.15),
        strokeWidth: 0.5 + intensity * (2.5 - 0.5),
        intensity,
      };
      
      result.push({ ...base, glow: true });
      result.push(base);
    });

    // Update arc count for transition tracking
    if (result.length !== prevArcCount) {
      setPrevArcCount(result.length);
    }
    
    return {
      processedArcs: result,
      showTruncated: uniquePairsCount > flowLimit,
    };
  }, [countryCentroids, arcs, activeWeaponCategories, flowLimit, prevArcCount]);

  useEffect(() => {
    const focusOnCurrentCountry = () => {
      if (focusedCountry && globeRef.current && countries.length > 0) {
        const centroid = countryCentroids[focusedCountry];
        if (centroid) {
          globeRef.current.pointOfView({ lat: centroid.lat, lng: centroid.lng, altitude: 1.5 }, 1000);
        }
      }
    };

    focusOnCurrentCountry();
    window.addEventListener('recenterGlobe', focusOnCurrentCountry);
    return () => window.removeEventListener('recenterGlobe', focusOnCurrentCountry);
  }, [focusedCountry, countries, countryCentroids]);

  const handleCountryClick = (polygon) => {
    const geoName = polygon?.properties?.name;
    if (!geoName) return;
    // Use GEO_NAME_TO_ISO first, then fall back to nameToIso
    const iso = GEO_NAME_TO_ISO[geoName] || nameToIso(geoName);
    if (iso) {
      setFocusedCountry(iso);
      if (onCountryClick) onCountryClick(iso);
    }
  };

  return (
    <div className="w-full h-full relative" style={{ cursor: hoverD || hoverArc ? 'pointer' : 'grab' }}>
      <Globe
        ref={globeRef}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundColor="#0a0c10"
        atmosphereColor="#1a3a6e"
        atmosphereAltitude={0.15}
        
        polygonsData={countries}
        polygonAltitude={d => d === hoverD ? 0.02 : 0.01}
        polygonCapColor={d => d === hoverD ? '#2a3a5a' : '#1a2035'}
        polygonSideColor={() => '#1a2035'}
        polygonStrokeColor={() => '#2d3a52'}
        
        onPolygonHover={setHoverD}
        onPolygonClick={handleCountryClick}
        polygonLabel={({ properties: d }) => `
          <div style="background: rgba(0, 0, 0, 0.8); padding: 4px 8px; border-radius: 4px; border: 1px solid #334155; color: #f8fafc; font-family: monospace; font-size: 12px; pointer-events: none;">
            ${d.name}
          </div>
        `}
        
        arcsData={processedArcs}
        arcStartLat={d => d.startLat}
        arcStartLng={d => d.startLng}
        arcEndLat={d => d.endLat}
        arcEndLng={d => d.endLng}
        arcColor={d => {
          const isHovered = hoverArc && hoverArc.supplier_iso === d.supplier_iso && hoverArc.recipient_iso === d.recipient_iso;
          return hexToRgba(categoryColor(d.category), d.glow ? (isHovered ? 0.6 : 0.3) : (isHovered ? 1.0 : (hoverArc ? 0.2 : 0.8)));
        }}
        arcAltitude={d => d.altitude}
        arcStroke={d => {
          const isHovered = hoverArc && hoverArc.supplier_iso === d.supplier_iso && hoverArc.recipient_iso === d.recipient_iso;
          return d.glow ? (isHovered ? d.strokeWidth * 2.5 : d.strokeWidth * 2) : (isHovered ? d.strokeWidth + 1 : d.strokeWidth);
        }}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={d => Math.max(1000, 4000 - d.intensity * 3000)}
        onArcHover={setHoverArc}
        onArcClick={d => { if (onArcClick) onArcClick(d); }}
        arcLabel={d => {
          const topRecord = (d.records || []).sort((a, b) => b.tiv - a.tiv)[0];
          return `
            <div style="background: rgba(10,12,16,0.92); padding: 8px 12px; border-radius: 6px; border: 1px solid #334155; color: #f8fafc; font-size: 12px; pointer-events: none; max-width: 220px;">
              <strong style="display:block;margin-bottom:4px">${isoToName(d.supplier_iso)} → ${isoToName(d.recipient_iso)}</strong>
              <span style="color:${categoryColor(d.category)}">${d.category}</span>
              ${topRecord ? `<br/><span style="color:#94a3b8">${topRecord.designation}</span>` : ''}
              <br/><span style="color:#64748b">Total: ${formatTIV(d.tiv)}</span>
            </div>
          `;
        }}
      />

      {isLoadingGeo && <LoadingSpinner className="absolute inset-0 z-50" />}
      {loadErrorGeo && <ErrorBanner message={loadErrorGeo} onDismiss={() => setErrorGeo(null)} />}
      {(!isLoadingGeo && !loadErrorGeo && processedArcs.length === 0) && (
        <EmptyState message="No transfers match your current filters." onReset={resetFilters} />
      )}
      
      <CategoryLegend />
      
      {showTruncated && !bannerDismissed && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 max-w-[480px] w-full mx-auto bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] rounded-[6px] px-3.5 py-1.5 text-[12px] text-[#f59e0b] flex items-center gap-2 animate-fade-in" style={{ animationDuration: '200ms', animationFillMode: 'forwards' }}>
          <span role="img" aria-label="warning">⚠️</span>
          Displaying top {flowLimit} flows by volume — refine filters or adjust flow limit to see fewer, more specific transfers
          <button onClick={() => setBannerDismissed(true)} className="ml-auto text-[#f59e0b] hover:text-[#f59e0b]/80 focus:outline-none p-1">×</button>
        </div>
      )}
    </div>
  );
}
