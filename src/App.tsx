import { useState, useEffect, useMemo } from 'react';
import { 
  SlidersHorizontal, 
  ArrowUpDown, 
  Sparkles, 
  Grid3X3,
  LayoutGrid,
  Database,
  Shield,
  Layers
} from 'lucide-react';
import { Saree, CartItem, Order, FabricType, OccasionType, WeaveType, BlouseOption, BlouseMeasurement, BoutiqueSettings } from './types';
import { SAREES_DATA } from './data/sareesData';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryPills } from './components/CategoryPills';
import { SareeCard } from './components/SareeCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrdersModal } from './components/OrdersModal';
import { WishlistModal } from './components/WishlistModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { AISareeStylistModal } from './components/AISareeStylistModal';
import { DrapeGuideModal } from './components/DrapeGuideModal';
import { FilterSidebar } from './components/FilterSidebar';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { ShareAppModal } from './components/ShareAppModal';
import { useAdminAuth } from './context/AdminAuthContext';
import { 
  seedSareesCatalogIfEmpty, 
  subscribeToSarees, 
  subscribeToOrders,
  subscribeToSettings,
  DEFAULT_BOUTIQUE_SETTINGS
} from './services/firestoreService';
import { checkWishlistPriceDrops } from './utils/priceDropHelper';

