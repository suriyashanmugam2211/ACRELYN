import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Map as MapIcon,
  List as ListIcon,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
} from 'lucide-react';
import type { Property, SortOption } from '../types/property';
import { repository } from '../lib/storage';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyMap } from '../components/map/PropertyMap';

const ITEMS_PER_PAGE = 12;

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<string | null>(null);

  // Mobile list/map view tab ('list' | 'map')
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filters initialized from URL search params
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [selectedLocation, setSelectedLocation] = useState<string>(searchParams.get('location') || '');
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '');
  const [minArea, setMinArea] = useState<string>(searchParams.get('minArea') || '');
  const [maxArea, setMaxArea] = useState<string>(searchParams.get('maxArea') || '');
  const [facing, setFacing] = useState<string>(searchParams.get('facing') || '');
  const [dataType, setDataType] = useState<string>(searchParams.get('type') || 'ALL');
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'recently_added');

  // Load properties
  useEffect(() => {
    let mounted = true;
    repository.getProperties().then((data) => {
      if (mounted) {
        setProperties(data);
        setLoading(false);
      }
    });

    const unsub = repository.subscribe('properties', (updated: Property[]) => {
      setProperties(updated);
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  // Sync URL search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedLocation) params.set('location', selectedLocation);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minArea) params.set('minArea', minArea);
    if (maxArea) params.set('maxArea', maxArea);
    if (facing) params.set('facing', facing);
    if (dataType && dataType !== 'ALL') params.set('type', dataType);
    if (sortBy && sortBy !== 'recently_added') params.set('sort', sortBy);

    setSearchParams(params, { replace: true });
    setCurrentPage(1); // Reset page on filter changes
  }, [searchQuery, selectedLocation, minPrice, maxPrice, minArea, maxArea, facing, dataType, sortBy, setSearchParams]);

  // Extract unique locations for filter dropdown
  const uniqueLocations = useMemo(() => {
    const locSet = new Set<string>();
    properties.forEach((p) => {
      const parts = p.location.split(',');
      parts.forEach((part) => {
        const clean = part.replace('Chennai region', '').replace('Chennai', '').trim();
        if (clean.length > 2) locSet.add(clean);
      });
    });
    return Array.from(locSet).sort();
  }, [properties]);

  // Filtered and Sorted properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // 1. Text Search: city, locality, area, property name, property ID
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.property_name.toLowerCase().includes(q);
        const matchesId = p.property_id.toLowerCase().includes(q);
        const matchesLocation = p.location.toLowerCase().includes(q);
        const matchesFacilities = p.facilities.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesLocation && !matchesFacilities) {
          return false;
        }
      }

      // 2. Location
      if (selectedLocation && !p.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }

      // 3. Price
      if (minPrice && p.price_inr < parseFloat(minPrice)) return false;
      if (maxPrice && p.price_inr > parseFloat(maxPrice)) return false;

      // 4. Area
      if (minArea && p.plot_area_sqft < parseFloat(minArea)) return false;
      if (maxArea && p.plot_area_sqft > parseFloat(maxArea)) return false;

      // 5. Facing
      if (facing && facing !== 'ANY') {
        if (!p.facing.toLowerCase().includes(facing.toLowerCase())) return false;
      }

      // 6. Data Type
      if (dataType === 'REAL_ADVERTISED' && p.data_type !== 'REAL_ADVERTISED') return false;
      if (dataType === 'DEMO_SYNTHETIC' && p.data_type !== 'DEMO_SYNTHETIC') return false;

      return true;
    });
  }, [properties, searchQuery, selectedLocation, minPrice, maxPrice, minArea, maxArea, facing, dataType]);

  // Sorting
  const sortedProperties = useMemo(() => {
    const list = [...filteredProperties];
    switch (sortBy) {
      case 'price_asc':
        return list.sort((a, b) => a.price_inr - b.price_inr);
      case 'price_desc':
        return list.sort((a, b) => b.price_inr - a.price_inr);
      case 'area_asc':
        return list.sort((a, b) => a.plot_area_sqft - b.plot_area_sqft);
      case 'area_desc':
        return list.sort((a, b) => b.plot_area_sqft - a.plot_area_sqft);
      case 'recently_added':
      default:
        return list.sort((a, b) => {
          if (a.data_type === 'REAL_ADVERTISED' && b.data_type !== 'REAL_ADVERTISED') return -1;
          if (b.data_type === 'REAL_ADVERTISED' && a.data_type !== 'REAL_ADVERTISED') return 1;
          return 0;
        });
    }
  }, [filteredProperties, sortBy]);

  // Paginated records
  const totalPages = Math.ceil(sortedProperties.length / ITEMS_PER_PAGE);
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProperties.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProperties, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMaxArea('');
    setFacing('');
    setDataType('ALL');
    setSortBy('recently_added');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedLocation || minPrice || maxPrice || minArea || maxArea || facing || (dataType && dataType !== 'ALL')
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search & Top Action Bar */}
      <div className="bg-white rounded-2xl border border-[#DCEBE4] p-4 mb-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71817A] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, locality, plot name, or ID (e.g., Padur, ACR-REAL-001)..."
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] focus:border-[#00E6A0] transition-all text-[#142B25] placeholder:text-[#71817A]/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-[#71817A] hover:text-[#142B25]"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter controls & Sort */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Data Type Segmented Control */}
            <div className="flex items-center bg-[#F7FAF8] p-1 rounded-xl border border-[#DCEBE4] text-xs font-bold">
              <button
                onClick={() => setDataType('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dataType === 'ALL'
                    ? 'bg-white text-[#087F5B] shadow-xs font-bold border border-[#DCEBE4]'
                    : 'text-[#71817A] hover:text-[#142B25]'
                }`}
              >
                All ({properties.length})
              </button>
              <button
                onClick={() => setDataType('REAL_ADVERTISED')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dataType === 'REAL_ADVERTISED'
                    ? 'bg-[#087F5B] text-white shadow-xs font-bold shadow-[0_0_10px_rgba(0,230,160,0.3)]'
                    : 'text-[#71817A] hover:text-[#142B25]'
                }`}
              >
                Advertised (10)
              </button>
              <button
                onClick={() => setDataType('DEMO_SYNTHETIC')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dataType === 'DEMO_SYNTHETIC'
                    ? 'bg-amber-100 text-amber-900 shadow-xs font-bold'
                    : 'text-[#71817A] hover:text-[#142B25]'
                }`}
              >
                Demo (290)
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 text-xs font-bold bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
            >
              <option value="recently_added">Sort: Featured & Recent</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_asc">Plot Area: Low to High</option>
              <option value="area_desc">Plot Area: High to Low</option>
            </select>

            {/* Filter Drawer Toggle */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                hasActiveFilters
                  ? 'bg-[#087F5B] text-white border-[#087F5B] shadow-[0_0_12px_rgba(0,230,160,0.35)]'
                  : 'bg-white text-[#142B25] border-[#DCEBE4] hover:border-[#087F5B]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters && '●'}</span>
            </button>

            {/* Mobile View Toggle Button (List vs Map) */}
            <div className="flex lg:hidden items-center bg-[#F7FAF8] p-1 rounded-xl border border-[#DCEBE4]">
              <button
                onClick={() => setMobileView('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  mobileView === 'list' ? 'bg-white shadow-xs text-[#087F5B]' : 'text-[#71817A]'
                }`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileView('map')}
                className={`p-1.5 rounded-lg transition-colors ${
                  mobileView === 'map' ? 'bg-white shadow-xs text-[#087F5B]' : 'text-[#71817A]'
                }`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips strip */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-[#DCEBE4] flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-[#71817A]">Active Filters:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B8FFE5]/40 border border-[#00E6A0]/40 text-[#087F5B] font-bold">
                Keyword: "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {selectedLocation && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B8FFE5]/40 border border-[#00E6A0]/40 text-[#087F5B] font-bold">
                Location: {selectedLocation}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedLocation('')} />
              </span>
            )}
            {minPrice && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B8FFE5]/40 border border-[#00E6A0]/40 text-[#087F5B] font-bold">
                Min: ₹{parseInt(minPrice) / 100000}L
                <X className="w-3 h-3 cursor-pointer" onClick={() => setMinPrice('')} />
              </span>
            )}
            {maxPrice && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B8FFE5]/40 border border-[#00E6A0]/40 text-[#087F5B] font-bold">
                Max: ₹{parseInt(maxPrice) / 100000}L
                <X className="w-3 h-3 cursor-pointer" onClick={() => setMaxPrice('')} />
              </span>
            )}
            {minArea && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B8FFE5]/40 border border-[#00E6A0]/40 text-[#087F5B] font-bold">
                Min: {minArea} sq.ft
                <X className="w-3 h-3 cursor-pointer" onClick={() => setMinArea('')} />
              </span>
            )}
            {maxArea && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B8FFE5]/40 border border-[#00E6A0]/40 text-[#087F5B] font-bold">
                Max: {maxArea} sq.ft
                <X className="w-3 h-3 cursor-pointer" onClick={() => setMaxArea('')} />
              </span>
            )}
            {facing && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B8FFE5]/40 border border-[#00E6A0]/40 text-[#087F5B] font-bold">
                Facing: {facing}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFacing('')} />
              </span>
            )}
            {dataType !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B8FFE5]/40 border border-[#00E6A0]/40 text-[#087F5B] font-bold">
                Type: {dataType === 'REAL_ADVERTISED' ? 'Advertised' : 'Demo'}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setDataType('ALL')} />
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="ml-auto inline-flex items-center gap-1 text-[#087F5B] hover:text-[#00E6A0] font-bold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout: Desktop Side-by-Side (55% list, 45% sticky map) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Listing Column (Visible on Desktop OR when mobileView === 'list') */}
        <div
          className={`lg:col-span-7 space-y-4 ${
            mobileView === 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-[#71817A] px-1">
            <div>
              Showing <span className="font-bold text-[#142B25] tabular-nums">{filteredProperties.length}</span> matching land parcels
              {totalPages > 1 && (
                <span> (Page {currentPage} of {totalPages})</span>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-white border border-[#DCEBE4] animate-pulse" />
              ))}
            </div>
          ) : paginatedProperties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#DCEBE4] p-12 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#F7FAF8] border border-[#DCEBE4] flex items-center justify-center mx-auto text-[#087F5B]">
                <Search className="w-6 h-6 opacity-60" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#142B25]">
                No land parcels matched your filters
              </h3>
              <p className="text-sm text-[#71817A] max-w-md mx-auto">
                Try widening your price range, clearing locality filters, or resetting the explorer to view all cataloged plots.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2.5 bg-[#087F5B] hover:bg-[#066346] text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-[0_0_12px_rgba(0,230,160,0.3)]"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paginatedProperties.map((property) => (
                <PropertyCard
                  key={property.property_id}
                  property={property}
                  isHighlighted={highlightedPropertyId === property.property_id}
                  onMouseEnter={() => setHighlightedPropertyId(property.property_id)}
                  onMouseLeave={() => setHighlightedPropertyId(null)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-4 flex items-center justify-between border-t border-[#DCEBE4]">
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(p - 1, 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1 px-3.5 py-2 text-xs font-bold border border-[#DCEBE4] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#087F5B] bg-white text-[#142B25] shadow-2xs transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-xs text-[#71817A] tabular-nums">
                Page <span className="font-bold text-[#142B25]">{currentPage}</span> of {totalPages}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => {
                  setCurrentPage((p) => Math.min(p + 1, totalPages));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1 px-3.5 py-2 text-xs font-bold border border-[#DCEBE4] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#087F5B] bg-white text-[#142B25] shadow-2xs transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Map Column (Sticky on Desktop, or when mobileView === 'map') */}
        <div
          className={`lg:col-span-5 ${
            mobileView === 'list' ? 'hidden lg:block' : 'block'
          } lg:sticky lg:top-24 h-[calc(100vh-140px)] min-h-[500px]`}
        >
          <PropertyMap
            properties={filteredProperties}
            selectedPropertyId={selectedPropertyId}
            highlightedPropertyId={highlightedPropertyId}
            onSelectProperty={(id) => {
              setSelectedPropertyId(id);
              setHighlightedPropertyId(id);
            }}
            className="h-full w-full shadow-sm"
          />
        </div>
      </div>

      {/* Slide-over Filter Drawer (Accessible from mobile or desktop) */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFilterDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#DCEBE4] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#087F5B]" />
                  <h3 className="font-serif text-lg font-bold text-[#142B25]">
                    Advanced Land Filters
                  </h3>
                </div>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-[#71817A] hover:bg-[#F7FAF8] hover:text-[#142B25]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Locality Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-[#142B25] mb-1.5 uppercase tracking-wider">
                    Locality / Region
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25] font-medium"
                  >
                    <option value="">All Chennai Localities</option>
                    {uniqueLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs font-bold text-[#142B25] mb-1.5 uppercase tracking-wider">
                    Price Range (₹ INR)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min (e.g. 2000000)"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="px-3 py-2 text-sm bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
                    />
                    <input
                      type="number"
                      placeholder="Max (e.g. 10000000)"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="px-3 py-2 text-sm bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
                    />
                  </div>
                </div>

                {/* Plot Area Range */}
                <div>
                  <label className="block text-xs font-bold text-[#142B25] mb-1.5 uppercase tracking-wider">
                    Plot Area (Square Feet)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min (e.g. 600)"
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                      className="px-3 py-2 text-sm bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
                    />
                    <input
                      type="number"
                      placeholder="Max (e.g. 3600)"
                      value={maxArea}
                      onChange={(e) => setMaxArea(e.target.value)}
                      className="px-3 py-2 text-sm bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
                    />
                  </div>
                  <div className="text-[11px] text-[#71817A] mt-1.5">
                    Reference: 1 Ground = 2,400 sq.ft · 1 Cent = 435.6 sq.ft
                  </div>
                </div>

                {/* Facing Direction */}
                <div>
                  <label className="block text-xs font-bold text-[#142B25] mb-1.5 uppercase tracking-wider">
                    Facing Direction
                  </label>
                  <select
                    value={facing}
                    onChange={(e) => setFacing(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25] font-medium"
                  >
                    <option value="">Any Facing</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="North East">North East</option>
                    <option value="North West">North West</option>
                    <option value="South East">South East</option>
                    <option value="South West">South West</option>
                  </select>
                </div>

                {/* Data Type */}
                <div>
                  <label className="block text-xs font-bold text-[#142B25] mb-1.5 uppercase tracking-wider">
                    Dataset Classification
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-[#142B25] cursor-pointer">
                      <input
                        type="radio"
                        name="drawerDataType"
                        checked={dataType === 'ALL'}
                        onChange={() => setDataType('ALL')}
                        className="text-[#087F5B] focus:ring-[#087F5B]"
                      />
                      <span className="font-medium">All 300 Records (Advertised + Demo)</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[#142B25] cursor-pointer">
                      <input
                        type="radio"
                        name="drawerDataType"
                        checked={dataType === 'REAL_ADVERTISED'}
                        onChange={() => setDataType('REAL_ADVERTISED')}
                        className="text-[#087F5B] focus:ring-[#087F5B]"
                      />
                      <span className="font-medium">Publicly Advertised Plots Only (10)</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[#142B25] cursor-pointer">
                      <input
                        type="radio"
                        name="drawerDataType"
                        checked={dataType === 'DEMO_SYNTHETIC'}
                        onChange={() => setDataType('DEMO_SYNTHETIC')}
                        className="text-[#087F5B] focus:ring-[#087F5B]"
                      />
                      <span className="font-medium">Synthetic Demo Records Only (290)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-[#DCEBE4] bg-[#F7FAF8] flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-[#71817A] hover:text-[#142B25] bg-white border border-[#DCEBE4] rounded-xl transition-all"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-[#087F5B] hover:bg-[#066346] rounded-xl transition-all shadow-sm hover:shadow-[0_0_12px_rgba(0,230,160,0.3)]"
                >
                  Apply Filters ({filteredProperties.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
