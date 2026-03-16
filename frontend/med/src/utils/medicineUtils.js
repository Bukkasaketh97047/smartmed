/**
 * BULLETPROOF medicine matcher — handles real-world OCR/handwriting quirks:
 *   - Case insensitive: "PARACETAMOL" → Paracetamol 500mg
 *   - No space + mg:   "Paracetamol500mg" → Paracetamol 500mg
 *   - Digits glued:    "Cetirizine10mg"   → Cetirizine 10mg
 *   - Brand only:      "Crocin"           → Paracetamol 500mg
 *   - Short acronym:   "ORS"              → ORS Electrolyte Sachet
 *   - Partial name:    "Amox"             → Amoxicillin 500mg
 *   - Typo tolerance:  via character overlap scoring
 */

export function normalize(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(str) {
  return (str || "")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2")
    .replace(/(\d)([a-zA-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const UNITS = new Set(["mg", "mcg", "ml", "iu", "g", "tab", "cap", "syp", "inj", "sachet"]);

export function alphaTokens(tok) {
  return tok.split(" ").filter((w) => w.length >= 2 && !UNITS.has(w) && isNaN(w));
}

export function digitTokens(tok) {
  return tok.split(" ").filter((w) => /^\d+$/.test(w));
}

function charOverlap(a, b) {
  if (!a || !b) return 0;
  const shorter = a.length < b.length ? a : b;
  const longer = a.length < b.length ? b : a;
  let hits = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) hits++;
  }
  return hits / longer.length;
}

/**
 * Match a raw medicine name string against a products array.
 * @param {string} rawName - OCR-extracted or user-typed medicine name
 * @param {Array}  products - Array of product objects with { name, brand, tags, ... }
 * @returns {object|null} - Best matching product, or null if no match found
 */
export function matchMedicine(rawName, products) {
  if (!rawName || !rawName.trim() || !products || !products.length) return null;

  const raw = tokenize(rawName);
  const rawNorm = normalize(rawName);
  const rawAlpha = alphaTokens(raw);
  const rawDigit = digitTokens(raw);
  const rawAlphaStr = rawAlpha.join(" ");

  let best = null;
  let bestScore = 0;

  for (const med of products) {
    const mName = tokenize(med.name);
    const mBrand = tokenize(med.brand || "");
    const mTags = (med.tags || []).map(normalize).join(" ");
    const mNorm = normalize(med.name);
    const mBrandN = normalize(med.brand || "");
    const mAlpha = alphaTokens(mName);
    const mDigit = digitTokens(mName);
    const mAlphaStr = mAlpha.join(" ");

    let score = 0;

    if (mNorm === rawNorm || mBrandN === rawNorm || mName === raw || mBrand === raw) {
      score = 100;
    } else if (mNorm.startsWith(rawNorm) || mBrandN.startsWith(rawNorm)) {
      score = 95;
    } else if (mNorm.includes(rawNorm) || mBrandN.includes(rawNorm)) {
      score = 92;
    } else if (mName.startsWith(raw) || mBrand.startsWith(raw)) {
      score = 90;
    } else if (mName.includes(raw) || mBrand.includes(raw)) {
      score = 88;
    } else if (
      mTags.split(" ").includes(rawNorm) ||
      rawAlpha.some((t) => mTags.split(" ").includes(t))
    ) {
      score = 85;
    } else if (
      rawAlpha.length > 0 &&
      rawAlpha.every((t) => mAlphaStr.includes(t) || mBrand.includes(t))
    ) {
      const digitBoost =
        rawDigit.length > 0 && rawDigit.every((d) => mDigit.includes(d)) ? 8 : 0;
      score = 80 + digitBoost;
    } else if (rawAlpha.length > 0 && rawAlpha.every((t) => mTags.includes(t))) {
      const digitBoost =
        rawDigit.length > 0 && rawDigit.every((d) => mDigit.includes(d)) ? 10 : 0;
      score = 60 + digitBoost;
    } else if (
      rawAlpha.some((t) => t.length >= 4 && (mAlphaStr.includes(t) || mBrand.includes(t)))
    ) {
      const digitBoost =
        rawDigit.length > 0 && rawDigit.every((d) => mDigit.includes(d)) ? 10 : 0;
      score = 55 + digitBoost;
    } else if (rawAlpha.some((t) => t.length >= 4 && mTags.includes(t))) {
      score = 40;
    } else {
      const overlap = charOverlap(rawAlphaStr, mAlphaStr);
      if (overlap > 0.75) score = Math.round(35 + overlap * 20);
    }

    if (score > bestScore) {
      bestScore = score;
      best = med;
    }
  }

  return bestScore >= 35 ? best : null;
}