export default function App() {
  const { isAdmin } = useAdminAuth();

  // Live Firestore Data & Sync State
  const [sareesCatalog, setSareesCatalog] = useState<Saree[]>(SAREES_DATA);
  const [boutiqueSettings, setBoutiqueSettings] = useState<BoutiqueSettings>(DEFAULT_BOUTIQUE_SETTINGS);
  const [isDbLive, setIsDbLive] = useState(false);
  const [selectedStateFilter, setSelectedStateFilter] = useState<'All' | 'Telangana' | 'Andhra Pradesh'>('All');

  // Persistence state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('virasat_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Saree[]>(() => {
    try {
      const saved = localStorage.getItem('virasat_wishlist');
      if (saved) {
        const parsed: Saree[] = JSON.parse(saved);
        return parsed.map((item) => ({
          ...item,
          savedAtPrice: item.savedAtPrice ?? item.price,
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('virasat_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currency, setCurrency] = useState('INR');

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('virasat_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('virasat_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('virasat_orders', JSON.stringify(orders));
  }, [orders]);

  // Real-time Firestore Sync, Catalog Seeding & Settings
  useEffect(() => {
    let isSubscribed = true;

    // 1. Seed or retrieve initial catalog from Firestore
    seedSareesCatalogIfEmpty()
      .then((data) => {
        if (isSubscribed && data && data.length > 0) {
          setSareesCatalog(data);
          setIsDbLive(true);
        }
      })
      .catch((err) => {
        console.warn('Firestore initial sync notice:', err);
      });

    // 2. Subscribe to real-time saree catalog updates
    const unsubSarees = subscribeToSarees(
      (liveSarees) => {
        if (isSubscribed && liveSarees && liveSarees.length > 0) {
          setSareesCatalog(liveSarees);
          setIsDbLive(true);
        }
      },
      (err) => {
        console.warn('Firestore subscription fallback:', err);
      }
    );

    // 3. Subscribe to real-time orders updates
    const unsubOrders = subscribeToOrders((liveOrders) => {
      if (isSubscribed && liveOrders && liveOrders.length > 0) {
        setOrders(liveOrders);
      }
    });

    // 4. Subscribe to boutique settings updates
    const unsubSettings = subscribeToSettings((liveSettings) => {
      if (isSubscribed && liveSettings) {
        setBoutiqueSettings(liveSettings);
      }
    });

    return () => {
      isSubscribed = false;
      if (typeof unsubSarees === 'function') unsubSarees();
      if (typeof unsubOrders === 'function') unsubOrders();
      if (typeof unsubSettings === 'function') unsubSettings();
    };
  }, []);

  // Modals & Drawers
  const [selectedSaree, setSelectedSaree] = useState<Saree | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState<string>('');
  const [isStylistOpen, setIsStylistOpen] = useState(false);
  const [isDrapeGuideOpen, setIsDrapeGuideOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sareeToShare, setSareeToShare] = useState<Saree | null>(null);

  const handleOpenTrackOrder = (orderId?: string) => {
    if (orderId) {
      setTrackOrderId(orderId);
    }
    setIsTrackOrderOpen(true);
  };

  // Admin Modals
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Checkout promo pass-through
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutPromoCode, setCheckoutPromoCode] = useState('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedFabrics, setSelectedFabrics] = useState<FabricType[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<OccasionType[]>([]);
  const [selectedWeaves, setSelectedWeaves] = useState<WeaveType[]>([]);
  const [silkMarkOnly, setSilkMarkOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(60000);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [gridColumns, setGridColumns] = useState<3 | 4>(3);

  // Category change handler tailored for Andhra Pradesh & Telangana handlooms
  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    if (catId === 'pochampally') {
      setSelectedFabrics(['Pochampally Ikkat']);
      setSelectedOccasions([]);
    } else if (catId === 'gadwal') {
      setSelectedFabrics(['Gadwal Silk']);
      setSelectedOccasions([]);
    } else if (catId === 'uppada') {
      setSelectedFabrics(['Uppada Jamdani']);
      setSelectedOccasions([]);
    } else if (catId === 'dharmavaram') {
      setSelectedFabrics(['Dharmavaram Silk']);
      setSelectedOccasions([]);
    } else if (catId === 'mangalagiri') {
      setSelectedFabrics(['Mangalagiri Cotton Silk', 'Narayanpet Handloom']);
      setSelectedOccasions([]);
    } else if (catId === 'bridal') {
      setSelectedFabrics([]);
      setSelectedOccasions(['Bridal & Pelli']);
    } else {
      setSelectedFabrics([]);
      setSelectedOccasions([]);
    }

    // Scroll to collection
    const collectionEl = document.getElementById('collection-grid-section');
    if (collectionEl) {
      collectionEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter handlers
  const handleToggleFabric = (fab: FabricType) => {
    setSelectedFabrics((prev) =>
      prev.includes(fab) ? prev.filter((f) => f !== fab) : [...prev, fab]
    );
  };

  const handleToggleOccasion = (occ: OccasionType) => {
    setSelectedOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  const handleToggleWeave = (w: WeaveType) => {
    setSelectedWeaves((prev) =>
      prev.includes(w) ? prev.filter((item) => item !== w) : [...prev, w]
    );
  };

  const handleResetFilters = () => {
    setSelectedFabrics([]);
    setSelectedOccasions([]);
    setSelectedWeaves([]);
    setSilkMarkOnly(false);
    setMaxPrice(60000);
    setSearchQuery('');
    setActiveCategory('all');
    setSelectedStateFilter('All');
  };

  const activeFilterCount =
    selectedFabrics.length +
    selectedOccasions.length +
    selectedWeaves.length +
    (silkMarkOnly ? 1 : 0) +
    (maxPrice < 60000 ? 1 : 0) +
    (selectedStateFilter !== 'All' ? 1 : 0);

  // Filtered & Sorted Sarees based on live catalog
  const filteredSarees = useMemo(() => {
    let result = [...sareesCatalog];

    // State Filter (Telangana vs Andhra Pradesh)
    if (selectedStateFilter !== 'All') {
      result = result.filter(
        (s) => s.stateRegion === selectedStateFilter || s.origin.toLowerCase().includes(selectedStateFilter.toLowerCase())
      );
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.teluguName && s.teluguName.toLowerCase().includes(q)) ||
          s.subtitle.toLowerCase().includes(q) ||
          s.fabric.toLowerCase().includes(q) ||
          s.weave.toLowerCase().includes(q) ||
          s.origin.toLowerCase().includes(q) ||
          (s.district && s.district.toLowerCase().includes(q)) ||
          s.color.toLowerCase().includes(q)
      );
    }

    // Fabric filter
    if (selectedFabrics.length > 0) {
      result = result.filter((s) => selectedFabrics.includes(s.fabric));
    }

    // Occasion filter
    if (selectedOccasions.length > 0) {
      result = result.filter((s) => selectedOccasions.includes(s.occasion));
    }

    // Weave filter
    if (selectedWeaves.length > 0) {
      result = result.filter((s) => selectedWeaves.includes(s.weave));
    }

    // Silk mark
    if (silkMarkOnly) {
      result = result.filter((s) => s.isSilkMarkCertified);
    }

    // Price
    result = result.filter((s) => s.price <= maxPrice);

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
        break;
      default:
        // featured: bestsellers first
        result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    return result;
  }, [
    sareesCatalog,
    selectedStateFilter,
    searchQuery,
    selectedFabrics,
    selectedOccasions,
    selectedWeaves,
    silkMarkOnly,
    maxPrice,
    sortBy,
  ]);

  // Check for price drops on items in the user's wishlist
  const wishlistPriceDrops = useMemo(() => {
    return checkWishlistPriceDrops(wishlist, sareesCatalog);
  }, [wishlist, sareesCatalog]);

  const priceDropCount = wishlistPriceDrops.length;

  // Wishlist Toggle
  const handleToggleWishlist = (saree: Saree) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === saree.id);
      if (exists) {
        showToast(`Removed "${saree.name}" from your wishlist`);
        return prev.filter((item) => item.id !== saree.id);
      } else {
        showToast(`Saved "${saree.name}" to your wishlist`);
        const itemToSave: Saree = {
          ...saree,
          savedAtPrice: saree.price,
          savedAtDate: new Date().toISOString(),
        };
        return [...prev, itemToSave];
      }
    });
  };

  // Simulate price drop on a wishlisted item for instant interactive testing & demonstration
  const handleSimulatePriceDrop = (sareeId: string, revert: boolean = false) => {
    const targetWishItem = wishlist.find((w) => w.id === sareeId);
    const targetCatalog = sareesCatalog.find((s) => s.id === sareeId);
    if (!targetCatalog) return;

    if (revert) {
      const original = targetWishItem?.savedAtPrice ?? targetCatalog.originalPrice ?? targetCatalog.price;
      setSareesCatalog((prev) =>
        prev.map((s) => (s.id === sareeId ? { ...s, price: original } : s))
      );
      showToast(`Reverted "${targetCatalog.name}" back to original price.`);
    } else {
      const baseline = targetWishItem?.savedAtPrice ?? targetCatalog.price;
      const discountedPrice = Math.round(baseline * 0.85); // 15% price drop
      setSareesCatalog((prev) =>
        prev.map((s) => (s.id === sareeId ? { ...s, price: discountedPrice } : s))
      );
      const dropAmt = baseline - discountedPrice;
      showToast(`🎉 Price Drop Alert! "${targetCatalog.name}" dropped by ₹${dropAmt.toLocaleString('en-IN')} (15% OFF)! Check navbar alert badge.`);
    }
  };

  // Cart Handlers
  const handleAddToCart = (
    saree: Saree,
    quantity: number,
    fallAndPico: boolean,
    blouseOption: BlouseOption,
    blouseMeasurements?: BlouseMeasurement,
    petticoatAddon?: boolean
  ) => {
    // Calculate total item price with add-ons
    let unitPrice = saree.price;
    if (blouseOption === 'standard-stitched') unitPrice += 800;
    if (blouseOption === 'custom-tailored') unitPrice += 1500;
    if (petticoatAddon) unitPrice += 450;

    const newItemId = `${saree.id}-${blouseOption}-${fallAndPico ? 'fp' : 'nofp'}-${petticoatAddon ? 'pet' : 'nopet'}`;

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === newItemId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          id: newItemId,
          saree,
          quantity,
          fallAndPico,
          blouseOption,
          blouseMeasurements,
          petticoatAddon: Boolean(petticoatAddon),
          unitPrice,
        },
      ];
    });

    showToast(`Added "${saree.name}" to shopping bag!`);
    setIsCartOpen(true);
  };

  const handleQuickAdd = (saree: Saree) => {
    handleAddToCart(saree, 1, true, 'unstitched', undefined, false);
  };

  const handleBuyNow = (
    saree: Saree,
    quantity: number,
    fallAndPico: boolean,
    blouseOption: BlouseOption,
    blouseMeasurements?: BlouseMeasurement,
    petticoatAddon?: boolean
  ) => {
    handleAddToCart(saree, quantity, fallAndPico, blouseOption, blouseMeasurements, petticoatAddon);
    setSelectedSaree(null);
    setIsCheckoutOpen(true);
  };

  const handleReviewSubmitted = (sareeId: string, newRating: number, newReviewCount: number) => {
    setSareesCatalog((prev) =>
      prev.map((s) => (s.id === sareeId ? { ...s, rating: newRating, reviewCount: newReviewCount } : s))
    );
    if (selectedSaree && selectedSaree.id === sareeId) {
      setSelectedSaree((prev) => (prev ? { ...prev, rating: newRating, reviewCount: newReviewCount } : null));
    }
    showToast('Your verified handloom review has been recorded! Thank you.');
  };

  const handleUpdateCartQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart((prev) => {
      const target = prev.find((i) => i.id === itemId);
      if (target) {
        showToast(`Removed "${target.saree.name}" from bag`);
      }
      return prev.filter((item) => item.id !== itemId);
    });
  };

  // Checkout flow
  const handleProceedToCheckout = (discountAmount: number, promoCode: string) => {
    setCheckoutDiscount(discountAmount);
    setCheckoutPromoCode(promoCode);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]); // Empty cart on successful order
    showToast(`Order #${newOrder.id} confirmed & synced to live database!`);
  };

  // Open Admin Handler
  const handleOpenAdminPortal = () => {
    if (isAdmin) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1E1B18]">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="toast-notification"
          className="fixed bottom-6 right-6 z-50 bg-[#241215] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#4D272E] text-xs font-semibold flex items-center gap-2.5 animate-bounce"
        >
          <div className="p-1 rounded-full bg-[#821D24] text-[#F3C56E]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation */}
      <Navbar
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        priceDropCount={priceDropCount}
        currentCurrency={currency}
        onCurrencyChange={setCurrency}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
        onOpenStylist={() => setIsStylistOpen(true)}
        onOpenDrapeGuide={() => setIsDrapeGuideOpen(true)}
        onOpenAdmin={handleOpenAdminPortal}
        onOpenShare={() => {
          setSareeToShare(null);
          setIsShareOpen(true);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectCategory={handleSelectCategory}
        activeCategory={activeCategory}
        selectedStateFilter={selectedStateFilter}
        onSelectStateFilter={setSelectedStateFilter}
        isDbLive={isDbLive}
        announcementText={boutiqueSettings.announcementText}
      />

      {/* Hero Banner Section */}
      <HeroBanner
        onShopCollection={() => {
          const el = document.getElementById('collection-grid-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenStylist={() => setIsStylistOpen(true)}
        onOpenDrapeGuide={() => setIsDrapeGuideOpen(true)}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
      />

      {/* Handloom Clusters & Regional Categories */}
      <section className="bg-white border-b border-[#E8DFD1] shadow-2xs">
        <CategoryPills
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />
      </section>

      {/* Mobile Floating Action Bar for Quick Access */}
      <div className="lg:hidden sticky top-16 z-30 bg-[#FAF8F5]/95 backdrop-blur-md px-4 py-2 border-b border-[#E8DFD1] flex items-center justify-between gap-2">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white rounded-xl border border-[#D5C5B2] text-xs font-bold text-[#2A1E17] shadow-xs active:scale-95 transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#821D24]" />
          <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
        </button>

        <select
          value={sortBy}
          onChange={(e: any) => setSortBy(e.target.value)}
          className="flex-1 py-2 px-2 bg-white rounded-xl border border-[#D5C5B2] text-xs font-bold text-[#2A1E17] shadow-xs"
        >
          <option value="featured">Featured Handlooms</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated (4.5+)</option>
          <option value="newest">New Weaves</option>
        </select>

        {isAdmin && (
          <button
            onClick={() => setIsAdminDashboardOpen(true)}
            className="p-2 bg-[#821D24] text-[#F5C767] rounded-xl font-bold shadow-xs shrink-0"
            title="Admin Studio"
          >
            <Shield className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Saree Catalog Explorer */}
      <main id="collection-grid-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* State Banner Notice */}
        <div className="mb-6 p-4 rounded-2xl bg-linear-to-r from-[#FAF2E8] to-[#F5ECE0] border border-[#E3D4C3] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#821D24] text-[#F5C767] flex items-center justify-center font-serif-title font-bold text-lg shadow-xs">
              వి
            </div>
            <div>
              <h2 className="font-serif-title text-base sm:text-lg font-bold text-[#2A1E17]">
                {selectedStateFilter === 'All'
                  ? 'All Andhra Pradesh & Telangana Handlooms'
                  : selectedStateFilter === 'Telangana'
                  ? 'Telangana State Artisan Clusters (పోచంపల్లి, గద్వాల & నారాయణపేట)'
                  : 'Andhra Pradesh Artisan Clusters (ఉప్పాడ, ధర్మవరం, మంగళగిరి & చీరాల)'}
              </h2>
              <p className="text-xs text-[#6B5748]">
                {filteredSarees.length} Authentic GI Handlooms ready for immediate dispatch across all 59 districts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B5748] hidden sm:inline">Viewing Region:</span>
            <div className="flex bg-white rounded-xl p-1 border border-[#D5C5B2] shadow-2xs text-xs">
              {(['All', 'Telangana', 'Andhra Pradesh'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStateFilter(st)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    selectedStateFilter === st
                      ? 'bg-[#821D24] text-white shadow-xs'
                      : 'text-[#4A3B32] hover:text-[#821D24]'
                  }`}
                >
                  {st === 'All' ? 'AP & TG' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <FilterSidebar
            isOpenMobile={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
            selectedFabrics={selectedFabrics}
            onToggleFabric={handleToggleFabric}
            selectedOccasions={selectedOccasions}
            onToggleOccasion={handleToggleOccasion}
            selectedWeaves={selectedWeaves}
            onToggleWeave={handleToggleWeave}
            silkMarkOnly={silkMarkOnly}
            onToggleSilkMark={() => setSilkMarkOnly(!silkMarkOnly)}
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
            onResetFilters={handleResetFilters}
            activeFilterCount={activeFilterCount}
            currency={currency}
          />

          {/* Saree Grid Section */}
          <div className="flex-1 min-w-0">
            {/* Desktop Sort & Grid Header */}
            <div className="hidden lg:flex items-center justify-between pb-4 mb-6 border-b border-[#E8DFD1]">
              <div className="flex items-center gap-2">
                <span className="font-serif-title text-xl font-bold text-[#2A1E17]">
                  {activeCategory === 'all'
                    ? 'Heritage Master Weaves'
                    : activeCategory.toUpperCase()}
                </span>
                <span className="text-xs text-[#8C7665]">
                  ({filteredSarees.length} designs available)
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#6B5748] font-medium">Sort By:</span>
                  <select
                    id="sort-by-select"
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-white border border-[#D5C5B2] rounded-lg px-3 py-1.5 text-xs text-[#2A1E17] font-semibold focus:outline-hidden focus:border-[#821D24]"
                  >
                    <option value="featured">Featured Weaves</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                    <option value="newest">New Arrivals</option>
                  </select>
                </div>

                {/* Grid layout toggle */}
                <div className="flex items-center bg-white border border-[#D5C5B2] rounded-lg p-0.5">
                  <button
                    onClick={() => setGridColumns(3)}
                    className={`p-1.5 rounded-md transition-colors ${
                      gridColumns === 3 ? 'bg-[#FAF2E8] text-[#821D24]' : 'text-[#8C7665]'
                    }`}
                    title="3 Columns"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setGridColumns(4)}
                    className={`p-1.5 rounded-md transition-colors ${
                      gridColumns === 4 ? 'bg-[#FAF2E8] text-[#821D24]' : 'text-[#8C7665]'
                    }`}
                    title="4 Columns"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sarees Grid */}
            {filteredSarees.length > 0 ? (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                  gridColumns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
                } gap-4 sm:gap-6`}
              >
                {filteredSarees.map((saree) => (
                  <SareeCard
                    key={saree.id}
                    saree={saree}
                    currency={currency}
                    isWishlisted={wishlist.some((w) => w.id === saree.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onQuickView={(s) => setSelectedSaree(s)}
                    onQuickAddToBag={handleQuickAdd}
                    onShareSaree={(s) => {
                      setSareeToShare(s);
                      setIsShareOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              /* Empty Search / Filter State */
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E8DFD1] my-4">
                <div className="w-14 h-14 rounded-full bg-[#FAF2E8] text-[#821D24] flex items-center justify-center mx-auto mb-4">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <h3 className="font-serif-title text-xl font-bold text-[#2A1E17]">
                  No Handlooms Matching Your Filter
                </h3>
                <p className="text-xs text-[#7A6757] max-w-md mx-auto mt-2 leading-relaxed">
                  Try clearing your filters or search for Pochampally Ikkat, Gadwal Kuttu, Uppada Jamdani, or Dharmavaram Silk.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-5 px-5 py-2.5 rounded-full bg-[#821D24] text-white text-xs font-bold shadow-sm hover:bg-[#68141A] transition-all cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Telugu Heritage & Trust Highlights */}
      <section className="bg-[#FAF2E8]/60 border-t border-[#E8DFD1] py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[10px] uppercase tracking-widest text-[#821D24] font-bold">
              The Virasat Telugu Handloom Promise
            </span>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2A1E17] mt-1">
              Why Telugu Households Across AP & Telangana Trust Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="bg-white p-5 rounded-2xl border border-[#E0D5C7] shadow-2xs space-y-2">
              <span className="text-2xl font-serif-title font-bold text-[#821D24]">01. 100% GI Handloom Authenticity</span>
              <p className="text-xs text-[#5C4B3E] leading-relaxed">
                Directly sourced from cooperative weaver societies in Pochampally, Gadwal, Uppada, and Dharmavaram with Silk Mark certification.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E0D5C7] shadow-2xs space-y-2">
              <span className="text-2xl font-serif-title font-bold text-[#821D24]">02. Free Fall, Pico & Blouse Tailoring</span>
              <p className="text-xs text-[#5C4B3E] leading-relaxed">
                Complimentary edging and fall attachment so your saree arrives drape-ready for your muhurtham, seemantham, or puja.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E0D5C7] shadow-2xs space-y-2">
              <span className="text-2xl font-serif-title font-bold text-[#821D24]">03. 24–48h AP/TG Express Delivery</span>
              <p className="text-xs text-[#5C4B3E] leading-relaxed">
                Guaranteed fast express dispatch to all 59 districts across Hyderabad, Vijayawada, Vizag, Tirupati, Warangal, and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        onOpenStylist={() => setIsStylistOpen(true)}
        onOpenDrapeGuide={() => setIsDrapeGuideOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
        onSelectCategory={handleSelectCategory}
        onOpenAdmin={handleOpenAdminPortal}
        onOpenShare={() => {
          setSareeToShare(null);
          setIsShareOpen(true);
        }}
      />

      {/* MODALS */}

      {/* Product Detail / Quick View Modal */}
      <ProductDetailModal
        saree={selectedSaree}
        currency={currency}
        isWishlisted={selectedSaree ? wishlist.some((w) => w.id === selectedSaree.id) : false}
        onClose={() => setSelectedSaree(null)}
        onToggleWishlist={handleToggleWishlist}
        onOpenShareSaree={(saree) => {
          setSareeToShare(saree);
          setIsShareOpen(true);
        }}
        onReviewSubmitted={handleReviewSubmitted}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        currency={currency}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
        onExploreSarees={() => {
          setIsCartOpen(false);
          const el = document.getElementById('collection-grid-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Express Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        currency={currency}
        discountAmount={checkoutDiscount}
        promoCode={checkoutPromoCode}
        onOrderSuccess={handleOrderSuccess}
        onOpenTrackOrder={handleOpenTrackOrder}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        catalog={sareesCatalog}
        currency={currency}
        onRemoveFromWishlist={handleToggleWishlist}
        onMoveToCart={handleQuickAdd}
        onShareSaree={(s) => {
          setSareeToShare(s);
          setIsShareOpen(true);
        }}
        onExploreSarees={() => {
          setIsWishlistOpen(false);
          const el = document.getElementById('collection-grid-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onSimulatePriceDrop={handleSimulatePriceDrop}
      />

      {/* Orders Tracking Modal */}
      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        currency={currency}
        isDbLive={isDbLive}
        onOpenTrackOrder={handleOpenTrackOrder}
      />

      {/* Dedicated Track Order by ID Modal */}
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => {
          setIsTrackOrderOpen(false);
          setTrackOrderId('');
        }}
        currency={currency}
        isDbLive={isDbLive}
        initialOrderId={trackOrderId}
        recentOrders={orders}
      />

      {/* AI Saree Stylist Concierge */}
      <AISareeStylistModal
        isOpen={isStylistOpen}
        onClose={() => setIsStylistOpen(false)}
        currency={currency}
        onSelectSaree={(saree) => setSelectedSaree(saree)}
        onQuickAdd={handleQuickAdd}
      />

      {/* Saree Draping Guide Modal */}
      <DrapeGuideModal
        isOpen={isDrapeGuideOpen}
        onClose={() => setIsDrapeGuideOpen(false)}
        onShopCategory={handleSelectCategory}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminDashboardOpen(true);
        }}
      />

      {/* Admin Management Dashboard Studio */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        sarees={sareesCatalog}
        orders={orders}
        settings={boutiqueSettings}
        currency={currency}
        isDbLive={isDbLive}
      />

      {/* Share Store & Product Modal */}
      <ShareAppModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        sareeToShare={sareeToShare}
      />
    </div>
  );
}
