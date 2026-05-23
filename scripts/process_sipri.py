import pandas as pd
import json
import os
import numpy as np

# Country name mapping to ISO 3166-1 alpha-3
# Providing top 80+ most common arms-trading countries (and SIPRI specific names)
COUNTRY_MAPPING = {
    "United States": "USA", "USA": "USA",
    "Russia": "RUS", "Soviet Union": "SUN",
    "France": "FRA",
    "China": "CHN", "PR China": "CHN",
    "Germany": "DEU", "FRG": "DEU", "West Germany": "DEU", "East Germany": "DDR",
    "Italy": "ITA",
    "United Kingdom": "GBR", "UK": "GBR",
    "South Korea": "KOR", "Korea, South": "KOR",
    "Spain": "ESP",
    "Israel": "ISR",
    "Netherlands": "NLD",
    "Ukraine": "UKR",
    "Sweden": "SWE",
    "Switzerland": "CHE",
    "Turkey": "TUR", "Türkiye": "TUR",
    "Canada": "CAN",
    "Belarus": "BLR",
    "United Arab Emirates": "ARE", "UAE": "ARE",
    "Australia": "AUS",
    "Brazil": "BRA",
    "South Africa": "ZAF",
    "India": "IND",
    "Norway": "NOR",
    "Belgium": "BEL",
    "Japan": "JPN",
    "Poland": "POL",
    "Czechia": "CZE", "Czech Republic": "CZE", "Czechoslovakia": "CSK",
    "Austria": "AUT",
    "Finland": "FIN",
    "Serbia": "SRB", "Yugoslavia": "YUG",
    "Slovakia": "SVK",
    "Iran": "IRN",
    "Bulgaria": "BGR",
    "Portugal": "PRT",
    "Denmark": "DNK",
    "Jordan": "JOR",
    "Saudi Arabia": "SAU",
    "Egypt": "EGY",
    "Indonesia": "IDN",
    "Pakistan": "PAK",
    "Qatar": "QAT",
    "Algeria": "DZA",
    "Iraq": "IRQ",
    "Morocco": "MAR",
    "Vietnam": "VNM", "North Vietnam": "VDR", "South Vietnam": "VNM",
    "Kuwait": "KWT",
    "Singapore": "SGP",
    "Taiwan": "TWN",
    "Thailand": "THA",
    "Greece": "GRC",
    "Bangladesh": "BGD",
    "Colombia": "COL",
    "Philippines": "PHL",
    "Chile": "CHL",
    "Nigeria": "NGA",
    "Mexico": "MEX",
    "Peru": "PER",
    "Malaysia": "MYS",
    "Oman": "OMN",
    "Romania": "ROU",
    "Myanmar": "MMR", "Burma": "MMR",
    "Angola": "AGO",
    "Kazakhstan": "KAZ",
    "Turkmenistan": "TKM",
    "Croatia": "HRV",
    "Sudan": "SDN",
    "Uzbekistan": "UZB",
    "Syria": "SYR",
    "Argentina": "ARG",
    "Ecuador": "ECU",
    "Venezuela": "VEN",
    "Libya": "LBY",
    "Yemen": "YEM", "North Yemen": "YEM", "South Yemen": "YMD",
    "Afghanistan": "AFG",
    "Mali": "MLI",
    "Cameroon": "CMR",
    "Uganda": "UGA",
    "Senegal": "SEN",
    "Chad": "TCD",
    "North Korea": "PRK",
    "Zaire": "COD", "DR Congo": "COD",
    "Somalia": "SOM",
    "Kenya": "KEN",
    "Ethiopia": "ETH",
    "Eritrea": "ERI",
    "New Zealand": "NZL",
    "Ireland": "IRL",
    "Cuba": "CUB",
    "Honduras": "HND",
    "El Salvador": "SLV",
    "Nicaragua": "NIC",
    "Bolivia": "BOL",
    "Uruguay": "URY",
    "Paraguay": "PRY"
}

