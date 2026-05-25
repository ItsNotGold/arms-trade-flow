import React from 'react';
import { useMapStore } from '../../store/mapStore';
import { categoryColor } from '../../utils/formatters';

const CATEGORIES = [
  'Aircraft',
  'Armoured vehicles',
  'Artillery',
  'Missiles',
  'Ships',
  'Sensors',
  'Other',
];

export default function CategoryLegend() {
  const { activeWeaponCategories, toggleWeaponCategory } = useMapStore();

  return (
    <div className="absolute bottom-16 left-4 flex gap-2 bg-[#0d101e]/80 backdrop-blur-md border border-[#1e2330] p-2 rounded-md text-sm text-text-muted z-30">
      {CATEGORIES.map((cat) => {
        const isActive = activeWeaponCategories.length === 0 || activeWeaponCategories.includes(cat);
        return (
          <button
            key={cat}
            onClick={() => toggleWeaponCategory(cat)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}
              ${isActive ? 'text-white' : 'text-text-muted'}
            `}
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: categoryColor(cat), opacity: isActive ? 1 : 0.2 }}
            ></span>
            <span>{cat}</span>
          </button>
        );
      })}
    </div>
  );
}
