import React, { useEffect, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useMapStore } from '../../store/mapStore';
import { loadWeaponSystem } from '../../utils/dataLoader';
import { formatTIV, categoryColor } from '../../utils/formatters';

/**
 * WeaponSystemCard
 * Shows details for a weapon system when selected.
 * Props:
 *   weaponName: string (name of the weapon system)
 *   onClose: function to dismiss the card
 */
export default function WeaponSystemCard({ weaponName, onClose }) {
  const [weapon, setWeapon] = useState(null);
  const setSelectedWeapon = useMapStore(state => state.setSelectedWeapon);

  useEffect(() => {
    if (!weaponName) return;
    loadWeaponSystem(weaponName).then(data => setWeapon(data)).catch(err => console.error('Failed to load weapon system', err));
  }, [weaponName]);

  if (!weapon) return null;

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="relative max-w-lg w-full bg-[#0d101e]/90 backdrop-blur-md border border-[#1e2330] rounded-xl shadow-lg p-4 flex flex-col gap-3 pointer-events-auto">
        <button onClick={handleClose} className="absolute top-2 right-2 text-text-muted hover:text-text-primary">
          <X size={16} />
        </button>
        <h2 className="text-lg font-semibold text-text-primary">{weapon.name}</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: categoryColor(weapon.category) }} />
          <span className="text-text-muted">{weapon.category}</span>
        </div>
        {weapon.designation && (
          <p className="text-sm text-white">Designation: {weapon.designation}</p>
        )}
        {weapon.description && (
          <p className="text-xs text-text-muted">{weapon.description}</p>
        )}
        {weapon.tiv && (
          <p className="text-xs text-text-muted">TIV: {formatTIV(weapon.tiv)}</p>
        )}
        <button onClick={() => setSelectedWeapon(null)} className="self-start mt-2 flex items-center gap-1 text-accent hover:underline">
          <ArrowRight size={14} /> Close Weapon System
        </button>
        <p className="mt-2 text-xs text-text-muted">Source: SIPRI Arms Transfers Database</p>
      </div>
    </div>
  );
}
