import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import MapPage from './pages/MapPage';
import MethodologyPage from './pages/MethodologyPage';
import { Globe, ShieldAlert } from 'lucide-react';
import LoadingSpinner from './components/Loading/LoadingSpinner';

const ComparePage = lazy(() => import('./pages/ComparePage'));


export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary selection:bg-accent/20 selection:text-accent font-sans">
      <Analytics />
      {/* Persistent Global Header Navbar */}
      <Navbar />

      {/* Main Page Content Area */}
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/compare" element={<Suspense fallback={<div className='flex items-center justify-center h-full'><LoadingSpinner /></div>}><ComparePage /></Suspense>} />
          <Route path="/methodology" element={<MethodologyPage />} />
        </Routes>
      </main>

      {/* Persistent Premium Dark Footer */}
      <footer className="bg-background border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col gap-1 text-left">
            <div className="flex items-center gap-1.5 font-semibold text-text-primary">
              <Globe className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span>Arms Trade Flow Project</span>
            </div>
            <p className="text-text-muted">
              Built on ATT and SIPRI TIV volumes. Visualizing global transparency.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-text-muted">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-yellow-500/80" /> Open Source Initiative
            </span>
            <span>•</span>
            <span>© {new Date().getFullYear()} ATF</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
