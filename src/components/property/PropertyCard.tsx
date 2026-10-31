import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Scale, Compass, MapPin, ArrowRight, AlertTriangle, Check, Layers } from 'lucide-react';
import type { Property } from '../../types/property';
import { formatINR, formatPlotArea, formatPricePerSqft } from '../../lib/formatters';
import { repository } from '../../lib/storage';
import { getLandImagesForProperty, LAND_IMAGE_GALLERY } from '../../lib/dataset';

interface PropertyCardProps {
  property: Property;
  isHighlighted?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isHighlighted = false,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [inCompare, setInCompare] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Guaranteed fallback land imagery for this specific plot
  const fallback = getLandImagesForProperty(property.property_id || property.id || 'ACR-DEFAULT', 2);
  const initialImage =
    property.cover_image && property.cover_image.trim().startsWith('http') && !property.cover_image.includes('null')
      ? property.cover_image.trim()
      : property.image_urls?.[0] || fallback.cover_image;

  const [currentImageSrc, setCurrentImageSrc] = useState<string>(initialImage);

  useEffect(() => {
    const valid =
      property.cover_image && property.cover_image.trim().startsWith('http') && !property.cover_image.includes('null')
        ? property.cover_image.trim()
        : property.image_urls?.[0] || fallback.cover_image;
    setCurrentImageSrc(valid);
  }, [property.cover_image, property.property_id]);

  useEffect(() => {
    setIsSaved(repository.isSaved(property.property_id));
    setInCompare(repository.isInComparison(property.property_id));

    const unsubSaved = repository.subscribe('saved', () => {
      setIsSaved(repository.isSaved(property.property_id));
    });
    const unsubCompare = repository.subscribe('compare', () => {
      setInCompare(repository.isInComparison(property.property_id));
    });

    return () => {
      unsubSaved();
      unsubCompare();
    };
  }, [property.property_id]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = repository.toggleSaveProperty(property.property_id);
    setActionNotice(saved ? 'Saved to shortlist' : 'Removed from shortlist');
    setTimeout(() => setActionNotice(null), 2000);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = repository.toggleCompareProperty(property.property_id);
    if (result.message) {
      alert(result.message);
    } else {
      setActionNotice(result.inComparison ? 'Added to comparison' : 'Removed from comparison');
      setTimeout(() => setActionNotice(null), 2000);
    }
  };

