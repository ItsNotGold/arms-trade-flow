# Weapons Tracker

An interactive data visualization platform that maps and analyzes global conventional weapons transfers using data from the Stockholm International Peace Research Institute (SIPRI).

## Overview

Weapons Tracker provides comprehensive insights into international arms transfers through multiple interactive visualization modes. The platform allows users to explore weapon flows between countries, identify trading patterns, and understand geopolitical dynamics through weapon distribution data.

**Live Demo:** [Weapons Tracker](https://weapons-tracker.vercel.app)

## Features

### Multiple Visualization Modes

- **Flat Map View**: 2D geographic visualization with animated weapon flow arcs showing transfer relationships between countries
- **Globe View**: 3D interactive globe with real-time weapon flow rendering
- **Chord Diagram**: Network visualization showing relationships between countries and weapon categories

### Interactive Filtering

- **Year Range Selection**: Analyze trends across different time periods
- **Weapon Categories**: Filter by 7 weapon types (Aircraft, Missiles, Ships, Artillery, etc.)
- **Minimum TIV Filter**: Set minimum transfer value thresholds to focus on significant transfers
- **Geopolitical Blocs**: Filter by NATO, EU, BRICS, ASEAN, SCO, Arab League, and African Union membership
- **Flow Limit Control**: Adjust the number of displayed flows for clarity

### Country Profiles

Click any country to view:
- Total import/export values
- Top trading partners
- Category breakdown (what types of weapons were transferred)
- Yearly trends and historical patterns
- Dependency metrics

### Search Functionality

- Search countries by name or ISO code
- Search weapon systems by designation and category
- Instant navigation to selected country profiles

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

- **React 18** - UI framework with hooks for state management
- **Zustand** - Global state management
- **MapLibre GL** - 2D map rendering with OpenStreetMap
- **D3.js** - Chord diagram and data visualization
- **Recharts** - Area charts and breakdowns
- **React Globe.gl** - 3D globe visualization
- **Tailwind CSS** - Styling and responsive design
- **Vite** - Build tool
- **Python 3** - Data processing pipeline

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

The project uses a data pipeline to process SIPRI raw data:

1. **Raw Data Import** - Reads SIPRI ATT CSV, validates and normalizes country names to ISO 3166-1 alpha-3 codes
2. **Country Profiles** - Aggregates flows by country, calculates import/export values, identifies top partners, and computes yearly trends
3. **Flow Data** - Individual transfer records with supplier/recipient ISO codes, year, category, and TIV values
4. **Weapon Systems** - Unique weapon designations indexed by category for search functionality
5. **Yearly Totals** - Global aggregates by year for historical trend analysis

To regenerate data from raw SIPRI CSV:

```bash
cd scripts
python3 process_sipri.py
```

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m 'Add your feature'`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request with a clear description

## Known Issues & Limitations

- SIPRI data typically includes transfers up to the previous year
- Some microstates may have limited historical data
- Older records (pre-1960s) are sparse

## Deployment

The project is configured for deployment on Vercel. Build the production version with:

```bash
npm run build
```

Then push to GitHub and connect the repository to Vercel for automatic deployments.

## License

This project is open source and available under the MIT License.

## Data Attribution

This project uses data from the Stockholm International Peace Research Institute (SIPRI) Arms Transfers Database (ATT). For more information, visit [sipri.org/databases/armstransfers](https://sipri.org/databases/armstransfers).

## Support

For issues, questions, or suggestions, open an issue on [GitHub](https://github.com/ItsNotGold/Weapons-tracker/issues).
