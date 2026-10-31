import type { Property, ImportSummary, DataType } from '../types/property';

// Curated authentic land photography assets for plots & developments across Tamil Nadu & India
export const LAND_IMAGE_GALLERY = [
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80', // Vast green field horizon
  'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1400&q=80', // Rural land with trees and boundary path
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1400&q=80', // Plotted land parcel with vegetation
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80', // Rolling hills & open terrain
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1400&q=80', // Clean meadow plot layout
  'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1400&q=80', // Boundary layout with tree line
  'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=1400&q=80', // Farmland parcel with access road
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80', // Wide green open land expanse
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=80', // Forest border residential plot
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80', // Scenic natural countryside plot
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80', // Wide scenic valley parcel
  'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1400&q=80', // Green trees and boundary clearing
  'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1400&q=80', // Sunrise over plotted open meadow
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1400&q=80', // Highland plateau development site
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1400&q=80', // Verdant agricultural acreage
  'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=1400&q=80', // Lush green field with fence path
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80', // Sunlit wooded boundary parcel
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1400&q=80', // Sunlit nature clearing
  'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=1400&q=80', // Clear open countryside acreage
  'https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=1400&q=80', // Country road running through land
  'https://images.unsplash.com/photo-1498429089284-41f8cf3ffd39?auto=format&fit=crop&w=1400&q=80', // Rolling pasture land
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80', // Expansive nature plot
];

/**
 * Deterministically generates rich land gallery images for any property ID
 * ensuring no property is ever left without high-quality photography.
 */
export function getLandImagesForProperty(id: string, count = 4): { cover_image: string; image_urls: string[] } {
  let hash = 0;
  const str = String(id || 'ACR-DEFAULT');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  const selected: string[] = [];
  const galleryLen = LAND_IMAGE_GALLERY.length;

  for (let step = 0; step < count; step++) {
    const idx = (positiveHash + step * 7 + 3) % galleryLen;
    const img = LAND_IMAGE_GALLERY[idx];
    if (!selected.includes(img)) {
      selected.push(img);
    }
  }

  // Fallback to fill up to count
  let fIdx = 0;
  while (selected.length < count && fIdx < galleryLen) {
    if (!selected.includes(LAND_IMAGE_GALLERY[fIdx])) {
      selected.push(LAND_IMAGE_GALLERY[fIdx]);
    }
    fIdx++;
  }

  return {
    cover_image: selected[0] || LAND_IMAGE_GALLERY[0],
    image_urls: selected,
  };
}

// Approximate area coordinates for Chennai localities (for real advertised listings)
// Explicitly tagged as approximate area centers per prompt requirements
export const CHENNAI_APPROXIMATE_CENTERS: Record<string, { lat: number; lng: number }> = {
  melakottaiyur: { lat: 12.8465, lng: 80.1415 },
  chengalpet: { lat: 12.6939, lng: 79.9757 },
  vettuvankeni: { lat: 12.9231, lng: 80.2524 },
  thiruninravur: { lat: 13.1180, lng: 80.0270 },
  sriperumbudur: { lat: 12.9700, lng: 79.9400 },
  pallavaram: { lat: 12.9675, lng: 80.1491 },
  kuthambakkam: { lat: 13.0645, lng: 80.0245 },
  urapakkam: { lat: 12.8672, lng: 80.0699 },
  padur: { lat: 12.8050, lng: 80.2220 },
  chromepet: { lat: 12.9516, lng: 80.1462 },
  tambaram: { lat: 12.9249, lng: 80.1000 },
  perungalathur: { lat: 12.9048, lng: 80.0881 },
  vandalur: { lat: 12.8912, lng: 80.0810 },
  guduvancheri: { lat: 12.8439, lng: 80.0601 },
  kelambakkam: { lat: 12.7865, lng: 80.2205 },
  siruseri: { lat: 12.8315, lng: 80.2250 },
  medavakkam: { lat: 12.9174, lng: 80.1925 },
  mambakkam: { lat: 12.8645, lng: 80.1695 },
  avadi: { lat: 13.1147, lng: 80.1098 },
  poonamallee: { lat: 13.0489, lng: 80.0934 },
  porur: { lat: 13.0335, lng: 80.1560 },
  madhavaram: { lat: 13.1501, lng: 80.2312 },
  redhills: { lat: 13.1872, lng: 80.2014 },
  padappai: { lat: 12.8778, lng: 80.0345 },
  oragadam: { lat: 12.8275, lng: 79.9401 },
};

/**
 * Robust CSV parser that correctly handles quoted strings with internal commas and newlines
 */
export function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Transform parsed CSV rows into typed Property objects with validation
 */