# Hardcoded region mapping (iso to region)
REGION_MAPPING = {
    "USA": "North America", "CAN": "North America", "MEX": "North America",
    "RUS": "Europe", "FRA": "Europe", "DEU": "Europe", "ITA": "Europe", "GBR": "Europe",
    "ESP": "Europe", "NLD": "Europe", "UKR": "Europe", "SWE": "Europe", "CHE": "Europe",
    "BLR": "Europe", "NOR": "Europe", "BEL": "Europe", "POL": "Europe", "CZE": "Europe",
    "AUT": "Europe", "FIN": "Europe", "SRB": "Europe", "SVK": "Europe", "BGR": "Europe",
    "PRT": "Europe", "DNK": "Europe", "GRC": "Europe", "ROU": "Europe", "HRV": "Europe",
    "SUN": "Europe", "DDR": "Europe", "CSK": "Europe", "YUG": "Europe", "IRL": "Europe",
    "CHN": "Asia", "KOR": "Asia", "IND": "Asia", "JPN": "Asia", "IDN": "Asia", "PAK": "Asia",
    "VNM": "Asia", "SGP": "Asia", "TWN": "Asia", "THA": "Asia", "BGD": "Asia", "PHL": "Asia",
    "MYS": "Asia", "MMR": "Asia", "KAZ": "Asia", "TKM": "Asia", "UZB": "Asia", "AFG": "Asia",
    "PRK": "Asia", "VDR": "Asia",
    "ISR": "Middle East", "TUR": "Middle East", "ARE": "Middle East", "IRN": "Middle East",
    "JOR": "Middle East", "SAU": "Middle East", "QAT": "Middle East", "IRQ": "Middle East",
    "KWT": "Middle East", "OMN": "Middle East", "SYR": "Middle East", "YEM": "Middle East",
    "YMD": "Middle East",
    "ZAF": "Africa", "EGY": "Africa", "DZA": "Africa", "MAR": "Africa", "NGA": "Africa",
    "AGO": "Africa", "SDN": "Africa", "LBY": "Africa", "MLI": "Africa", "CMR": "Africa",
    "UGA": "Africa", "SEN": "Africa", "TCD": "Africa", "COD": "Africa", "SOM": "Africa",
    "KEN": "Africa", "ETH": "Africa", "ERI": "Africa",
    "BRA": "Latin America", "COL": "Latin America", "CHL": "Latin America", "PER": "Latin America",
    "ARG": "Latin America", "ECU": "Latin America", "VEN": "Latin America", "CUB": "Latin America",
    "HND": "Latin America", "SLV": "Latin America", "NIC": "Latin America", "BOL": "Latin America",
    "URY": "Latin America", "PRY": "Latin America",
    "AUS": "Oceania", "NZL": "Oceania"
}

def get_iso(country_name):
    return COUNTRY_MAPPING.get(country_name, country_name)

