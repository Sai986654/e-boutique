import { useState } from 'react';
import { Heart, Eye, ShoppingBag, ShieldCheck, Star, MapPin, Share2 } from 'lucide-react';
import { Saree } from '../types';
import { formatPrice } from '../utils/formatCurrency';

interface SareeCardProps {
  key?: string;
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
  const discountPercent = Math.round(((saree.originalPrice - saree.price) / saree.originalPrice) * 100);

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
        <img
          src={saree.images[currentImageIndex] || saree.images[0]}
          alt={saree.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
          {saree.isSilkMarkCertified && (
            <span className="inline-flex items-center gap-1 bg-[#1B4938] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-xs uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              <span>Silk Mark</span>
            </span>
          )}
          {saree.stateRegion && (
            <span className="bg-[#821D24] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-xs uppercase tracking-wider">
              {saree.stateRegion === 'Telangana' ? 'Telangana Loom' : saree.stateRegion === 'Andhra Pradesh' ? 'Andhra Loom' : 'South India'}
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
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 shadow-sm ${
            isWishlisted
              ? 'bg-[#821D24] text-white'
              : 'bg-white/80 text-[#4A3B32] hover:bg-white hover:text-[#821D24]'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View Hover Button */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button
            id={`quick-view-${saree.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(saree);
            }}
            className="flex-1 py-2 bg-white/95 hover:bg-white text-[#2B1E17] text-xs font-bold rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View (చూడండి)</span>
          </button>
          {onShareSaree && (
            <button
              id={`share-saree-${saree.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onShareSaree(saree);
              }}
              className="px-2.5 py-2 bg-white/95 hover:bg-white text-[#821D24] text-xs font-bold rounded-lg shadow-md flex items-center justify-center transition-colors cursor-pointer"
              title="Share this Saree"
              aria-label="Share this saree"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Fabric & District Origin */}
          <div className="flex items-center justify-between text-[11px] text-[#8C7665] mb-1">
            <span className="font-semibold uppercase tracking-wider text-[#821D24]">
              {saree.fabric}
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-[#5C4B3E]">
              <MapPin className="w-2.5 h-2.5 text-[#821D24]" />
              <span>{saree.district || saree.origin.split(',')[0]}</span>
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onQuickView(saree)}
            className="font-serif-title text-base font-bold text-[#231A14] leading-snug hover:text-[#821D24] transition-colors cursor-pointer line-clamp-1"
            title={saree.name}
          >
            {saree.name}
          </h3>

          {saree.teluguName && (
            <span className="text-xs text-[#821D24] font-medium block truncate mt-0.5">
              {saree.teluguName}
            </span>
          )}

          <p className="text-xs text-[#735F50] line-clamp-1 mt-0.5">
            {saree.subtitle}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex text-[#D99A26]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(saree.rating) ? 'fill-[#D99A26]' : 'text-[#D5C5B2]'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-[#423226] ml-1">
              {saree.rating.toFixed(1)}
            </span>
            <span className="text-[10px] text-[#8C7665]">
              ({saree.reviewCount})
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-[#F0E9DF] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-[#821D24]">
                {formatPrice(saree.price, currency)}
              </span>
              <span className="text-xs text-[#9E8B7C] line-through">
                {formatPrice(saree.originalPrice, currency)}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#1B4938] bg-[#EAF2ED] px-1.5 py-0.5 rounded">
              {discountPercent}% OFF • Free Fall/Pico
            </span>
          </div>

          <button
            id={`add-to-bag-${saree.id}`}
            onClick={() => onQuickAddToBag(saree)}
            className="inline-flex items-center gap-1.5 bg-[#FAF3EA] hover:bg-[#821D24] text-[#821D24] hover:text-white border border-[#E0D0BE] hover:border-[#821D24] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Add Saree with Complimentary Fall & Pico"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