export function processRawRows(rawRows: string[][]): {
  properties: Property[];
  summary: ImportSummary;
} {
  if (rawRows.length === 0) {
    return {
      properties: [],
      summary: {
        totalProcessed: 0,
        advertisedCount: 0,
        demoCount: 0,
        errorsCount: 0,
        duplicateCount: 0,
        message: 'CSV file is empty.',
      },
    };
  }

  const header = rawRows[0].map((h) => h.toLowerCase().trim());
  const expectedIndices = {
    property_id: header.indexOf('property_id'),
    property_name: header.indexOf('property_name'),
    location: header.indexOf('location'),
    plot_area_sqft: header.indexOf('plot_area_sqft'),
    price_inr: header.indexOf('price_inr'),
    price_per_sqft_inr: header.indexOf('price_per_sqft_inr'),
    facing: header.indexOf('facing'),
    land_type: header.indexOf('land_type'),
    facilities: header.indexOf('facilities'),
    latitude: header.indexOf('latitude'),
    longitude: header.indexOf('longitude'),
    source_url: header.indexOf('source_url'),
    availability_status: header.indexOf('availability_status'),
    verification_status: header.indexOf('verification_status'),
    data_type: header.indexOf('data_type'),
    notes: header.indexOf('notes'),
  };

  const properties: Property[] = [];
  const seenIds = new Set<string>();
  let advertisedCount = 0;
  let demoCount = 0;
  let errorsCount = 0;
  let duplicateCount = 0;

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (row.length < 5) continue; // Skip incomplete lines

    const property_id = (expectedIndices.property_id >= 0 ? row[expectedIndices.property_id] : row[0]) || `ACR-${i}`;

    if (seenIds.has(property_id)) {
      duplicateCount++;
      continue;
    }
    seenIds.add(property_id);

    const property_name = (expectedIndices.property_name >= 0 ? row[expectedIndices.property_name] : row[1]) || 'Land Parcel';
    const location = (expectedIndices.location >= 0 ? row[expectedIndices.location] : row[2]) || 'Chennai Region';
    const areaRaw = expectedIndices.plot_area_sqft >= 0 ? row[expectedIndices.plot_area_sqft] : row[3];
    const priceRaw = expectedIndices.price_inr >= 0 ? row[expectedIndices.price_inr] : row[4];

    const plot_area_sqft = parseFloat(areaRaw) || 0;
    const price_inr = parseFloat(priceRaw) || 0;

    if (plot_area_sqft <= 0 || price_inr <= 0) {
      errorsCount++;
      continue;
    }

    const price_per_sqft_inr = Math.round((price_inr / plot_area_sqft) * 100) / 100;
    const facing = (expectedIndices.facing >= 0 ? row[expectedIndices.facing] : row[6]) || 'Not specified';
    const land_type = (expectedIndices.land_type >= 0 ? row[expectedIndices.land_type] : row[7]) || 'Residential plot';
    const facilities = (expectedIndices.facilities >= 0 ? row[expectedIndices.facilities] : row[8]) || 'Not specified';

    let lat = expectedIndices.latitude >= 0 && row[expectedIndices.latitude] ? parseFloat(row[expectedIndices.latitude]) : null;
    let lng = expectedIndices.longitude >= 0 && row[expectedIndices.longitude] ? parseFloat(row[expectedIndices.longitude]) : null;
    let is_approximate_coord = false;

    const source_url = (expectedIndices.source_url >= 0 ? row[expectedIndices.source_url] : row[11]) || null;
    const availability_status = (expectedIndices.availability_status >= 0 ? row[expectedIndices.availability_status] : row[12]) || 'Available';
    const verification_status = (expectedIndices.verification_status >= 0 ? row[expectedIndices.verification_status] : row[13]) || 'Advertised listing; not independently verified';
    const rawDataType = (expectedIndices.data_type >= 0 ? row[expectedIndices.data_type] : row[14]) || '';
    const notes = (expectedIndices.notes >= 0 ? row[expectedIndices.notes] : row[15]) || '';

    const data_type: DataType = rawDataType.toUpperCase().includes('REAL') ? 'REAL_ADVERTISED' : 'DEMO_SYNTHETIC';

    if (data_type === 'REAL_ADVERTISED') {
      advertisedCount++;
      // If coordinates are missing for real listings, assign approximate center coordinates of the locality
      // with explicit is_approximate_coord = true flag per prompt instructions
      if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
        const lowerLoc = location.toLowerCase();
        for (const [key, coords] of Object.entries(CHENNAI_APPROXIMATE_CENTERS)) {
          if (lowerLoc.includes(key)) {
            lat = coords.lat;
            lng = coords.lng;
            is_approximate_coord = true;
            break;
          }
        }
      }
    } else {
      demoCount++;
    }

    // Assign rich, varied land photography gallery (4 distinct photos per plot)
    const { cover_image, image_urls } = getLandImagesForProperty(property_id, 4);

    properties.push({
      id: property_id,
      property_id,
      property_name,
      location,
      plot_area_sqft,
      price_inr,
      price_per_sqft_inr,
      facing,
      land_type,
      facilities,
      latitude: lat,
      longitude: lng,
      is_approximate_coord,
      source_url: source_url && source_url.trim() ? source_url.trim() : null,
      availability_status,
      verification_status,
      data_type,
      notes,
      image_urls,
      cover_image,
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return {
    properties,
    summary: {
      totalProcessed: properties.length,
      advertisedCount,
      demoCount,
      errorsCount,
      duplicateCount,
      message: `Processed ${properties.length} land records successfully (${advertisedCount} publicly advertised, ${demoCount} synthetic demo).`,
    },
  };
}

/**
 * Fetch and load the full 300 dataset from the public asset file
 */
export async function loadDatasetFromCSV(): Promise<{
  properties: Property[];
  summary: ImportSummary;
}> {
  try {
    const response = await fetch('/assets/aistudio/acrelyn_land_dataset_300_bd2b547f.csv');
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: Failed to load CSV dataset`);
    }
    const text = await response.text();
    const rows = parseCSV(text);
    return processRawRows(rows);
  } catch (error) {
    console.error('Failed to fetch dataset CSV:', error);
    return {
      properties: [],
      summary: {
        totalProcessed: 0,
        advertisedCount: 0,
        demoCount: 0,
        errorsCount: 1,
        duplicateCount: 0,
        message: error instanceof Error ? error.message : 'Unknown dataset load error',
      },
    };
  }
}
