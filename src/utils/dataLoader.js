import * as topojson from 'topojson-client';
import { fixAntimeridian } from './geoUtils';

// In-memory caches
let flowsCache = null;
let countryProfileCache = null;
let yearlyTotalsCache = null;
let weaponSystemsCache = null;
let geoDataCache = null;

const BLOCS = {
  'NATO': ['ALB', 'BEL', 'BGR', 'CAN', 'HRV', 'CZE', 'DNK', 'EST', 'FRA', 'DEU', 'GRC', 'HUN', 'ISL', 'ITA', 'LVA', 'LTU', 'LUX', 'MNE', 'NLD', 'MKD', 'NOR', 'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'ESP', 'TUR', 'GBR', 'USA', 'FIN', 'SWE'],
  'EU': ['AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA', 'DEU', 'GRC', 'HUN', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 'MLT', 'NLD', 'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'ESP', 'SWE'],
  'BRICS': ['BRA', 'RUS', 'IND', 'CHN', 'ZAF', 'EGY', 'ETH', 'IRN', 'ARE'],
  'SCO': ['CHN', 'IND', 'IRN', 'KAZ', 'KGZ', 'PAK', 'RUS', 'TJK', 'UZB'],
  'Arab League': ['DZA', 'BHR', 'COM', 'DJI', 'EGY', 'IRQ', 'JOR', 'KWT', 'LBN', 'LBY', 'MRT', 'MAR', 'OMN', 'PSE', 'QAT', 'SAU', 'SOM', 'SDN', 'SYR', 'TUN', 'ARE', 'YEM'],
  'ASEAN': ['BRN', 'KHM', 'IDN', 'LAO', 'MYS', 'MMR', 'PHL', 'SGP', 'THA', 'VNM'],
  'African Union': ['DZA', 'AGO', 'BEN', 'BWA', 'BFA', 'BDI', 'CPV', 'CMR', 'CAF', 'TCD', 'COM', 'COD', 'DJI', 'EGY', 'GNQ', 'ERI', 'SWZ', 'ETH', 'GAB', 'GMB', 'GHA', 'GIN', 'GNB', 'CIV', 'KEN', 'LSO', 'LBR', 'LBY', 'MDG', 'MWI', 'MLI', 'MRT', 'MUS', 'MAR', 'MOZ', 'NAM', 'NER', 'NGA', 'RWA', 'STP', 'SEN', 'SYC', 'SLE', 'SOM', 'ZAF', 'SSD', 'SDN', 'TZA', 'TGO', 'TUN', 'UGA', 'ZMB', 'ZWE']
};

const fetchJson = async (url) => {
  const cached = sessionStorage.getItem(url);
  if (cached) return JSON.parse(cached);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  const data = await response.json();
  // Only cache smaller files; skip flows.json and weapon_systems.json as they're too large for sessionStorage
  const shouldCache = !url.includes('flows.json') && !url.includes('weapon_systems.json');
  if (shouldCache) {
    try { sessionStorage.setItem(url, JSON.stringify(data)); } catch (e) { console.warn('Session storage quota exceeded, skipping cache for', url); }
  }
  return data;
};

export const loadFlows = async (yearStart, yearEnd, categories = [], minTiv = 0, selectedBlocs = []) => {
  if (!flowsCache) {
    flowsCache = await fetchJson('/data/flows.json');
  }

  return flowsCache.filter((flow) => {
    if (yearStart && flow.year < yearStart) return false;
    if (yearEnd && flow.year > yearEnd) return false;
    if (categories && categories.length > 0 && !categories.includes(flow.category)) return false;
    if (minTiv > 0 && flow.tiv < minTiv) return false;
    
    if (selectedBlocs && selectedBlocs.length > 0) {
      let matchesBloc = false;
      for (const bloc of selectedBlocs) {
        const members = BLOCS[bloc] || [];
        if (members.includes(flow.supplier_iso) || members.includes(flow.recipient_iso)) {
          matchesBloc = true;
          break;
        }
      }
      if (!matchesBloc) return false;
    }
    
    return true;
  });
};

export const loadCountryProfile = async (isoCode) => {
  // Always reload by_country to get fresh data (bust cache)
  const freshByCountry = await fetchJson('/data/by_country.json?' + Date.now());
  
  let profile = freshByCountry[isoCode];
  
  if (profile) {
    console.log('[CountryPanel] Profile found for', isoCode, '- Region:', profile.region);
    return profile;
  }
  
  // If no profile found, generate one from flows data
  console.log('[CountryPanel] Generating profile from flows for', isoCode);
  profile = await generateCountryProfileFromFlows(isoCode);
  
  if (profile) {
    console.log('[CountryPanel] Generated profile for', isoCode, '- Region:', profile.region);
  }
  
  return profile;
};

const generateCountryProfileFromFlows = async (isoCode) => {
  // Load flows if not cached
  if (!flowsCache) {
    flowsCache = await fetchJson('/data/flows.json');
  }
  
  // Reload by_country to get fresh region data (bust cache)
  const byCountry = await fetchJson('/data/by_country.json?' + Date.now());
  const countryEntry = byCountry[isoCode];
  
  const countryFlows = flowsCache.filter(f => f.supplier_iso === isoCode || f.recipient_iso === isoCode);
  
  if (!countryFlows.length) return null;
  
  // Aggregate exports and imports
  const exports = countryFlows.filter(f => f.supplier_iso === isoCode);
  const imports = countryFlows.filter(f => f.recipient_iso === isoCode);
  
  const totalExportedTiv = exports.reduce((sum, f) => sum + (f.tiv || 0), 0);
  const totalImportedTiv = imports.reduce((sum, f) => sum + (f.tiv || 0), 0);
  
  // Get top export partners
  const exportPartners = {};
  exports.forEach(f => {
    if (!exportPartners[f.recipient_iso]) {
      exportPartners[f.recipient_iso] = 0;
    }
    exportPartners[f.recipient_iso] += f.tiv || 0;
  });
  
  const topExportPartners = Object.entries(exportPartners)
    .map(([iso, tiv]) => ({ iso, tiv }))
    .sort((a, b) => b.tiv - a.tiv)
    .slice(0, 10);
  
  // Get top import partners
  const importPartners = {};
  imports.forEach(f => {
    if (!importPartners[f.supplier_iso]) {
      importPartners[f.supplier_iso] = 0;
    }
    importPartners[f.supplier_iso] += f.tiv || 0;
  });
  
  const topImportPartners = Object.entries(importPartners)
    .map(([iso, tiv]) => ({ iso, tiv }))
    .sort((a, b) => b.tiv - a.tiv)
    .slice(0, 10);
  
  // Aggregate by category
  const exportsByCategory = {};
  const importsByCategory = {};
  
  exports.forEach(f => {
    if (!exportsByCategory[f.category]) exportsByCategory[f.category] = 0;
    exportsByCategory[f.category] += f.tiv || 0;
  });
  
  imports.forEach(f => {
    if (!importsByCategory[f.category]) importsByCategory[f.category] = 0;
    importsByCategory[f.category] += f.tiv || 0;
  });
  
  // Get country name from flows (use supplier_name or recipient_name from any flow involving this country)
  let countryName = isoCode;
  const nameFlow = countryFlows.find(f => f.supplier_iso === isoCode && f.supplier_name);
  if (nameFlow) {
    countryName = nameFlow.supplier_name;
  } else {
    const nameFlow2 = countryFlows.find(f => f.recipient_iso === isoCode && f.recipient_name);
    if (nameFlow2) countryName = nameFlow2.recipient_name;
  }
  
  // Get region from by_country if available
  let region = 'Unknown';
  if (countryEntry && countryEntry.region) {
    region = countryEntry.region;
  }
  
  // Aggregate by year
  const yearlyExportsMap = {};
  const yearlyImportsMap = {};
  
  exports.forEach(f => {
    const year = f.year;
    if (!yearlyExportsMap[year]) yearlyExportsMap[year] = 0;
    yearlyExportsMap[year] += f.tiv || 0;
  });
  
  imports.forEach(f => {
    const year = f.year;
    if (!yearlyImportsMap[year]) yearlyImportsMap[year] = 0;
    yearlyImportsMap[year] += f.tiv || 0;
  });
  
  // Convert to sorted arrays
  const yearlyExports = Object.entries(yearlyExportsMap)
    .map(([year, tiv]) => ({ year: parseInt(year), tiv }))
    .sort((a, b) => a.year - b.year);
  
  const yearlyImports = Object.entries(yearlyImportsMap)
    .map(([year, tiv]) => ({ year: parseInt(year), tiv }))
    .sort((a, b) => a.year - b.year);
  
  return {
    name: countryName,
    iso: isoCode,
    region: region,
    total_exported_tiv: totalExportedTiv,
    total_imported_tiv: totalImportedTiv,
    top_export_partners: topExportPartners,
    top_import_partners: topImportPartners,
    exports_by_category: exportsByCategory,
    imports_by_category: importsByCategory,
    yearly_exports: yearlyExports,
    yearly_imports: yearlyImports
  };
};

export const loadAllCountries = async () => {
  // Always fetch fresh to bust cache
  return await fetchJson('/data/by_country.json?' + Date.now());
};

export const loadYearlyTotals = async () => {
  if (!yearlyTotalsCache) {
    yearlyTotalsCache = await fetchJson('/data/yearly_totals.json');
  }
  return yearlyTotalsCache;
};

export const loadWeaponSystem = async (name) => {
  if (!weaponSystemsCache) {
    weaponSystemsCache = await fetchJson('/data/weapon_systems.json');
  }
  return weaponSystemsCache.find(ws => ws.name === name) || null;
};

export const searchWeaponSystems = async (query) => {
  if (!weaponSystemsCache) {
    weaponSystemsCache = await fetchJson('/data/weapon_systems.json');
  }
  if (!query) return weaponSystemsCache;
  
  const lowerQuery = query.toLowerCase();
  return weaponSystemsCache.filter(ws => ws.name.toLowerCase().includes(lowerQuery));
};

export const GEO_DATA = async () => {
  if (!geoDataCache) {
    const rawTopoJson = await fetchJson('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
    
    // Convert topojson to GeoJSON
    let geojson = null;
    if (rawTopoJson && rawTopoJson.objects && rawTopoJson.objects.countries) {
      geojson = topojson.feature(rawTopoJson, rawTopoJson.objects.countries);
    } else if (rawTopoJson && rawTopoJson.features) {
      geojson = rawTopoJson;
    }
    
    // Fix antimeridian-crossing polygons (Russia, Fiji, etc.)
    if (geojson) {
      geojson = fixAntimeridian(geojson);
    }
    
    geoDataCache = geojson;
  }
  return geoDataCache;
};
