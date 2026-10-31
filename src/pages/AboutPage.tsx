import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Compass, Search, FileText, ArrowRight, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#087F5B]">
          <Sparkles className="w-3.5 h-3.5 text-[#00E6A0]" />
          <span>About The Platform</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#142B25] leading-tight">
          A Transparent Standard for Land Discovery
        </h1>
        <p className="text-lg text-[#71817A] leading-relaxed">
          ACRELYN was conceived to solve the fundamental opacity and friction of discovering residential layouts, agricultural parcels, and development plots across Greater Chennai.
        </p>
      </div>

      {/* Purpose & Mission */}
      <div className="bg-white rounded-2xl border border-[#DCEBE4] p-8 space-y-4 shadow-xs">
        <h2 className="font-serif text-2xl font-bold text-[#142B25]">
          Why Land Discovery Needs Rigor
        </h2>
        <div className="text-sm text-[#142B25] space-y-3.5 leading-relaxed">
          <p>
            Unlike apartments or commercial office buildings with standard floor layouts, land transactions present unique informational hurdles: boundary ambiguity, varying unit measurements (sq.ft, Grounds, Cents, Acres), fluctuating local rates, and unverified broker claims.
          </p>
          <p>
            ACRELYN provides a structured, data-first marketplace where every parcel is recorded with computed rate-per-square-foot metrics, spatial coordinate references, road access specifications, and unambiguous verification markers.
          </p>
        </div>
      </div>

      {/* Three Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#F7FAF8] border border-[#DCEBE4] rounded-2xl p-6 space-y-3 shadow-2xs hover:border-[#00E6A0] transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#087F5B] text-white flex items-center justify-center font-bold text-sm">
            01
          </div>
          <h3 className="font-bold text-base text-[#142B25]">
            Normalized Metrics
          </h3>
          <p className="text-xs text-[#71817A] leading-relaxed">
            Every listing computes accurate price-per-square-foot ratios alongside Chennai units (Grounds & Cents), making value comparison straightforward.
          </p>
        </div>

        <div className="bg-[#F7FAF8] border border-[#DCEBE4] rounded-2xl p-6 space-y-3 shadow-2xs hover:border-[#00E6A0] transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#00E6A0] text-[#142B25] flex items-center justify-center font-bold text-sm shadow-[0_0_10px_#00E6A0]">
            02
          </div>
          <h3 className="font-bold text-base text-[#142B25]">
            Spatial Integrity
          </h3>
          <p className="text-xs text-[#71817A] leading-relaxed">
            Parcels are explored via interactive OpenStreetMap layers. Exact coordinates and approximate area centers are distinguished without exaggeration.
          </p>
        </div>

        <div className="bg-[#F7FAF8] border border-[#DCEBE4] rounded-2xl p-6 space-y-3 shadow-2xs hover:border-[#00E6A0] transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#087F5B] text-white flex items-center justify-center font-bold text-sm">
            03
          </div>
          <h3 className="font-bold text-base text-[#142B25]">
            Synthetic Transparency
          </h3>
          <p className="text-xs text-[#71817A] leading-relaxed">
            We clearly label testing and benchmark records with DEMO badges, ensuring buyers are never misled by synthetic data.
          </p>
        </div>
      </div>

      {/* The Discovery Process */}
      <div className="space-y-6">
        <h2 className="font-serif text-2xl font-bold text-[#142B25]">
          The Land Discovery Workflow
        </h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-[#087F5B] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#142B25]">Exploration & Parametric Filtering</h4>
              <p className="text-xs text-[#71817A] mt-1 leading-relaxed">
                Filter by budget range, corridor locality, plot extent, and facing orientation across our catalog of real advertised listings and benchmark layouts.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-[#087F5B] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#142B25]">Spatial & Spec Inspection</h4>
              <p className="text-xs text-[#71817A] mt-1 leading-relaxed">
                Review verified road access, electricity connections, DTCP/RERA mentions, and geographic neighborhood positioning.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-[#087F5B] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#142B25]">Direct Verified Enquiry</h4>
              <p className="text-xs text-[#71817A] mt-1 leading-relaxed">
                Submit specific inquiries through our secure portal to initiate title verification dossiers and site coordinate inspection.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-[#087F5B] text-white p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md border border-[#00E6A0]/20">
        <div>
          <h3 className="font-serif text-xl font-bold">Begin Exploring Chennai Land</h3>
          <p className="text-xs text-emerald-100/90 mt-1">
            Access 300 cataloged land parcels with computed metrics.
          </p>
        </div>
        <Link
          to="/explore"
          className="px-5 py-3 bg-[#00E6A0] hover:bg-[#00c98c] text-[#142B25] text-xs font-bold rounded-xl whitespace-nowrap shadow-[0_0_15px_rgba(0,230,160,0.4)] transition-all flex items-center gap-1.5"
        >
          <span>Open Explorer</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
