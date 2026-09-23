import { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Sparkles, 
  BookOpen, 
  Package, 
  Menu, 
  X, 
  MapPin, 
  ChevronDown, 
  Database, 
  Shield, 
  Settings, 
  Share2,
  Truck,
  TrendingDown
} from 'lucide-react';
import { CURRENCIES } from '../data/sareesData';
import { useAdminAuth } from '../context/AdminAuthContext';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  priceDropCount?: number;
  currentCurrency: string;
  onCurrencyChange: (code: string) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenTrackOrder?: () => void;
  onOpenStylist: () => void;
  onOpenDrapeGuide: () => void;
  onOpenAdmin: () => void;
  onOpenShare?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectCategory: (cat: string) => void;
  activeCategory: string;
  selectedStateFilter: 'All' | 'Telangana' | 'Andhra Pradesh';
  onSelectStateFilter: (state: 'All' | 'Telangana' | 'Andhra Pradesh') => void;
  isDbLive: boolean;
  announcementText?: string;
}

export function Navbar({
  cartCount,
  wishlistCount,
  priceDropCount = 0,
  currentCurrency,
  onCurrencyChange,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenTrackOrder,
  onOpenStylist,
  onOpenDrapeGuide,
  onOpenAdmin,
  onOpenShare,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  activeCategory,
  selectedStateFilter,
  onSelectStateFilter,
  isDbLive,
  announcementText,
}: NavbarProps) {
  const { isAdmin, adminUser } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All AP & TG Weaves' },
    { id: 'pochampally', label: 'Pochampally Ikkat' },
    { id: 'gadwal', label: 'Gadwal Pattu' },
    { id: 'uppada', label: 'Uppada Jamdani' },
    { id: 'dharmavaram', label: 'Dharmavaram Pattu' },
    { id: 'mangalagiri', label: 'Mangalagiri & Narayanpet' },
    { id: 'bridal', label: 'Telugu Pelli Pattu' },
    { id: 'one-gram-gold', label: 'One Gram Gold (1 గ్రాము బంగారం)' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8DFD1] transition-all">
      {/* Regional Focus Announcement Bar */}
      <div id="announcement-bar" className="bg-[#821D24] text-[#FDF8F2] text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 mx-auto text-left sm:text-center">
          <MapPin className="w-3.5 h-3.5 text-[#F5C767] shrink-0" />
          <span className="truncate max-w-[280px] sm:max-w-none">
            {announcementText || 'Andhra Pradesh & Telangana Exclusive: Authentic Weaver-Direct Handlooms • Free Fall & Pico • 24–48h Express Delivery!'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-[11px] bg-black/20 px-2 py-0.5 rounded-full border border-white/20">
            <Database className={`w-3 h-3 ${isDbLive ? 'text-[#85E3B3]' : 'text-amber-300'}`} />
            <span>{isDbLive ? 'Firestore Live' : 'Connecting...'}</span>
          </div>

          {/* Direct Admin Portal Trigger */}
          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
              isAdmin
                ? 'bg-[#F5C767] text-[#821D24] border-[#F5C767] font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium'
            }`}
            title="Admin Login & Feature Management"
          >
            <Shield className="w-3 h-3" />
            <span>{isAdmin ? 'Admin Studio' : 'Admin Login'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#4A3B32] hover:text-[#821D24] rounded-md transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo & Telugu Saree Tagline */}
          <div className="flex flex-col items-start cursor-pointer" onClick={() => onSelectCategory('all')}>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#821D24] inline-block"></span>
              <h1 className="font-serif-title text-xl sm:text-3xl font-bold tracking-wider text-[#351015]">
                VIRASAT
              </h1>
              <span className="text-[10px] sm:text-[11px] bg-[#FAF0E1] text-[#821D24] font-bold px-1.5 sm:px-2 py-0.5 rounded border border-[#E3D3BE]">
                AP & TG
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[#735E4F] font-medium hidden xs:block">
              చేనేత పట్టు చీరలు • Regional Handlooms
            </span>
          </div>

          {/* State Region Quick Switcher - Desktop */}
          <div className="hidden xl:flex items-center bg-[#F2EAE0] p-1 rounded-full border border-[#D5C5B2] text-xs">
            {(['All', 'Telangana', 'Andhra Pradesh'] as const).map((st) => (
              <button
                key={st}
                onClick={() => onSelectStateFilter(st)}
                className={`px-3 py-1 rounded-full font-semibold transition-all ${
                  selectedStateFilter === st
                    ? 'bg-[#821D24] text-white shadow-xs'
                    : 'text-[#5C4B3E] hover:text-[#821D24]'
                }`}
              >
                {st === 'All' ? 'All (AP & TG)' : st}
              </button>
            ))}
          </div>

          {/* Desktop Category Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`nav-cat-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-2.5 py-1.5 text-xs font-semibold tracking-wide rounded-full transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-[#821D24] text-white shadow-xs'
                    : 'text-[#56453A] hover:text-[#821D24] hover:bg-[#F0EAE1]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* AI Stylist Button */}
            <button
              id="nav-ai-stylist-btn"
              onClick={onOpenStylist}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3ECE1] hover:bg-[#EBE1D2] text-[#821D24] text-xs font-semibold border border-[#DECFBE] transition-all shadow-xs"
              title="Vastra AI Saree Advisor"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C89933]" />
              <span>AI Stylist</span>
            </button>

            {/* Drape Guide Button */}
            <button
              id="nav-drape-guide-btn"
              onClick={onOpenDrapeGuide}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#56453A] hover:text-[#821D24] hover:bg-[#F3ECE1] transition-all"
              title="Telugu Nivi Drape Guide"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#821D24]" />
              <span>Drape</span>
            </button>

            {/* Currency Selector */}
            <div className="relative">
              <button
                id="currency-selector-btn"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-0.5 text-xs font-semibold text-[#56453A] hover:text-[#821D24] px-1.5 py-1.5 rounded-md hover:bg-[#F3ECE1] transition-colors"
                aria-label="Select Currency"
              >
                <span>{currentCurrency}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-1 w-28 bg-white border border-[#E8DFD1] shadow-lg rounded-lg py-1 z-50">
                  {Object.keys(CURRENCIES).map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        onCurrencyChange(code);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${
                        currentCurrency === code
                          ? 'bg-[#FAF2E8] font-bold text-[#821D24]'
                          : 'text-[#4A3B32] hover:bg-[#F7F4EF]'
                      }`}
                    >
                      <span>{code}</span>
                      <span className="text-[#8C7665]">{CURRENCIES[code].symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Toggle */}
            <div className="relative">
              <button
                id="search-toggle-btn"
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-full transition-colors ${
                  searchOpen ? 'bg-[#821D24] text-white' : 'text-[#4A3B32] hover:text-[#821D24] hover:bg-[#F3ECE1]'
                }`}
                aria-label="Search sarees"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Share App Button */}
            {onOpenShare && (
              <button
                id="share-app-btn"
                onClick={onOpenShare}
                className="p-2 text-[#821D24] hover:bg-[#FAF2E8] rounded-full transition-colors relative cursor-pointer"
                title="Share Store App (WhatsApp, QR Code, Link)"
                aria-label="Share Store App"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            {/* Track Order Direct Button */}
            {onOpenTrackOrder && (
              <button
                id="track-order-nav-btn"
                onClick={onOpenTrackOrder}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#821D24] bg-[#FAF3EA] hover:bg-[#F3E7D5] border border-[#DECFBE] rounded-full transition-colors cursor-pointer shadow-2xs"
                title="Track Delivery Status by Order ID"
                aria-label="Track Delivery Status"
              >
                <Truck className="w-3.5 h-3.5 text-[#821D24]" />
                <span className="hidden md:inline">Track Order</span>
              </button>
            )}

            {/* My Orders Button */}
            <button
              id="my-orders-btn"
              onClick={onOpenOrders}
              className="p-2 text-[#4A3B32] hover:text-[#821D24] hover:bg-[#F3ECE1] rounded-full transition-colors relative"
              title="Track Orders (Live Database)"
              aria-label="Track Orders"
            >
              <Package className="w-4 h-4" />
            </button>

            {/* Wishlist Button with Price Drop Alert Badge */}
            <button
              id="wishlist-btn"
              onClick={onOpenWishlist}
              className={`p-2 rounded-full transition-all relative cursor-pointer ${
                priceDropCount > 0 
                  ? 'text-[#821D24] bg-[#FAF3EA] hover:bg-[#F3E7D5] ring-1.5 ring-emerald-500/60' 
                  : 'text-[#4A3B32] hover:text-[#821D24] hover:bg-[#F3ECE1]'
              }`}
              aria-label={priceDropCount > 0 ? `Wishlist with ${priceDropCount} price drop alerts` : 'Wishlist'}
              title={
                priceDropCount > 0
                  ? `🔥 Price Drop Alert! ${priceDropCount} item(s) in your wishlist just dropped in price!`
                  : 'Saved Sarees Wishlist'
              }
            >
              <Heart className={`w-4 h-4 ${priceDropCount > 0 ? 'fill-[#821D24]/15' : ''}`} />
              
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#821D24] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}

              {/* Small Badge Alert for Wishlist Price Drops */}
              {priceDropCount > 0 && (
                <span
                  id="wishlist-price-drop-badge"
                  className="absolute -bottom-1 -left-1 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow-md border-2 border-white animate-pulse"
                  title={`${priceDropCount} item(s) had a price drop!`}
                >
                  <TrendingDown className="w-2.5 h-2.5 stroke-[2.5]" />
                  <span>{priceDropCount}</span>
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="cart-btn"
              onClick={onOpenCart}
              className="flex items-center gap-1 bg-[#821D24] hover:bg-[#68141A] text-white px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              <span className="bg-[#A42F37] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Live Search Expandable Bar */}
        {searchOpen && (
          <div className="py-3 border-t border-[#E8DFD1] flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8C7665] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Pochampally Ikkat, Gadwal Kuttu, Uppada Jamdani, Dharmavaram, Mangalagiri, Hyderabad, Vizag..."
                className="w-full bg-white border border-[#D5C5B2] rounded-full pl-10 pr-10 py-2 text-sm text-[#1F1C19] placeholder:text-[#9A8778] focus:outline-hidden focus:border-[#821D24] focus:ring-1 focus:ring-[#821D24]"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8C7665] hover:text-[#1F1C19]"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              onClick={() => setSearchOpen(false)}
              className="text-xs text-[#735E4F] hover:text-[#821D24] font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F5] border-t border-[#E8DFD1] px-4 py-4 space-y-3">
          {/* Admin Quick Action on Mobile */}
          <div className="p-3 bg-[#FAF2E8] rounded-xl border border-[#DECFBE] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#821D24]" />
              <span className="text-xs font-bold text-[#2A1E17]">Admin & Store Owner</span>
            </div>
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-bold bg-[#821D24] text-white px-3 py-1.5 rounded-lg shadow-xs cursor-pointer"
            >
              {isAdmin ? 'Open Studio' : 'Admin Login'}
            </button>
          </div>

          {/* State Filter Mobile */}
          <div className="flex gap-2">
            {(['All', 'Telangana', 'Andhra Pradesh'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  onSelectStateFilter(st);
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border text-center ${
                  selectedStateFilter === st
                    ? 'bg-[#821D24] text-white border-[#821D24]'
                    : 'bg-white text-[#5C4B3E] border-[#D5C5B2]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[#821D24] text-white'
                    : 'bg-white text-[#56453A] border border-[#E8DFD1]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E8DFD1] flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenStylist();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F3ECE1] text-[#821D24] text-xs font-semibold"
            >
              <Sparkles className="w-4 h-4 text-[#C89933]" />
              <span>Vastra AI Saree Advisor</span>
            </button>
            <button
              onClick={() => {
                onOpenDrapeGuide();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-[#E8DFD1] text-[#56453A] text-xs font-semibold"
            >
              <BookOpen className="w-4 h-4 text-[#821D24]" />
              <span>Telugu Nivi Drape Guide</span>
            </button>
            {onOpenShare && (
              <button
                onClick={() => {
                  onOpenShare();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FAF2E8] border border-[#DECFBE] text-[#821D24] text-xs font-bold cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#821D24]" />
                <span>Share Virasat Boutique App (WhatsApp, QR)</span>
              </button>
            )}
            {onOpenTrackOrder && (
              <button
                onClick={() => {
                  onOpenTrackOrder();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FAF3EA] border border-[#DECFBE] text-[#821D24] text-xs font-bold cursor-pointer"
              >
                <Truck className="w-4 h-4 text-[#821D24]" />
                <span>Track Order by ID (లైవ్ డెలివరీ ట్రాకింగ్)</span>
              </button>
            )}
            <button
              onClick={() => {
                onOpenWishlist();
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                priceDropCount > 0
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                  : 'bg-white border-[#E8DFD1] text-[#56453A]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#821D24] fill-[#821D24]" />
                <span>Saved Sarees ({wishlistCount})</span>
              </div>
              {priceDropCount > 0 ? (
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                  <span>{priceDropCount} Price Drop{priceDropCount > 1 ? 's' : ''}!</span>
                </span>
              ) : (
                <span className="text-[11px] text-[#7A6757]">View</span>
              )}
            </button>
            <button
              onClick={() => {
                onOpenOrders();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-[#E8DFD1] text-[#56453A] text-xs font-semibold"
            >
              <Package className="w-4 h-4 text-[#821D24]" />
              <span>Track Orders & Receipts (Live DB)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
