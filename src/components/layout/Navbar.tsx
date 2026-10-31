import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bookmark, Scale, Menu, X, Shield, ArrowUpRight, Sparkles } from 'lucide-react';
import { repository } from '../../lib/storage';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [compareCount, setCompareCount] = useState<number>(0);
  const [adminLoggedIn, setAdminLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    setSavedCount(repository.getSavedPropertyIds().length);
    setCompareCount(repository.getComparisonIds().length);
    setAdminLoggedIn(Boolean(repository.getAdminSession()));

    const unsubSaved = repository.subscribe('saved', (ids: string[]) => setSavedCount(ids.length));
    const unsubCompare = repository.subscribe('compare', (ids: string[]) => setCompareCount(ids.length));
    const unsubAdmin = repository.subscribe('admin', (admin: any) => setAdminLoggedIn(Boolean(admin)));

    return () => {
      unsubSaved();
      unsubCompare();
      unsubAdmin();
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Explore Lands', href: '/explore' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#F7FAF8]/95 backdrop-blur-md border-b border-[#DCEBE4]">
      {/* Strict 3-zone contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-[#087F5B] flex items-center justify-center text-white shadow-sm transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(0,230,160,0.5)] border border-[#00E6A0]/40">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 22 22 22" fill="#00E6A0" fillOpacity="0.4" />
              <line x1="12" y1="2" x2="12" y2="22" stroke="#00E6A0" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#142B25] group-hover:text-[#087F5B] transition-colors whitespace-nowrap">
              ACRELYN
            </span>
          </div>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#71817A]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`transition-colors whitespace-nowrap py-1 relative ${
                isActive(link.href)
                  ? 'text-[#087F5B] font-semibold'
                  : 'hover:text-[#087F5B]'
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00E6A0] rounded-full shadow-[0_0_8px_#00E6A0]" />
              )}
            </Link>
          ))}

          {/* Saved properties button */}
          <Link
            to="/saved"
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap py-1 relative ${
              isActive('/saved') ? 'text-[#087F5B] font-semibold' : 'hover:text-[#087F5B]'
            }`}
          >
            <Bookmark className="w-4 h-4 text-[#71817A]" />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="tabular-nums text-xs font-semibold px-2 py-0.5 bg-[#087F5B] text-white rounded-full shadow-[0_0_8px_rgba(0,230,160,0.4)]">
                {savedCount}
              </span>
            )}
          </Link>

          {/* Compare properties button */}
          <Link
            to="/compare"
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap py-1 relative ${
              isActive('/compare') ? 'text-[#087F5B] font-semibold' : 'hover:text-[#087F5B]'
            }`}
          >
            <Scale className="w-4 h-4 text-[#71817A]" />
            <span>Compare</span>
            {compareCount > 0 && (
              <span className="tabular-nums text-xs font-semibold px-2 py-0.5 bg-[#00E6A0] text-[#142B25] rounded-full shadow-[0_0_8px_#00E6A0]">
                {compareCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Zone 3: Primary Action / Admin Portal */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {adminLoggedIn ? (
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#087F5B] hover:bg-[#066347] rounded-lg transition-all shadow-sm hover:shadow-[0_0_15px_rgba(0,230,160,0.35)] whitespace-nowrap border border-[#00E6A0]/30"
            >
              <Shield className="w-3.5 h-3.5 text-[#00E6A0]" />
              <span>Admin Console</span>
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#142B25] bg-white border border-[#DCEBE4] hover:border-[#00E6A0] hover:text-[#087F5B] rounded-lg transition-all hover:shadow-[0_0_12px_rgba(0,230,160,0.2)] whitespace-nowrap"
            >
              <Shield className="w-3.5 h-3.5 text-[#71817A]" />
              <span>Admin Login</span>
            </Link>
          )}

          <Link
            to="/explore"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#142B25] bg-[#00E6A0] hover:bg-[#00D494] rounded-lg transition-all shadow-[0_0_14px_rgba(0,230,160,0.4)] hover:shadow-[0_0_20px_rgba(0,230,160,0.6)] whitespace-nowrap active:scale-[0.98]"
          >
            <span>Browse Plots</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#142B25]" />
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to="/saved"
            aria-label="Saved properties"
            className="p-2 text-[#71817A] hover:text-[#087F5B] relative"
          >
            <Bookmark className="w-5 h-5" />
            {savedCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 text-[10px] bg-[#087F5B] text-white rounded-full flex items-center justify-center font-bold shadow-[0_0_6px_#00E6A0]">
                {savedCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#142B25] hover:bg-[#DCEBE4]/60 rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#DCEBE4] bg-[#FFFFFF] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200 shadow-xl">
          <div className="flex flex-col space-y-1">
            <Link
              to="/explore"
              className="px-3 py-2.5 text-base font-semibold rounded-lg text-[#087F5B] hover:bg-[#F7FAF8]"
            >
              Explore Lands
            </Link>
            <Link
              to="/saved"
              className="px-3 py-2.5 text-base font-medium rounded-lg text-[#142B25] hover:bg-[#F7FAF8] flex items-center justify-between"
            >
              <span>Saved Properties</span>
              {savedCount > 0 && (
                <span className="text-xs px-2 py-0.5 bg-[#087F5B] text-white rounded-full shadow-[0_0_6px_#00E6A0]">
                  {savedCount}
                </span>
              )}
            </Link>
            <Link
              to="/compare"
              className="px-3 py-2.5 text-base font-medium rounded-lg text-[#142B25] hover:bg-[#F7FAF8] flex items-center justify-between"
            >
              <span>Compare Properties</span>
              {compareCount > 0 && (
                <span className="text-xs px-2 py-0.5 bg-[#00E6A0] text-[#142B25] font-bold rounded-full">
                  {compareCount}
                </span>
              )}
            </Link>
            <Link
              to="/about"
              className="px-3 py-2.5 text-base font-medium rounded-lg text-[#142B25] hover:bg-[#F7FAF8]"
            >
              About ACRELYN
            </Link>
            <Link
              to="/contact"
              className="px-3 py-2.5 text-base font-medium rounded-lg text-[#142B25] hover:bg-[#F7FAF8]"
            >
              Contact Support
            </Link>
            <Link
              to="/faq"
              className="px-3 py-2.5 text-base font-medium rounded-lg text-[#142B25] hover:bg-[#F7FAF8]"
            >
              Frequently Asked Questions
            </Link>
          </div>

          <div className="pt-3 border-t border-[#DCEBE4] flex flex-col gap-2">
            {adminLoggedIn ? (
              <Link
                to="/admin/dashboard"
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#087F5B] rounded-lg shadow-sm"
              >
                Go to Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="w-full text-center py-2.5 text-sm font-semibold text-[#087F5B] bg-[#F7FAF8] border border-[#DCEBE4] rounded-lg hover:border-[#00E6A0]"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
