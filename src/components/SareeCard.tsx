import { useState } from 'react';
import { Heart, Eye, ShoppingBag, ShieldCheck, Star, MapPin, Share2, Sparkles } from 'lucide-react';
import { Saree } from '../types';
import { formatPrice } from '../utils/formatCurrency';

interface SareeCardProps {
  saree: Saree;
  currency: string;
  isWishlisted: boolean;
  onToggleWishlist: (saree: Saree) => void;
  onQuickView: (saree: Saree) => void;
  onQuickAddToBag: (saree: Saree) => void;
  onShareSaree?: (saree: Saree) => void;
}

export function SareeCard({
  saree,
  currency,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onQuickAddToBag,
  onShareSaree,
}: SareeCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const discountPercent = Math.round(((saree.originalPrice - saree.price) / saree.originalPrice) * 100);
  const isOrnament = saree.productType === 'ornament';

  return (
    <div 
      id={`saree-card-${saree.id}`}
      className="group bg-white rounded-xl border border-[#EBE4D8] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      {/* Visual Image Container */}
      <div 
        className="relative aspect-3/4 overflow-hidden bg-[#F3EFE9] cursor-pointer"
        onMouseEnter={() => saree.images.length > 1 && setCurrentImageIndex(1)}
        onMouseLeave={() => setCurrentImageIndex(0)}
        onClick={() => onQuickView(saree)}
      >
        {!isLoaded && (
          <div className="absolute inset-0 bg-linear-to-r from-[#EDE6DC] via-[#F5EFE6] to-[#EDE6DC] animate-pulse" />
        )}
        <img
          src={saree.images[currentImageIndex] || saree.images[0]}
          alt={saree.name}
          className={`w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-1.5 items-start pointer-events-none">
          {isOrnament ? (
            <span className="inline-flex items-center gap-1 bg-[#821D24] text-[#F9E8B2] text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-sm shadow-sm uppercase tracking-wider border border-[#D4AF37]/50">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#FFD700]" />
              <span>1-Gram Gold</span>
            </span>
          ) : (
            saree.isSilkMarkCertified && (
              <span className="inline-flex items-center gap-1 bg-[#1B4938] text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-sm shadow-xs uppercase tracking-wider">
                <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>Silk Mark</span>
              </span>
            )
          )}
          {saree.stateRegion && (
            <span className="bg-[#821D24] text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-sm shadow-xs uppercase tracking-wider">
              {saree.stateRegion === 'Telangana' ? 'Telangana' : saree.stateRegion === 'Andhra Pradesh' ? 'Andhra' : 'South India'}
            </span>
          )}
        </div>

        {/* Wishlist Heart Action */}
        <button
          id={`wishlist-toggle-${saree.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(saree);
          }}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 shadow-sm ${
            isWishlisted
              ? 'bg-[#821D24] text-white'
              : 'bg-white/80 text-[#4A3B32] hover:bg-white hover:text-[#821D24]'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View Hover Button */}
        <div className="absolute inset-x-2 sm:inset-x-3 bottom-2 sm:bottom-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button
            id={`quick-view-${saree.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(saree);
            }}
            className="flex-1 py-1.5 sm:py-2 bg-white/95 hover:bg-white text-[#2B1E17] text-[11px] sm:text-xs font-bold rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isOrnament ? 'View Ornament (ఆభరణం)' : 'Quick View (చూడండి)'}</span>
          </button>
          {onShareSaree && (
            <button
              id={`share-saree-${saree.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onShareSaree(saree);
              }}
              className="px-2 sm:px-2.5 py-1.5 sm:py-2 bg-white/95 hover:bg-white text-[#821D24] text-xs font-bold rounded-lg shadow-md flex items-center justify-center transition-colors cursor-pointer"
              title={isOrnament ? "Share this Ornament" : "Share this Saree"}
              aria-label={isOrnament ? "Share this ornament" : "Share this saree"}
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div>
          {/* Fabric/Craft & District Origin */}
          <div className="flex items-center justify-between text-[9px] sm:text-[11px] text-[#8C7665] mb-1">
            <span className="font-semibold uppercase tracking-wider text-[#821D24] truncate max-w-[110px] sm:max-w-none">
              {isOrnament ? (saree.ornamentType || saree.fabric) : saree.fabric}
            </span>
            <span className="flex items-center gap-0.5 text-[8px] sm:text-[10px] text-[#5C4B3E] shrink-0">
              <MapPin className="w-2.5 h-2.5 text-[#821D24]" />
              <span>{saree.district || saree.origin.split(',')[0]}</span>
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onQuickView(saree)}
            className="font-serif-title text-xs sm:text-base font-bold text-[#231A14] leading-snug hover:text-[#821D24] transition-colors cursor-pointer line-clamp-1"
            title={saree.name}
          >
            {saree.name}
          </h3>

          {saree.teluguName && (
            <span className="text-[10px] sm:text-xs text-[#821D24] font-medium block truncate mt-0.5">
              {saree.teluguName}
            </span>
          )}

          <p className="text-[10px] sm:text-xs text-[#735F50] line-clamp-1 mt-0.5">
            {saree.subtitle}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1 sm:mt-1.5">
            <div className="flex text-[#D99A26]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                    i < Math.floor(saree.rating) ? 'fill-[#D99A26]' : 'text-[#D5C5B2]'
                  }`}
                />
              ))}
            </div>
            <span className="text-[9px] sm:text-[11px] font-bold text-[#423226] ml-0.5 sm:ml-1">
              {saree.rating.toFixed(1)}
            </span>
            <span className="text-[8px] sm:text-[10px] text-[#8C7665]">
              ({saree.reviewCount})
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-[#F0E9DF] flex flex-wrap items-center justify-between gap-1 sm:gap-1.5">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-xs sm:text-base font-bold text-[#821D24]">
                {formatPrice(saree.price, currency)}
              </span>
              <span className="text-[9px] sm:text-xs text-[#9E8B7C] line-through">
                {formatPrice(saree.originalPrice, currency)}
              </span>
            </div>
            <span className="text-[8px] sm:text-[10px] font-semibold text-[#1B4938] bg-[#EAF2ED] px-1 sm:px-1.5 py-0.5 rounded block truncate">
              {discountPercent}% OFF • {isOrnament ? '1-Yr Warranty • Velvet Box' : 'Fall/Pico Included'}
            </span>
          </div>

          <button
            id={`add-to-bag-${saree.id}`}
            onClick={() => onQuickAddToBag(saree)}
            className="inline-flex items-center gap-1 sm:gap-1.5 bg-[#FAF3EA] hover:bg-[#821D24] text-[#821D24] hover:text-white border border-[#E0D0BE] hover:border-[#821D24] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
            title={isOrnament ? "Add Ornament with Velvet Gift Box" : "Add Saree with Complimentary Fall & Pico"}
          >
            <ShoppingBag className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
