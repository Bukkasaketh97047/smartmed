/**
 * Smart "Frequently Bought Together" recommendation mapping.
 * Key: Product name (must match exactly as stored in the DB)
 * Value: Array of { name, reason } — products often needed alongside the key
 *
 * This is intentionally a name-based map (not ID-based) so it doesn't break
 * when backend IDs change. The cart logic looks up live product objects by name.
 */

export const MEDICINE_RECOMMENDATIONS = {
  // Fever / Pain
  "Paracetamol 500mg": [
    { name: "ORS Electrolyte Sachet",  reason: "Prevents dehydration during fever" },
    { name: "Ibuprofen 400mg",         reason: "Stronger pain relief option" },
    { name: "Vitamin C 500mg",         reason: "Speed up recovery" },
  ],
  "Dolo 650": [
    { name: "ORS Electrolyte Sachet",  reason: "Stay hydrated during fever" },
    { name: "Cetirizine 10mg",         reason: "If fever with cold symptoms" },
    { name: "Vitamin C 500mg",         reason: "Boost immunity" },
  ],
  "Ibuprofen 400mg": [
    { name: "Omeprazole 20mg",         reason: "Protect stomach lining with NSAID use" },
    { name: "Paracetamol 500mg",       reason: "Alternate for mild pain" },
  ],

  // Antibiotics
  "Azithromycin 500mg": [
    { name: "Omeprazole 20mg",         reason: "Protect gut during antibiotics" },
    { name: "Vitamin C 500mg",         reason: "Support immune response" },
    { name: "Zinc 50mg",              reason: "Speed up recovery" },
  ],
  "Amoxicillin 500mg": [
    { name: "Pantoprazole 40mg",       reason: "Prevent acidity from antibiotics" },
    { name: "Zinc 50mg",              reason: "Boost immunity" },
  ],

  // Diabetes
  "Metformin 500mg": [
    { name: "Vitamin B12 500mcg",      reason: "Metformin depletes B12" },
    { name: "Vitamin D3 1000IU",       reason: "Commonly low in diabetics" },
    { name: "Zinc 50mg",              reason: "Supports glucose metabolism" },
  ],
  "Glimepiride 2mg": [
    { name: "Metformin 500mg",         reason: "Commonly prescribed together" },
    { name: "Vitamin B12 500mcg",      reason: "Essential for diabetics" },
  ],

  // Heart
  "Atorvastatin 20mg": [
    { name: "Vitamin D3 1000IU",       reason: "Heart health support" },
    { name: "Multivitamin Complex",    reason: "Complete nutrition" },
  ],
  "Amlodipine 5mg": [
    { name: "Losartan 50mg",           reason: "Often prescribed together for BP" },
    { name: "Calcium 500mg + D3",      reason: "Bone health while on BP meds" },
  ],

  // Allergy
  "Cetirizine 10mg": [
    { name: "Montelukast 10mg",        reason: "Combined for better allergy control" },
    { name: "Vitamin C 500mg",         reason: "Natural antihistamine support" },
  ],

  // ORS / Gut
  "ORS Electrolyte Sachet": [
    { name: "Zinc 50mg",              reason: "Reduces diarrhea duration" },
    { name: "Paracetamol 500mg",       reason: "If fever accompanies diarrhea" },
  ],

  // Vitamins cross-sell
  "Vitamin D3 1000IU": [
    { name: "Calcium 500mg + D3",      reason: "Works better with calcium" },
    { name: "Vitamin B12 500mcg",      reason: "Energy & nerve support" },
  ],
  "Vitamin C 500mg": [
    { name: "Zinc 50mg",              reason: "Powerful immunity combo" },
    { name: "Multivitamin Complex",    reason: "Complete nutrition boost" },
  ],
};

/**
 * Compute "Frequently Bought Together" recommendations for the current cart.
 * @param {Array} cartItems - Cart items (each must have a `name` field)
 * @param {Array} allProducts - Full product list from context / API
 * @returns {Array} - Up to 6 unique recommended product objects, each with `reason` & `basedOn`
 */
export function getCartRecommendations(cartItems, allProducts) {
  if (!cartItems?.length || !allProducts?.length) return [];

  const recommendations = [];
  const cartNames = new Set(cartItems.map((i) => i.name?.toLowerCase()));

  for (const cartItem of cartItems) {
    const recs = MEDICINE_RECOMMENDATIONS[cartItem.name] || [];
    for (const rec of recs) {
      // Skip if already in cart or already recommended
      if (
        cartNames.has(rec.name.toLowerCase()) ||
        recommendations.find((r) => r.name?.toLowerCase() === rec.name.toLowerCase())
      ) {
        continue;
      }

      // Look up the live product object
      const product = allProducts.find(
        (p) => p.name?.toLowerCase() === rec.name.toLowerCase()
      );

      if (product) {
        recommendations.push({
          ...product,
          reason: rec.reason,
          basedOn: cartItem.name,
        });
      }
    }
  }

  return recommendations.slice(0, 6);
}
