import { X, Heart, ShoppingBag, Trash2, ArrowRight, Share2, TrendingDown, Sparkles } from 'lucide-react';
import { Saree } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { checkWishlistPriceDrops, calculateWishlistTotalSavings } from '../utils/priceDropHelper';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Saree[];
  catalog?: Saree[];
  currency: string;
  onRemoveFromWishlist: (saree: Saree) => void;
  onMoveToCart: (saree: Saree) => void;
  onExploreSarees: () => void;
  onShareSaree?: (saree: Saree) => void;
  onSimulatePriceDrop?: (sareeId: string, revert?: boolean) => void;
}

export function WishlistModal({
  isOpen,
  onClose,
  wishlist,
  catalog = [],
  currency,
  onRemoveFromWishlist,
  onMoveToCart,
  onExploreSarees,
  onShareSaree,
  onSimulatePriceDrop,
}: WishlistModalProps) {
  if (!isOpen) return null;

  const priceDrops = checkWishlistPriceDrops(wishlist, catalog);
  const totalSavings = calculateWishlistTotalSavings(priceDrops);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        id="wishlist-modal-container"
        className="bg-[#FAF8F5] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E8DFD1] overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8DFD1] bg-[#F4EFEA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#821D24] fill-[#821D24]" />
            <h2 className="font-serif-title text-xl font-bold text-[#2A1E17]">
              Saved Sarees ({wishlist.length})
            </h2>
            {priceDrops.length > 0 && (
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs animate-pulse">
                <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                <span>{priceDrops.length} Price Drop{priceDrops.length > 1 ? 's' : ''}!</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#5C4B3E] transition-colors cursor-pointer"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Price Drop Alert Banner */}
          {priceDrops.length > 0 && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-900 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-full bg-emerald-600 text-white shrink-0 shadow-xs">
                  <TrendingDown className="w-4 h-4 stroke-[2.5]" />
                </span>
                <div>
                  <div className="font-bold flex items-center gap-1.5 text-emerald-950">
                    <span>Good news! Price dropped on {priceDrops.length} saved saree{priceDrops.length > 1 ? 's' : ''}!</span>
                    <span className="bg-emerald-200 text-emerald-900 text-[10px] font-extrabold px-1.5 py-0.2 rounded">
                      Live Alert
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Total extra savings of <strong>{formatPrice(totalSavings, currency)}</strong> if you order today before stocks run out.
                  </p>
                </div>
              </div>
            </div>
          )}

          {wishlist.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Heart className="w-12 h-12 text-[#9E8B7C] mx-auto stroke-1" />
              <h3 className="font-serif-title text-lg font-bold text-[#2A1E17]">
                Your wishlist is currently empty
              </h3>
              <p className="text-xs text-[#7A6757] max-w-xs mx-auto">
                Tap the heart icon on any saree to save it for upcoming celebrations, weddings, and festivals. You'll receive real-time price drop alerts whenever rates are reduced!
              </p>
              <button
                onClick={() => {
                  onClose();
                  onExploreSarees();
                }}
                className="inline-flex items-center gap-2 bg-[#821D24] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md hover:bg-[#68141A] transition-colors cursor-pointer mt-2"
              >
                <span>Browse Sarees</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {wishlist.map((saree) => {
                // Find matching live catalog item and price drop info
                const liveCatalogSaree = catalog.find((c) => c.id === saree.id) || saree;
                const drop = priceDrops.find((d) => d.sareeId === saree.id);

                return (
                  <div
                    key={saree.id}
                    className={`bg-white p-3 rounded-xl border shadow-2xs flex gap-3 relative group transition-all ${
                      drop ? 'border-emerald-300 ring-1 ring-emerald-400/40 bg-emerald-50/20' : 'border-[#E0D5C7]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={saree.images[0]}
                        alt={saree.name}
                        className="w-20 h-24 rounded-lg object-cover bg-[#F3EFE9] border border-[#E8DFD1]"
                      />
                      {drop && (
                        <span className="absolute -top-1.5 -left-1.5 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs flex items-center gap-0.5 border border-white">
                          <TrendingDown className="w-2.5 h-2.5 stroke-[2.5]" />
                          <span>-{drop.percentageDrop}%</span>
                        </span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between text-xs">
                      <div>
                        {drop && (
                          <div className="mb-1">
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                              <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                              <span>Price dropped by {formatPrice(drop.dropAmount, currency)}!</span>
                            </span>
                          </div>
                        )}

                        <h4 className="font-bold text-[#2A1E17] line-clamp-1">
                          {saree.name}
                        </h4>
                        <span className="text-[11px] text-[#7A6757] block">
                          {saree.fabric} • {saree.origin.split(',')[0]}
                        </span>
                        
                        <div className="mt-1 flex items-baseline gap-2">
                          {drop ? (
                            <>
                              <span className="font-bold text-emerald-700 text-sm">
                                {formatPrice(drop.currentPrice, currency)}
                              </span>
                              <span className="line-through text-[#9E8B7C] text-[11px]">
                                {formatPrice(drop.savedAtPrice, currency)}
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-[#821D24]">
                              {formatPrice(saree.price, currency)}
                            </span>
                          )}
                        </div>

                        {/* Interactive price drop test action */}
                        {onSimulatePriceDrop && (
                          <div className="mt-1">
                            <button
                              type="button"
                              onClick={() => onSimulatePriceDrop(saree.id, !!drop)}
                              className={`text-[10px] font-semibold underline cursor-pointer transition-colors ${
                                drop ? 'text-amber-700 hover:text-amber-900' : 'text-emerald-700 hover:text-emerald-900'
                              }`}
                              title={drop ? "Revert to original price" : "Simulate a live price reduction to test the navbar alert badge"}
                            >
                              {drop ? '↩ Revert to original price' : '⚡ Test 15% Price Drop Alert'}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 pt-2">
                        <button
                          onClick={() => {
                            onMoveToCart(liveCatalogSaree);
                            onRemoveFromWishlist(saree);
                          }}
                          className={`flex-1 text-white py-1.5 px-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                            drop 
                              ? 'bg-emerald-700 hover:bg-emerald-800 shadow-xs' 
                              : 'bg-[#821D24] hover:bg-[#68141A]'
                          }`}
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>{drop ? 'Bag at Sale Price' : 'Move to Bag'}</span>
                        </button>

                        {onShareSaree && (
                          <button
                            onClick={() => onShareSaree(saree)}
                            className="p-1.5 rounded-lg text-[#821D24] hover:bg-[#FAF2E8] border border-[#E0D5C7] transition-colors cursor-pointer"
                            title="Share Saree with family/friends"
                            aria-label="Share saree"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onRemoveFromWishlist(saree)}
                          className="p-1.5 rounded-lg text-[#9E8B7C] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
