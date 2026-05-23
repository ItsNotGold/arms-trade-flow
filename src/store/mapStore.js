import { create } from 'zustand';

export const useMapStore = create((set) => ({
  selectedCountries: [],
  yearRange: [1950, 2023],
  activeWeaponCategories: [],
  selectedBlocs: [],

  playbackSpeed: 1,
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  // Loading and error flags
  isLoadingGeo: false,
  setLoadingGeo: (loading) => set({ isLoadingGeo: loading }),
  loadErrorGeo: null,
  setErrorGeo: (error) => set({ loadErrorGeo: error }),
  isLoadingFlows: false,
  setLoadingFlows: (loading) => set({ isLoadingFlows: loading }),
  loadErrorFlows: null,
  setErrorFlows: (error) => set({ loadErrorFlows: error }),

  // New arcs state
  arcs: [],
  setArcs: (newArcs) => set({ arcs: newArcs }),

  // State Mutators
  setSelectedCountries: (countries) => set({ selectedCountries: countries }),
  toggleCountrySelection: (countryCode) => set((state) => {
    const isSelected = state.selectedCountries.includes(countryCode);
    return {
      selectedCountries: isSelected
        ? state.selectedCountries.filter((c) => c !== countryCode)
        : [...state.selectedCountries, countryCode],
    };
  }),
  clearSelectedCountries: () => set({ selectedCountries: [] }),

  setYearRange: (range) => set({ yearRange: range }),

  setActiveWeaponCategories: (categories) => set({ activeWeaponCategories: categories }),
  toggleWeaponCategory: (category) => set((state) => {
    const isActive = state.activeWeaponCategories.includes(category);
    return {
      activeWeaponCategories: isActive
        ? state.activeWeaponCategories.filter((c) => c !== category)
        : [...state.activeWeaponCategories, category],
    };
  }),
  clearWeaponCategories: () => set({ activeWeaponCategories: [] }),

  // View and UI state
  activeView: 'globe',
  setActiveView: (view) => set({ activeView: view }),

  // Playback
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  toggleIsPlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),

  // Embargo layer
  showEmbargoLayer: false,
  setShowEmbargoLayer: (show) => set({ showEmbargoLayer: show }),
  toggleEmbargoLayer: () => set((state) => ({ showEmbargoLayer: !state.showEmbargoLayer })),

  // Focused country
  focusedCountry: null,
  setFocusedCountry: (country) => set({ focusedCountry: country }),

  // Selected weapon
  selectedWeapon: null,
  setSelectedWeapon: (weapon) => set({ selectedWeapon: weapon }),

  // Selected flow
  selectedFlow: null,
  setSelectedFlow: (flow) => set({ selectedFlow: flow }),

  // Min TIV
  minTiv: 0,
  setMinTiv: (val) => set({ minTiv: val }),

  // Flow limit for map arcs
  flowLimit: 100,
  setFlowLimit: (limit) => set({ flowLimit: Math.max(1, Math.min(200, limit)) }),

  // Reset filters
  resetFilters: () => set({
    selectedCountries: [],
    yearRange: [1950, 2023],
    activeWeaponCategories: [],
    selectedBlocs: [],
    activeView: 'globe',
    isPlaying: false,
    showEmbargoLayer: false,
    focusedCountry: null,
    selectedWeapon: null,
    selectedFlow: null,
    minTiv: 0,
  }),
}));
