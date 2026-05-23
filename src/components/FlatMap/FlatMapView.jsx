import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '../../store/mapStore';
import { GEO_DATA } from '../../utils/dataLoader';
import { isoToName, nameToIso, categoryColor, formatTIV } from '../../utils/formatters';
import { COUNTRY_CENTROIDS } from '../../data/centroids';

// Map from world-atlas natural-earth names → ISO alpha-3 codes
// (world-atlas@2 uses numeric IDs, not ISO codes; we need name-based lookup)
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
  'Sri Lanka': 'LKA',
  'Cyprus': 'CYP',
  'Lebanon': 'LBN',
  'Tunisia': 'TUN',
  'Ghana': 'GHA',
  'Ivory Coast': 'CIV',
  "Côte d'Ivoire": 'CIV',
  'South Sudan': 'SSD',
  'Central African Rep.': 'CAF',
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
  
  // Historical countries and alternative names for better data coverage
  'Viet Nam': 'VNM',
  'Vietnam': 'VNM',
  'Bosnia-Herzegovina': 'BIH',
  'East Germany (GDR)': 'DEU', // Map to modern Germany
  'Czechoslovakia': 'CZE', // Map to Czech Republic (primary modern successor)
  'Turkiye': 'TUR',
  'Myanmar': 'MMR',
  'Burundi': 'BDI',
  'Tajikistan': 'TJK',
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

const mapStyle = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
        'https://b.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
        'https://c.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors © CARTO'
    }
  },
  layers: [{ id: 'carto-dark-layer', type: 'raster', source: 'carto-dark' }]
};

