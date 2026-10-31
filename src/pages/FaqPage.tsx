import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const faqs = [
    {
      q: 'How do I explore land plots on ACRELYN?',
      a: 'Navigate to the Explore Lands page where you will find an interactive OpenStreetMap view paired side-by-side with property cards. You can filter by minimum and maximum budget, plot extent in square feet, facing direction, Chennai locality, and dataset classification.',
    },
    {
      q: 'What is the difference between "Public Advertised" and "Synthetic Demo" listings?',
      a: 'Public Advertised listings (ACR-REAL-001 through ACR-REAL-010) are authentic real estate records aggregated from public portals with source links and reported asking rates. Synthetic Demo listings (ACR-DEMO-001 to ACR-DEMO-290) are benchmark records generated solely for evaluating search filters, pricing algorithms, and spatial map rendering. Demo records are clearly badged and are not for sale.',
    },
    {
      q: 'What does "Advertised listing; not independently verified" mean?',
      a: 'It means the asking price, plot area, and facilities reflect the seller\'s public advertisement. ACRELYN has not performed title deed verification, encumbrance certificate (EC) validation, or DTCP/CMDA layout inspection. All buyers must perform complete legal due diligence with a qualified property advocate.',
    },
    {
      q: 'Are the map markers the exact boundary lines of the property?',
      a: 'No. Where exact survey parcel coordinates are unavailable (such as public advertised listings), we provide an approximate locality center point for geographic reference. This never implies or represents exact physical legal plot boundaries.',
    },
    {
      q: 'What land measurement units are used in Chennai and Tamil Nadu?',
      a: 'The most common units are Square Feet (sq.ft), Grounds, and Cents. 1 Ground equals 2,400 sq.ft. 1 Cent equals 435.6 sq.ft. 1 Acre equals 43,560 sq.ft (or 18.15 Grounds / 100 Cents). ACRELYN automatically converts plot extents into all standard formats.',
    },
    {
      q: 'How do I submit an enquiry and what happens next?',
      a: 'On any property detail page, complete the enquiry form with your name, verified email, and phone number. The submission is persisted directly to our Supabase database and assigned a status of "New". Our desk reviews the enquiry and follows up with verified documentation details.',
    },
    {
      q: 'Do I need to create an account to save or compare properties?',
      a: 'No. Anonymous visitors can bookmark plots and compare up to 4 land parcels. Your shortlisted properties are saved directly in your browser\'s local storage and remain available when you return.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#087F5B]">
          <Sparkles className="w-3.5 h-3.5 text-[#00E6A0]" />
          <span>Platform Guide</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#142B25]">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-[#71817A] leading-relaxed">
          Clear answers about exploring land, understanding verification classifications, and navigating transactions on ACRELYN.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-[#DCEBE4] p-6 space-y-2 hover:border-[#00E6A0] transition-all shadow-xs"
          >
            <h3 className="font-serif text-base font-bold text-[#142B25] flex items-start gap-2.5">
              <span className="text-[#087F5B] font-sans text-sm font-bold mt-0.5">Q.</span>
              <span>{faq.q}</span>
            </h3>
            <p className="text-sm text-[#71817A] pl-6 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-[#F7FAF8] border border-[#DCEBE4] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <h4 className="font-bold text-sm text-[#142B25]">Have an unanswered question?</h4>
          <p className="text-xs text-[#71817A] mt-0.5">Reach our enquiry desk directly for assistance.</p>
        </div>
        <Link
          to="/contact"
          className="px-5 py-2.5 bg-[#087F5B] hover:bg-[#066346] text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-[0_0_12px_rgba(0,230,160,0.3)]"
        >
          Contact Support Desk
        </Link>
      </div>
    </div>
  );
};
