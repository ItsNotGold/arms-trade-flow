# Weapons Tracker

An interactive data visualization platform that maps and analyzes global conventional weapons transfers using data from the Stockholm International Peace Research Institute (SIPRI).

## Overview

Weapons Tracker provides comprehensive insights into international arms transfers through multiple interactive visualization modes. The platform allows users to explore weapon flows between countries, identify trading patterns, and understand geopolitical dynamics through weapon distribution data.

**Live Demo:** [Weapons Tracker](https://weapons-tracker.vercel.app)

## Features

### 📊 Multiple Visualization Modes

- **Flat Map View**: 2D geographic visualization with animated weapon flow arcs showing transfer relationships between countries
- **Globe View**: 3D interactive globe with real-time weapon flow rendering
- **Chord Diagram**: Network visualization showing relationships between countries and weapon categories

### 🔍 Interactive Filtering

- **Year Range Selection**: Analyze trends across different time periods
- **Weapon Categories**: Filter by 7 weapon types (Aircraft, Missiles, Ships, Artillery, etc.)
- **Minimum TIV Filter**: Set minimum transfer value thresholds to focus on significant transfers
- **Geopolitical Blocs**: Filter by NATO, EU, BRICS, ASEAN, SCO, Arab League, and African Union membership
- **Flow Limit Control**: Adjust the number of displayed flows for clarity

### 📍 Country Profiles

Click any country to view:
- Total import/export values
- Top trading partners
- Category breakdown (what types of weapons were transferred)
- Yearly trends and historical patterns
- Dependency metrics

### 🔎 Search Functionality

- Search countries by name or ISO code
- Search weapon systems by designation and category
- Instant navigation to selected country profiles

### 📈 Data Insights

- Dependency scores showing import concentration
- Top import/export partners ranked by transfer value
- Category-based aggregation
- Yearly historical trends (1960–2025)

## Data Source

**SIPRI Arms Transfers Database (ATT)**

The project uses verified data from the Stockholm International Peace Research Institute's extensive database of conventional arms transfers. Data includes:

- **Coverage**: Over 60,000 weapon transfer records
- **Time Period**: 1960–2025
- **Countries**: 257+ nations and entities
- **Weapon Categories**: 7 main categories with detailed designations
- **Update Frequency**: Annual, typically released in March

For more information on SIPRI data methodology and access to raw data, visit [sipri.org](https://sipri.org/databases/armstransfers).

## Technology Stack

### Frontend

- **React 18** - UI framework with hooks for state management
- **Zustand** - Global state management
- **MapLibre GL** - 2D map rendering with OpenStreetMap
- **D3.js** - Chord diagram and data visualization
- **Recharts** - Area charts and breakdowns
- **React Globe.gl** - 3D globe visualization
- **Tailwind CSS** - Styling and responsive design
- **Vite** - Fast build tool

### Data Processing

- **Python 3** - Scripts for data normalization and aggregation
- **JSON** - Data storage format

## Installation

### Prerequisites

- Node.js 16+ and npm
- Python 3.7+ (for data processing scripts)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ItsNotGold/Weapons-tracker.git
   cd Weapons-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

### Project Structure

```
src/
├── components/          # React components
│   ├── Navbar.jsx      # Navigation header
│   ├── FlatMap/        # 2D map visualization
│   ├── Globe/          # 3D globe visualization
│   ├── Chord/          # Chord diagram
│   ├── Filters/        # Filter sidebar
│   ├── Panels/         # Country detail panels
│   ├── Search/         # Search bar
│   ├── Timeline/       # Year selection control
│   └── Loading/        # Loading states and skeletons
├── pages/              # Page components
│   ├── MapPage.jsx     # Main visualization page
│   ├── ComparePage.jsx # (Future) Country comparison
│   └── MethodologyPage.jsx # Documentation
├── store/              # Zustand state management
│   └── mapStore.js     # Global app state
├── utils/              # Utilities
│   ├── dataLoader.js   # Data fetching and aggregation
│   ├── formatters.js   # Formatting and color mapping
│   └── geoUtils.js     # Geographic utilities
├── hooks/              # Custom React hooks
├── data/               # Data directory (frontend)
└── App.jsx             # Root component

public/
├── data/               # JSON data files
│   ├── by_country.json         # Country profiles
│   ├── flows.json              # Weapon transfer records
│   ├── weapon_systems.json     # Weapon designations
│   └── yearly_totals.json      # Aggregated yearly data
└── icons.svg           # Icon definitions

scripts/
├── process_sipri.py    # Data processing pipeline
└── data/
    ├── sipri_raw.csv   # Raw SIPRI data
    └── output/         # Processed JSON files
```

## Data Processing

### Pipeline Overview

1. **Raw Data Import** (`scripts/process_sipri.py`)
   - Reads SIPRI ATT CSV data
   - Validates and cleans entries
   - Normalizes country names to ISO 3166-1 alpha-3 codes

2. **Country Profiles** (`by_country.json`)
   - Aggregates flows by country
   - Calculates total exports/imports
   - Identifies top trading partners
   - Groups by weapon category
   - Computes yearly trends

3. **Flow Data** (`flows.json`)
   - Individual transfer records
   - Supplier and recipient ISO codes
   - Year, category, designation, quantity, TIV
   - All values standardized to ISO codes

4. **Weapon Systems** (`weapon_systems.json`)
   - Unique weapon designations
   - Category classification
   - Search indexing

5. **Yearly Totals** (`yearly_totals.json`)
   - Global aggregates by year
   - Category breakdown
   - Historical trends

### Running the Pipeline

```bash
cd scripts
python3 process_sipri.py
```

This regenerates all JSON files in `public/data/` from the raw SIPRI CSV.

## Key Features Explained

### Global State Management (Zustand)

The app uses a centralized store (`mapStore.js`) managing:

- `yearRange` - Currently selected year period
- `activeView` - Active visualization (flat, globe, chord)
- `flowLimit` - Maximum number of flows to display
- `focusedCountry` - Selected country profile
- `activeWeaponCategories` - Filtered weapon types
- `selectedBlocs` - Geopolitical bloc filters
- `minTiv` - Minimum transfer value threshold

### Country Click Flow

1. User clicks country on map
2. `FlatMapView.jsx` resolves geographic name to ISO code via `GEO_NAME_TO_ISO` mapping
3. `setFocusedCountry(iso)` dispatches to Zustand
4. `CountryPanel.jsx` monitors `focusedCountry` state
5. `loadCountryProfile(iso)` fetches profile from cache or generates from flows
6. Panel animates in with country data

### Search Integration

- SearchBar loads all countries from `by_country.json`
- Searches by country name or ISO code
- Returns exact match or substring matches
- Calls same `setFocusedCountry()` dispatcher as map clicks
- Unified data flow ensures consistency

## Performance Optimizations

- **Data Caching**: All JSON files cached after first load
- **Memoization**: useMemo for expensive computations
- **Lazy Loading**: Chord and Globe views loaded on-demand
- **Responsive Container**: Recharts uses ResponsiveContainer for dynamic sizing
- **Debounced Filters**: Reduces recalculations during rapid changes

## Contributing

Contributions are welcome! Areas for enhancement:

- **Data Corrections**: Help identify and fix country/weapon data inconsistencies
- **Features**: New visualization types, comparison tools, export functionality
- **UI/UX**: Improved accessibility, mobile responsiveness, dark mode
- **Translations**: Localize the interface for different languages
- **Performance**: Optimization for larger datasets

### How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m 'Add your feature'`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request with a clear description

## Known Issues & Limitations

- **Data Lag**: SIPRI data typically includes transfers up to the previous year
- **Small Countries**: Some microstates may have limited data
- **Historical Gaps**: Older records (pre-1960s) are sparse
- **Weapon Categories**: Simplified grouping from detailed SIPRI classifications

## Deployment

The project is configured for deployment on Vercel:

```bash
npm run build
```

This generates a production-optimized build in the `dist/` directory.

For Vercel deployment:
1. Push to GitHub
2. Connect repository to Vercel
3. Auto-deploys on push to main branch

See `vercel.json` for deployment configuration.

## License

This project is open source and available under the MIT License. See LICENSE file for details.

## Data Attribution

This project uses data from:

**Stockholm International Peace Research Institute (SIPRI)**
- SIPRI Arms Transfers Database (ATT)
- https://sipri.org/databases/armstransfers

## Contact & Support

For issues, questions, or suggestions:

- **GitHub Issues**: [ItsNotGold/Weapons-tracker/issues](https://github.com/ItsNotGold/Weapons-tracker/issues)
- **Discussions**: [ItsNotGold/Weapons-tracker/discussions](https://github.com/ItsNotGold/Weapons-tracker/discussions)

## Acknowledgments

- **SIPRI** for comprehensive weapons transfer data
- **MapLibre GL** for open-source map rendering
- **D3.js**, **Recharts** for visualization libraries
- **React** and **Zustand** for the UI framework
- All contributors and users who help improve the project
