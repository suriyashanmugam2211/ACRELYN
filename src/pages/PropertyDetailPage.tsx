import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Bookmark,
  Scale,
  Share2,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  Copy,
  Calendar,
  Layers,
  Send,
  Building,
  Shield,
  Eye,
  Check,
  Sparkles,
  Info,
} from 'lucide-react';
import type { Property } from '../types/property';
import { repository } from '../lib/storage';
import { getLandImagesForProperty, LAND_IMAGE_GALLERY } from '../lib/dataset';
import { formatINR, formatPlotArea, formatPricePerSqft, formatDate } from '../lib/formatters';
import { PropertyMap } from '../components/map/PropertyMap';
import { PropertyCard } from '../components/property/PropertyCard';

const COUNTRY_DIAL_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
];

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Gallery
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  // State actions & Toast feedback
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [inCompare, setInCompare] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Enquiry form state
  const [customerName, setCustomerName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [phone, setPhone] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState<boolean>(false);
  const [enquirySuccess, setEnquirySuccess] = useState<boolean>(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);
  const [formValidation, setFormValidation] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    repository.getProperties().then((data) => {
      if (!mounted) return;
      setAllProperties(data);
      if (id) {
        const found = repository.getPropertyById(id, data);
        if (found) {
          setProperty(found);
          setIsSaved(repository.isSaved(found.property_id));
          setInCompare(repository.isInComparison(found.property_id));
          setMessage(`Hello, I am interested in property ${found.property_id} (${found.property_name}) in ${found.location}. Please provide title verification and site inspection details.`);
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Handle Save toggle
  const handleToggleSave = () => {
    if (!property) return;
    const newState = repository.toggleSaveProperty(property.property_id);
    setIsSaved(newState);
    showToast(newState ? 'Plot added to your Saved Shortlist' : 'Plot removed from your Saved Shortlist');
  };

  // Handle Compare toggle
  const handleToggleCompare = () => {
    if (!property) return;
    const res = repository.toggleCompareProperty(property.property_id);
    if (res.message) {
      showToast(res.message);
    } else {
      setInCompare(res.inComparison);
      showToast(res.inComparison ? 'Added to Property Comparison (Max 4)' : 'Removed from Property Comparison');
    }
  };

  // Copy share link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    showToast('Listing URL copied to clipboard');
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Validate and submit Enquiry
  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    const errors: Record<string, string> = {};
    if (!customerName.trim()) {
      errors.customerName = 'Please enter your full name.';
    }
    if (!email.trim()) {
      errors.email = 'Please provide an email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!phone.trim()) {
      errors.phone = 'Please enter your 10-digit mobile number.';
    } else if (phone.length !== 10) {
      errors.phone = `Phone number must be exactly 10 digits (currently ${phone.length}/10 digits).`;
    } else if (countryCode === '+91' && !/^[6-9]\d{9}$/.test(phone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
    }
    if (!message.trim()) {
      errors.message = 'Please include a brief message or question.';
    }

    setFormValidation(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmittingEnquiry(true);
    setEnquiryError(null);

    const fullPhoneNumber = `${countryCode} ${phone.trim()}`;

    const result = await repository.submitEnquiry({
      property_id: property.property_id,
      customer_name: customerName.trim(),
      email: email.trim(),
      phone: fullPhoneNumber,
      message: message.trim(),
      status: 'New',
    });

    setIsSubmittingEnquiry(false);

    if (result.success) {
      setEnquirySuccess(true);
      setCustomerName('');
      setEmail('');
      setPhone('');
    } else {
      setEnquiryError(result.error || 'Failed to submit enquiry. Please check database connectivity.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-8 w-48 bg-white border border-[#DCEBE4] animate-pulse rounded mb-6" />
        <div className="h-96 bg-white border border-[#DCEBE4] animate-pulse rounded-2xl mb-8" />
        <div className="h-64 bg-white border border-[#DCEBE4] animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#142B25]">
          Property Listing Not Found
        </h2>
        <p className="text-sm text-[#71817A]">
          The requested property identifier ({id}) was not found in the ACRELYN catalog.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#087F5B] hover:bg-[#066346] text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-[0_0_12px_rgba(0,230,160,0.3)]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Land Explorer</span>
        </Link>
      </div>
    );
  }

  const isDemo = property.data_type === 'DEMO_SYNTHETIC';
  const similarProperties = allProperties
    .filter((p) => p.property_id !== property.property_id && (p.location.includes(property.location.split(',')[0]) || p.facing === property.facing))
    .slice(0, 3);

  const fallback = getLandImagesForProperty(property.property_id || property.id || 'ACR-DEFAULT', 1);
  const propertyCover =
    property.cover_image && property.cover_image.trim().startsWith('http') && !property.cover_image.includes('null')
      ? property.cover_image.trim()
      : property.image_urls?.[0] || fallback.cover_image;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#142B25] text-white px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(0,230,160,0.4)] border border-[#00E6A0] text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00E6A0]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Back breadcrumb */}
      <div className="flex items-center justify-between text-xs text-[#71817A]">
        <Link to="/explore" className="inline-flex items-center gap-1.5 font-bold hover:text-[#087F5B] transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Return to All Plots</span>
        </Link>
        <div className="font-mono text-[11px] font-bold text-[#087F5B] bg-[#B8FFE5]/40 px-2.5 py-1 rounded-lg border border-[#00E6A0]/40">
          ID: {property.property_id}
        </div>
      </div>

      {/* SYNTHETIC DEMO RECORD BANNER */}
      {isDemo && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <div className="font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <span>DEMONSTRATION RECORD — SYNTHETIC BENCHMARK DATA</span>
            </div>
            <p className="leading-relaxed">
              This record ({property.property_id}) is generated for marketplace workflow evaluation, filter testing, and spatial indexing. It is <strong className="font-bold">not an active physical property for sale</strong> and does not represent real-world seller documentation.
            </p>
          </div>
        </div>
      )}

      {/* HEADER TITLE & QUICK ACTIONS */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#DCEBE4]">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[#087F5B] text-white">
              {property.land_type}
            </span>
            <span className="text-xs text-[#71817A]">•</span>
            <div className="flex items-center gap-1 text-xs text-[#71817A]">
              <MapPin className="w-3.5 h-3.5 text-[#087F5B]" />
              <span className="font-medium text-[#142B25]">{property.location}</span>
            </div>
            {property.is_approximate_coord && (
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-200">
                Approximate Area Center
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#142B25] leading-tight">
            {property.property_name}
          </h1>

          <div className="text-xs text-[#71817A] flex items-center gap-3 pt-1">
            <span>Availability: <strong className="text-[#142B25] font-bold">{property.availability_status}</strong></span>
            <span>•</span>
            <span>Verification: <strong className="text-[#142B25] font-bold">{property.verification_status}</strong></span>
          </div>
        </div>

        {/* Pricing Block & Action buttons */}
        <div className="flex flex-col sm:items-end gap-3 shrink-0">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#087F5B] tabular-nums tracking-tight">
              {formatINR(property.price_inr, false)}
            </div>
            <div className="text-xs text-[#71817A] tabular-nums sm:text-right mt-0.5 font-medium">
              Computed Rate: <strong className="font-bold text-[#142B25]">{formatPricePerSqft(property.price_per_sqft_inr)}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleCompare}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                inCompare
                  ? 'bg-[#00E6A0] text-[#142B25] border-[#00E6A0] shadow-[0_0_12px_rgba(0,230,160,0.4)]'
                  : 'bg-white text-[#142B25] border-[#DCEBE4] hover:border-[#087F5B]'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>{inCompare ? 'In Comparison' : 'Compare'}</span>
            </button>

            <button
              onClick={handleToggleSave}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                isSaved
                  ? 'bg-[#087F5B] text-white border-[#087F5B] shadow-[0_0_12px_rgba(0,230,160,0.3)]'
                  : 'bg-white text-[#142B25] border-[#DCEBE4] hover:border-[#087F5B]'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
              <span>{isSaved ? 'Saved' : 'Save Plot'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              title="Copy shareable link"
              className="p-2 text-xs font-bold rounded-xl border border-[#DCEBE4] bg-white text-[#142B25] hover:border-[#087F5B] transition-all"
            >
              {copySuccess ? <Check className="w-4 h-4 text-[#087F5B]" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* GALLERY & MEDIA SECTION — Displays this specific land parcel's authentic photography */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Dedicated Land Image */}
        <div className="lg:col-span-8">
          <div
            onClick={() => setLightboxOpen(true)}
            className="relative aspect-[16/10] bg-[#F7FAF8] rounded-2xl overflow-hidden cursor-zoom-in border border-[#DCEBE4] group shadow-xs"
          >
            <img
              src={propertyCover}
              alt={property.property_name}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = fallback.cover_image;
              }}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
            />
            {/* Top Left Plot Badge */}
            <div className="absolute top-3 left-3 bg-[#087F5B]/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-[#00E6A0]/40 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#00E6A0] animate-pulse" />
              <span>{property.property_id} · Verified Plot Photo</span>
            </div>

            {/* Bottom Right Zoom Badge */}
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 pointer-events-none">
              <Eye className="w-3.5 h-3.5 text-[#00E6A0]" />
              <span>Click to view full photo</span>
            </div>
          </div>
        </div>

        {/* KEY PLOT METRICS CARD */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#DCEBE4] p-6 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#142B25] mb-4">
              Plot Specifications
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#DCEBE4]">
                <span className="text-[#71817A] font-medium">Plot Area (sq.ft)</span>
                <span className="font-bold text-[#142B25] tabular-nums text-sm">
                  {property.plot_area_sqft.toLocaleString('en-IN')} sq.ft
                </span>
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-[#DCEBE4]">
                <span className="text-[#71817A] font-medium">Chennai Land Units</span>
                <span className="font-bold text-[#087F5B] tabular-nums">
                  {formatPlotArea(property.plot_area_sqft)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-[#DCEBE4]">
                <span className="text-[#71817A] font-medium">Facing Direction</span>
                <span className="font-bold text-[#142B25] flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-[#087F5B]" />
                  {property.facing}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-[#DCEBE4]">
                <span className="text-[#71817A] font-medium">Land Category</span>
                <span className="font-bold text-[#142B25]">{property.land_type}</span>
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-[#DCEBE4]">
                <span className="text-[#71817A] font-medium">Catalog Classification</span>
                <span className="font-bold text-[#142B25]">
                  {property.data_type === 'REAL_ADVERTISED' ? 'Public Advertised' : 'Synthetic Demo'}
                </span>
              </div>

              {property.source_url && (
                <div className="pt-2">
                  <a
                    href={property.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#087F5B] hover:text-[#00E6A0] font-bold underline underline-offset-2"
                  >
                    <span>View Public Source Listing</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#DCEBE4]">
            <a
              href="#enquiry-section"
              className="w-full py-3 bg-[#087F5B] hover:bg-[#066346] text-white text-xs font-bold rounded-xl text-center block transition-all shadow-sm hover:shadow-[0_0_12px_rgba(0,230,160,0.3)]"
            >
              Enquire About This Plot
            </a>
          </div>
        </div>
      </div>

      {/* MAIN SPECIFICATIONS & WORKING CUSTOMER ENQUIRY FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Left Column: Details & Facilities & Map */}
        <div className="lg:col-span-7 space-y-8">
          {/* Facilities & Infrastructure */}
          <div className="bg-white rounded-2xl border border-[#DCEBE4] p-6 space-y-4 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-[#142B25]">
              Facilities & Layout Attributes
            </h3>
            <p className="text-sm text-[#142B25] leading-relaxed bg-[#F7FAF8] p-4 rounded-xl border border-[#DCEBE4]">
              {property.facilities || 'Standard residential layout access.'}
            </p>
            {property.notes && (
              <div className="text-xs text-[#71817A] italic pt-1">
                Field notes: {property.notes}
              </div>
            )}
          </div>

          {/* Interactive Map Coordinates */}
          <div className="bg-white rounded-2xl border border-[#DCEBE4] p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#142B25]">
                  Spatial Map Location
                </h3>
                <p className="text-xs text-[#71817A] mt-0.5">
                  {property.is_approximate_coord
                    ? 'Approximate locality center point for geographic reference'
                    : 'OpenStreetMap coordinates recorded for this parcel'}
                </p>
              </div>
              {property.latitude && property.longitude && (
                <div className="font-mono text-xs text-[#087F5B] bg-[#F7FAF8] px-2.5 py-1 rounded-lg border border-[#DCEBE4] font-bold">
                  {property.latitude.toFixed(5)}, {property.longitude.toFixed(5)}
                </div>
              )}
            </div>

            <div className="h-80 w-full rounded-2xl overflow-hidden border border-[#DCEBE4]">
              <PropertyMap
                properties={[property]}
                selectedPropertyId={property.property_id}
                center={[property.latitude || 12.98, property.longitude || 80.14]}
                zoomLevel={13}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Customer Enquiry Form (Connected directly to Supabase) */}
        <div id="enquiry-section" className="lg:col-span-5">
          <div className="sticky top-24 bg-white rounded-2xl border border-[#DCEBE4] p-6 sm:p-7 shadow-xs space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#087F5B] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#00E6A0]" />
                <span>Direct Inquiry</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#142B25]">
                Enquire About {property.property_id}
              </h3>
              <p className="text-xs text-[#71817A] mt-1 leading-normal">
                Submissions are stored directly to the database. An Acrelyn land representative will follow up with verified documentation.
              </p>
            </div>

            {enquirySuccess ? (
              <div className="bg-[#B8FFE5]/30 border-2 border-[#00E6A0] rounded-2xl p-6 text-center space-y-3 animate-in fade-in duration-200 shadow-[0_0_20px_rgba(0,230,160,0.2)]">
                <div className="w-12 h-12 rounded-full bg-[#087F5B] text-[#00E6A0] flex items-center justify-center mx-auto shadow-[0_0_12px_#00E6A0]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-serif text-lg font-bold text-[#142B25]">
                  Enquiry Successfully Recorded in Database!
                </h4>
                <p className="text-xs text-[#142B25] leading-relaxed">
                  Your enquiry for <strong>{property.property_id}</strong> has been persisted directly to Supabase PostgreSQL. Our operations team will contact you regarding legal verification and site inspection.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setEnquirySuccess(false)}
                    className="px-5 py-2.5 bg-[#087F5B] hover:bg-[#066346] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnquiry} className="space-y-4">
                {enquiryError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 leading-normal">
                    <strong>Submission failed:</strong> {enquiryError}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-[#142B25] mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Anand Sundaram"
                    className={`w-full px-3 py-2 text-sm bg-[#F7FAF8] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25] ${
                      formValidation.customerName ? 'border-red-400 bg-red-50/20' : 'border-[#DCEBE4]'
                    }`}
                  />
                  {formValidation.customerName && (
                    <span className="text-[11px] text-red-600 mt-1 block font-medium">
                      {formValidation.customerName}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-[#142B25] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="anand@example.com"
                    className={`w-full px-3 py-2 text-sm bg-[#F7FAF8] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25] ${
                      formValidation.email ? 'border-red-400 bg-red-50/20' : 'border-[#DCEBE4]'
                    }`}
                  />
                  {formValidation.email && (
                    <span className="text-[11px] text-red-600 mt-1 block font-medium">
                      {formValidation.email}
                    </span>
                  )}
                </div>

                {/* Phone with Country Code & Exact 10-Digit Constraint */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#142B25]">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <span
                      className={`text-[10px] font-bold ${
                        phone.length === 10
                          ? 'text-[#087F5B] bg-[#B8FFE5]/70 px-1.5 py-0.5 rounded border border-[#00E6A0]/40 font-mono'
                          : 'text-[#71817A] font-mono'
                      }`}
                    >
                      {phone.length}/10 digits
                    </span>
                  </div>

                  <div
                    className={`flex rounded-xl overflow-hidden border bg-[#F7FAF8] transition-all ${
                      formValidation.phone
                        ? 'border-red-400 bg-red-50/20'
                        : phone.length === 10
                        ? 'border-[#00E6A0] ring-1 ring-[#00E6A0]'
                        : 'border-[#DCEBE4] focus-within:ring-2 focus-within:ring-[#087F5B] focus-within:border-[#00E6A0]'
                    }`}
                  >
                    {/* Country Code Selector */}
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="px-2.5 py-2 text-xs font-bold bg-[#EAF3EF] border-r border-[#DCEBE4] text-[#142B25] focus:outline-none cursor-pointer shrink-0"
                      title="Select Country Code"
                    >
                      {COUNTRY_DIAL_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} ({c.country})
                        </option>
                      ))}
                    </select>

                    {/* 10-Digit Mobile Number Input */}
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        // Strictly accept digits only and cap at 10 digits
                        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(digitsOnly);
                        if (formValidation.phone) {
                          setFormValidation((prev) => {
                            const updated = { ...prev };
                            delete updated.phone;
                            return updated;
                          });
                        }
                      }}
                      placeholder="98400 12345 (10 digits)"
                      className="w-full px-3 py-2 text-sm bg-transparent text-[#142B25] focus:outline-none font-medium placeholder:text-[#71817A]/50 tracking-wider"
                    />
                  </div>

                  {formValidation.phone ? (
                    <span className="text-[11px] text-red-600 mt-1 block font-medium">
                      {formValidation.phone}
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#71817A] mt-1 block">
                      Enter 10-digit mobile number without leading zero.
                    </span>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-[#142B25] mb-1">
                    Your Requirements / Questions <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`w-full px-3 py-2 text-sm bg-[#F7FAF8] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25] ${
                      formValidation.message ? 'border-red-400 bg-red-50/20' : 'border-[#DCEBE4]'
                    }`}
                  />
                  {formValidation.message && (
                    <span className="text-[11px] text-red-600 mt-1 block font-medium">
                      {formValidation.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingEnquiry}
                  className="w-full py-3.5 bg-[#087F5B] hover:bg-[#066346] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_16px_rgba(0,230,160,0.4)]"
                >
                  {isSubmittingEnquiry ? (
                    <span>Persisting to Database...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-[#00E6A0]" />
                      <span>Send Official Enquiry</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-[#71817A] text-center pt-1 font-medium">
                  🔒 We protect customer privacy. Details are saved securely to Supabase.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* SIMILAR PROPERTIES */}
      {similarProperties.length > 0 && (
        <div className="pt-12 border-t border-[#DCEBE4] space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#142B25]">
              Similar Land Parcels in this Corridor
            </h3>
            <p className="text-xs text-[#71817A] mt-1">
              Alternative plots matching location and orientation parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProperties.map((p) => (
              <PropertyCard key={p.property_id} property={p} />
            ))}
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={propertyCover}
              alt={property.property_name}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = fallback.cover_image;
              }}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/20"
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-3 right-3 text-white bg-black/60 rounded-full p-2 hover:bg-black font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
