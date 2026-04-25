import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Blob "mo:core/Blob";
import Storage "mo:caffeineai-object-storage/Storage";
import Types "../types/catalog";
import Common "../types/common";
import NewFeatureTypes "../types/new-features";

module {
  public func toPublicProduct(p : Types.Product) : Types.ProductPublic {
    {
      id = p.id;
      name = p.name;
      description = p.description;
      price = p.price;
      categoryId = p.categoryId;
      imageBlob = p.imageBlob;
      stockQty = p.stockQty;
      rating = p.rating;
      reviewCount = p.reviewCount;
      isActive = p.isActive;
      isFeatured = p.isFeatured;
      isBestSeller = p.isBestSeller;
      isNewArrival = p.isNewArrival;
      harvestDate = p.harvestDate;
      bestBeforeDate = p.bestBeforeDate;
      bundleId = p.bundleId;
      ageRestricted = p.ageRestricted;
      ageCategory = p.ageCategory;
      createdAt = p.createdAt;
    };
  };

  public func toPublicCategory(c : Types.Category) : Types.CategoryPublic {
    {
      id = c.id;
      name = c.name;
      displayOrder = c.displayOrder;
      isActive = c.isActive;
      iconEmoji = c.iconEmoji;
    };
  };

  public func toPublicBanner(b : Types.Banner) : Types.BannerPublic {
    {
      id = b.id;
      imageBlob = b.imageBlob;
      title = b.title;
      link = b.link;
      displayOrder = b.displayOrder;
      isActive = b.isActive;
      createdAt = b.createdAt;
    };
  };

  public func toPublicReview(r : Types.Review) : Types.ReviewPublic {
    {
      id = r.id;
      productId = r.productId;
      userId = r.userId;
      rating = r.rating;
      title = r.title;
      text = r.text;
      isApproved = r.isApproved;
      helpfulCount = r.helpfulCount;
      createdAt = r.createdAt;
    };
  };

  public func toPublicFlashDeal(fd : Types.FlashDeal) : Types.FlashDealPublic {
    {
      id = fd.id;
      productId = fd.productId;
      discountPercent = fd.discountPercent;
      startDateTime = fd.startDateTime;
      endDateTime = fd.endDateTime;
      isActive = fd.isActive;
    };
  };

  public func filterProducts(
    products : Map.Map<Common.ProductId, Types.Product>,
    filters : Types.ProductFilters,
  ) : [Types.ProductPublic] {
    let results = List.empty<Types.ProductPublic>();
    for ((_, p) in products.entries()) {
      var match = true;
      if (filters.onlyActive and not p.isActive) { match := false };
      switch (filters.categoryId) {
        case (?catId) { if (p.categoryId != catId) { match := false } };
        case null {};
      };
      switch (filters.minPrice) {
        case (?mp) { if (p.price < mp) { match := false } };
        case null {};
      };
      switch (filters.maxPrice) {
        case (?mp) { if (p.price > mp) { match := false } };
        case null {};
      };
      switch (filters.minRating) {
        case (?mr) { if (p.rating < mr) { match := false } };
        case null {};
      };
      switch (filters.searchQuery) {
        case (?q) {
          let lq = q.toLower();
          let nameMatch = p.name.toLower().contains(#text lq);
          let descMatch = p.description.toLower().contains(#text lq);
          if (not nameMatch and not descMatch) { match := false };
        };
        case null {};
      };
      if (match) { results.add(toPublicProduct(p)) };
    };
    results.toArray();
  };

  public func searchProducts(
    products : Map.Map<Common.ProductId, Types.Product>,
    searchTerm : Text,
    filters : Types.ProductFilters,
  ) : [Types.ProductPublic] {
    let lq = searchTerm.toLower();
    let results = List.empty<Types.ProductPublic>();
    for ((_, p) in products.entries()) {
      if (not filters.onlyActive or p.isActive) {
        let nameMatch = p.name.toLower().contains(#text lq);
        let descMatch = p.description.toLower().contains(#text lq);
        if (nameMatch or descMatch) {
          results.add(toPublicProduct(p));
        };
      };
    };
    results.toArray();
  };

  public func getFeatured(products : Map.Map<Common.ProductId, Types.Product>) : [Types.ProductPublic] {
    let results = List.empty<Types.ProductPublic>();
    for ((_, p) in products.entries()) {
      if (p.isFeatured and p.isActive) { results.add(toPublicProduct(p)) };
    };
    results.toArray();
  };

  public func getBestSellers(products : Map.Map<Common.ProductId, Types.Product>) : [Types.ProductPublic] {
    let results = List.empty<Types.ProductPublic>();
    for ((_, p) in products.entries()) {
      if (p.isBestSeller and p.isActive) { results.add(toPublicProduct(p)) };
    };
    results.toArray();
  };

  public func getNewArrivals(products : Map.Map<Common.ProductId, Types.Product>) : [Types.ProductPublic] {
    let results = List.empty<Types.ProductPublic>();
    for ((_, p) in products.entries()) {
      if (p.isNewArrival and p.isActive) { results.add(toPublicProduct(p)) };
    };
    results.toArray();
  };

  public func getActiveFlashDeals(
    flashDeals : Map.Map<Common.FlashDealId, Types.FlashDeal>,
  ) : [Types.FlashDealPublic] {
    let now = Time.now();
    let results = List.empty<Types.FlashDealPublic>();
    for ((_, fd) in flashDeals.entries()) {
      if (fd.isActive and fd.startDateTime <= now and fd.endDateTime >= now) {
        results.add(toPublicFlashDeal(fd));
      };
    };
    results.toArray();
  };

  public func getActiveBanners(
    banners : Map.Map<Common.BannerId, Types.Banner>,
  ) : [Types.BannerPublic] {
    let results = List.empty<Types.BannerPublic>();
    for ((_, b) in banners.entries()) {
      if (b.isActive) { results.add(toPublicBanner(b)) };
    };
    results.toArray();
  };

  public func updateProductRating(
    products : Map.Map<Common.ProductId, Types.Product>,
    productId : Common.ProductId,
    reviews : List.List<Types.Review>,
  ) {
    switch (products.get(productId)) {
      case null {};
      case (?p) {
        var total = 0;
        var count = 0;
        reviews.forEach(func(r) {
          if (r.productId == productId and r.isApproved) {
            total += r.rating;
            count += 1;
          };
        });
        if (count > 0) {
          p.rating := total / count;
          p.reviewCount := count;
        };
      };
    };
  };

  // Seed 50+ products across 10 categories
  public func seedProducts(
    products : Map.Map<Common.ProductId, Types.Product>,
    categories : Map.Map<Common.CategoryId, Types.Category>,
    nextProductId : Nat,
    nextCategoryId : Nat,
  ) : (Nat, Nat) {
    let now = Time.now();
    let emptyBlob : Storage.ExternalBlob = Blob.empty();

    // Seed 10 categories
    let catData : [(Text, Text)] = [
      ("Fruits & Vegetables", "🥦"),
      ("Dairy & Eggs", "🥛"),
      ("Meat & Seafood", "🥩"),
      ("Beverages", "🥤"),
      ("Snacks & Chips", "🍿"),
      ("Frozen Foods", "🧊"),
      ("Bakery", "🍞"),
      ("Pantry & Staples", "🫙"),
      ("Personal Care", "🧴"),
      ("Home & Garden", "🏡"),
    ];

    var catId = nextCategoryId;
    for ((name, emoji) in catData.values()) {
      let cat : Types.Category = {
        id = catId;
        name = name;
        var displayOrder = catId;
        var isActive = true;
        iconEmoji = emoji;
      };
      categories.add(catId, cat);
      catId += 1;
    };

    // Category id offsets: fruits=nextCategoryId, dairy=+1, meat=+2, bev=+3, snacks=+4,
    //   frozen=+5, bakery=+6, pantry=+7, personal=+8, home=+9
    let c0 = nextCategoryId;

    // Seed products per category
    let prodData : [(Text, Text, Nat, Nat, Bool, Bool, Bool)] = [
      // (name, desc, price_cents, catOffset, isFeatured, isBestSeller, isNewArrival)
      // Fruits & Vegetables (cat +0)
      ("Fresh Bananas (1kg)", "Ripe and sweet yellow bananas, perfect for snacking", 149, 0, true, true, false),
      ("Organic Apples (6 pcs)", "Crisp Fuji apples, freshly picked from certified farms", 299, 0, true, false, false),
      ("Baby Spinach (200g)", "Tender baby spinach leaves, washed and ready to eat", 199, 0, false, false, true),
      ("Cherry Tomatoes (250g)", "Vibrant, bite-sized cherry tomatoes bursting with flavor", 249, 0, false, true, false),
      ("Red Onions (500g)", "Pungent and flavourful red onions for cooking and salads", 99, 0, false, false, false),
      ("Sweet Corn (2 pcs)", "Fresh sweet corn on the cob, great for grilling or boiling", 179, 0, false, false, true),
      // Dairy & Eggs (cat +1)
      ("Full Cream Milk (1L)", "Fresh whole milk, pasteurised and vitamin D fortified", 189, 1, true, true, false),
      ("Organic Eggs (12 pcs)", "Free-range organic eggs, rich in protein and nutrients", 349, 1, true, false, false),
      ("Greek Yogurt (400g)", "Thick and creamy Greek yogurt, high in protein", 269, 1, false, true, false),
      ("Cheddar Cheese (200g)", "Mature cheddar cheese, perfect for sandwiches and cooking", 399, 1, false, false, true),
      ("Butter Unsalted (250g)", "Rich, creamy unsalted butter for baking and cooking", 299, 1, false, true, false),
      ("Paneer (200g)", "Fresh Indian cottage cheese, great for curries and grilling", 229, 1, false, false, true),
      // Meat & Seafood (cat +2)
      ("Chicken Breast (500g)", "Boneless, skinless chicken breast, lean and versatile", 499, 2, true, true, false),
      ("Salmon Fillet (300g)", "Atlantic salmon fillet, rich in omega-3 fatty acids", 799, 2, true, false, true),
      ("Ground Beef (500g)", "Premium lean ground beef, ideal for burgers and sauces", 599, 2, false, true, false),
      ("Shrimp Cooked (250g)", "Peeled and deveined cooked shrimp, ready to eat", 649, 2, false, false, true),
      ("Lamb Chops (400g)", "Tender New Zealand lamb chops, great for grilling", 899, 2, false, false, false),
      // Beverages (cat +3)
      ("Orange Juice 1L", "100% pure squeezed orange juice, no added sugar", 249, 3, true, true, false),
      ("Sparkling Water (6x500ml)", "Refreshing sparkling mineral water, zero calories", 299, 3, false, true, false),
      ("Green Tea (25 bags)", "Premium Japanese green tea, rich in antioxidants", 199, 3, false, false, true),
      ("Cold Brew Coffee (500ml)", "Smooth and bold cold brew coffee, ready to drink", 349, 3, true, false, true),
      ("Coconut Water (330ml)", "Natural coconut water with electrolytes, no added sugar", 179, 3, false, true, false),
      ("Mango Smoothie (300ml)", "Thick, creamy mango smoothie made with real fruit", 229, 3, false, false, true),
      // Snacks & Chips (cat +4)
      ("Sea Salt Potato Chips (150g)", "Crispy, light potato chips lightly dusted with sea salt", 149, 4, false, true, false),
      ("Mixed Nuts (200g)", "Premium mix of cashews, almonds, pistachios and walnuts", 499, 4, true, false, false),
      ("Dark Chocolate Bar (100g)", "70% cocoa dark chocolate, ethically sourced", 249, 4, false, true, true),
      ("Rice Crackers (100g)", "Light and crispy rice crackers, gluten-free snack", 129, 4, false, false, false),
      ("Granola Bars (6 pcs)", "Wholesome oat and honey granola bars with dried fruit", 299, 4, true, false, true),
      ("Popcorn Butter (100g)", "Movie-style buttered popcorn, ready to pop", 99, 4, false, true, false),
      // Frozen Foods (cat +5)
      ("Frozen Pizza Margherita", "Classic Neapolitan pizza with tomato, basil and mozzarella", 599, 5, true, true, false),
      ("Frozen Mixed Vegetables (500g)", "Blanched and flash-frozen mixed vegetables blend", 249, 5, false, true, false),
      ("Ice Cream Vanilla (500ml)", "Rich, creamy vanilla ice cream made with real milk", 349, 5, true, false, false),
      ("Frozen Fish Fingers (400g)", "Crispy golden fish fingers, ready to bake or fry", 349, 5, false, false, true),
      ("Frozen Peas (500g)", "Sweet garden peas, freshly frozen at peak ripeness", 179, 5, false, true, false),
      // Bakery (cat +6)
      ("Sourdough Loaf", "Artisan sourdough loaf with crispy crust and chewy crumb", 399, 6, true, true, false),
      ("Croissants (4 pcs)", "Buttery, flaky all-butter croissants baked fresh daily", 349, 6, true, false, true),
      ("Blueberry Muffins (4 pcs)", "Moist muffins packed with fresh blueberries", 299, 6, false, true, false),
      ("Whole Wheat Bread", "Nutritious whole wheat sandwich bread, no preservatives", 229, 6, false, false, false),
      ("Cinnamon Rolls (6 pcs)", "Soft cinnamon rolls drizzled with cream cheese frosting", 449, 6, false, false, true),
      // Pantry & Staples (cat +7)
      ("Basmati Rice (2kg)", "Premium long-grain basmati rice from the Himalayan foothills", 449, 7, false, true, false),
      ("Extra Virgin Olive Oil (500ml)", "Cold-pressed extra virgin olive oil from Greek groves", 599, 7, true, false, false),
      ("Pasta Penne (500g)", "Bronze die-cut Italian penne pasta, premium quality", 199, 7, false, true, true),
      ("Chickpeas Canned (400g)", "Ready-to-use canned chickpeas in salted water", 149, 7, false, false, false),
      ("Tomato Passata (500g)", "Smooth Italian tomato passata for pasta and sauces", 179, 7, false, true, false),
      ("Honey Raw (500g)", "Raw wildflower honey, unfiltered and unheated", 499, 7, true, false, true),
      // Personal Care (cat +8)
      ("Shampoo Anti-Dandruff (400ml)", "Clinical-strength anti-dandruff shampoo for daily use", 399, 8, false, true, false),
      ("Moisturising Body Lotion (500ml)", "Deep hydration body lotion with shea butter and aloe vera", 349, 8, true, false, false),
      ("Toothpaste Whitening (150g)", "Advanced whitening toothpaste with fluoride protection", 199, 8, false, true, true),
      ("Hand Sanitiser (300ml)", "70% alcohol hand sanitiser, kills 99.9% of germs", 149, 8, false, false, false),
      ("Sunscreen SPF50 (200ml)", "Broad-spectrum SPF50 sunscreen, water resistant", 449, 8, true, false, true),
      // Home & Garden (cat +9)
      ("Dish Soap (500ml)", "Concentrated dish soap with lemon, cuts through grease fast", 149, 9, false, true, false),
      ("All-Purpose Cleaner (750ml)", "Powerful multi-surface cleaner with fresh scent", 199, 9, false, false, false),
      ("Laundry Detergent (1kg)", "High efficiency laundry powder for all machine types", 449, 9, true, true, false),
      ("Toilet Paper 12 rolls", "Soft and strong 3-ply toilet paper, individually wrapped", 349, 9, false, true, true),
      ("Candle Soy Vanilla (200g)", "Hand-poured soy wax candle with warm vanilla scent", 299, 9, false, false, true),
    ];

    var prodId = nextProductId;
    for ((name, desc, price, catOffset, isFeatured, isBestSeller, isNewArrival) in prodData.values()) {
      let prod : Types.Product = {
        id = prodId;
        var name = name;
        var description = desc;
        var price = price;
        var categoryId = c0 + catOffset;
        var imageBlob = emptyBlob;
        var stockQty = 50 + (prodId * 7 % 150); // varied stock
        var rating = 3 + (prodId % 3);           // 3-5 star rating
        var reviewCount = prodId % 40;
        var isActive = true;
        var isFeatured = isFeatured;
        var isBestSeller = isBestSeller;
        var isNewArrival = isNewArrival;
        var harvestDate = null;
        var bestBeforeDate = null;
        var bundleId = null;
        var ageRestricted = false;
        var ageCategory = (null : ?NewFeatureTypes.AgeGatedCategory);
        createdAt = now;
      };
      products.add(prodId, prod);
      prodId += 1;
    };

    (prodId, catId);
  };
};
