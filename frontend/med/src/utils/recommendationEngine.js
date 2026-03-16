export const getRecommendations = (cartItems, allProducts) => {
    if (!cartItems || cartItems.length === 0) return [];

    // Mapping of category to related categories
    const categoryMap = {
        "Fever & Pain": ["Medical Devices", "Digestive Health"],
        "Cold & Cough": ["Vitamins", "Personal Care"],
        "Digestive Health": ["Vitamins", "First Aid"],
        "First Aid": ["Personal Care", "Medical Devices"],
        "Medical Devices": ["First Aid", "Personal Care"],
        "Vitamins": ["Personal Care", "Digestive Health"],
        "Personal Care": ["First Aid", "Medical Devices"]
    };

    // Product-specific overrides (e.g. Dolo -> Thermometer)
    const productSpecificMap = {
        "Dolo 650": ["Digital Thermometer", "ORS Packets"],
        "Paracetamol 500mg": ["Digital Thermometer"],
        "Vicks Action 500": ["Strepsils Honey", "Vaporizer Machine"]
    };

    // Get categories of items in cart
    const cartCategories = [...new Set(cartItems.map(item => item.category))];

    // Get names of items in cart
    const cartItemNames = cartItems.map(item => item.name);

    // Get recommended items from specific map
    const specificRecommendations = [];
    cartItemNames.forEach(name => {
        if (productSpecificMap[name]) {
            specificRecommendations.push(...productSpecificMap[name]);
        }
    });

    // Get recommended categories
    const recommendedCategories = [];
    cartCategories.forEach(cat => {
        if (categoryMap[cat]) {
            recommendedCategories.push(...categoryMap[cat]);
        }
    });

    const uniqueRecommendedCats = [...new Set(recommendedCategories)];

    // Filter all products to find suggestions
    // Exclude items already in cart
    const cartItemIds = new Set(cartItems.map(item => item.id));

    const suggestions = allProducts.filter(p =>
        (uniqueRecommendedCats.includes(p.category) || specificRecommendations.includes(p.name)) &&
        !cartItemIds.has(p.id)
    );

    // Return a sample of suggestions (e.g., top 4)
    return suggestions.sort(() => 0.5 - Math.random()).slice(0, 4);
};
