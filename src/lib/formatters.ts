/**
 * Currency formatting for Indian Rupees (INR)
 * Formats large amounts to Lakhs (L) and Crores (Cr) with precision
 */
export function formatINR(amount: number, compact: boolean = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Price on Request';
  if (amount <= 0) return 'Price on Request';

  if (!compact) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr.toFixed(cr % 1 === 0 ? 0 : 2)} Cr`;
  } else if (amount >= 100000) {
    const lk = amount / 100000;
    return `₹${lk.toFixed(lk % 1 === 0 ? 0 : 2)} L`;
  } else if (amount >= 1000) {
    const th = amount / 1000;
    return `₹${th.toFixed(1)} K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Format plot area with square feet and Chennai land units (Grounds / Cents)
 */
export function formatPlotArea(sqft: number): string {
  if (!sqft || isNaN(sqft) || sqft <= 0) return 'Area not specified';
  const sqftFormatted = `${sqft.toLocaleString('en-IN')} sq.ft`;

  // 1 Ground = 2400 sq.ft; 1 Cent = 435.6 sq.ft; 1 Acre = 43560 sq.ft
  if (sqft >= 43560) {
    const acres = (sqft / 43560).toFixed(2);
    return `${sqftFormatted} (${acres} Acres)`;
  } else if (sqft >= 2400) {
    const grounds = (sqft / 2400).toFixed(2);
    return `${sqftFormatted} (${grounds} Grounds)`;
  } else if (sqft >= 435.6) {
    const cents = (sqft / 435.6).toFixed(1);
    return `${sqftFormatted} (${cents} Cents)`;
  }
  return sqftFormatted;
}

export function formatPricePerSqft(rate: number): string {
  if (!rate || isNaN(rate) || rate <= 0) return 'N/A';
  return `₹${Math.round(rate).toLocaleString('en-IN')} / sq.ft`;
}

export function formatDate(isoString?: string): string {
  if (!isoString) return 'Recent';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Recent';
  }
}
