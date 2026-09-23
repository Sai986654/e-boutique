import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  SlidersHorizontal, 
  ArrowUpDown, 
  Sparkles, 
  Grid3X3,
  LayoutGrid,
  Database,
  Shield,
  Layers,
  Loader2,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { Saree, CartItem, Order, FabricType, OccasionType, WeaveType, BlouseOption, BlouseMeasurement, BoutiqueSettings, SareeCollection, ProductDepartment } from './types';
import { SAREES_DATA, INITIAL_COLLECTIONS } from './data/sareesData';
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
  subscribeToCollections,
  seedCollectionsIfEmpty,
  DEFAULT_BOUTIQUE_SETTINGS
} from './services/firestoreService';
import { checkWishlistPriceDrops } from './utils/priceDropHelper';

const PAGE_SIZE = 8;

export default function App() {
  const { isAdmin } = useAdminAuth();

  // Live Firestore Data & Sync State
  const [sareesCatalog, setSareesCatalog] = useState<Saree[]>(SAREES_DATA);
  const [collections, setCollections] = useState<SareeCollection[]>(INITIAL_COLLECTIONS);
  const [boutiqueSettings, setBoutiqueSettings] = useState<BoutiqueSettings>(DEFAULT_BOUTIQUE_SETTINGS);
  const [isDbLive, setIsDbLive] = useState(false);
  const [selectedStateFilter, setSelectedStateFilter] = useState<'All' | 'Telangana' | 'Andhra Pradesh'>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<ProductDepartment>('all');

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

    // 5. Seed or retrieve initial collections
    seedCollectionsIfEmpty().then((data) => {
      if (isSubscribed && data && data.length > 0) {
        setCollections(data);
      }
    });

    // 6. Subscribe to real-time collections updates
    const unsubCollections = subscribeToCollections((liveCollections) => {
      if (isSubscribed && liveCollections && liveCollections.length > 0) {
        setCollections(liveCollections);
      }
    });

    return () => {
      isSubscribed = false;
      if (typeof unsubSarees === 'function') unsubSarees();
      if (typeof unsubOrders === 'function') unsubOrders();
      if (typeof unsubSettings === 'function') unsubSettings();
      if (typeof unsubCollections === 'function') unsubCollections();
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
  const [mobileColumns, setMobileColumns] = useState<1 | 2>(1);

  // Category change handler tailored for Andhra Pradesh & Telangana handlooms and ornaments
  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    if (catId === 'pochampally') {
      setSelectedDepartment('sarees');
      setSelectedFabrics(['Pochampally Ikkat']);
      setSelectedOccasions([]);
    } else if (catId === 'gadwal') {
      setSelectedDepartment('sarees');
      setSelectedFabrics(['Gadwal Silk']);
      setSelectedOccasions([]);
    } else if (catId === 'uppada') {
      setSelectedDepartment('sarees');
      setSelectedFabrics(['Uppada Jamdani']);
      setSelectedOccasions([]);
    } else if (catId === 'dharmavaram') {
      setSelectedDepartment('sarees');
      setSelectedFabrics(['Dharmavaram Silk']);
      setSelectedOccasions([]);
    } else if (catId === 'mangalagiri') {
      setSelectedDepartment('sarees');
      setSelectedFabrics(['Mangalagiri Cotton Silk', 'Narayanpet Handloom']);
      setSelectedOccasions([]);
    } else if (catId === 'bridal') {
      setSelectedDepartment('all');
      setSelectedFabrics([]);
      setSelectedOccasions(['Bridal & Pelli']);
    } else if (catId === 'one-gram-gold') {
      setSelectedDepartment('ornaments');
      setSelectedFabrics(['One Gram Gold Ornaments']);
      setSelectedOccasions([]);
    } else {
      setSelectedDepartment('all');
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
    setSelectedDepartment('all');
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
    (selectedDepartment !== 'all' ? 1 : 0) +
    selectedFabrics.length +
    selectedOccasions.length +
    selectedWeaves.length +
    (silkMarkOnly ? 1 : 0) +
    (maxPrice < 60000 ? 1 : 0) +
    (selectedStateFilter !== 'All' ? 1 : 0);

  // Filtered & Sorted Sarees based on live catalog
  const filteredSarees = useMemo(() => {
    let result = [...sareesCatalog];

    // Department Filter: Sarees vs 1-Gram Gold Ornaments
    if (selectedDepartment === 'sarees') {
      result = result.filter((s) => s.productType !== 'ornament');
    } else if (selectedDepartment === 'ornaments') {
      result = result.filter((s) => s.productType === 'ornament');
    }

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
          (s.ornamentType && s.ornamentType.toLowerCase().includes(q)) ||
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
    selectedDepartment,
    selectedStateFilter,
    searchQuery,
    selectedFabrics,
    selectedOccasions,
    selectedWeaves,
    silkMarkOnly,
    maxPrice,
    sortBy,
  ]);

  // Pagination & Lazy Load on Scroll
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  // Reset pagination whenever search or filter criteria change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    selectedFabrics,
    selectedOccasions,
    selectedWeaves,
    silkMarkOnly,
    maxPrice,
    sortBy,
    searchQuery,
    selectedStateFilter,
    activeCategory,
  ]);

  const displayedSarees = useMemo(() => {
    return filteredSarees.slice(0, visibleCount);
  }, [filteredSarees, visibleCount]);

  const hasMore = visibleCount < filteredSarees.length;

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredSarees.length));
      setIsLoadingMore(false);
    }, 450);
  };

  // IntersectionObserver for auto lazy loading as user scrolls towards bottom
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '250px',
        threshold: 0.1,
      }
    );

    const target = loadMoreTriggerRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore, isLoadingMore, visibleCount, filteredSarees.length]);

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
    setIsCartOpen(false); // Close cart drawer so it doesn't clash with checkout modal
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

        {/* Mobile 1-Col vs 2-Col View Toggle */}
        <div className="flex items-center bg-white border border-[#D5C5B2] rounded-xl p-0.5 shadow-xs shrink-0">
          <button
            type="button"
            onClick={() => setMobileColumns(1)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              mobileColumns === 1 ? 'bg-[#FAF2E8] text-[#821D24]' : 'text-[#8C7665]'
            }`}
            title="1 Column: Detailed Full Drape View"
            aria-label="1 Column Detailed View"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <rect x="2.5" y="2.5" width="11" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setMobileColumns(2)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              mobileColumns === 2 ? 'bg-[#FAF2E8] text-[#821D24]' : 'text-[#8C7665]'
            }`}
            title="2 Columns: Compact Catalog View"
            aria-label="2 Columns Compact View"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1.5" y="2.5" width="5.5" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <rect x="9" y="2.5" width="5.5" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>

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

      {/* Main Saree & Ornaments Catalog Explorer */}
      <main id="collection-grid-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Primary Department Switcher */}
        <div className="mb-6 bg-white p-2 sm:p-2.5 rounded-2xl border border-[#E3D4C3] shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#8C7665] uppercase tracking-wider pl-2 hidden md:inline">
              Department:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                id="dept-tab-all"
                onClick={() => {
                  setSelectedDepartment('all');
                  setSelectedFabrics([]);
                  setActiveCategory('all');
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  selectedDepartment === 'all'
                    ? 'bg-[#821D24] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#4A3B32] hover:bg-[#F3ECE1]'
                }`}
              >
                All Items (అన్నీ)
              </button>

              <button
                type="button"
                id="dept-tab-sarees"
                onClick={() => {
                  setSelectedDepartment('sarees');
                  setSelectedFabrics([]);
                  if (activeCategory === 'one-gram-gold') setActiveCategory('all');
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedDepartment === 'sarees'
                    ? 'bg-[#821D24] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#4A3B32] hover:bg-[#F3ECE1]'
                }`}
              >
                <span>🥻 Handloom Sarees (చేనేత చీరలు)</span>
              </button>

              <button
                type="button"
                id="dept-tab-ornaments"
                onClick={() => {
                  setSelectedDepartment('ornaments');
                  setSelectedFabrics(['One Gram Gold Ornaments']);
                  setActiveCategory('one-gram-gold');
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedDepartment === 'ornaments'
                    ? 'bg-linear-to-r from-[#821D24] to-[#5C1116] text-[#FDEEA2] shadow-xs border border-[#D4AF37]/60'
                    : 'bg-[#FAF8F5] text-[#4A3B32] hover:bg-[#F3ECE1]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>👑 1-Gram Gold Ornaments (ఆభరణాలు)</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-[#8C7665] pr-2">
            Showing <strong className="text-[#821D24]">{filteredSarees.length}</strong> items
          </div>
        </div>

        {/* State Banner Notice */}
        <div className="mb-6 p-4 rounded-2xl bg-linear-to-r from-[#FAF2E8] to-[#F5ECE0] border border-[#E3D4C3] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#821D24] text-[#F5C767] flex items-center justify-center font-serif-title font-bold text-lg shadow-xs">
              {selectedDepartment === 'ornaments' ? 'బం' : 'వి'}
            </div>
            <div>
              <h2 className="font-serif-title text-base sm:text-lg font-bold text-[#2A1E17]">
                {selectedDepartment === 'ornaments'
                  ? '👑 24K Micro Gold Plated Ornaments (ఒక గ్రాము బంగారం ఆభరణాలు)'
                  : selectedDepartment === 'sarees'
                  ? selectedStateFilter === 'All'
                    ? '🥻 Authentic Andhra Pradesh & Telangana Handloom Sarees'
                    : selectedStateFilter === 'Telangana'
                    ? 'Telangana State Artisan Clusters (పోచంపల్లి, గద్వాల & నారాయణపేట)'
                    : 'Andhra Pradesh Artisan Clusters (ఉప్పాడ, ధర్మవరం, మంగళగిరి & చీరాల)'
                  : selectedStateFilter === 'All'
                  ? 'All Andhra Pradesh & Telangana Handloom Sarees & 1-Gram Gold Ornaments'
                  : selectedStateFilter === 'Telangana'
                  ? 'Telangana State Artisan Weaves & Secunderabad Temple Ornaments'
                  : 'Andhra Pradesh Handlooms & Coastal Temple Jewellery'}
              </h2>
              <p className="text-xs text-[#6B5748]">
                {selectedDepartment === 'ornaments'
                  ? `${filteredSarees.length} Authentic 24K Micro Gold Kasu Malas, Harams, Vaddanams, Jhumkas & Bangles with 1-Year Guarantee & Velvet Box.`
                  : `${filteredSarees.length} Authentic creations ready for immediate dispatch across all 59 districts.`}
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
            selectedDepartment={selectedDepartment}
            onSelectDepartment={setSelectedDepartment}
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

            {/* Sarees Grid with Lazy Loading */}
            {filteredSarees.length > 0 ? (
              <div className="space-y-6">
                <div
                  className={`grid ${
                    mobileColumns === 1 ? 'grid-cols-1' : 'grid-cols-2'
                  } sm:grid-cols-2 ${
                    gridColumns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
                  } gap-3 sm:gap-6`}
                >
                  {displayedSarees.map((saree) => (
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

                {/* Pagination, Lazy Loading & Sentinel Indicator */}
                <div className="mt-8 space-y-4">
                  {/* Sentinel element observed by IntersectionObserver */}
                  <div ref={loadMoreTriggerRef} className="h-2 w-full pointer-events-none" />

                  {/* Loading state shimmer */}
                  {isLoadingMore && (
                    <div className="flex items-center justify-center gap-2.5 py-6 bg-white/70 backdrop-blur-xs rounded-2xl border border-[#E8DFD1] text-[#821D24] text-xs font-bold animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin text-[#821D24]" />
                      <span>Unfolding authentic handloom masterpieces...</span>
                    </div>
                  )}

                  {/* Manual Load More fallback button & progress */}
                  {hasMore && !isLoadingMore && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#FAF2E8] border border-[#DECFBE] rounded-2xl text-xs">
                      <div className="text-[#5C4B3E]">
                        Showing <strong className="text-[#821D24]">{displayedSarees.length}</strong> of{' '}
                        <strong className="text-[#2A1E17]">{filteredSarees.length}</strong> handcrafted sarees
                        <div className="w-36 h-1.5 bg-[#E2D4C3] rounded-full overflow-hidden mt-1.5">
                          <div
                            className="h-full bg-[#821D24] rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.round((displayedSarees.length / filteredSarees.length) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleLoadMore}
                        className="px-5 py-2.5 rounded-full bg-[#821D24] hover:bg-[#68141A] text-white font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer text-xs"
                      >
                        <span>Load More Sarees</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* All items loaded status */}
                  {!hasMore && filteredSarees.length > PAGE_SIZE && (
                    <div className="text-center py-6 text-xs text-[#7A6757] flex items-center justify-center gap-2 border-t border-[#E8DFD1]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        You&apos;ve viewed all <strong>{filteredSarees.length}</strong> GI handlooms in this selection.
                      </span>
                    </div>
                  )}
                </div>
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
        collections={collections}
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
