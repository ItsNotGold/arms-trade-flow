import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';
import { useMapStore } from '../../store/mapStore';
import { formatTIV } from '../../utils/formatters';
import { loadYearlyTotals } from '../../utils/dataLoader';

const HISTORICAL_EVENTS = [
  { year: 1950, label: "Korean War begins" },
  { year: 1965, label: "Indo-Pakistani War" },
  { year: 1973, label: "Yom Kippur War" },
  { year: 1979, label: "Soviet-Afghan War" },
  { year: 1991, label: "Cold War ends / Gulf War" },
  { year: 2001, label: "War on Terror begins" },
  { year: 2003, label: "Iraq War invasion" },
  { year: 2011, label: "Syrian Civil War begins" },
  { year: 2014, label: "Annexation of Crimea" },
  { year: 2022, label: "Invasion of Ukraine" }
];

export default function TimelineBar() {
  const {
    yearRange,
    setYearRange,
    isPlaying,
    setIsPlaying,
    toggleIsPlaying,
    playbackSpeed,
    setPlaybackSpeed
  } = useMapStore();

  const [yearlyTotals, setYearlyTotals] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const trackRef = useRef(null);

  // Fetch yearly totals data on mount
  useEffect(() => {
    loadYearlyTotals()
      .then((data) => {
        const map = {};
        if (Array.isArray(data)) {
          data.forEach((item) => {
            map[item.year] = item.total_global_tiv;
          });
        }
        setYearlyTotals(map);
      })
      .catch((err) => console.error('Failed to load yearly totals', err));
  }, []);

  // Playback logic
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      const delay = 1000 / playbackSpeed;
      interval = setInterval(() => {
        // Get current end year from state
        const currentEnd = yearRange[1];
        if (currentEnd >= 2023) {
          setIsPlaying(false);
        } else {
          const nextYear = currentEnd + 1;
          // Smooth year progression with optimized timing
          requestAnimationFrame(() => {
            setYearRange([nextYear, nextYear]);
          });
        }
      }, delay);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, yearRange, setYearRange, setIsPlaying]);

  // Click Play handler: reset to 1950 if already at 2023
  const handlePlayClick = () => {
    if (!isPlaying && yearRange[1] >= 2023) {
      setYearRange([1950, 1950]);
    }
    toggleIsPlaying();
  };

  // Convert click/touch coordinates to year with smooth easing
  const getYearFromX = (clientX) => {
    if (!trackRef.current) return 1950;
    const rect = trackRef.current.getBoundingClientRect();
    const width = rect.width;
    const clickX = clientX - rect.left;
    let percentage = clickX / width;
    percentage = Math.max(0, Math.min(1, percentage));
    return Math.round(1950 + percentage * (2023 - 1950));
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    const newYear = getYearFromX(e.clientX);
    setYearRange([newYear, newYear]);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      const newYear = getYearFromX(clientX);
      setYearRange([newYear, newYear]);
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const isRangeMode = yearRange[0] !== yearRange[1];
  const startPercent = isRangeMode ? ((yearRange[0] - 1950) / 73) * 100 : 0;
  const endPercent = ((yearRange[1] - 1950) / 73) * 100;
  const currentYear = yearRange[1];
  const tivValue = yearlyTotals[currentYear] || 0;

  return (
    <div className={`w-full bg-transparent z-30 flex items-center justify-between px-6 select-none transition-all duration-300 ${
      isCollapsed ? 'h-[48px]' : 'h-[72px]'
    }`}>
      
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-white transition-colors rounded hover:bg-white/5"
        aria-label={isCollapsed ? 'Expand timeline' : 'Collapse timeline'}
      >
        {isCollapsed ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Collapsed View - Just show year and playback controls */}
      {isCollapsed ? (
        <div className="flex-1 flex items-center justify-between ml-8 mr-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayClick}
              className={`p-1 transition-colors focus:outline-none rounded hover:bg-white/5 ${
                isPlaying ? 'text-[#e2e8f0]' : 'text-[#64748b] hover:text-[#e2e8f0]'
              }`}
              aria-label={isPlaying ? 'Pause playback' : 'Play playback'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
            </button>
            <div className="text-sm font-mono font-bold text-[#e2e8f0]">
              {currentYear}
            </div>
          </div>
          <div className="text-xs text-[#64748b]">
            {formatTIV(tivValue)}
          </div>
        </div>
      ) : (
        <>
          {/* FULL VIEW - LEFT — PLAYBACK CONTROLS (160px) */}
          <div className="w-[160px] flex-shrink-0 flex items-center gap-4">
            <button
              onClick={handlePlayClick}
              className={`p-1.5 transition-colors focus:outline-none rounded-lg hover:bg-white/5 ${
                isPlaying ? 'text-[#e2e8f0]' : 'text-[#64748b] hover:text-[#e2e8f0]'
              }`}
              aria-label={isPlaying ? 'Pause playback' : 'Play playback'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
            </button>
        
        <div className="flex gap-1 bg-[#13161e] border border-[#1e2330] p-0.5 rounded-full">
          {[1, 2, 4].map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all focus:outline-none ${
                playbackSpeed === speed
                  ? 'text-[#e2e8f0] bg-[#3b82f6]/20 border border-[#3b82f6]/30'
                  : 'text-[#64748b] hover:text-[#e2e8f0] border border-transparent'
              }`}
            >
              {speed}×
            </button>
          ))}
        </div>
      </div>

        {/* FLOW LIMIT DROPDOWN */}

        {/* CENTER — SCRUBBER TRACK (flex-grow) */}
        <div className="flex-grow mx-8 flex items-center relative h-10">
        <div
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onTouchStart={(e) => {
            setIsDragging(true);
            const newYear = getYearFromX(e.touches[0].clientX);
            setYearRange([newYear, newYear]);
          }}
          className="relative w-full h-[4px] bg-[#1e2330] rounded-full cursor-pointer"
        >
          {/* Highlighted active portion */}
          <div
            className="absolute h-full bg-[#3b82f6] rounded-full"
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`
            }}
          />

          {/* Draggable circular handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -ml-[7px] w-[14px] h-[14px] bg-white rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.4)] pointer-events-none transition-transform duration-75"
            style={{ left: `${endPercent}%` }}
          />

          {/* Event markers */}
          {HISTORICAL_EVENTS.map((event) => {
            const percent = ((event.year - 1950) / 73) * 100;
            return (
              <div
                key={event.year}
                className="absolute top-1/2 -translate-y-1/2 w-4 h-6 flex items-center justify-center cursor-pointer group"
                style={{ left: `${percent}%`, transform: 'translateX(-50%)' }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setYearRange([event.year, event.year]);
                }}
              >
                {/* Visual Tick Mark */}
                <div className="w-[2px] h-[8px] bg-[#3b82f6]/50 rounded-full group-hover:bg-[#3b82f6] group-hover:h-[12px] transition-all" />

                {/* Tooltip */}
                <div className="absolute bottom-full mb-3 hidden group-hover:flex flex-col items-center pointer-events-none select-none z-50 animate-fade-in">
                  <div className="bg-[#13161e] border border-[#1e2330] text-[#e2e8f0] px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <span className="text-[#3b82f6] font-mono font-bold mr-1.5">{event.year}:</span>
                    {event.label}
                  </div>
                  {/* Tooltip Arrow */}
                  <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-[#1e2330] mt-[-1px]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT — YEAR DISPLAY (120px) */}
      <div className="w-[120px] flex-shrink-0 flex flex-col items-end justify-center">
        <div className="text-[24px] font-mono font-bold text-[#e2e8f0] leading-none">
          {currentYear}
        </div>
        <div className="text-[12px] text-[#64748b] mt-1 font-sans">
          {formatTIV(tivValue)}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