  const isDemo = property.data_type === 'DEMO_SYNTHETIC';

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col relative ${
        isHighlighted
          ? 'border-[#00E6A0] shadow-[0_12px_32px_-4px_rgba(8,127,91,0.12),0_0_20px_rgba(0,230,160,0.35)] -translate-y-1'
          : 'border-[#DCEBE4] hover:border-[#00E6A0] hover:shadow-[0_12px_28px_-6px_rgba(8,127,91,0.08),0_0_16px_rgba(0,230,160,0.2)] hover:-translate-y-0.5'
      }`}
    >
      {/* Toast Notice */}
      {actionNotice && (
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 px-3 py-1 bg-[#087F5B] text-white text-[11px] font-semibold rounded-full shadow-[0_0_12px_rgba(0,230,160,0.5)] border border-[#00E6A0] animate-in fade-in duration-200 whitespace-nowrap">
          {actionNotice}
        </div>
      )}

      {/* Property Image Container — Always displays genuine land imagery */}
      <div className="relative aspect-[16/10] bg-[#F7FAF8] overflow-hidden">
        <img
          src={currentImageSrc}
          alt={property.property_name}
          onError={() => {
            // If primary image fails, safely swap to guaranteed fallback
            if (currentImageSrc !== fallback.cover_image) {
              setCurrentImageSrc(fallback.cover_image);
            } else {
              setCurrentImageSrc(LAND_IMAGE_GALLERY[0]);
            }
          }}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
        />

        {/* Top Badges overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          {/* Data type badge */}
          {isDemo ? (
            <span className="pointer-events-auto inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100/95 border border-amber-300 px-2.5 py-1 rounded-md shadow-xs backdrop-blur-xs">
              <AlertTriangle className="w-3 h-3 text-amber-700" />
              DEMO RECORD
            </span>
          ) : (
            <span className="pointer-events-auto inline-flex items-center gap-1 text-[10px] font-bold text-white bg-[#087F5B]/95 border border-[#00E6A0]/60 px-2.5 py-1 rounded-md shadow-[0_0_10px_rgba(0,230,160,0.3)] backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E6A0] shadow-[0_0_4px_#00E6A0]" />
              ADVERTISED
            </span>
          )}

          {/* Quick Actions (Save & Compare) */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              onClick={handleToggleCompare}
              title={inCompare ? 'Remove from comparison' : 'Add to comparison'}
              className={`p-2 rounded-lg backdrop-blur-md transition-all ${
                inCompare
                  ? 'bg-[#00E6A0] text-[#142B25] shadow-[0_0_12px_#00E6A0] scale-105 font-bold'
                  : 'bg-white/95 text-[#142B25] border border-[#DCEBE4] hover:border-[#00E6A0] hover:text-[#087F5B] hover:shadow-[0_0_10px_rgba(0,230,160,0.3)]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleToggleSave}
              title={isSaved ? 'Remove from saved' : 'Save property'}
              className={`p-2 rounded-lg backdrop-blur-md transition-all ${
                isSaved
                  ? 'bg-[#087F5B] text-white shadow-[0_0_12px_rgba(0,230,160,0.5)] border border-[#00E6A0]'
                  : 'bg-white/95 text-[#142B25] border border-[#DCEBE4] hover:border-[#00E6A0] hover:text-[#087F5B] hover:shadow-[0_0_10px_rgba(0,230,160,0.3)]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-[#00E6A0]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom Property ID Strip */}
        <div className="absolute bottom-2.5 left-3 pointer-events-none z-10">
          <span className="text-[10px] font-mono tracking-wider font-bold text-white bg-[#142B25]/80 backdrop-blur-xs px-2 py-0.5 rounded border border-white/20">
            {property.property_id}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location Line */}
          <div className="flex items-center gap-1.5 text-xs text-[#71817A] mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#00E6A0] shrink-0" />
            <span className="truncate font-medium">{property.location}</span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg font-bold text-[#142B25] group-hover:text-[#087F5B] transition-colors leading-snug line-clamp-1 mb-2.5">
            <Link to={`/property/${property.property_id}`}>
              {property.property_name}
            </Link>
          </h3>

          {/* Metadata Row: Unboxed clean text with typographic separators */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#71817A] mb-3.5">
            <span className="font-bold text-[#142B25] tabular-nums">
              {formatPlotArea(property.plot_area_sqft)}
            </span>
            <span aria-hidden="true" className="text-[#DCEBE4]">·</span>
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#087F5B]" />
              <span>{property.facing !== 'Not specified' ? `${property.facing} Facing` : 'Orientation N/S'}</span>
            </span>
            <span aria-hidden="true" className="text-[#DCEBE4]">·</span>
            <span>{property.land_type}</span>
          </div>

          {/* Approximate locality disclaimer */}
          {property.is_approximate_coord && (
            <div className="text-[11px] text-[#71817A] bg-[#F7FAF8] border border-[#DCEBE4] rounded-md px-2.5 py-1 mb-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>Locality area center (approximate)</span>
            </div>
          )}
        </div>

        {/* Price & Action Footer */}
        <div className="pt-3.5 border-t border-[#DCEBE4] flex items-center justify-between mt-auto">
          <div>
            <div className="text-xl font-bold text-[#087F5B] tabular-nums tracking-tight">
              {formatINR(property.price_inr)}
            </div>
            <div className="text-[11px] text-[#71817A] tabular-nums font-medium">
              {formatPricePerSqft(property.price_per_sqft_inr)}
            </div>
          </div>

          <Link
            to={`/property/${property.property_id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#142B25] bg-[#F7FAF8] group-hover:bg-[#00E6A0] border border-[#DCEBE4] group-hover:border-[#00E6A0] rounded-xl transition-all group-hover:shadow-[0_0_12px_rgba(0,230,160,0.4)]"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
