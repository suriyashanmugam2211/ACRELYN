import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3 pb-6 border-b border-[#DCEBE4]">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#087F5B]">
          <Sparkles className="w-3.5 h-3.5 text-[#00E6A0]" />
          <span>Legal & Trust</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#142B25]">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#71817A]">
          Last revised: October 2026
        </p>
      </div>

      <div className="text-[#142B25] space-y-6 leading-relaxed">
        <section className="bg-white p-6 rounded-2xl border border-[#DCEBE4] space-y-2 shadow-xs">
          <h2 className="font-serif text-lg font-bold text-[#142B25]">
            1. Information We Collect
          </h2>
          <p className="text-sm text-[#71817A]">
            When you interact with ACRELYN, we collect the following categories of information:
          </p>
          <ul className="list-disc pl-5 text-sm text-[#71817A] space-y-1.5 pt-1">
            <li>
              <strong className="text-[#142B25]">Enquiry Information:</strong> When you submit a property enquiry or contact request, we collect your full name, email address, phone number, and specific message or property preferences.
            </li>
            <li>
              <strong className="text-[#142B25]">Local Preferences:</strong> Your saved properties and comparison lists are stored client-side in your web browser via LocalStorage. This data does not leave your device unless you submit an enquiry.
            </li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-[#DCEBE4] space-y-2 shadow-xs">
          <h2 className="font-serif text-lg font-bold text-[#142B25]">
            2. How Information is Used
          </h2>
          <p className="text-sm text-[#71817A]">
            Enquiry details are stored strictly in our secure database for the purpose of responding to your property questions, scheduling site inspections, and providing title documentation details. We do not sell or lease customer contact information to third-party telemarketers or external advertising networks.
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-[#DCEBE4] space-y-2 shadow-xs">
          <h2 className="font-serif text-lg font-bold text-[#142B25]">
            3. Data Retention and Security
          </h2>
          <p className="text-sm text-[#71817A]">
            Customer enquiries are stored using authenticated PostgreSQL database storage with Row Level Security (RLS) enforcement. Only authorized administrators possess access to read and update customer enquiry records.
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-[#DCEBE4] space-y-2 shadow-xs">
          <h2 className="font-serif text-lg font-bold text-[#142B25]">
            4. Contact
          </h2>
          <p className="text-sm text-[#71817A]">
            For inquiries regarding your stored enquiry data or requests to remove your contact information, please contact our desk at <strong className="text-[#087F5B]">privacy@acrelyn.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};