def get_region(iso_code):
    return REGION_MAPPING.get(iso_code, "Unknown")

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(script_dir, 'data', 'sipri_raw.csv')
    output_dir = os.path.join(script_dir, 'output')

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    print(f"Reading {input_file}...")
    try:
        # Find the header row dynamically by searching for Supplier and Recipient
        skiprows = 0
        with open(input_file, 'r', encoding='utf-8', errors='ignore') as f:
            for idx, line in enumerate(f):
                if 'Supplier' in line and 'Recipient' in line:
                    skiprows = idx
                    break
        print(f"Detected header row at index {skiprows}")
        df = pd.read_csv(input_file, skiprows=skiprows)
    except FileNotFoundError:
        print(f"Error: Could not find input file at {input_file}")
        print("Please ensure the CSV file is placed there and run again.")
        return

    # Strip whitespace from string columns
    str_cols = df.select_dtypes(['object']).columns
    df[str_cols] = df[str_cols].apply(lambda x: x.str.strip() if hasattr(x, 'str') else x)

    # Map column names in case of case mismatches or different naming conventions
    col_mapping = {c.lower().strip(): c for c in df.columns}
    def get_col(name):
        aliases = {
            'year': ['delivery year', 'year'],
            'tiv (total)': ['tiv delivery values', 'tiv (total)', 'tiv delivery value']
        }
        for alias in aliases.get(name.lower(), [name.lower()]):
            if alias in col_mapping:
                return col_mapping[alias]
        return col_mapping.get(name.lower(), name)
        
    supplier_col = get_col('Supplier')
    recipient_col = get_col('Recipient')
    year_col = get_col('Year')
    category_col = get_col('Armament category')
    designation_col = get_col('Designation')
    quantity_col = get_col('Numbers delivered')
    tiv_col = get_col('TIV (total)')

    # Drop rows where TIV (total) is 0 or null
    df[tiv_col] = pd.to_numeric(df[tiv_col], errors='coerce')
    initial_records = len(df)
    df = df[df[tiv_col].notna() & (df[tiv_col] > 0)]
    
    print(f"Dropped {initial_records - len(df)} records with missing or 0 TIV. Remaining: {len(df)}")

    # Add ISO and Region
    df['supplier_iso'] = df[supplier_col].apply(get_iso)
    df['recipient_iso'] = df[recipient_col].apply(get_iso)
    
    df['supplier_region'] = df['supplier_iso'].apply(get_region)
    df['recipient_region'] = df['recipient_iso'].apply(get_region)

    # Process quantities safely
    df['_qty'] = pd.to_numeric(df[quantity_col], errors='coerce')

    # 1. flows.json
    flows = []
    for _, row in df.iterrows():
        flows.append({
            'supplier_iso': row['supplier_iso'],
            'recipient_iso': row['recipient_iso'],
            'year': int(row[year_col]) if pd.notna(row[year_col]) else None,
            'category': row[category_col] if pd.notna(row[category_col]) else "Unknown",
            'designation': row[designation_col] if pd.notna(row[designation_col]) else "Unknown",
            'quantity': int(row['_qty']) if pd.notna(row['_qty']) else None,
            'tiv': float(row[tiv_col])
        })
    
    with open(os.path.join(output_dir, 'flows.json'), 'w') as f:
        json.dump(flows, f, indent=2)

    # 2. by_country.json
    by_country = {}
    countries = pd.concat([df['supplier_iso'], df['recipient_iso']]).unique()
    
    for iso in countries:
        name_sup = df[df['supplier_iso'] == iso][supplier_col].iloc[0] if not df[df['supplier_iso'] == iso].empty else None
        name_rec = df[df['recipient_iso'] == iso][recipient_col].iloc[0] if not df[df['recipient_iso'] == iso].empty else None
        name = name_sup or name_rec or iso
        
        region = get_region(iso)
        
        exports = df[df['supplier_iso'] == iso]
        imports = df[df['recipient_iso'] == iso]
        
        total_exported_tiv = exports[tiv_col].sum()
        total_imported_tiv = imports[tiv_col].sum()
        
        # Top export partners
        top_exp = exports.groupby('recipient_iso')[tiv_col].sum().sort_values(ascending=False).head(10)
        top_export_partners = [{'iso': k, 'tiv': float(v)} for k, v in top_exp.items()]
        
        # Top import partners
        top_imp = imports.groupby('supplier_iso')[tiv_col].sum().sort_values(ascending=False).head(10)
        top_import_partners = [{'iso': k, 'tiv': float(v)} for k, v in top_imp.items()]
        
        # Exports by category
        exp_cat = exports.groupby(category_col)[tiv_col].sum()
        exports_by_category = {k: float(v) for k, v in exp_cat.items()}
        
        # Imports by category
        imp_cat = imports.groupby(category_col)[tiv_col].sum()
        imports_by_category = {k: float(v) for k, v in imp_cat.items()}
        
        # Yearly exports
        yr_exp = exports.groupby(year_col)[tiv_col].sum()
        yearly_exports = [{'year': int(k), 'tiv': float(v)} for k, v in yr_exp.items()]
        
        # Yearly imports
        yr_imp = imports.groupby(year_col)[tiv_col].sum()
        yearly_imports = [{'year': int(k), 'tiv': float(v)} for k, v in yr_imp.items()]
        
        by_country[iso] = {
            'iso': iso,
            'name': name,
            'region': region,
            'total_exported_tiv': float(total_exported_tiv),
            'total_imported_tiv': float(total_imported_tiv),
            'top_export_partners': top_export_partners,
            'top_import_partners': top_import_partners,
            'exports_by_category': exports_by_category,
            'imports_by_category': imports_by_category,
            'yearly_exports': yearly_exports,
            'yearly_imports': yearly_imports
        }

    with open(os.path.join(output_dir, 'by_country.json'), 'w') as f:
        json.dump(by_country, f, indent=2)

    # 3. yearly_totals.json
    yearly_totals = []
    years = df[year_col].dropna().unique()
    for year in sorted(years):
        yr_df = df[df[year_col] == year]
        
        total_global_tiv = yr_df[tiv_col].sum()
        
        top_exp = yr_df.groupby('supplier_iso')[tiv_col].sum().sort_values(ascending=False).head(10)
        top_exporters = [{'iso': k, 'tiv': float(v)} for k, v in top_exp.items()]
        
        top_imp = yr_df.groupby('recipient_iso')[tiv_col].sum().sort_values(ascending=False).head(10)
        top_importers = [{'iso': k, 'tiv': float(v)} for k, v in top_imp.items()]
        
        yearly_totals.append({
            'year': int(year),
            'total_global_tiv': float(total_global_tiv),
            'top_exporters': top_exporters,
            'top_importers': top_importers
        })

    with open(os.path.join(output_dir, 'yearly_totals.json'), 'w') as f:
        json.dump(yearly_totals, f, indent=2)

    # 4. weapon_systems.json
    weapon_systems = []
    designations = df[designation_col].dropna().unique()
    
    for des in designations:
        des_df = df[df[designation_col] == des]
        
        category = des_df[category_col].iloc[0] if not des_df[category_col].empty and pd.notna(des_df[category_col].iloc[0]) else "Unknown"
        
        transfers = []
        for _, row in des_df.iterrows():
            transfers.append({
                'supplier_iso': row['supplier_iso'],
                'recipient_iso': row['recipient_iso'],
                'year': int(row[year_col]) if pd.notna(row[year_col]) else None,
                'quantity': int(row['_qty']) if pd.notna(row['_qty']) else None,
                'tiv': float(row[tiv_col])
            })
            
        weapon_systems.append({
            'name': des,
            'category': category,
            'transfers': transfers
        })

    with open(os.path.join(output_dir, 'weapon_systems.json'), 'w') as f:
        json.dump(weapon_systems, f, indent=2)

    # Summary Report
    print("--------------------------------------------------")
    print("Processing Complete. Summary:")
    print(f"Total Records Processed: {len(df)}")
    
    min_year = df[year_col].min()
    max_year = df[year_col].max()
    print(f"Year Range: {int(min_year)} - {int(max_year)}")
    
    print(f"Number of Unique Countries: {len(countries)}")
    print(f"Number of Unique Weapon Systems: {len(designations)}")
    
    top_5_exporters = df.groupby('supplier_iso')[tiv_col].sum().sort_values(ascending=False).head(5)
    print("Top 5 Exporters (by TIV):")
    for iso, tiv in top_5_exporters.items():
        print(f"  {iso}: {tiv}")
    print("--------------------------------------------------")

if __name__ == "__main__":
    main()
