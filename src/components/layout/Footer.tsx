import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, ExternalLink, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B3D2E] text-white border-t border-[#087F5B]/30 mt-24 relative overflow-hidden">
      {/* Subtle neon gradient ambient background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00E6A0]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#087F5B] flex items-center justify-center text-white shadow-sm transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(0,230,160,0.5)] border border-[#00E6A0]/40">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 22 22 22" fill="#00E6A0" fillOpacity="0.4" />
                  <line x1="12" y1="2" x2="12" y2="22" stroke="#00E6A0" />
                </svg>
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-[#00E6A0] transition-colors">
                ACRELYN
              </span>
            </Link>
            <p className="text-sm text-emerald-100/80 max-w-sm leading-relaxed">
              Discover Land. Build Your Future. A structured land marketplace for exploring residential, commercial, and plotted development parcels with transparent pricing and verified metadata across Chennai and South India.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-200/80 pt-1">
              <MapPin className="w-4 h-4 text-[#00E6A0]" />
              <span>Covering Greater Chennai & Tamil Nadu Corridors</span>
            </div>
          </div>

          {/* Column 2: Marketplace */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#00E6A0] mb-4 flex items-center gap-1.5">
              <span>Marketplace</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-emerald-100/80">
              <li>
                <Link to="/explore" className="hover:text-[#00E6A0] transition-colors">
                  Explore Lands
                </Link>
              </li>
              <li>
                <Link to="/explore?type=REAL_ADVERTISED" className="hover:text-[#00E6A0] transition-colors">
                  Advertised Listings
                </Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-[#00E6A0] transition-colors">
                  Saved Properties
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-[#00E6A0] transition-colors">
                  Property Comparison
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#00E6A0] mb-4">
              Platform & Support
            </h4>
            <ul className="space-y-2.5 text-sm text-emerald-100/80">
              <li>
                <Link to="/about" className="hover:text-[#00E6A0] transition-colors">
                  About ACRELYN
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#00E6A0] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#00E6A0] transition-colors">
                  Contact Enquiry Desk
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-[#00E6A0] transition-colors flex items-center gap-1">
                  <span>Admin Management</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Transparency */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#00E6A0] mb-4">
              Transparency & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-emerald-100/80">
              <li>
                <Link to="/terms" className="hover:text-[#00E6A0] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#00E6A0] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-xl bg-[#07271D] border border-emerald-800/40 text-[11px] text-emerald-200/80 leading-normal">
              <div className="flex items-center gap-1.5 font-semibold text-[#00E6A0] mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00E6A0]" />
                <span>Verification Policy</span>
              </div>
              Synthetic records are prominently flagged with DEMO notices. Advertised records require independent document verification before financial commitments.
            </div>
          </div>
        </div>

        {/* Legal Disclaimer & Bottom strip */}
        <div className="mt-14 pt-8 border-t border-emerald-900/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-emerald-200/60">
          <p>
            © {new Date().getFullYear()} ACRELYN Land Marketplace. All rights reserved.
          </p>
          <p className="text-center md:text-right max-w-2xl text-[11px] text-emerald-300/60">
            Disclaimer: ACRELYN aggregates public real estate listing data and provides testing demo records. We do not provide legal title insurance or property brokerage representation. Buyers must perform independent due diligence with certified legal counsel.
          </p>
        </div>
      </div>
    </footer>
  );
};
