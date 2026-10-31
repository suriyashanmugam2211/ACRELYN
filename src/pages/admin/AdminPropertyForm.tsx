import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Save,
  ChevronLeft,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Eye,
  Plus,
  MapPin,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { Property, DataType } from '../../types/property';
import { repository } from '../../lib/storage';
import { LAND_IMAGE_GALLERY } from '../../lib/dataset';
import { formatINR, formatPlotArea } from '../../lib/formatters';

export const AdminPropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState<boolean>(isEditing);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [propertyId, setPropertyId] = useState<string>('');
  const [propertyName, setPropertyName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [plotArea, setPlotArea] = useState<string>('');
  const [priceInr, setPriceInr] = useState<string>('');
  const [facing, setFacing] = useState<string>('North');
  const [landType, setLandType] = useState<string>('Residential plot');
  const [facilities, setFacilities] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('Available');
  const [verificationStatus, setVerificationStatus] = useState<string>('Advertised listing; not independently verified');
  const [dataType, setDataType] = useState<DataType>('REAL_ADVERTISED');
  const [notes, setNotes] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState<string>('');

  // Live preview toggle
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Load existing property if editing
  useEffect(() => {
    if (isEditing && id) {
      repository.getProperties().then((all) => {
        const p = repository.getPropertyById(id, all);
        if (p) {
          setPropertyId(p.property_id);
          setPropertyName(p.property_name);
          setLocation(p.location);
          setPlotArea(p.plot_area_sqft.toString());
          setPriceInr(p.price_inr.toString());
          setFacing(p.facing);
          setLandType(p.land_type);
          setFacilities(p.facilities || '');
          setLatitude(p.latitude ? p.latitude.toString() : '');
          setLongitude(p.longitude ? p.longitude.toString() : '');
          setSourceUrl(p.source_url || '');
          setAvailabilityStatus(p.availability_status);
          setVerificationStatus(p.verification_status);
          setDataType(p.data_type);
          setNotes(p.notes || '');
          setImages(p.image_urls || []);
          setCoverImage(p.cover_image || (p.image_urls && p.image_urls[0]) || '');
        }
        setLoading(false);
      });
    } else {
      // Auto-generate fresh property ID
      setPropertyId(`ACR-CUSTOM-${Math.floor(100 + Math.random() * 900)}`);
      setCoverImage(LAND_IMAGE_GALLERY[0]);
      setImages([LAND_IMAGE_GALLERY[0], LAND_IMAGE_GALLERY[1]]);
      setLoading(false);
    }
  }, [id, isEditing]);

  // Computed rate per sqft
  const areaNum = parseFloat(plotArea) || 0;
  const priceNum = parseFloat(priceInr) || 0;
  const computedRate = areaNum > 0 && priceNum > 0 ? Math.round((priceNum / areaNum) * 100) / 100 : 0;

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      const updated = [...images, newImageUrl.trim()];
      setImages(updated);
      if (!coverImage) setCoverImage(newImageUrl.trim());
      setNewImageUrl('');
    }
  };

  const handleSelectPreloaded = (url: string) => {
    if (!images.includes(url)) {
      setImages([...images, url]);
      if (!coverImage) setCoverImage(url);
    }
  };

  const handleRemoveImage = (imgUrl: string) => {
    const updated = images.filter((img) => img !== imgUrl);
    setImages(updated);
    if (coverImage === imgUrl) {
      setCoverImage(updated[0] || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName.trim() || !location.trim() || areaNum <= 0 || priceNum <= 0) {
      setStatusMessage({
        type: 'error',
        text: 'Please provide valid property title, location, positive plot area, and positive asking price.',
      });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    const propertyPayload: Property = {
      id: propertyId.trim(),
      property_id: propertyId.trim(),
      property_name: propertyName.trim(),
      location: location.trim(),
      plot_area_sqft: areaNum,
      price_inr: priceNum,
      price_per_sqft_inr: computedRate,
      facing,
      land_type: landType,
      facilities: facilities.trim() || 'Not specified',
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      source_url: sourceUrl.trim() || null,
      availability_status: availabilityStatus,
      verification_status: verificationStatus,
      data_type: dataType,
      notes: notes.trim(),
      image_urls: images.length > 0 ? images : [coverImage],
      cover_image: coverImage || images[0] || LAND_IMAGE_GALLERY[0],
      updated_at: new Date().toISOString(),
    };

    const res = await repository.saveProperty(propertyPayload);
    setSaving(false);

    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: `Property ${propertyId} saved successfully into Supabase!`,
      });
      setTimeout(() => {
        navigate('/admin/properties');
      }, 1200);
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Failed to save property.',
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-[#71817A]">Loading property editor...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DCEBE4]">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/properties"
            className="p-2 rounded-xl border border-[#DCEBE4] bg-white text-[#71817A] hover:text-[#142B25] hover:border-[#087F5B] transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#142B25]">
              {isEditing ? `Edit Plot: ${propertyId}` : 'Add New Land Parcel'}
            </h1>
            <p className="text-xs text-[#71817A]">
              Configure spatial boundaries, pricing, and documentation flags
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#087F5B] bg-white border border-[#DCEBE4] hover:border-[#00E6A0] rounded-xl transition-all shadow-2xs"
        >
          <Eye className="w-3.5 h-3.5 text-[#00E6A0]" />
          <span>{showPreview ? 'Hide Preview' : 'Live Preview'}</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-[#B8FFE5]/40 border border-[#00E6A0] text-[#087F5B]'
              : 'bg-red-50 border border-red-300 text-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Live Preview Drawer if toggled */}
      {showPreview && (
        <div className="p-5 bg-white rounded-2xl border-2 border-[#00E6A0] space-y-3 shadow-[0_0_15px_rgba(0,230,160,0.2)]">
          <div className="flex items-center justify-between text-xs font-bold text-[#087F5B]">
            <span>Card Preview (How buyers see this plot):</span>
            <span className="font-mono">{propertyId}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 text-xs">
              <div className="font-serif text-lg font-bold text-[#142B25]">
                {propertyName || 'Untitled Land Parcel'}
              </div>
              <div className="text-[#71817A]">📍 {location || 'Chennai Region'}</div>
              <div className="text-xl font-bold text-[#087F5B] pt-2">
                {formatINR(priceNum)} • <span className="text-xs text-[#71817A] font-normal">{computedRate} ₹/sq.ft</span>
              </div>
              <div className="text-[#142B25] font-medium">
                Area: {formatPlotArea(areaNum)} ({facing} facing)
              </div>
            </div>
            <div className="aspect-[16/9] bg-slate-100 rounded-xl overflow-hidden border border-[#DCEBE4]">
              <img
                src={coverImage || LAND_IMAGE_GALLERY[0]}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#DCEBE4] p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Basic Metadata */}
        <div>
          <h3 className="font-serif text-base font-bold text-[#142B25] mb-4 pb-2 border-b border-[#DCEBE4]">
            1. Core Identification & Location
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#142B25] mb-1">
                Property ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={isEditing}
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl disabled:opacity-60 text-[#142B25] font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#142B25] mb-1">
                Plot Title / Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                placeholder="e.g. Prime Corner Villa Plot in Padur"
                className="w-full px-3 py-2 text-xs bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#142B25] mb-1">
                Location / Locality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Melakottaiyur, Chennai"
                className="w-full px-3 py-2 text-xs bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#142B25] mb-1">
                Classification Type
              </label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value as DataType)}
                className="w-full px-3 py-2 text-xs font-bold bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
              >
                <option value="REAL_ADVERTISED">Public Advertised</option>
                <option value="DEMO_SYNTHETIC">Synthetic Demo Record</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Area */}
        <div>
          <h3 className="font-serif text-base font-bold text-[#142B25] mb-4 pb-2 border-b border-[#DCEBE4]">
            2. Plot Extent & Pricing
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#142B25] mb-1">
                Plot Area (sq.ft) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={plotArea}
                onChange={(e) => setPlotArea(e.target.value)}
                placeholder="2400"
                className="w-full px-3 py-2 text-xs bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
              />
              <span className="text-[10px] text-[#71817A] mt-1 block font-medium">
                {formatPlotArea(areaNum)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#142B25] mb-1">
                Asking Price (₹ INR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={priceInr}
                onChange={(e) => setPriceInr(e.target.value)}
                placeholder="7500000"
                className="w-full px-3 py-2 text-xs bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
              />
              <span className="text-[10px] text-[#087F5B] font-bold mt-1 block">
                {formatINR(priceNum)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#142B25] mb-1">
                Computed Price per sq.ft
              </label>
              <div className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#B8FFE5]/40 border border-[#00E6A0]/40 rounded-xl text-[#087F5B]">
                ₹{computedRate.toLocaleString('en-IN')} / sq.ft
              </div>
              <span className="text-[10px] text-[#71817A] mt-1 block">
                Auto-calculated ratio
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#142B25] mb-1">
                Facing Orientation
              </label>
              <select
                value={facing}
                onChange={(e) => setFacing(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
              >
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="North East">North East</option>
                <option value="North West">North West</option>
                <option value="South East">South East</option>
                <option value="South West">South West</option>
                <option value="Not specified">Not specified</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#142B25] mb-1">
                Land Category
              </label>
              <input
                type="text"
                value={landType}
                onChange={(e) => setLandType(e.target.value)}
                placeholder="Residential plot"
                className="w-full px-3 py-2 text-xs bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl text-[#142B25]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#142B25] mb-1">
                Availability Status
              </label>
              <input
                type="text"
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value)}
                placeholder="Available"
                className="w-full px-3 py-2 text-xs bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl text-[#142B25]"
              />
            </div>
          </div>
        </div>

        {/* Spatial Coordinates & Documentation */}
        <div>
          <h3 className="font-serif text-base font-bold text-[#142B25] mb-4 pb-2 border-b border-[#DCEBE4]">
            3. Coordinates & Facilities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#142B25] mb-1">
                Latitude (e.g. 12.9812)
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="12.981234"
                className="w-full px-3 py-2 text-xs bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl text-[#142B25]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#142B25] mb-1">
                Longitude (e.g. 80.1423)
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="80.142345"
                className="w-full px-3 py-2 text-xs bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl text-[#142B25]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#142B25] mb-1">
                Facilities & Road Access Details
              </label>
              <input
                type="text"
                value={facilities}
                onChange={(e) => setFacilities(e.target.value)}
                placeholder="Gated community; 30ft blacktop road; EB connection; DTCP approved"
                className="w-full px-3 py-2 text-xs bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl text-[#142B25]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#142B25] mb-1">
                Public Source URL (if advertised)
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl text-[#142B25]"
              />
            </div>
          </div>
        </div>

        {/* Image Management */}
        <div>
          <h3 className="font-serif text-base font-bold text-[#142B25] mb-4 pb-2 border-b border-[#DCEBE4]">
            4. Image Management
          </h3>

          <div className="space-y-4">
            {/* Add Image input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Add Image URL (https://...)"
                className="flex-1 px-3 py-2 text-xs bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl text-[#142B25]"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 bg-[#087F5B] text-white text-xs font-bold rounded-xl hover:bg-[#066346] transition-all shadow-2xs"
              >
                Add Image
              </button>
            </div>

            {/* Quick choose from authentic stock gallery */}
            <div>
              <span className="text-[11px] text-[#71817A] font-bold block mb-2">
                Or select verified land imagery:
              </span>
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {LAND_IMAGE_GALLERY.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectPreloaded(url)}
                    className="w-16 h-12 rounded-xl overflow-hidden border border-[#DCEBE4] shrink-0 hover:border-[#00E6A0] transition-all"
                  >
                    <img src={url} alt="land" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 group ${
                    coverImage === img ? 'border-[#00E6A0] ring-2 ring-[#00E6A0]/20' : 'border-[#DCEBE4]'
                  }`}
                >
                  <img src={img} alt="plot" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCoverImage(img)}
                      className="px-2.5 py-1 bg-[#00E6A0] text-[#142B25] text-[10px] font-bold rounded-md"
                    >
                      {coverImage === img ? 'Cover ✓' : 'Set Cover'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img)}
                      className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {coverImage === img && (
                    <span className="absolute top-1 left-1 bg-[#00E6A0] text-[#142B25] text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                      Cover Image
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-[#DCEBE4] flex items-center justify-end gap-3">
          <Link
            to="/admin/properties"
            className="px-4 py-2.5 text-xs font-bold text-[#71817A] hover:text-[#142B25] bg-white border border-[#DCEBE4] rounded-xl transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#087F5B] hover:bg-[#066346] disabled:opacity-50 rounded-xl shadow-md flex items-center gap-2 transition-all hover:shadow-[0_0_12px_rgba(0,230,160,0.3)]"
          >
            <Save className="w-4 h-4 text-[#00E6A0]" />
            <span>{saving ? 'Persisting Property...' : 'Save Property Listing'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
