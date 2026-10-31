import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, MapPin, Compass, Building, Inbox, Sparkles } from 'lucide-react';
import type { Property, Enquiry } from '../../types/property';
import { repository } from '../../lib/storage';
import { formatINR } from '../../lib/formatters';

export const AdminAnalyticsPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([repository.getProperties(), repository.getEnquiries()]).then(
      ([props, enqs]) => {
        setProperties(props);
        setEnquiries(enqs);
        setLoading(false);
      }
    );
  }, []);

  // Compute breakdown by locality
  const locationStats = useMemo(() => {
    const counts: Record<string, number> = {};
    properties.forEach((p) => {
      const locKey = p.location.split(',')[0].trim();
      counts[locKey] = (counts[locKey] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [properties]);

  // Price Bracket Breakdown
  const priceBrackets = useMemo(() => {
    let under25L = 0;
    let from25to50L = 0;
    let from50to1Cr = 0;
    let above1Cr = 0;

    properties.forEach((p) => {
      if (p.price_inr < 2500000) under25L++;
      else if (p.price_inr <= 5000000) from25to50L++;
      else if (p.price_inr <= 10000000) from50to1Cr++;
      else above1Cr++;
    });

    return [
      { label: '< ₹25 Lakh', count: under25L },
      { label: '₹25L – ₹50L', count: from25to50L },
      { label: '₹50L – ₹1 Cr', count: from50to1Cr },
      { label: '> ₹1 Crore', count: above1Cr },
    ];
  }, [properties]);

  // Facing orientation breakdown
  const facingStats = useMemo(() => {
    const counts: Record<string, number> = {};
    properties.forEach((p) => {
      const f = p.facing || 'Not specified';
      counts[f] = (counts[f] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [properties]);

  // Enquiry status stats
  const enquiryStats = useMemo(() => {
    const counts: Record<string, number> = {
      New: 0,
      Contacted: 0,
      'In Progress': 0,
      Resolved: 0,
      Closed: 0,
    };
    enquiries.forEach((e) => {
      if (counts[e.status] !== undefined) counts[e.status]++;
    });
    return counts;
  }, [enquiries]);

  if (loading) {
    return <div className="p-8 text-xs text-[#71817A]">Computing analytics from Supabase...</div>;
  }

  const maxLocCount = locationStats.length > 0 ? locationStats[0][1] : 1;
  const maxPriceCount = Math.max(...priceBrackets.map((b) => b.count), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#087F5B] mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#00E6A0]" />
          <span>Quantitative Intelligence</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#142B25]">
          Marketplace Analytics & Distribution
        </h1>
        <p className="text-xs text-[#71817A] mt-1">
          Quantitative distribution across {properties.length} land records and {enquiries.length} customer interactions in Supabase
        </p>
      </div>

      {/* Grid of Visual Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Locality Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-[#DCEBE4] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-[#142B25] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#087F5B]" />
              <span>Top Chennai Corridors by Inventory</span>
            </h3>
            <span className="text-[11px] text-[#71817A] font-semibold">Plots Cataloged</span>
          </div>

          <div className="space-y-3 pt-2">
            {locationStats.map(([loc, count]) => {
              const pct = Math.round((count / maxLocCount) * 100);
              return (
                <div key={loc} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#142B25]">{loc}</span>
                    <span className="text-[#087F5B] tabular-nums font-bold">{count}</span>
                  </div>
                  <div className="h-2 w-full bg-[#F7FAF8] rounded-full overflow-hidden border border-[#DCEBE4]">
                    <div
                      className="h-full bg-gradient-to-r from-[#087F5B] to-[#00E6A0] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-[#DCEBE4] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-[#142B25] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#087F5B]" />
              <span>Price Bracket Distribution</span>
            </h3>
            <span className="text-[11px] text-[#71817A] font-semibold">Listing Volumes</span>
          </div>

          <div className="space-y-3 pt-2">
            {priceBrackets.map((bracket) => {
              const pct = Math.round((bracket.count / maxPriceCount) * 100);
              return (
                <div key={bracket.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#142B25]">{bracket.label}</span>
                    <span className="text-[#087F5B] tabular-nums font-bold">{bracket.count}</span>
                  </div>
                  <div className="h-2 w-full bg-[#F7FAF8] rounded-full overflow-hidden border border-[#DCEBE4]">
                    <div
                      className="h-full bg-gradient-to-r from-[#087F5B] to-[#00E6A0] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Facing Direction Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-[#DCEBE4] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-[#142B25] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#087F5B]" />
              <span>Facing Orientation Breakdown</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {facingStats.map(([f, count]) => (
              <div key={f} className="p-3 bg-[#F7FAF8] rounded-xl border border-[#DCEBE4] flex items-center justify-between text-xs">
                <span className="font-bold text-[#142B25]">{f}</span>
                <span className="font-extrabold text-[#087F5B] tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inbound Enquiry Funnel */}
        <div className="bg-white p-6 rounded-2xl border border-[#DCEBE4] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-[#142B25] flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[#087F5B]" />
              <span>Customer Lead Pipeline</span>
            </h3>
            <span className="text-[11px] font-bold text-[#087F5B] bg-[#B8FFE5]/50 px-2.5 py-0.5 rounded-md border border-[#00E6A0]/40">
              {enquiries.length} Total Inquiries
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {Object.entries(enquiryStats).map(([status, count]) => (
              <div key={status} className="p-3 bg-[#F7FAF8] rounded-xl border border-[#DCEBE4] text-xs">
                <div className="text-[11px] font-semibold text-[#71817A]">{status}</div>
                <div className="text-xl font-extrabold text-[#142B25] mt-1 tabular-nums">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
