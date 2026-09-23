import { useState, useEffect, type FormEvent } from 'react';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Scissors, 
  Sparkles, 
  Check, 
  RotateCcw,
  MapPin,
  Share2,
  Star,
  Maximize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Saree, BlouseOption, BlouseMeasurement } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { SareeReviewSection } from './SareeReviewSection';

interface ProductDetailModalProps {
  saree: Saree | null;
  currency: string;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (saree: Saree) => void;
  onOpenShareSaree?: (saree: Saree) => void;
  onReviewSubmitted?: (sareeId: string, newRating: number, newReviewCount: number) => void;
  onAddToCart: (
    saree: Saree, 
    quantity: number, 
    fallAndPico: boolean, 
    blouseOption: BlouseOption,
    blouseMeasurements?: BlouseMeasurement,
    petticoatAddon?: boolean
  ) => void;
  onBuyNow: (
    saree: Saree, 
    quantity: number, 
    fallAndPico: boolean, 
    blouseOption: BlouseOption,
    blouseMeasurements?: BlouseMeasurement,
    petticoatAddon?: boolean
  ) => void;
}

export function ProductDetailModal({
  saree,
  currency,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onOpenShareSaree,
  onReviewSubmitted,
  onAddToCart,
  onBuyNow,
}: ProductDetailModalProps) {
  if (!saree) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [quantity, setQuantity] = useState(1);
  const [fallAndPico, setFallAndPico] = useState(true);
  const [blouseOption, setBlouseOption] = useState<BlouseOption>('unstitched');
  const [petticoatAddon, setPetticoatAddon] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);

  // Dynamic rating states synced with saree and updated when new review is posted
  const [currentRating, setCurrentRating] = useState<number>(saree.rating || 5.0);
  const [currentReviewCount, setCurrentReviewCount] = useState<number>(saree.reviewCount || 1);

  useEffect(() => {
    setCurrentRating(saree.rating || 5.0);
    setCurrentReviewCount(saree.reviewCount || 1);
  }, [saree.id, saree.rating, saree.reviewCount]);

  const handleReviewAdded = (newRating: number, newReviewCount: number) => {
    setCurrentRating(newRating);
    setCurrentReviewCount(newReviewCount);
    if (onReviewSubmitted) {
      onReviewSubmitted(saree.id, newRating, newReviewCount);
    }
  };

  // Blouse customization state tailored for South Indian & Telugu tastes
  const [bustSize, setBustSize] = useState('36');
  const [waistSize, setWaistSize] = useState('30');
  const [neckStyle, setNeckStyle] = useState<'Traditional Telugu Square Neck' | 'Sweetheart' | 'Round Deep' | 'V-Neck' | 'Boat Neck' | 'High Collar'>('Traditional Telugu Square Neck');
  const [sleeveLength, setSleeveLength] = useState('Elbow Length (with Zari Border)');

  // Ornament specific customization
  const isOrnament = saree.productType === 'ornament';
  const [ornamentFastening, setOrnamentFastening] = useState<'traditional-dori' | 'gold-chain-extender'>('traditional-dori');
  const [bangleSize, setBangleSize] = useState('2.6');

  const chainExtenderCost = (isOrnament && ornamentFastening === 'gold-chain-extender') ? 350 : 0;
  const blouseStitchingCost = (!isOrnament && blouseOption === 'custom-tailored') ? 1200 : 0;
  const petticoatCost = (!isOrnament && petticoatAddon) ? 650 : 0;
  const unitTotal = saree.price + (isOrnament ? chainExtenderCost : (blouseStitchingCost + petticoatCost));

  const handlePincodeCheck = (e: FormEvent) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.length < 3) return;
    const isAPTG = pincode.startsWith('50') || pincode.startsWith('51') || pincode.startsWith('52') || pincode.startsWith('53');
    const days = isAPTG ? 2 : 4;
    const d = new Date();
    d.setDate(d.getDate() + days);
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    setDeliveryEstimate(
      isAPTG 
        ? `⚡ AP & Telangana Express: Guaranteed delivery by ${dateStr}!`
        : `National Express delivery by ${dateStr}`
    );
  };

  const handleAdd = () => {
    const measurements: BlouseMeasurement = {
      bust: isOrnament ? `Size: ${bangleSize}, Clasp: ${ornamentFastening}` : bustSize,
      waist: waistSize,
      blouseLength: '14.5"',
      sleeveLength: sleeveLength,
      neckStyle: neckStyle,
    };
    onAddToCart(
      saree, 
      quantity, 
      isOrnament ? false : fallAndPico, 
      isOrnament ? 'unstitched' : blouseOption, 
      measurements, 
      isOrnament ? false : petticoatAddon
    );
    onClose();
  };

  const handleBuy = () => {
    const measurements: BlouseMeasurement = {
      bust: isOrnament ? `Size: ${bangleSize}, Clasp: ${ornamentFastening}` : bustSize,
      waist: waistSize,
      blouseLength: '14.5"',
      sleeveLength: sleeveLength,
      neckStyle: neckStyle,
    };
    onBuyNow(
      saree, 
      quantity, 
      isOrnament ? false : fallAndPico, 
      isOrnament ? 'unstitched' : blouseOption, 
      measurements, 
      isOrnament ? false : petticoatAddon
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fadeIn">
      <div 
        id="product-detail-modal"
        className="bg-[#FAF8F5] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#E8DFD1] overflow-hidden relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Close & Wishlist */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DFD1] bg-[#F4EFEA]">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#821D24] font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{saree.origin}</span>
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-xs font-semibold text-[#6B5A4D]">{saree.fabric}</span>
            {saree.stateRegion && (
              <span className="text-[10px] bg-[#FAF0E1] text-[#821D24] font-bold px-2 py-0.5 rounded border border-[#E3D3BE]">
                {saree.stateRegion}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWishlist(saree)}
              className={`p-2 rounded-full border transition-colors ${
                isWishlisted
                  ? 'bg-[#821D24] border-[#821D24] text-white'
                  : 'bg-white border-[#E0D5C7] text-[#4A3B32] hover:text-[#821D24]'
              }`}
              title="Save to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>
            <button
              id="close-product-modal-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-white border border-[#E0D5C7] text-[#4A3B32] hover:bg-[#821D24] hover:text-white transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Gallery */}
          <div className="md:col-span-6 space-y-4">
            {/* Main Stage Image with Uncropped Mode and Zoom */}
            <div className="relative aspect-4/5 rounded-xl overflow-hidden bg-[#F2ECE4] border border-[#E0D5C7] group">
              <img
                src={saree.images[activeImageIndex] || saree.images[0]}
                alt={saree.name}
                onClick={() => setIsZoomOpen(true)}
                className={`w-full h-full ${
                  fitMode === 'cover' ? 'object-cover object-top' : 'object-contain object-center'
                } transition-all duration-300 cursor-zoom-in`}
              />

              {isOrnament ? (
                <div className="absolute top-3 left-3 bg-[#821D24] text-[#F9E8B2] text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-sm shadow-md flex items-center gap-1.5 uppercase tracking-wide pointer-events-none border border-[#D4AF37]/50">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>One Gram Gold Plated (1-Gram)</span>
                </div>
              ) : (
                saree.isSilkMarkCertified && (
                  <div className="absolute top-3 left-3 bg-[#1B4938] text-white text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-1 rounded-sm shadow-md flex items-center gap-1.5 uppercase tracking-wide pointer-events-none">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Silk Mark Certified</span>
                  </div>
                )
              )}

              {/* Top-Right: Full-Screen Zoom Button */}
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-[#2A1E17] p-2 rounded-lg shadow-md backdrop-blur-xs flex items-center justify-center transition-all border border-[#E0D5C7] cursor-pointer hover:text-[#821D24]"
                title={isOrnament ? "Inspect temple nakshi & stone detailing in full-screen zoom" : "Inspect weave in full-screen zoom"}
                aria-label="Inspect weave in full-screen zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Bottom-Right: Uncropped Full Saree / Ornament View Toggle */}
              <button
                type="button"
                onClick={() => setFitMode(fitMode === 'cover' ? 'contain' : 'cover')}
                className="absolute bottom-3 right-3 bg-white/95 hover:bg-white text-[#2A1E17] hover:text-[#821D24] text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-md backdrop-blur-xs flex items-center gap-1.5 transition-all border border-[#E0D5C7] cursor-pointer active:scale-95"
                title={fitMode === 'cover' ? (isOrnament ? 'View complete full ornament' : 'View entire uncropped saree with all borders') : 'Fit image to frame'}
              >
                {fitMode === 'cover' ? (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-[#821D24]" />
                    <span>{isOrnament ? 'Full Ornament View' : 'Uncrop Saree (Full Border)'}</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 text-[#821D24]" />
                    <span>Fill Frame</span>
                  </>
                )}
              </button>
            </div>

            {/* Thumbnails */}
            {saree.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {saree.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-[#821D24] ring-2 ring-[#821D24]/20' : 'border-[#E0D5C7] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Saree / Ornament Specs Pills */}
            {isOrnament ? (
              <div className="bg-white p-3.5 rounded-xl border border-[#E8DFD1] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#8C7665] block text-[10px] uppercase font-semibold">Jewellery Craft</span>
                  <span className="font-bold text-[#2A1E17]">{saree.ornamentType || saree.weave}</span>
                </div>
                <div>
                  <span className="text-[#8C7665] block text-[10px] uppercase font-semibold">Gold Plating</span>
                  <span className="font-bold text-[#821D24]">{saree.goldPurity || '1-Gram Gold Plated'}</span>
                </div>
                <div>
                  <span className="text-[#8C7665] block text-[10px] uppercase font-semibold">Stones & Pearls</span>
                  <span className="font-medium text-[#2A1E17]">{saree.gemstones || 'Kemp Rubies & Pearls'}</span>
                </div>
                <div>
                  <span className="text-[#8C7665] block text-[10px] uppercase font-semibold">Ornament Weight</span>
                  <span className="font-medium text-[#2A1E17]">{saree.weight}</span>
                </div>
              </div>
            ) : (
              <div className="bg-white p-3.5 rounded-xl border border-[#E8DFD1] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#8C7665] block text-[10px] uppercase font-semibold">Weave Craft</span>
                  <span className="font-bold text-[#2A1E17]">{saree.weave}</span>
                </div>
                <div>
                  <span className="text-[#8C7665] block text-[10px] uppercase font-semibold">Zari Authenticity</span>
                  <span className="font-bold text-[#2A1E17]">{saree.zariType}</span>
                </div>
                <div>
                  <span className="text-[#8C7665] block text-[10px] uppercase font-semibold">Length & Blouse</span>
                  <span className="font-medium text-[#2A1E17]">{saree.length}</span>
                </div>
                <div>
                  <span className="text-[#8C7665] block text-[10px] uppercase font-semibold">Gross Weight</span>
                  <span className="font-medium text-[#2A1E17]">{saree.weight}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Saree Info & Customization */}
          <div className="md:col-span-6 space-y-5">
            <div>
              <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#231A14]">
                {saree.name}
              </h2>
              {saree.teluguName && (
                <span className="text-sm font-semibold text-[#821D24] block mt-1">
                  {saree.teluguName}
                </span>
              )}
              <p className="text-xs sm:text-sm text-[#735F50] mt-1 leading-relaxed">
                {saree.subtitle}
              </p>

              {/* Star Rating snippet with direct jump to review section */}
              <div className="flex items-center gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('saree-reviews-container');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 bg-[#FAF3EA] hover:bg-[#F3E7D7] border border-[#DECFBE] px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs group"
                  title="View customer ratings & reviews"
                >
                  <div className="flex items-center text-[#F5C767]">
                    <Star className="w-3.5 h-3.5 fill-[#F5C767]" />
                  </div>
                  <span className="font-bold text-[#2A1E17]">{currentRating}</span>
                  <span className="text-[#7A6757]">({currentReviewCount} customer {currentReviewCount === 1 ? 'review' : 'reviews'})</span>
                  <span className="text-[#821D24] font-semibold text-[11px] underline ml-1 group-hover:text-[#68141A]">
                    Read reviews ↓
                  </span>
                </button>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 pb-3 border-b border-[#E8DFD1]">
              <span className="text-2xl sm:text-3xl font-bold text-[#821D24]">
                {formatPrice(unitTotal, currency)}
              </span>
              <span className="text-sm text-[#9E8B7C] line-through">
                {formatPrice(saree.originalPrice, currency)}
              </span>
              <span className="text-xs font-semibold text-[#1B4938] bg-[#EAF2ED] px-2 py-0.5 rounded">
                Save {Math.round(((saree.originalPrice - saree.price) / saree.originalPrice) * 100)}%
              </span>
            </div>

            {/* Weave & Story description */}
            <div className="text-xs sm:text-sm text-[#4E3F35] leading-relaxed bg-[#F5EFE6]/60 p-3.5 rounded-xl border border-[#E8DFD1]">
              <p>{saree.description}</p>
            </div>

            {/* Customization Options (Saree Tailoring vs Ornament Fastening & Sizing) */}
            {isOrnament ? (
              <div className="space-y-4 pt-1">
                <h3 className="text-xs uppercase font-bold tracking-wider text-[#2A1E17] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#821D24]" />
                  <span>Jewellery Fastening & Fitting Options</span>
                </h3>

                {/* Back Clasp / Attachment Option */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[#4A3B32] block">
                    Back Clasp / Dori Preference:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setOrnamentFastening('traditional-dori')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        ornamentFastening === 'traditional-dori'
                          ? 'border-[#821D24] bg-[#FAF1E8] font-bold text-[#821D24]'
                          : 'border-[#E0D5C7] bg-white text-[#4A3B32]'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>Traditional Zari Dori</span>
                        <span className="font-bold text-[#1B4938] uppercase text-[10px]">Free</span>
                      </div>
                      <span className="block text-[10px] text-[#7A6757] font-normal">Adjustable golden thread tie • Universal fit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrnamentFastening('gold-chain-extender')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        ornamentFastening === 'gold-chain-extender'
                          ? 'border-[#821D24] bg-[#FAF1E8] font-bold text-[#821D24]'
                          : 'border-[#E0D5C7] bg-white text-[#4A3B32]'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>Micro-Gold Link Chain</span>
                        <span className="text-[#821D24] font-bold">+₹350</span>
                      </div>
                      <span className="block text-[10px] text-[#7A6757] font-normal">3-inch 1-gram gold plated link chain extender</span>
                    </button>
                  </div>
                </div>

                {/* Bangle Sizing if Bangles & Kadas */}
                {saree.ornamentType === 'Bangles & Kadas' && (
                  <div className="p-3 bg-white rounded-xl border border-[#E0D5C7] space-y-2 text-xs">
                    <label className="block text-[10px] font-bold uppercase text-[#735E4F]">
                      Select Bangle Size (గాజుల సైజు):
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { size: '2.4', label: '2.4 (Small)' },
                        { size: '2.6', label: '2.6 (Medium)' },
                        { size: '2.8', label: '2.8 (Large)' },
                        { size: '2.10', label: '2.10 (XL)' },
                      ].map((b) => (
                        <button
                          key={b.size}
                          type="button"
                          onClick={() => setBangleSize(b.size)}
                          className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                            bangleSize === b.size
                              ? 'border-[#821D24] bg-[#FAF1E8] text-[#821D24] ring-1 ring-[#821D24]'
                              : 'border-[#D5C5B2] bg-white text-[#4A3B32]'
                          }`}
                        >
                          <div>{b.size}</div>
                          <div className="text-[9px] text-[#7A6757]">{b.label.split(' ')[1]}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Royal Presentation Kit & 1-Year Guarantee */}
                <div className="p-3.5 bg-linear-to-r from-[#FAF2E8] to-[#F5ECE0] rounded-xl border border-[#E3D3BF] space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-[#821D24] font-bold">
                    <ShieldCheck className="w-4 h-4 text-[#821D24]" />
                    <span>Royal Velvet Gift Box & 1-Year Micro-Plating Guarantee</span>
                  </div>
                  <p className="text-[#6B5748] text-[11px] leading-relaxed">
                    Delivered in our signature lockable royal velvet jewelry chest with an airtight zip storage pouch, cleaning cloth, and official 1-year replating warranty card.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <h3 className="text-xs uppercase font-bold tracking-wider text-[#2A1E17] flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-[#821D24]" />
                  <span>Custom Finishing & Tailoring</span>
                </h3>

                {/* Complimentary Fall & Pico */}
                <label className="flex items-start gap-3 p-3 rounded-xl border border-[#DCD0C0] bg-white cursor-pointer hover:border-[#821D24] transition-colors">
                  <input
                    type="checkbox"
                    checked={fallAndPico}
                    onChange={(e) => setFallAndPico(e.target.checked)}
                    className="mt-0.5 accent-[#821D24] w-4 h-4 rounded cursor-pointer"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2A1E17]">Complimentary Fall & Pico Finishing</span>
                      <span className="font-bold text-[#1B4938] uppercase text-[10px]">Free</span>
                    </div>
                    <p className="text-[#7A6757] text-[11px] mt-0.5">
                      Ensures crisp Telugu Nivi pleats without slipping during weddings and pujas.
                    </p>
                  </div>
                </label>

                {/* Blouse Stitching Options */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[#4A3B32] block">
                    Blouse Piece Preference:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setBlouseOption('unstitched')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        blouseOption === 'unstitched'
                          ? 'border-[#821D24] bg-[#FAF1E8] font-bold text-[#821D24]'
                          : 'border-[#E0D5C7] bg-white text-[#4A3B32]'
                      }`}
                    >
                      <span>Unstitched (Included)</span>
                      <span className="block text-[10px] text-[#7A6757] font-normal">0.8m Pure Silk Fabric</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBlouseOption('custom-tailored')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        blouseOption === 'custom-tailored'
                          ? 'border-[#821D24] bg-[#FAF1E8] font-bold text-[#821D24]'
                          : 'border-[#E0D5C7] bg-white text-[#4A3B32]'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>Custom Tailored</span>
                        <span className="text-[#821D24] font-bold">+₹1,200</span>
                      </div>
                      <span className="block text-[10px] text-[#7A6757] font-normal">Master Artisan Stitching</span>
                    </button>
                  </div>

                  {/* Blouse measurements dropdown if custom tailored selected */}
                  {blouseOption === 'custom-tailored' && (
                    <div className="p-3 bg-white rounded-xl border border-[#E0D5C7] space-y-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#735E4F] mb-1">
                            Bust Size (Inches)
                          </label>
                          <select
                            value={bustSize}
                            onChange={(e) => setBustSize(e.target.value)}
                            className="w-full bg-[#FAF8F5] border border-[#D5C5B2] rounded-lg p-1.5 text-xs"
                          >
                            {['32', '34', '36', '38', '40', '42', '44'].map((size) => (
                              <option key={size} value={size}>
                                {size} inches
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#735E4F] mb-1">
                            Neckline Pattern
                          </label>
                          <select
                            value={neckStyle}
                            onChange={(e: any) => setNeckStyle(e.target.value)}
                            className="w-full bg-[#FAF8F5] border border-[#D5C5B2] rounded-lg p-1.5 text-xs"
                          >
                            <option value="Traditional Telugu Square Neck">Traditional Square (తెలుగు చతురస్రం)</option>
                            <option value="Sweetheart">Sweetheart Neck (Trending)</option>
                            <option value="Round Deep">Classic Deep Round</option>
                            <option value="V-Neck">Royal V-Neck</option>
                            <option value="Boat Neck">Modern Boat Neck</option>
                            <option value="High Collar">High Collar / Stand</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#735E4F] mb-1">
                          Sleeve Cut
                        </label>
                        <select
                          value={sleeveLength}
                          onChange={(e) => setSleeveLength(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#D5C5B2] rounded-lg p-1.5 text-xs"
                        >
                          <option value="Elbow Length (with Zari Border)">Elbow Length (with Zari Border)</option>
                          <option value="Cap Sleeves">Cap Sleeves (5 inches)</option>
                          <option value="Sleeveless">Modern Sleeveless</option>
                          <option value="Full Length Sleeves">Full Length Royal</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Matching Petticoat Add-on */}
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-[#DCD0C0] bg-white cursor-pointer hover:border-[#821D24] text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={petticoatAddon}
                      onChange={(e) => setPetticoatAddon(e.target.checked)}
                      className="accent-[#821D24] w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Add Matching Pure Satin Petticoat / Inskirt</span>
                  </div>
                  <span className="font-bold text-[#821D24]">+₹650</span>
                </label>
              </div>
            )}

            {/* Pincode Estimator */}
            <form onSubmit={handlePincodeCheck} className="space-y-1 pt-1">
              <label className="text-[11px] font-semibold text-[#5A493D] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#821D24]" />
                <span>Estimate AP & Telangana Express Delivery Pincode</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter Pincode (e.g. 500001 Hyderabad, 530001 Vizag)"
                  className="bg-white border border-[#D5C5B2] rounded-lg px-3 py-1.5 text-xs text-[#2A1E17] flex-1 focus:outline-hidden focus:border-[#821D24]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#FAF3EA] hover:bg-[#F0E2D1] text-[#821D24] font-bold text-xs rounded-lg border border-[#DECFBE] transition-colors cursor-pointer"
                >
                  Check
                </button>
              </div>
              {deliveryEstimate && (
                <p className="text-[11px] font-semibold text-[#1B4938] flex items-center gap-1 mt-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{deliveryEstimate}</span>
                </p>
              )}
            </form>

            {/* Quantity and Actions */}
            <div className="pt-3 border-t border-[#E8DFD1] space-y-3">
              {/* Quantity selector and Mobile Share button */}
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#5A493D]">Qty:</span>
                  <div className="flex items-center border border-[#D5C5B2] rounded-lg bg-white overflow-hidden text-xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-[#4A3B32] hover:bg-[#FAF8F5] font-bold active:bg-gray-100"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3.5 py-2 font-bold text-[#2A1E17]">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-[#4A3B32] hover:bg-[#FAF8F5] font-bold active:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {onOpenShareSaree && (
                  <button
                    type="button"
                    onClick={() => onOpenShareSaree(saree)}
                    className="inline-flex sm:hidden items-center gap-1.5 px-3 py-2 bg-[#FAF3EA] hover:bg-[#EFE3D3] text-[#821D24] text-xs font-bold border border-[#DECFBE] rounded-xl transition-all cursor-pointer shadow-2xs"
                    title="Share Saree via WhatsApp, Link or QR"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                )}
              </div>

              {/* Action Buttons: Stack on mobile, side-by-side on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  id="modal-add-to-bag-btn"
                  onClick={handleAdd}
                  className="w-full bg-[#FAF3EA] hover:bg-[#821D24] text-[#821D24] hover:text-white border border-[#821D24] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag ({formatPrice(unitTotal * quantity, currency)})</span>
                </button>

                <button
                  id="modal-buy-now-btn"
                  onClick={handleBuy}
                  className="w-full bg-[#821D24] hover:bg-[#68141A] text-white py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4 text-[#F5C767]" />
                  <span>Express Buy Now</span>
                </button>
              </div>

              {/* Desktop Share Saree / Ornament Trigger */}
              {onOpenShareSaree && (
                <div className="hidden sm:flex justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenShareSaree(saree)}
                    className="inline-flex items-center gap-1.5 text-xs text-[#821D24] hover:underline font-semibold cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{isOrnament ? 'Share Ornament via WhatsApp or QR' : 'Share Saree via WhatsApp or QR'}</span>
                  </button>
                </div>
              )}

              {/* Guarantees */}
              <div className="flex items-center justify-between text-[11px] text-[#7A6757] pt-1">
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3 h-3 text-[#821D24]" />
                  {isOrnament ? '7-Day Easy Exchange' : '7-Day Easy Return'}
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#821D24]" />
                  {isOrnament ? '1-Yr Plating Warranty' : 'Silk Mark Tested'}
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#821D24]" />
                  AP & TG Express
                </span>
              </div>
            </div>
          </div>

          {/* Customer Ratings & Reviews Section */}
          <div className="md:col-span-12">
            <SareeReviewSection
              saree={{
                ...saree,
                rating: currentRating,
                reviewCount: currentReviewCount,
              }}
              onReviewAdded={handleReviewAdded}
            />
          </div>
        </div>
      </div>

      {/* Full-Screen Uncropped Zoom Lightbox Viewer */}
      {isZoomOpen && (
        <div
          id="saree-zoom-lightbox"
          className="fixed inset-0 z-70 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-fadeIn"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Top Control Bar */}
          <div
            className="w-full max-w-6xl mx-auto flex items-center justify-between text-white pb-3 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="text-sm sm:text-base font-bold font-serif-title truncate">{saree.name}</span>
              <span className="text-[10px] sm:text-xs text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30 shrink-0">
                100% Uncropped View
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Zoom Controls */}
              <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/20">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
                  disabled={zoomLevel <= 1}
                  className="p-1.5 hover:bg-white/20 rounded text-white disabled:opacity-30 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs px-2 font-mono font-bold">{zoomLevel}x</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.5))}
                  disabled={zoomLevel >= 2.5}
                  className="p-1.5 hover:bg-white/20 rounded text-white disabled:opacity-30 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close zoom viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Image Canvas (Zero Crop) */}
          <div
            className="flex-1 w-full max-w-6xl mx-auto flex items-center justify-center overflow-auto p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={saree.images[activeImageIndex] || saree.images[0]}
              alt={saree.name}
              className="max-h-[75vh] sm:max-h-[82vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-200 select-none"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>

          {/* Bottom Thumbnails */}
          {saree.images.length > 1 && (
            <div
              className="w-full max-w-6xl mx-auto flex justify-center gap-2 pt-2 border-t border-white/10 overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {saree.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setZoomLevel(1);
                  }}
                  className={`w-12 h-16 rounded-md overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-amber-400 ring-2 ring-amber-400/40 opacity-100'
                      : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
