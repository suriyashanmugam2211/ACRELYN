import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ArrowRight,
  Compass,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
  Layers,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Bookmark,
  Scale,
  Maximize2,
  Eye,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { Property } from '../types/property';
import { repository } from '../lib/storage';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyMap } from '../components/map/PropertyMap';
import { formatINR, formatPlotArea, formatPricePerSqft } from '../lib/formatters';
import { LAND_IMAGE_GALLERY } from '../lib/dataset';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Hero search form state
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [searchMinPrice, setSearchMinPrice] = useState<string>('');
  const [searchMaxPrice, setSearchMaxPrice] = useState<string>('');
  const [searchMinArea, setSearchMinArea] = useState<string>('');

  // Homepage interactive map state
  const [selectedMapPropertyId, setSelectedMapPropertyId] = useState<string | null>(null);
  const [activeLocalityFilter, setActiveLocalityFilter] = useState<string>('ALL');

  useEffect(() => {
    let mounted = true;
    repository.getProperties().then((data) => {
      if (mounted) {
        setProperties(data);
        if (data.length > 0) {
          // Select an advertised property by default for preview
          const advertised = data.find((p) => p.data_type === 'REAL_ADVERTISED') || data[0];
          setSelectedMapPropertyId(advertised.property_id);
        }
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

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation.trim()) params.set('location', searchLocation.trim());
    if (searchMinPrice) params.set('minPrice', searchMinPrice);
    if (searchMaxPrice) params.set('maxPrice', searchMaxPrice);
    if (searchMinArea) params.set('minArea', searchMinArea);
    navigate(`/explore?${params.toString()}`);
  };

  // Filtered properties for the interactive homepage map
  const mapProperties = useMemo(() => {
    if (activeLocalityFilter === 'ALL') return properties;
    if (activeLocalityFilter === 'ADVERTISED') {
      return properties.filter((p) => p.data_type === 'REAL_ADVERTISED');
    }
    return properties.filter((p) =>
      p.location.toLowerCase().includes(activeLocalityFilter.toLowerCase())
    );
  }, [properties, activeLocalityFilter]);

  // Featured advertised properties
  const advertisedListings = properties.filter((p) => p.data_type === 'REAL_ADVERTISED');
  const featuredSample = advertisedListings.length > 0 ? advertisedListings.slice(0, 6) : properties.slice(0, 6);

  const POPULAR_LOCATIONS = [
    { name: 'Padur & OMR', count: properties.filter((p) => p.location.includes('Padur')).length || 18, filter: 'Padur' },
    { name: 'Vettuvankeni (ECR)', count: properties.filter((p) => p.location.includes('Vettuvankeni')).length || 4, filter: 'Vettuvankeni' },
    { name: 'Tambaram (GST)', count: properties.filter((p) => p.location.includes('Tambaram')).length || 24, filter: 'Tambaram' },
    { name: 'Sriperumbudur', count: properties.filter((p) => p.location.includes('Sriperumbudur')).length || 20, filter: 'Sriperumbudur' },
    { name: 'Chengalpet', count: properties.filter((p) => p.location.includes('Chengalpet')).length || 12, filter: 'Chengalpet' },
    { name: 'Pallavaram', count: properties.filter((p) => p.location.includes('Pallavaram')).length || 22, filter: 'Pallavaram' },
    { name: 'Oragadam', count: properties.filter((p) => p.location.includes('Oragadam')).length || 19, filter: 'Oragadam' },
    { name: 'Avadi', count: properties.filter((p) => p.location.includes('Avadi')).length || 20, filter: 'Avadi' },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 pb-20 bg-[#F7FAF8]">
      {/* HERO SECTION WITH ENTRANCE ANIMATIONS */}
      <section className="relative bg-[#087F5B] text-white overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 border-b border-[#00E6A0]/20">
        {/* Soft neon emerald glow gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00E6A0]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#B8FFE5]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#00E6A0_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            {/* Motion Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#00E6A0]/40 text-[#B8FFE5] shadow-[0_0_15px_rgba(0,230,160,0.2)]"
            >
              <span className="w-2 h-2 rounded-full bg-[#00E6A0] animate-pulse shadow-[0_0_8px_#00E6A0]" />
              Structured Land Discovery Across Greater Chennai
            </motion.div>

            {/* Motion Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12]"
            >
              Discover Land.{' '}
              <span className="text-[#00E6A0] drop-shadow-[0_0_24px_rgba(0,230,160,0.4)]">
                Build Your Future.
              </span>
            </motion.h1>

            {/* Motion Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-2xl"
            >
              Explore residential layouts, villa plots, and strategic development parcels with complete transparency. Compare rate per sq.ft, analyze road facing, and inspect real coordinates.
            </motion.p>
          </div>

          {/* Search Card Container with Entrance Animation */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="mt-10 max-w-5xl bg-white text-[#142B25] rounded-2xl p-4 sm:p-6 shadow-[0_12px_36px_rgba(8,127,91,0.12)] border border-[#DCEBE4]"
          >
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Location Input */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-[#71817A] mb-1.5 uppercase tracking-wider">
                  Location or Locality
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#087F5B] absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="e.g. Padur, Tambaram, Pallavaram, OMR..."
                    className="w-full pl-9.5 pr-4 py-2.5 text-sm bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] focus:border-[#00E6A0] transition-all font-medium text-[#142B25] placeholder:text-[#71817A]/60"
                  />
                </div>
              </div>

              {/* Budget Min */}
              <div>
                <label className="block text-xs font-bold text-[#71817A] mb-1.5 uppercase tracking-wider">
                  Min Budget
                </label>
                <select
                  value={searchMinPrice}
                  onChange={(e) => setSearchMinPrice(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] focus:border-[#00E6A0] transition-all font-medium text-[#142B25]"
                >
                  <option value="">Any Min</option>
                  <option value="2000000">₹20 Lakh</option>
                  <option value="4000000">₹40 Lakh</option>
                  <option value="6000000">₹60 Lakh</option>
                  <option value="10000000">₹1 Crore</option>
                </select>
              </div>

              {/* Budget Max */}
              <div>
                <label className="block text-xs font-bold text-[#71817A] mb-1.5 uppercase tracking-wider">
                  Max Budget
                </label>
                <select
                  value={searchMaxPrice}
                  onChange={(e) => setSearchMaxPrice(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] focus:border-[#00E6A0] transition-all font-medium text-[#142B25]"
                >
                  <option value="">Any Max</option>
                  <option value="3000000">₹30 Lakh</option>
                  <option value="5000000">₹50 Lakh</option>
                  <option value="8000000">₹80 Lakh</option>
                  <option value="15000000">₹1.5 Crore</option>
                  <option value="25000000">₹2.5 Crore+</option>
                </select>
              </div>

              {/* Search CTA with Neon Glow on Hover */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-5 bg-[#087F5B] hover:bg-[#066346] text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.98] hover:shadow-[0_0_20px_rgba(0,230,160,0.4)]"
                >
                  <Search className="w-4 h-4 text-[#00E6A0]" />
                  <span>Search Land</span>
                </button>
              </div>
            </form>

            {/* Quick Filter shortcuts */}
            <div className="mt-4 pt-4 border-t border-[#DCEBE4] flex flex-wrap items-center justify-between gap-3 text-xs text-[#71817A]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#142B25]">Quick Filters:</span>
                <Link
                  to="/explore?maxPrice=4000000"
                  className="hover:text-[#087F5B] font-medium underline underline-offset-2 hover:decoration-[#00E6A0]"
                >
                  Under ₹40 Lakh
                </Link>
                <span className="text-[#DCEBE4]">•</span>
                <Link
                  to="/explore?minArea=2400"
                  className="hover:text-[#087F5B] font-medium underline underline-offset-2 hover:decoration-[#00E6A0]"
                >
                  1 Full Ground (2,400 sq.ft)
                </Link>
                <span className="text-[#DCEBE4]">•</span>
                <Link
                  to="/explore?type=REAL_ADVERTISED"
                  className="hover:text-[#087F5B] font-medium underline underline-offset-2 hover:decoration-[#00E6A0]"
                >
                  Public Advertised Only
                </Link>
              </div>

              <Link
                to="/explore"
                className="font-bold text-[#087F5B] hover:text-[#00E6A0] flex items-center gap-1 transition-colors"
              >
                <span>Open Fullscreen Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MAIN HOMEPAGE FEATURE: LARGE INTERACTIVE CHENNAI LAND MAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#087F5B] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#00E6A0]" />
              <span>Interactive Spatial Explorer</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142B25]">
              Explore Chennai Plots on the Live Map
            </h2>
            <p className="text-sm text-[#71817A] mt-1 max-w-2xl">
              Pan across Greater Chennai corridors. Click any glowing emerald marker to inspect rate per sq.ft, survey facing, and layout specifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#DCEBE4] text-xs font-bold text-[#087F5B] hover:border-[#00E6A0] hover:shadow-[0_0_12px_rgba(0,230,160,0.25)] transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#087F5B]" />
              <span>Full Screen Map</span>
            </Link>
          </div>
        </div>

        {/* Quick Corridor Selection Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
          {[
            { id: 'ALL', label: 'All Chennai', count: properties.length },
            { id: 'ADVERTISED', label: 'Advertised Only', count: advertisedListings.length },
            { id: 'Padur', label: 'OMR Corridor', count: properties.filter((p) => p.location.includes('Padur')).length },
            { id: 'Vettuvankeni', label: 'ECR Coastal', count: properties.filter((p) => p.location.includes('Vettuvankeni')).length },
            { id: 'Tambaram', label: 'Tambaram / GST', count: properties.filter((p) => p.location.includes('Tambaram')).length },
            { id: 'Sriperumbudur', label: 'Sriperumbudur', count: properties.filter((p) => p.location.includes('Sriperumbudur')).length },
            { id: 'Avadi', label: 'Avadi / North West', count: properties.filter((p) => p.location.includes('Avadi')).length },
          ].map((corridor) => (
            <button
              key={corridor.id}
              onClick={() => setActiveLocalityFilter(corridor.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                activeLocalityFilter === corridor.id
                  ? 'bg-[#087F5B] text-white border-[#087F5B] shadow-[0_0_12px_rgba(0,230,160,0.35)]'
                  : 'bg-white text-[#71817A] border-[#DCEBE4] hover:border-[#087F5B] hover:text-[#142B25]'
              }`}
            >
              {corridor.label} <span className="opacity-70 font-mono text-[10px]">({corridor.count})</span>
            </button>
          ))}
        </div>

        {/* Interactive Map Container */}
        <div className="rounded-2xl overflow-hidden shadow-xs border border-[#DCEBE4] h-[360px] sm:h-[420px]">
          <PropertyMap
            properties={mapProperties}
            selectedPropertyId={selectedMapPropertyId}
            onSelectProperty={(id) => setSelectedMapPropertyId(id)}
            className="h-full w-full"
          />
        </div>
      </section>

      {/* FEATURED PUBLICLY ADVERTISED PROPERTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#087F5B] mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E6A0]" />
              <span>Curated Opportunities</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142B25]">
              Publicly Advertised Land Parcels
            </h2>
            <p className="text-sm text-[#71817A] mt-1 max-w-xl">
              Authentic land listings aggregated from verified public portals with recorded asking prices and direct locality references.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#087F5B] hover:text-[#00E6A0] group transition-colors"
          >
            <span>View All {properties.length} Listings</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-white border border-[#DCEBE4] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSample.map((property) => (
              <PropertyCard key={property.property_id} property={property} />
            ))}
          </div>
        )}
      </section>

      {/* POPULAR LOCATIONS IN CHENNAI REGION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#EAF3EF] rounded-3xl p-8 sm:p-10 border border-[#DCEBE4]">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider font-bold text-[#087F5B]">
              Key Growth Corridors
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142B25] mt-1">
              Popular Chennai Land Corridors
            </h2>
            <p className="text-sm text-[#71817A] mt-2">
              From tech hubs along OMR to automotive belts in Sriperumbudur and Oragadam, browse structured land records by locality.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {POPULAR_LOCATIONS.map((loc) => (
              <Link
                key={loc.name}
                to={`/explore?location=${encodeURIComponent(loc.filter)}`}
                className="bg-white p-4 rounded-xl border border-[#DCEBE4] hover:border-[#00E6A0] hover:shadow-[0_0_15px_rgba(0,230,160,0.25)] transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <MapPin className="w-4 h-4 text-[#087F5B] group-hover:text-[#00E6A0] group-hover:scale-110 transition-transform" />
                  <ChevronRight className="w-4 h-4 text-[#71817A] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-bold text-sm text-[#142B25] group-hover:text-[#087F5B]">
                  {loc.name}
                </h3>
                <div className="text-xs text-[#71817A] mt-0.5 tabular-nums">
                  {loc.count > 0 ? `${loc.count} plots cataloged` : 'Explore locality'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EXPLORE BY BUDGET & PLOT SIZE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* By Budget */}
          <div className="border border-[#DCEBE4] rounded-2xl p-8 bg-white space-y-4 shadow-xs">
            <h3 className="font-serif text-xl font-bold text-[#142B25]">
              Explore Land by Budget
            </h3>
            <p className="text-xs text-[#71817A]">
              Find land plots tailored to your exact investment parameters.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/explore?maxPrice=3000000"
                className="p-3.5 rounded-xl bg-[#F7FAF8] hover:bg-[#087F5B] hover:text-white transition-all border border-[#DCEBE4] text-xs font-bold group"
              >
                Under ₹30 Lakh
                <span className="block text-[11px] font-normal opacity-80 mt-0.5 group-hover:text-emerald-100">Budget entry plots</span>
              </Link>
              <Link
                to="/explore?minPrice=3000000&maxPrice=6000000"
                className="p-3.5 rounded-xl bg-[#F7FAF8] hover:bg-[#087F5B] hover:text-white transition-all border border-[#DCEBE4] text-xs font-bold group"
              >
                ₹30L — ₹60 Lakh
                <span className="block text-[11px] font-normal opacity-80 mt-0.5 group-hover:text-emerald-100">Prime suburban layouts</span>
              </Link>
              <Link
                to="/explore?minPrice=6000000&maxPrice=12000000"
                className="p-3.5 rounded-xl bg-[#F7FAF8] hover:bg-[#087F5B] hover:text-white transition-all border border-[#DCEBE4] text-xs font-bold group"
              >
                ₹60L — ₹1.2 Crore
                <span className="block text-[11px] font-normal opacity-80 mt-0.5 group-hover:text-emerald-100">Established residential</span>
              </Link>
              <Link
                to="/explore?minPrice=12000000"
                className="p-3.5 rounded-xl bg-[#F7FAF8] hover:bg-[#087F5B] hover:text-white transition-all border border-[#DCEBE4] text-xs font-bold group"
              >
                Above ₹1.2 Crore
                <span className="block text-[11px] font-normal opacity-80 mt-0.5 group-hover:text-emerald-100">Large parcels & prime land</span>
              </Link>
            </div>
          </div>

          {/* By Plot Size */}
          <div className="border border-[#DCEBE4] rounded-2xl p-8 bg-white space-y-4 shadow-xs">
            <h3 className="font-serif text-xl font-bold text-[#142B25]">
              Explore by Plot Size & Extent
            </h3>
            <p className="text-xs text-[#71817A]">
              Target plots using square feet or traditional Chennai land measurements.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/explore?maxArea=1000"
                className="p-3.5 rounded-xl bg-[#F7FAF8] hover:bg-[#087F5B] hover:text-white transition-all border border-[#DCEBE4] text-xs font-bold group"
              >
                Compact (600–1,000 sq.ft)
                <span className="block text-[11px] font-normal opacity-80 mt-0.5 group-hover:text-emerald-100">1.5 to 2.3 Cents</span>
              </Link>
              <Link
                to="/explore?minArea=1200&maxArea=1800"
                className="p-3.5 rounded-xl bg-[#F7FAF8] hover:bg-[#087F5B] hover:text-white transition-all border border-[#DCEBE4] text-xs font-bold group"
              >
                Mid-size (1,200–1,800 sq.ft)
                <span className="block text-[11px] font-normal opacity-80 mt-0.5 group-hover:text-emerald-100">Half Ground to 0.75 Ground</span>
              </Link>
              <Link
                to="/explore?minArea=2400&maxArea=3600"
                className="p-3.5 rounded-xl bg-[#F7FAF8] hover:bg-[#087F5B] hover:text-white transition-all border border-[#DCEBE4] text-xs font-bold group"
              >
                1 Full Ground (2,400+ sq.ft)
                <span className="block text-[11px] font-normal opacity-80 mt-0.5 group-hover:text-emerald-100">Classic Chennai villa plot</span>
              </Link>
              <Link
                to="/explore?minArea=4000"
                className="p-3.5 rounded-xl bg-[#F7FAF8] hover:bg-[#087F5B] hover:text-white transition-all border border-[#DCEBE4] text-xs font-bold group"
              >
                Large Extents (4,000+ sq.ft)
                <span className="block text-[11px] font-normal opacity-80 mt-0.5 group-hover:text-emerald-100">Development & farmhouse</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE ACRELYN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-wider font-bold text-[#087F5B]">
            Our Operating Principles
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#142B25] mt-2">
            Why Discerning Land Buyers Rely on ACRELYN
          </h2>
          <p className="text-sm text-[#71817A] mt-3">
            Land acquisition requires complete accuracy. We eliminate the ambiguity common to unorganized property portals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-7 rounded-2xl border border-[#DCEBE4] space-y-3 hover:border-[#00E6A0] hover:shadow-[0_0_20px_rgba(0,230,160,0.2)] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#087F5B] text-white flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-lg text-[#142B25]">
              Clear Listing Provenance
            </h3>
            <p className="text-sm text-[#71817A] leading-relaxed">
              We never disguise synthetic test plots as actual properties for sale. Public advertised records are identified with direct source links and clear disclaimer labels.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-[#DCEBE4] space-y-3 hover:border-[#00E6A0] hover:shadow-[0_0_20px_rgba(0,230,160,0.2)] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#00E6A0] text-[#142B25] flex items-center justify-center font-bold text-sm shadow-[0_0_12px_#00E6A0]">
              02
            </div>
            <h3 className="font-bold text-lg text-[#142B25]">
              Standardized Rate per Sq.Ft
            </h3>
            <p className="text-sm text-[#71817A] leading-relaxed">
              Every parcel displays computed ₹/sq.ft metrics alongside total price, allowing direct apples-to-apples value comparisons across competing Chennai localities.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-[#DCEBE4] space-y-3 hover:border-[#00E6A0] hover:shadow-[0_0_20px_rgba(0,230,160,0.2)] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#087F5B] text-white flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-lg text-[#142B25]">
              Interactive Spatial Exploration
            </h3>
            <p className="text-sm text-[#71817A] leading-relaxed">
              Locate properties geographically using our synchronized OpenStreetMap explorer. Filter by facing direction, plot area, and verified layout attributes.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#087F5B] text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-xl border border-[#00E6A0]/30">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#00E6A0]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Ready to Explore Verified Land Opportunities?
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              Browse our complete catalog of {properties.length} land records, compare plot dimensions, or submit an enquiry to our desk.
            </p>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/explore"
                className="px-6 py-3.5 rounded-xl bg-[#00E6A0] hover:bg-[#00c98c] text-[#142B25] text-sm font-bold shadow-[0_0_20px_rgba(0,230,160,0.4)] transition-all inline-flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch Interactive Explorer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold transition-all"
              >
                Contact Enquiry Desk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
