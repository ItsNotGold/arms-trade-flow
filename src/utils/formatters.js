export const formatTIV = (value) => {
  if (value === null || value === undefined) return '0 TIV';
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M TIV`;
  }
  if (value >= 1000) {
    return `${value.toLocaleString()} TIV`;
  }
  return `${value.toLocaleString()} TIV`;
};

export const formatYear = (year) => {
  if (!year) return '';
  return String(year);
};

// We will use the same dictionary as the python script but in reverse as well
const COUNTRY_DICT = {
  "USA": "United States",
  "RUS": "Russia",
  "SUN": "Soviet Union",
  "FRA": "France",
  "CHN": "China",
  "DEU": "Germany",
  "DDR": "East Germany",
  "ITA": "Italy",
  "GBR": "United Kingdom",
  "KOR": "South Korea",
  "ESP": "Spain",
  "ISR": "Israel",
  "NLD": "Netherlands",
  "UKR": "Ukraine",
  "SWE": "Sweden",
  "CHE": "Switzerland",
  "TUR": "Turkey",
  "CAN": "Canada",
  "BLR": "Belarus",
  "ARE": "United Arab Emirates",
  "AUS": "Australia",
  "BRA": "Brazil",
  "ZAF": "South Africa",
  "IND": "India",
  "NOR": "Norway",
  "BEL": "Belgium",
  "JPN": "Japan",
  "POL": "Poland",
  "CZE": "Czechia",
  "CSK": "Czechoslovakia",
  "AUT": "Austria",
  "FIN": "Finland",
  "SRB": "Serbia",
  "YUG": "Yugoslavia",
  "SVK": "Slovakia",
  "IRN": "Iran",
  "BGR": "Bulgaria",
  "PRT": "Portugal",
  "DNK": "Denmark",
  "JOR": "Jordan",
  "SAU": "Saudi Arabia",
  "EGY": "Egypt",
  "IDN": "Indonesia",
  "PAK": "Pakistan",
  "QAT": "Qatar",
  "DZA": "Algeria",
  "IRQ": "Iraq",
  "MAR": "Morocco",
  "VNM": "Vietnam",
  "VDR": "North Vietnam",
  "KWT": "Kuwait",
  "SGP": "Singapore",
  "TWN": "Taiwan",
  "THA": "Thailand",
  "GRC": "Greece",
  "BGD": "Bangladesh",
  "COL": "Colombia",
  "PHL": "Philippines",
  "CHL": "Chile",
  "NGA": "Nigeria",
  "MEX": "Mexico",
  "PER": "Peru",
  "MYS": "Malaysia",
  "OMN": "Oman",
  "ROU": "Romania",
  "MMR": "Myanmar",
  "AGO": "Angola",
  "KAZ": "Kazakhstan",
  "TKM": "Turkmenistan",
  "HRV": "Croatia",
  "SDN": "Sudan",
  "UZB": "Uzbekistan",
  "SYR": "Syria",
  "ARG": "Argentina",
  "ECU": "Ecuador",
  "VEN": "Venezuela",
  "LBY": "Libya",
  "YEM": "Yemen",
  "YMD": "South Yemen",
  "AFG": "Afghanistan",
  "MLI": "Mali",
  "CMR": "Cameroon",
  "UGA": "Uganda",
  "SEN": "Senegal",
  "TCD": "Chad",
  "PRK": "North Korea",
  "COD": "DR Congo",
  "SOM": "Somalia",
  "KEN": "Kenya",
  "ETH": "Ethiopia",
  "ERI": "Eritrea",
  "NZL": "New Zealand",
  "IRL": "Ireland",
  "CUB": "Cuba",
  "HND": "Honduras",
  "SLV": "El Salvador",
  "NIC": "Nicaragua",
  "BOL": "Bolivia",
  "URY": "Uruguay",
  "PRY": "Paraguay"
};

const NAME_TO_ISO = Object.fromEntries(
  Object.entries(COUNTRY_DICT).map(([iso, name]) => [name.toLowerCase(), iso])
);

export const isoToName = (isoCode) => {
  return COUNTRY_DICT[isoCode] || isoCode;
};

export const nameToIso = (name) => {
  return NAME_TO_ISO[name.toLowerCase()] || name;
};

export const categoryColor = (category) => {
  const colors = {
    'Aircraft': '#3b82f6',
    'Armoured vehicles': '#f59e0b',
    'Artillery': '#ef4444',
    'Missiles': '#8b5cf6',
    'Ships': '#06b6d4',
    'Sensors': '#10b981',
    'Other': '#64748b'
  };
  return colors[category] || colors['Other'];
};
