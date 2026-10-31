import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, X, Plus, Check, ArrowRight, AlertTriangle, Trash2, Search, Sparkles } from 'lucide-react';
import type { Property } from '../types/property';
import { repository } from '../lib/storage';
import { formatINR, formatPlotArea, formatPricePerSqft } from '../lib/formatters';
import { LAND_IMAGE_GALLERY } from '../lib/dataset';

export const ComparePage: React.FC = () => {
  const [comparedProperties, setComparedProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [modalSearch, setModalSearch] = useState<string>('');

  const loadComparison = async () => {
    const all = await repository.getProperties();
    setAllProperties(all);
    const compareIds = repository.getComparisonIds();
    const matched = compareIds
      .map((id) => all.find((p) => p.property_id === id))
      .filter((p): p is Property => Boolean(p));
    setComparedProperties(matched);
    setLoading(false);
  };

  useEffect(() => {
    loadComparison();
    const unsub = repository.subscribe('compare', () => {
      loadComparison();
    });
    return unsub;
  }, []);

  const handleRemove = (propertyId: string) => {
    repository.toggleCompareProperty(propertyId);
  };

  const handleClearAll = () => {
    repository.clearComparison();
  };

  const handleAddProperty = (propertyId: string) => {
    repository.toggleCompareProperty(propertyId);
    setShowAddModal(false);
    setModalSearch('');
  };

  // Find lowest price & largest area among compared properties
  const lowestPrice = comparedProperties.length > 1
    ? Math.min(...comparedProperties.map((p) => p.price_inr))
    : null;

  const largestArea = comparedProperties.length > 1
    ? Math.max(...comparedProperties.map((p) => p.plot_area_sqft))
    : null;

  const lowestRate = comparedProperties.length > 1
    ? Math.min(...comparedProperties.map((p) => p.price_per_sqft_inr))
    : null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-8 w-48 bg-white border border-[#DCEBE4] animate-pulse rounded mb-6" />
        <div className="h-96 bg-white border border-[#DCEBE4] animate-pulse rounded-2xl" />
      </div>
    );
  }

  const availableToAdd = allProperties
    .filter((p) => !comparedProperties.some((cp) => cp.property_id === p.property_id))
    .filter((p) => {
      if (!modalSearch.trim()) return true;
      const q = modalSearch.toLowerCase();
      return (
        p.property_name.toLowerCase().includes(q) ||
        p.property_id.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#DCEBE4]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#087F5B] mb-1">
            <Scale className="w-3.5 h-3.5 text-[#00E6A0]" />
            <span>Side-by-Side Matrix</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#142B25]">
            Property Comparison
          </h1>
          <p className="text-sm text-[#71817A] mt-1">
            Compare key metrics across up to 4 land parcels to evaluate relative value.
          </p>
        </div>

        {comparedProperties.length > 0 && (
          <div className="flex items-center gap-3">
            {comparedProperties.length < 4 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#087F5B] hover:bg-[#066346] rounded-xl transition-all shadow-xs hover:shadow-[0_0_12px_rgba(0,230,160,0.3)]"
              >
                <Plus className="w-3.5 h-3.5 text-[#00E6A0]" />
                <span>Add Property ({comparedProperties.length}/4)</span>
              </button>
            )}

            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* Comparison Matrix or Empty State */}
      {comparedProperties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCEBE4] p-16 text-center max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#F7FAF8] border border-[#DCEBE4] text-[#087F5B] flex items-center justify-center mx-auto">
            <Scale className="w-8 h-8 text-[#087F5B]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#142B25]">
            No Properties in Comparison
          </h2>
          <p className="text-sm text-[#71817A] leading-relaxed">
            Select up to 4 land parcels from the Explorer or details pages to compare pricing, plot areas, facing orientations, and facilities side-by-side.
          </p>
          <div className="pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#087F5B] hover:bg-[#066346] text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:shadow-[0_0_15px_rgba(0,230,160,0.3)]"
            >
              <span>Browse Plots to Compare</span>
              <ArrowRight className="w-4 h-4 text-[#00E6A0]" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#DCEBE4] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DCEBE4] bg-[#F7FAF8]">
                  <th className="p-4 w-48 text-xs font-bold text-[#71817A] uppercase tracking-wider">
                    Specification
                  </th>
                  {comparedProperties.map((p) => (
                    <th key={p.property_id} className="p-4 min-w-[240px] max-w-[280px] align-top">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-[10px] font-bold text-[#087F5B] bg-[#B8FFE5]/40 border border-[#00E6A0]/40 px-2 py-0.5 rounded-md">
                          {p.property_id}
                        </span>
                        <button
                          onClick={() => handleRemove(p.property_id)}
                          className="p-1 rounded-lg text-[#71817A] hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <Link
                        to={`/property/${p.property_id}`}
                        className="font-serif font-bold text-base text-[#142B25] hover:text-[#087F5B] line-clamp-2 transition-colors"
                      >
                        {p.property_name}
                      </Link>
                    </th>
                  ))}
                  {/* Empty Slot for adding up to 4 */}
                  {comparedProperties.length < 4 && (
                    <th className="p-4 min-w-[200px] bg-slate-50/50 border-l border-dashed border-[#DCEBE4] align-middle text-center">
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="p-4 rounded-xl border-2 border-dashed border-[#DCEBE4] hover:border-[#00E6A0] hover:bg-white transition-all text-xs font-bold text-[#087F5B] flex flex-col items-center gap-2 mx-auto"
                      >
                        <Plus className="w-5 h-5 text-[#00E6A0]" />
                        <span>Add Slot ({comparedProperties.length + 1}/4)</span>
                      </button>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCEBE4] text-xs">
                {/* Image */}
                <tr>
                  <td className="p-4 font-bold text-[#71817A] bg-[#F7FAF8]">
                    Overview
                  </td>
                  {comparedProperties.map((p, idx) => (
                    <td key={p.property_id} className="p-4">
                      <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-[#DCEBE4]">
                        <img
                          src={p.cover_image || p.image_urls?.[0] || LAND_IMAGE_GALLERY[idx % LAND_IMAGE_GALLERY.length]}
                          alt={p.property_name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = LAND_IMAGE_GALLERY[idx % LAND_IMAGE_GALLERY.length];
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                  ))}
                  {comparedProperties.length < 4 && <td className="bg-slate-50/50" />}
                </tr>

                {/* Price */}
                <tr>
                  <td className="p-4 font-bold text-[#71817A] bg-[#F7FAF8]">
                    Price
                  </td>
                  {comparedProperties.map((p) => {
                    const isLowest = lowestPrice !== null && p.price_inr === lowestPrice;
                    return (
                      <td key={p.property_id} className="p-4">
                        <div className="text-base font-extrabold text-[#087F5B] tabular-nums">
                          {formatINR(p.price_inr)}
                        </div>
                        {isLowest && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-[#087F5B] bg-[#B8FFE5]/60 border border-[#00E6A0]/40 px-2 py-0.5 rounded-md">
                            Lowest Price
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {comparedProperties.length < 4 && <td className="bg-slate-50/50" />}
                </tr>

                {/* Plot Area */}
                <tr>
                  <td className="p-4 font-bold text-[#71817A] bg-[#F7FAF8]">
                    Plot Area
                  </td>
                  {comparedProperties.map((p) => {
                    const isLargest = largestArea !== null && p.plot_area_sqft === largestArea;
                    return (
                      <td key={p.property_id} className="p-4">
                        <div className="font-bold text-[#142B25] tabular-nums text-sm">
                          {p.plot_area_sqft.toLocaleString('en-IN')} sq.ft
                        </div>
                        <div className="text-[11px] text-[#71817A] mt-0.5 font-medium">
                          {formatPlotArea(p.plot_area_sqft)}
                        </div>
                        {isLargest && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-[#087F5B] bg-[#B8FFE5]/60 border border-[#00E6A0]/40 px-2 py-0.5 rounded-md">
                            Largest Extent
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {comparedProperties.length < 4 && <td className="bg-slate-50/50" />}
                </tr>

                {/* Rate per sqft */}
                <tr>
                  <td className="p-4 font-bold text-[#71817A] bg-[#F7FAF8]">
                    Rate / sq.ft
                  </td>
                  {comparedProperties.map((p) => {
                    const isBestRate = lowestRate !== null && p.price_per_sqft_inr === lowestRate;
                    return (
                      <td key={p.property_id} className="p-4 tabular-nums">
                        <div className="font-bold text-[#142B25]">
                          {formatPricePerSqft(p.price_per_sqft_inr)}
                        </div>
                        {isBestRate && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-[#087F5B] bg-[#B8FFE5] border border-[#00E6A0] px-2 py-0.5 rounded-md shadow-2xs">
                            Best Rate / sq.ft
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {comparedProperties.length < 4 && <td className="bg-slate-50/50" />}
                </tr>

                {/* Location */}
                <tr>
                  <td className="p-4 font-bold text-[#71817A] bg-[#F7FAF8]">
                    Location
                  </td>
                  {comparedProperties.map((p) => (
                    <td key={p.property_id} className="p-4 text-[#142B25] font-medium">
                      {p.location}
                    </td>
                  ))}
                  {comparedProperties.length < 4 && <td className="bg-slate-50/50" />}
                </tr>

                {/* Facing */}
                <tr>
                  <td className="p-4 font-bold text-[#71817A] bg-[#F7FAF8]">
                    Facing
                  </td>
                  {comparedProperties.map((p) => (
                    <td key={p.property_id} className="p-4 font-medium text-[#142B25]">
                      {p.facing || 'Not specified'}
                    </td>
                  ))}
                  {comparedProperties.length < 4 && <td className="bg-slate-50/50" />}
                </tr>

                {/* Land Type */}
                <tr>
                  <td className="p-4 font-bold text-[#71817A] bg-[#F7FAF8]">
                    Category
                  </td>
                  {comparedProperties.map((p) => (
                    <td key={p.property_id} className="p-4 text-[#142B25] font-medium">
                      {p.land_type}
                    </td>
                  ))}
                  {comparedProperties.length < 4 && <td className="bg-slate-50/50" />}
                </tr>

                {/* Facilities */}
                <tr>
                  <td className="p-4 font-bold text-[#71817A] bg-[#F7FAF8]">
                    Facilities
                  </td>
                  {comparedProperties.map((p) => (
                    <td key={p.property_id} className="p-4 text-[#71817A] leading-relaxed">
                      {p.facilities || 'Standard residential layout access'}
                    </td>
                  ))}
                  {comparedProperties.length < 4 && <td className="bg-slate-50/50" />}
                </tr>

                {/* Classification */}
                <tr>
                  <td className="p-4 font-bold text-[#71817A] bg-[#F7FAF8]">
                    Catalog
                  </td>
                  {comparedProperties.map((p) => (
                    <td key={p.property_id} className="p-4">
                      {p.data_type === 'DEMO_SYNTHETIC' ? (
                        <span className="inline-block text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                          Synthetic Demo
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-bold text-[#087F5B] bg-[#B8FFE5] border border-[#00E6A0] px-2 py-0.5 rounded-md">
                          Public Advertised
                        </span>
                      )}
                    </td>
                  ))}
                  {comparedProperties.length < 4 && <td className="bg-slate-50/50" />}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="p-4 font-bold text-[#71817A] bg-[#F7FAF8]">
                    Actions
                  </td>
                  {comparedProperties.map((p) => (
                    <td key={p.property_id} className="p-4">
                      <Link
                        to={`/property/${p.property_id}`}
                        className="w-full text-center py-2.5 px-3 bg-[#087F5B] hover:bg-[#066346] text-white text-xs font-bold rounded-xl block transition-all shadow-sm hover:shadow-[0_0_10px_rgba(0,230,160,0.3)]"
                      >
                        View Full Dossier
                      </Link>
                    </td>
                  ))}
                  {comparedProperties.length < 4 && <td className="bg-slate-50/50" />}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal to add a property to comparison */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col shadow-2xl border border-[#DCEBE4]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCEBE4]">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#087F5B]" />
                <h3 className="font-serif text-lg font-bold text-[#142B25]">
                  Select Plot to Compare
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setModalSearch('');
                }}
                className="p-1.5 rounded-lg text-[#71817A] hover:bg-[#F7FAF8] hover:text-[#142B25]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick search inside modal */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#71817A] absolute left-3 top-3" />
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Search plot name, ID, or locality..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
              />
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {availableToAdd.slice(0, 30).map((p) => (
                <div
                  key={p.property_id}
                  onClick={() => handleAddProperty(p.property_id)}
                  className="p-3 rounded-xl border border-[#DCEBE4] hover:border-[#00E6A0] hover:bg-[#F7FAF8] cursor-pointer flex items-center justify-between transition-all"
                >
                  <div>
                    <div className="font-mono text-[10px] text-[#087F5B] font-bold">{p.property_id}</div>
                    <div className="font-bold text-sm text-[#142B25]">{p.property_name}</div>
                    <div className="text-xs text-[#71817A]">
                      {p.location} • {formatPlotArea(p.plot_area_sqft)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#087F5B]">{formatINR(p.price_inr)}</div>
                    <div className="text-[11px] text-[#087F5B] font-bold mt-1 inline-flex items-center gap-1">
                      <span>Add +</span>
                    </div>
                  </div>
                </div>
              ))}
              {availableToAdd.length === 0 && (
                <div className="p-8 text-center text-xs text-[#71817A]">
                  No matching plots found for "{modalSearch}".
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
