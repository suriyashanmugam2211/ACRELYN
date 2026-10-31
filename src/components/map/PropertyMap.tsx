import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Maximize2, MapPin, Sparkles } from 'lucide-react';
import type { Property } from '../../types/property';
import { formatINR, formatPlotArea } from '../../lib/formatters';
import { getLandImagesForProperty, LAND_IMAGE_GALLERY } from '../../lib/dataset';

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string | null;
  highlightedPropertyId?: string | null;
  onSelectProperty?: (propertyId: string) => void;
  className?: string;
  zoomLevel?: number;
  center?: [number, number];
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedPropertyId,
  highlightedPropertyId,
  onSelectProperty,
  className = 'h-full w-full',
  zoomLevel = 11,
  center = [12.98, 80.14], // Chennai Region Default
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: zoomLevel,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Update Markers when properties change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    markersMapRef.current.clear();

    const validProperties = properties.filter(
      (p) => p.latitude !== null && p.longitude !== null && !isNaN(p.latitude) && !isNaN(p.longitude)
    );

    if (validProperties.length === 0) return;

    const bounds = L.latLngBounds([]);

    validProperties.forEach((property) => {
      const lat = property.latitude!;
      const lng = property.longitude!;
      bounds.extend([lat, lng]);

      const isSelected = property.property_id === selectedPropertyId;
      const isHighlighted = property.property_id === highlightedPropertyId;
      const isDemo = property.data_type === 'DEMO_SYNTHETIC';
      const isApprox = property.is_approximate_coord;

      // Custom DivIcon with Light Neon styling
      const priceText = formatINR(property.price_inr, true);
      const markerHtml = `
        <div class="acrelyn-neon-marker cursor-pointer ${
          isSelected || isHighlighted ? 'scale-115 z-50' : 'z-10 hover:scale-110'
        }">
          <div class="acrelyn-marker-bubble ${isSelected || isHighlighted ? 'active' : ''} ${isDemo && !isSelected && !isHighlighted ? 'demo' : ''}">
            <span>${priceText}</span>
            ${isApprox ? '<span title="Approximate area center" style="font-size:9px; opacity:0.8; margin-left:2px;">~</span>' : ''}
          </div>
          <div class="acrelyn-marker-pin ${isSelected || isHighlighted ? 'pulse' : ''}" style="${
            isSelected || isHighlighted ? 'background:#00E6A0; border-color:#087F5B; box-shadow:0 0 12px #00E6A0;' : ''
          }"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'acrelyn-custom-icon',
        html: markerHtml,
        iconSize: [64, 30],
        iconAnchor: [32, 28],
        popupAnchor: [0, -28],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const fallbackImg = getLandImagesForProperty(property.property_id || property.id || 'ACR-DEFAULT', 1).cover_image;
      const markerCover = property.cover_image && property.cover_image.startsWith('http') && !property.cover_image.includes('null')
        ? property.cover_image
        : fallbackImg;

      // Popup Content with Matching Land Image
      const popupHtml = `
        <div style="width: 250px; font-family: 'Plus Jakarta Sans', sans-serif; background: #FFFFFF; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 24px rgba(8,127,91,0.18);">
          <div style="position: relative; height: 110px; background: #EAF3EF; overflow: hidden;">
            <img src="${markerCover}" alt="${property.property_name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='${LAND_IMAGE_GALLERY[0]}'" />
            <div style="position: absolute; top: 8px; left: 8px; font-size: 10px; font-family: monospace; font-weight: 700; color: #FFFFFF; background: rgba(20,43,37,0.85); padding: 2px 6px; border-radius: 6px;">
              ${property.property_id}
            </div>
            <div style="position: absolute; top: 8px; right: 8px; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; ${
              isDemo ? 'background: #FEF3C7; color: #92400E;' : 'background: #00E6A0; color: #142B25;'
            }">
              ${isDemo ? 'DEMO' : 'ADVERTISED'}
            </div>
            <div style="position: absolute; bottom: 8px; left: 8px; font-size: 13px; font-weight: 800; color: #FFFFFF; background: rgba(8,127,91,0.92); padding: 3px 8px; border-radius: 6px;">
              ${priceText}
            </div>
          </div>
          <div style="padding: 10px 14px; background: #FFFFFF;">
            <div style="font-weight: 700; font-size: 13px; color: #142B25; line-height: 1.3; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${property.property_name}
            </div>
            <div style="font-size: 11px; color: #71817A; margin-bottom: 6px; display: flex; align-items: center; gap: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              <span>📍 ${property.location}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; font-size: 11px;">
              <span style="color: #71817A;">Extent: <strong style="color: #142B25;">${formatPlotArea(property.plot_area_sqft)}</strong></span>
              <span style="color: #087F5B; font-weight: 700;">${property.facing || 'East'} Facing</span>
            </div>
            ${
              isApprox
                ? '<div style="font-size: 10px; color: #92400E; background: #FEF3C7; padding: 3px 6px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #FDE68A;">Locality area center</div>'
                : ''
            }
            <a href="/property/${property.property_id}" style="display: block; width: 100%; text-align: center; background: #087F5B; color: #FFFFFF; padding: 7px 0; border-radius: 8px; font-size: 11px; font-weight: 700; text-decoration: none; box-shadow: 0 0 10px rgba(0, 230, 160, 0.4); transition: all 0.2s;">
              View Full Details →
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectProperty) {
          onSelectProperty(property.property_id);
        }
      });

      marker.addTo(markersLayer);
      markersMapRef.current.set(property.property_id, marker);
    });

    // Fit map bounds if there are markers and no specific property is selected
    if (bounds.isValid() && !selectedPropertyId) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [properties, selectedPropertyId, highlightedPropertyId, onSelectProperty]);

  // Pan to highlighted or selected marker
  useEffect(() => {
    const targetId = selectedPropertyId || highlightedPropertyId;
    if (!targetId) return;

    const marker = markersMapRef.current.get(targetId);
    const map = mapInstanceRef.current;
    if (marker && map) {
      const latLng = marker.getLatLng();
      map.panTo(latLng, { animate: true, duration: 0.5 });
      if (selectedPropertyId && selectedPropertyId === targetId) {
        marker.openPopup();
      }
    }
  }, [selectedPropertyId, highlightedPropertyId]);

  const handleResetBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const validProperties = properties.filter(
      (p) => p.latitude !== null && p.longitude !== null && !isNaN(p.latitude) && !isNaN(p.longitude)
    );
    if (validProperties.length === 0) return;
    const bounds = L.latLngBounds([]);
    validProperties.forEach((p) => bounds.extend([p.latitude!, p.longitude!]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#DCEBE4] bg-[#F7FAF8] shadow-sm ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px]" />

      {/* Top Map Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        <button
          onClick={handleResetBounds}
          title="Fit all markers in view"
          className="bg-white/95 backdrop-blur-md p-2 rounded-xl border border-[#DCEBE4] text-[#142B25] hover:text-[#087F5B] hover:border-[#00E6A0] hover:shadow-[0_0_12px_rgba(0,230,160,0.3)] transition-all shadow-xs flex items-center gap-1.5 text-xs font-semibold"
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#087F5B]" />
          <span className="hidden sm:inline">Fit All</span>
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[#DCEBE4] text-xs shadow-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#087F5B] border border-[#00E6A0] shadow-[0_0_6px_#00E6A0] inline-block" />
          <span className="font-semibold text-[#142B25]">Advertised</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          <span className="font-semibold text-[#71817A]">Demo Plot</span>
        </div>
        <div className="text-[#71817A] border-l border-[#DCEBE4] pl-2.5 font-medium tabular-nums">
          {properties.filter((p) => p.latitude !== null).length} plots mapped
        </div>
      </div>
    </div>
  );
};
