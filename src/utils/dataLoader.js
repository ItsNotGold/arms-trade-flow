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
  if (!countryProfileCache) {
    countryProfileCache = await fetchJson('/data/by_country.json');
  }
  return countryProfileCache[isoCode] || null;
};

export const loadAllCountries = async () => {
  if (!countryProfileCache) {
    countryProfileCache = await fetchJson('/data/by_country.json');
  }
  return countryProfileCache;
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
