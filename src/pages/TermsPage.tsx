import React from 'react';
import { Sparkles } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3 pb-6 border-b border-[#DCEBE4]">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#087F5B]">
          <Sparkles className="w-3.5 h-3.5 text-[#00E6A0]" />
          <span>Legal & Operational Terms</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#142B25]">
          Terms of Service
        </h1>
        <p className="text-xs text-[#71817A]">
          Last revised: October 2026
        </p>
      </div>

      <div className="text-[#142B25] space-y-6 leading-relaxed">
        <section className="bg-white p-6 rounded-2xl border border-[#DCEBE4] space-y-2 shadow-xs">
          <h2 className="font-serif text-lg font-bold text-[#142B25]">
            1. Nature of the Platform
          </h2>
          <p className="text-sm text-[#71817A]">
            ACRELYN operates as an informational land discovery marketplace and aggregation interface. ACRELYN is not a licensed real estate broker, certified land surveyor, title insurance company, or legal advocate.
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-[#DCEBE4] space-y-2 shadow-xs">
          <h2 className="font-serif text-lg font-bold text-[#142B25]">
            2. Advertised vs. Verified Listings
          </h2>
          <p className="text-sm text-[#71817A]">
            Information regarding publicly advertised properties—including asking price, plot extent, facing direction, DTCP/RERA approvals, and listed facilities—is sourced from public portals and seller submissions. This data is subject to change, prior sale, or seller repricing. Users are strictly advised to verify title deeds, encumbrance certificates (EC), revenue sketch maps (FMB), and planning permissions directly with local authorities before making financial commitments.
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-[#DCEBE4] space-y-2 shadow-xs">
          <h2 className="font-serif text-lg font-bold text-[#142B25]">
            3. Synthetic Demonstration Data
          </h2>
          <p className="text-sm text-[#71817A]">
            Properties identified with the <strong className="text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md font-bold">DEMO_SYNTHETIC</strong> tag are artificial records provided solely for software testing, interface demonstration, and spatial algorithm validation. They are explicitly not available for sale, lease, or acquisition.
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-[#DCEBE4] space-y-2 shadow-xs">
          <h2 className="font-serif text-lg font-bold text-[#142B25]">
            4. Geographic Coordinates & Map Representations
          </h2>
          <p className="text-sm text-[#71817A]">
            Map pins provided on ACRELYN represent either approximate area centers or illustrative coordinate references. Under no circumstance should a digital pin be construed as an exact cadastral property boundary or physical pegging survey.
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-[#DCEBE4] space-y-2 shadow-xs">
          <h2 className="font-serif text-lg font-bold text-[#142B25]">
            5. Limitation of Liability
          </h2>
          <p className="text-sm text-[#71817A]">
            ACRELYN shall not be liable for any financial losses, contractual disputes, title defects, or boundary discrepancies arising from transactions conducted based on listing information displayed on this website. Users must engage independent legal counsel for conveyancing.
          </p>
        </section>
      </div>
    </div>
  );
};
