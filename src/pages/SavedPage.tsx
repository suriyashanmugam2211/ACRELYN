import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowRight, Trash2, Search, Sparkles, Check } from 'lucide-react';
import type { Property } from '../types/property';
import { repository } from '../lib/storage';
import { PropertyCard } from '../components/property/PropertyCard';

export const SavedPage: React.FC = () => {
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  const loadSaved = async () => {
    const all = await repository.getProperties();
    const savedIds = repository.getSavedPropertyIds();
    const matched = all.filter((p) => savedIds.includes(p.property_id));
    setSavedProperties(matched);
    setLoading(false);
  };

  useEffect(() => {
    loadSaved();
    const unsub = repository.subscribe('saved', () => {
      loadSaved();
    });
    return unsub;
  }, []);

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    savedProperties.forEach((p) => repository.toggleSaveProperty(p.property_id));
    setConfirmClear(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-8 w-48 bg-white border border-[#DCEBE4] animate-pulse rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-white border border-[#DCEBE4] animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#DCEBE4]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#087F5B] mb-1">
            <Bookmark className="w-3.5 h-3.5 text-[#00E6A0]" />
            <span>Personal Shortlist</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#142B25]">
            Saved Land Parcels
          </h1>
          <p className="text-sm text-[#71817A] mt-1">
            Properties bookmarked for inspection and comparison.
          </p>
        </div>

        {savedProperties.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#71817A] font-semibold tabular-nums">
              {savedProperties.length} plot{savedProperties.length === 1 ? '' : 's'} saved
            </span>
            <button
              onClick={handleClearAll}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all border ${
                confirmClear
                  ? 'bg-red-600 text-white border-red-600 shadow-md animate-pulse'
                  : 'text-red-700 bg-red-50 hover:bg-red-100 border-red-200'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmClear ? 'Click again to confirm' : 'Clear All'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {savedProperties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCEBE4] p-16 text-center max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#F7FAF8] border border-[#DCEBE4] text-[#087F5B] flex items-center justify-center mx-auto shadow-xs">
            <Bookmark className="w-8 h-8 text-[#087F5B]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#142B25]">
            No Saved Properties Yet
          </h2>
          <p className="text-sm text-[#71817A] leading-relaxed">
            As you explore land listings across Chennai, click the bookmark icon on any property card to save plots here for quick access and comparison.
          </p>
          <div className="pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#087F5B] hover:bg-[#066346] text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:shadow-[0_0_15px_rgba(0,230,160,0.3)]"
            >
              <Search className="w-4 h-4 text-[#00E6A0]" />
              <span>Explore Available Plots</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map((property) => (
            <PropertyCard key={property.property_id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};