export default function FlatMapView({ arcs = [], onArcClick, onCountryClick }) {
  const mapRef = useRef(null);
  const [baseGeojson, setBaseGeojson] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [hoveredArc, setHoveredArc] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: 10,
    latitude: 20,
    zoom: 1.5
  });

  const { focusedCountry, setFocusedCountry, flowLimit, activeWeaponCategories } = useMapStore();
  const svgRef = useRef(null);
  const rafRef = useRef(null);
  const mapMoveHandlerRef = useRef(null);

  useEffect(() => {
    GEO_DATA().then(geojson => {
      // GEO_DATA now returns pre-processed GeoJSON with antimeridian fixes applied
      if (geojson && geojson.features) {
        setBaseGeojson(geojson);
      }
    }).catch(err => console.error("Failed to load map data", err));
  }, []);

  const countryTotals = useMemo(() => {
    const totals = {};
    arcs.forEach(arc => {
      const impIso = arc.recipient_iso;
      const expIso = arc.supplier_iso;
      if (!totals[impIso]) totals[impIso] = { import: 0, export: 0 };
      if (!totals[expIso]) totals[expIso] = { import: 0, export: 0 };
      totals[impIso].import += arc.tiv;
      totals[expIso].export += arc.tiv;
    });
    return totals;
  }, [arcs]);

  const geojsonSource = useMemo(() => {
    if (!baseGeojson) return null;
    const features = baseGeojson.features.map(f => {
      // Extract country name from properties
      const geoName = f.properties?.name || '';
      // Use GEO_NAME_TO_ISO mapping first, then fall back to nameToIso utility
      const iso = GEO_NAME_TO_ISO[geoName] || nameToIso(geoName);
      
      if (!iso) {
        console.warn('Could not determine ISO code for country:', geoName);
        return null;
      }
      
      const stats = countryTotals[iso] || { import: 0, export: 0 };
      const tiv = 0; // No country coloring
      return {
        ...f,
        id: iso,
        properties: {
          ...f.properties,
          iso,
          name: f.properties.name || isoToName(iso),
          tiv: tiv
        }
      };
    }).filter(Boolean); // Remove null entries
    return { type: 'FeatureCollection', features };
  }, [baseGeojson, countryTotals]);

  const countryCentroids = useMemo(() => {
    if (!geojsonSource) return {};
    const map = {};
    geojsonSource.features.forEach(f => {
      const iso = f.properties.iso;
      let pts = [];
      if (f.geometry.type === 'Polygon') pts = f.geometry.coordinates[0];
      else if (f.geometry.type === 'MultiPolygon') pts = f.geometry.coordinates[0][0];
      
      if (pts && pts.length) {
        let lngSum = 0, latSum = 0;
        pts.forEach(p => { lngSum += p[0]; latSum += p[1]; });
        map[iso] = { lat: latSum / pts.length, lng: lngSum / pts.length };
      }
    });
    // Merge with the canonical COUNTRY_CENTROIDS (centroids.js) so we have broader coverage.
    const merged = { ...map };
    Object.entries(COUNTRY_CENTROIDS).forEach(([iso, coords]) => {
      if (!merged[iso]) {
        // centroids.js stores [lng, lat]
        merged[iso] = { lng: coords[0], lat: coords[1] };
      }
    });
    return merged;
  }, [geojsonSource]);

  // Debug: verify arcs and centroids are arriving into this component
  useEffect(() => {
    try {
      const arcCount = Array.isArray(arcs) ? arcs.length : 0;
      const centroidCount = Object.keys(countryCentroids).length;
      console.log(`FlatMapView: ${arcCount} arcs, ${centroidCount} country centroids`, {
        sampleArc: arcs[0],
        sampleCentroid: Object.entries(countryCentroids)[0]
      });
    } catch (err) { /* ignore logging errors */ }
  }, [arcs, countryCentroids]);

  const maxTiv = useMemo(() => {
    if (!geojsonSource) return 1;
    const vals = geojsonSource.features.map(f => f.properties.tiv).filter(v => v > 0);
    return vals.length ? Math.max(...vals) : 1;
  }, [geojsonSource]);

  const fillLayerStyle = useMemo(() => ({
    id: 'country-fills',
    type: 'fill',
    paint: {
      'fill-color': 'rgba(0,0,0,0)',
      'fill-opacity': 0.8
    }
  }), [maxTiv]);

  const lineLayerStyle = {
    id: 'country-borders',
    type: 'line',
    paint: {
      'line-color': '#2d3a52',
      'line-width': 1
    }
  };

  const onMouseMove = useCallback((e) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      setHoveredCountry({
        feature,
        x: e.point.x,
        y: e.point.y
      });
    } else {
      setHoveredCountry(null);
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    setHoveredCountry(null);
  }, []);

  const onClick = useCallback((e) => {
    if (e.features && e.features.length > 0) {
      const geoName = e.features[0].properties?.name;
      if (!geoName) return;
      // Use GEO_NAME_TO_ISO mapping first, then fall back to nameToIso
      const iso = GEO_NAME_TO_ISO[geoName] || nameToIso(geoName);
      if (iso) {
        setFocusedCountry(iso);
        if (onCountryClick) onCountryClick(iso);
      }
    }
  }, [onCountryClick, setFocusedCountry]);

  // Center on focused country
  useEffect(() => {
    const focusOnCurrentCountry = () => {
      if (focusedCountry && countryCentroids[focusedCountry] && mapRef.current) {
        const { lat, lng } = countryCentroids[focusedCountry];
        const mapObj = mapRef.current.getMap();
        try {
          // Use MapLibre's flyTo for a smooth transition
          mapObj.flyTo({ center: [lng, lat], zoom: 3, duration: 1000, essential: true });
          // Keep React viewState in sync after the animation completes
          setTimeout(() => {
            setViewState((prev) => ({ ...prev, longitude: lng, latitude: lat, zoom: 3 }));
          }, 1000);
        } catch (err) {
          // Fallback to updating viewState if flyTo isn't available
          setViewState((prev) => ({
            ...prev,
            longitude: lng,
            latitude: lat,
            zoom: 3,
            transitionDuration: 1000
          }));
        }
      }
    };

    focusOnCurrentCountry();
    
    window.addEventListener('recenterGlobe', focusOnCurrentCountry);
    return () => window.removeEventListener('recenterGlobe', focusOnCurrentCountry);
  }, [focusedCountry, countryCentroids]);

  // Imperative SVG rendering for arcs to improve responsiveness.
  const renderArcs = useCallback(() => {
    const svg = svgRef.current;
    const mapObj = mapRef.current && mapRef.current.getMap();
    if (!svg || !mapObj || !arcs || !arcs.length || !Object.keys(countryCentroids).length) {
      if (svg) {
        svg.style.opacity = '0';
        setTimeout(() => { svg.innerHTML = ''; svg.style.opacity = '1'; }, 200);
      }
      return;
    }

    // Fade out existing paths for smooth transition
    svg.style.transition = 'opacity 0.2s ease-out';
    svg.style.opacity = '0';
    
    setTimeout(() => {
      // Clear previous paths
      svg.innerHTML = '';

      // Apply weapon category filter if set
      let filtered = arcs;
      if (activeWeaponCategories && activeWeaponCategories.length) {
        filtered = filtered.filter(a => activeWeaponCategories.includes(a.category));
      }

      // Aggregate by pair, sum TIV, track category totals
      // Apply historical country code mapping to modern equivalents
      const pairMap = {};
      filtered.forEach(a => {
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

      // Convert to array, pick dominant category, sort by total TIV, limit to flowLimit
      let sorted = Object.values(pairMap)
        .map(p => {
          const dominantCat = Object.entries(p.categoryMap).reduce((best, cur) => cur[1] > best[1] ? cur : best)[0];
          // Find the most significant record (highest TIV) for hover details
          const topRecord = p.records.reduce((best, cur) => (cur.tiv || 0) > (best.tiv || 0) ? cur : best);
          return {
            supplier_iso: p.supplier_iso,
            recipient_iso: p.recipient_iso,
            tiv: p.totalTiv,
            category: dominantCat,
            records: p.records,
            // Add details from top record for hover tooltip
            designation: topRecord.designation || 'Unknown',
            quantity: topRecord.quantity || '—',
            year: topRecord.year,
          };
        })
        .sort((a, b) => b.tiv - a.tiv)
        .slice(0, flowLimit);
      
      if (sorted.length > 0) {
        console.log('First aggregated arc:', sorted[0]);
        console.log('Total arcs to render:', sorted.length);
      }

      const maxTivArc = Math.max(...sorted.map(a => a.tiv), 0);
      const maxLog = Math.log10(maxTivArc + 1) || 1;

      const svgNS = 'http://www.w3.org/2000/svg';
      let drawnArcs = 0;
      let skippedNoStart = 0, skippedNoEnd = 0, skippedDistance = 0;

      sorted.forEach(arc => {
        const start = countryCentroids[arc.supplier_iso];
        const end = countryCentroids[arc.recipient_iso];
        
        if (!start) {
          skippedNoStart++;
          return;
        }
        if (!end) {
          skippedNoEnd++;
          return;
        }

        const pStart = mapObj.project([start.lng, start.lat]);
        const pEnd = mapObj.project([end.lng, end.lat]);

        const dx = pEnd.x - pStart.x;
        const dy = pEnd.y - pStart.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Skip extremely long arcs (antimeridian artifacts)
        if (dist > mapObj.getCanvas().width * 0.8) {
          skippedDistance++;
          return;
        }

        const mx = (pStart.x + pEnd.x) / 2;
        const my = (pStart.y + pEnd.y) / 2;
        const nx = -dy / dist || 0;
        const ny = dx / dist || 0;
        const elevation = Math.max(30, dist * 0.18);
        const cx = mx + nx * elevation;
        const cy = my + ny * elevation;

        const logTiv = Math.log10(arc.tiv + 1);
        const intensity = logTiv / maxLog;
        const strokeWidth = 1 + intensity * 5;

        const path = document.createElementNS(svgNS, 'path');
        const d = `M ${pStart.x} ${pStart.y} Q ${cx} ${cy} ${pEnd.x} ${pEnd.y}`;
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', categoryColor(arc.category));
        path.setAttribute('stroke-width', String(strokeWidth));
        path.setAttribute('opacity', String(0.7));
        path.setAttribute('class', 'cursor-pointer');
        path.style.transition = 'opacity 0.3s ease, stroke-width 0.3s ease';
        // Allow pointer events only on the path itself so the underlying map remains interactive
        path.setAttribute('pointer-events', 'auto');

        // Events
        path.addEventListener('mouseenter', (e) => {
          console.log('✓ Arc mouseenter triggered', {
            supplier: arc.supplier_iso,
            recipient: arc.recipient_iso,
            designation: arc.designation,
            quantity: arc.quantity,
            year: arc.year
          });
          setHoveredArc(arc);
          path.setAttribute('opacity', '1');
          path.setAttribute('stroke-width', String(strokeWidth + 2));
        });
        path.addEventListener('mouseleave', () => {
          console.log('✓ Arc mouseleave');
          setHoveredArc(null);
          path.setAttribute('opacity', String(0.7));
          path.setAttribute('stroke-width', String(strokeWidth));
        });
        path.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!onArcClick) return;

          // Aggregate all matching records for this supplier→recipient pair
          const supplierIso = HISTORICAL_ISO_TO_MODERN[arc.supplier_iso] || arc.supplier_iso;
          const recipientIso = HISTORICAL_ISO_TO_MODERN[arc.recipient_iso] || arc.recipient_iso;

          const pairRecords = arcs.filter(r => {
            const s = HISTORICAL_ISO_TO_MODERN[r.supplier_iso] || r.supplier_iso;
            const t = HISTORICAL_ISO_TO_MODERN[r.recipient_iso] || r.recipient_iso;
            return s === supplierIso && t === recipientIso;
          });

          const totalTiv = pairRecords.reduce((s, r) => s + (r.tiv || 0), 0);

          // Determine dominant category (most frequent among records)
          const catCount = {};
          pairRecords.forEach(r => { catCount[r.category] = (catCount[r.category] || 0) + 1; });
          const dominantCat = Object.keys(catCount).sort((a,b) => catCount[b] - catCount[a])[0] || (arc.category || 'Other');

          const aggregated = {
            supplier_iso: supplierIso,
            recipient_iso: recipientIso,
            tiv: totalTiv,
            category: dominantCat,
            records: pairRecords
          };

          onArcClick(aggregated);
        });

        svg.appendChild(path);
        drawnArcs++;
      });
      
      console.log(`Arc rendering: ${drawnArcs} drawn, ${skippedNoStart} missing supplier, ${skippedNoEnd} missing recipient, ${skippedDistance} too long`);
      
      // Fade in new arcs
      setTimeout(() => {
        svg.style.transition = 'opacity 0.3s ease-in';
        svg.style.opacity = '1';
      }, 20);
    }, 200);
  }, [arcs, countryCentroids, onArcClick, flowLimit, activeWeaponCategories]);

  // Re-render when arcs or centroids change
  useEffect(() => {
    // schedule a render on next frame for stability
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      renderArcs();
      rafRef.current = null;
    });
  }, [arcs, countryCentroids, renderArcs]);

  // Cleanup map listeners and RAF on unmount
  useEffect(() => {
    return () => {
      try {
        const mapObj = mapRef.current && mapRef.current.getMap();
        if (mapObj && mapMoveHandlerRef.current) {
          mapObj.off('move', mapMoveHandlerRef.current);
          mapMoveHandlerRef.current = null;
        }
      } catch (err) { /* ignore */ }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (svgRef.current) svgRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div 
      className="absolute inset-0 bg-background"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={mapStyle}
        mapLib={maplibregl}
        interactiveLayerIds={['country-fills']}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        onLoad={(e) => {
          // Remove any symbol/text layers that might have been included by a fetched/merged style
          try {
            const map = e.target;
            const style = map.getStyle();
            if (style && Array.isArray(style.layers)) {
              style.layers.forEach(l => {
                if (!l || !l.id) return;
                // Identify text/symbol layers by type or presence of text-field
                const isSymbol = l.type === 'symbol' || (l.layout && l.layout['text-field']);
                if (isSymbol) {
                  try { map.removeLayer(l.id); } catch (err) { /* ignore */ }
                }
              });
            }
            // Set up move listener to re-render arcs via requestAnimationFrame
            try {
              const scheduleRender = () => {
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                rafRef.current = requestAnimationFrame(() => {
                  renderArcs();
                  rafRef.current = null;
                });
              };
              map.on('move', scheduleRender);
              mapMoveHandlerRef.current = scheduleRender;
              // initial draw
              renderArcs();
            } catch (err) {
              console.warn('Failed to attach map move listener', err);
            }
          } catch (err) {
            console.warn('Failed to prune symbol layers', err);
          }
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      >
        {geojsonSource && (
          <Source id="countries-data" type="geojson" data={geojsonSource}>
            <Layer {...fillLayerStyle} />
            <Layer {...lineLayerStyle} />
          </Source>
        )}
      </Map>

      {/* SVG Overlay for Arcs (imperative drawing) */}
      <svg
        ref={svgRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 20,
          overflow: 'visible',
          pointerEvents: 'none' // allow map interactions through the SVG; individual paths will enable pointer events
        }}
      />

      {/* Info Overlay */}
      <div
        className="text-[10px] text-text-muted bg-transparent px-2 py-1 rounded backdrop-blur-md"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10
        }}
      >
        Map View
      </div>

      <div
        className="text-[10px] text-text-muted bg-transparent px-2 py-1 rounded backdrop-blur-md"
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          zIndex: 10
        }}
      >
        Tiles © CartoDB | Data © SIPRI
      </div>

      {/* Country Hover Tooltip */}
      {hoveredCountry && hoveredCountry.feature && !hoveredArc && (
        <div
          className="absolute z-30 bg-black/80 text-white text-xs p-2 rounded border border-slate-700 pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px]"
          style={{ left: hoveredCountry.x, top: hoveredCountry.y }}
        >
          <div className="font-bold">{hoveredCountry.feature.properties.name}</div>
        </div>
      )}

      {/* Arc Hover Tooltip */}
      {hoveredArc && (
        <div 
          className="absolute z-40 bg-black/80 text-white text-xs p-2 rounded border border-slate-700 pointer-events-none"
          style={{ 
            left: '50%', top: '20%', transform: 'translate(-50%, -50%)' // Fixed pos for arc tooltip for simplicity
          }}
        >
          <strong>{isoToName(hoveredArc.supplier_iso)} &rarr; {isoToName(hoveredArc.recipient_iso)}</strong><br/>
          Category: <span style={{ color: categoryColor(hoveredArc.category) }}>{hoveredArc.category}</span><br/>
          Designation: {hoveredArc.designation}<br/>
          Quantity: {hoveredArc.quantity || 'Unknown'}<br/>
          TIV: {formatTIV(hoveredArc.tiv)}<br/>
          Year: {hoveredArc.year}
        </div>
      )}
    </div>
  );
}
