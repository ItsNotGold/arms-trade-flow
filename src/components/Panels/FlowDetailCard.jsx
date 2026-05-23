import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useMapStore } from '../../store/mapStore';
import { isoToName, formatTIV, categoryColor } from '../../utils/formatters';

/**
 * FlowDetailCard
 * Shows a summary of all individual weapon transfers for a supplier→recipient pair.
 * Props:
 *   flow: aggregated arc object (supplier_iso, recipient_iso, tiv, records[])
 *   onClose: callback to dismiss the card
 */
export default function FlowDetailCard({ flow, onClose }) {
  const setSelectedWeapon = useMapStore(state => state.setSelectedWeapon);

  if (!flow) return null;

  const { supplier_iso, recipient_iso, tiv, records = [] } = flow;

  // Sort individual transfers: most recent first, then by TIV descending
  const transfers = [...records].sort((a, b) => b.year - a.year || b.tiv - a.tiv);

  const handleViewWeapon = (designation) => {
    if (designation) {
      setSelectedWeapon(designation);
      if (onClose) onClose();
    }
  };

  return (
    // Position above the TimelineBar (72px) with an 8px gap → bottom-[88px]
    <div className="fixed inset-x-0 bottom-[88px] flex justify-center z-50 pointer-events-none px-4">
      <div className="relative w-full max-w-lg bg-[#0d101e]/96 backdrop-blur-xl border border-[#1e2330] rounded-2xl shadow-2xl flex flex-col pointer-events-auto"
        style={{ maxHeight: '52vh' }}>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-[#1e2330] shrink-0">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
              <span>{isoToName(supplier_iso)}</span>
              <span className="text-[#3b82f6]">→</span>
              <span>{isoToName(recipient_iso)}</span>
            </h2>
            <p className="text-[11px] text-[#64748b] mt-0.5">
              {formatTIV(tiv)} total
              {transfers.length > 0 && (
                <span> · {transfers.length} transfer{transfers.length !== 1 ? 's' : ''}</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 p-1.5 rounded-lg text-[#64748b] hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Transfer list */}
        <div className="overflow-y-auto custom-scrollbar px-3 py-2 flex flex-col gap-1.5">
          {transfers.length === 0 ? (
            <p className="text-[#64748b] text-xs py-4 text-center">No detailed records available.</p>
          ) : (
            transfers.map((r, i) => (
              <button
                key={i}
                onClick={() => handleViewWeapon(r.designation)}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-[#1e2330] border border-transparent hover:border-[#2d3a52] transition-all group"
              >
                {/* Year */}
                <span className="font-mono text-[11px] text-[#64748b] w-10 shrink-0">
                  {r.year}
                </span>

                {/* Category dot */}
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: categoryColor(r.category) }}
                />

                {/* Main info */}
                <div className="flex-grow min-w-0">
                  <div className="text-[13px] font-semibold text-white truncate group-hover:text-[#3b82f6] transition-colors">
                    {r.designation || 'Unknown system'}
                  </div>
                  <div className="text-[10px] text-[#64748b] mt-0.5">
                    {r.category}
                    {r.quantity != null && <span> · Qty: {r.quantity}</span>}
                    <span> · {formatTIV(r.tiv)}</span>
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight size={13} className="text-[#64748b] group-hover:text-[#3b82f6] shrink-0 transition-colors" />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-[#1e2330] shrink-0">
          <p className="text-[10px] text-[#475569]">
            Source: SIPRI Arms Transfers Database — click a row to view weapon system details
          </p>
        </div>
      </div>
    </div>
  );
}
