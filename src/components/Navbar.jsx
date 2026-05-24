import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Shield, Map, ArrowLeftRight, BookOpen, ExternalLink } from 'lucide-react';

export default function Navbar() {
  const activeClass = ({ isActive }) =>
    `px-4 py-2 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 flex items-center gap-2 ${
      isActive
        ? 'bg-accent/15 text-accent border border-accent/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
        : 'text-text-muted hover:text-text-primary hover:bg-surface border border-transparent'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0c10] border-b border-[#1e2330] backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Branding Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent group-hover:scale-105 group-hover:bg-accent/20 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-text-primary group-hover:text-accent transition-colors duration-300">
            Arms Trade Flow
          </span>
        </Link>

        {/* Route Links */}
        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={activeClass}>
            <Map className="w-4 h-4" /> Map Tracker
          </NavLink>
          <NavLink to="/compare" className={activeClass}>
            <ArrowLeftRight className="w-4 h-4" /> Compare States
          </NavLink>
          <NavLink to="/methodology" className={activeClass}>
            <BookOpen className="w-4 h-4" /> Methodology
          </NavLink>
        </div>

        {/* Call to Action - GitHub link (Open Source theme) */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/ItsNotGold/Weapons-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-surface hover:bg-border text-xs text-text-primary font-medium rounded-xl border border-border transition-all duration-200"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-text-muted" />
          </a>

          {/* Small screen mobile dropdown toggler layout could be added if needed,
              but for now we provide a clean, premium horizontal responsive design */}
        </div>
      </div>
      
      {/* Mobile view footer drawer representation (clean responsive bar) */}
      <div className="md:hidden flex justify-around border-t border-[#1e2330] py-2 bg-[#0a0c10]/95 backdrop-blur-md">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center text-[10px] ${isActive ? 'text-accent' : 'text-text-muted'}`}>
          <Map className="w-4 h-4 mb-0.5" /> Map
        </NavLink>
        <NavLink to="/compare" className={({ isActive }) => `flex flex-col items-center text-[10px] ${isActive ? 'text-accent' : 'text-text-muted'}`}>
          <ArrowLeftRight className="w-4 h-4 mb-0.5" /> Compare
        </NavLink>
        <NavLink to="/methodology" className={({ isActive }) => `flex flex-col items-center text-[10px] ${isActive ? 'text-accent' : 'text-text-muted'}`}>
          <BookOpen className="w-4 h-4 mb-0.5" /> Methodology
        </NavLink>
      </div>
    </nav>
  );
}
