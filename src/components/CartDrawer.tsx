import { useState, type FormEvent } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Scissors, 
  ShieldCheck, 
  Tag,
  Check
} from 'lucide-react';
import { CartItem } from '../types';
import { formatPrice } from '../utils/formatCurrency';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: string;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onProceedToCheckout: (discountAmount: number, promoCode: string) => void;
  onExploreSarees: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onExploreSarees,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>({
    code: 'UTSAV15',
    percent: 15,
  });
  const [promoError, setPromoError] = useState('');

  const rawSubtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountAmount = appliedPromo ? Math.round((rawSubtotal * appliedPromo.percent) / 100) : 0;
  const shippingThreshold = 10000;
  const isFreeShipping = rawSubtotal >= shippingThreshold || items.length === 0;
  const shippingFee = isFreeShipping ? 0 : 500;
  const grandTotal = Math.max(0, rawSubtotal - discountAmount + shippingFee);

  const handleApplyPromo = (e: FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();
    if (code === 'UTSAV15') {
      setAppliedPromo({ code: 'UTSAV15', percent: 15 });
    } else if (code === 'WELCOME10') {
      setAppliedPromo({ code: 'WELCOME10', percent: 10 });
    } else if (code === 'BRIDAL20') {
      setAppliedPromo({ code: 'BRIDAL20', percent: 20 });
    } else {
      setPromoError('Invalid coupon code. Try UTSAV15 or WELCOME10');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div 
        id="cart-drawer-panel"
        className="w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col border-l border-[#E5DCD0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8DFD1] bg-[#F4EFEA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#821D24]" />
            <h2 className="font-serif-title text-xl font-bold text-[#2A1E17]">
              Your Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <button
            id="close-cart-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#5C4B3E] transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress bar */}
        <div className="px-6 py-2.5 bg-[#FAF2E8] border-b border-[#EADFCF] text-xs">
          {rawSubtotal < shippingThreshold ? (
            <p className="text-[#821D24] font-medium">
              Add <strong>{formatPrice(shippingThreshold - rawSubtotal, currency)}</strong> more for <strong>Free Worldwide Express Delivery</strong>!
            </p>
          ) : (
            <p className="text-[#1B4938] font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#1B4938]" />
              <span>Complimentary Insured Express Delivery unlocked!</span>
            </p>
          )}
          <div className="w-full bg-[#E5DCD0] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-[#821D24] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (rawSubtotal / shippingThreshold) * 100)}%` }}
            />
          </div>
        </div>

        {/* Items List or Empty State */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F3ECE1] text-[#821D24] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8 stroke-1" />
              </div>
              <h3 className="font-serif-title text-xl font-bold text-[#2A1E17]">
                Your bag is empty
              </h3>
              <p className="text-xs text-[#7A6757] max-w-xs mx-auto">
                Discover our handwoven Katan silks, bridal Kanjeevarams, and featherweight organzas.
              </p>
              <button
                id="cart-empty-explore-btn"
                onClick={() => {
                  onClose();
                  onExploreSarees();
                }}
                className="inline-flex items-center gap-2 bg-[#821D24] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md hover:bg-[#68141A] transition-colors cursor-pointer"
              >
                <span>Explore Saree Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                id={`cart-item-${item.id}`}
                className="bg-white p-3.5 rounded-xl border border-[#E8DFD1] shadow-2xs flex gap-3.5"
              >
                {/* Image */}
                <img
                  src={item.saree.images[0]}
                  alt={item.saree.name}
                  className="w-20 h-24 rounded-lg object-cover object-top bg-[#F3EFE9] shrink-0 border border-[#E8DFD1]"
                />

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between text-xs">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-[#2A1E17] line-clamp-1 leading-tight">
                        {item.saree.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-[#9A8778] hover:text-[#821D24] transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-[11px] text-[#7A6757] block mt-0.5">
                      {item.saree.fabric} • {item.saree.color}
                    </span>

                    {/* Customization Badges */}
                    {item.saree.productType === 'ornament' ? (
                      <div className="flex flex-wrap gap-1 mt-1.5 text-[10px]">
                        <span className="bg-[#FAF2E8] text-[#821D24] px-1.5 py-0.5 rounded font-semibold border border-[#D4AF37]/30">
                          👑 1-Gram Gold Plated
                        </span>
                        <span className="bg-[#EBF3ED] text-[#1B4938] px-1.5 py-0.5 rounded font-medium">
                          1-Yr Warranty • Velvet Gift Box
                        </span>
                        {item.blouseMeasurements?.bust?.includes('Size') && (
                          <span className="bg-[#F0E6D8] text-[#594232] px-1.5 py-0.5 rounded">
                            {item.blouseMeasurements.bust}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1.5 text-[10px]">
                        {item.fallAndPico && (
                          <span className="bg-[#FAF2E8] text-[#821D24] px-1.5 py-0.5 rounded font-medium">
                            Fall & Pico Added
                          </span>
                        )}
                        {item.blouseOption === 'custom-tailored' ? (
                          <span className="bg-[#EBF3ED] text-[#1B4938] px-1.5 py-0.5 rounded font-medium">
                            Tailored Blouse ({item.blouseMeasurements?.bust}&quot;, {item.blouseMeasurements?.neckStyle})
                          </span>
                        ) : (
                          <span className="bg-[#F4EFEA] text-[#635144] px-1.5 py-0.5 rounded">
                            Unstitched Blouse
                          </span>
                        )}
                        {item.petticoatAddon && (
                          <span className="bg-[#F0E6D8] text-[#594232] px-1.5 py-0.5 rounded">
                            Satin Inskirt
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quantity & Unit Price */}
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#F0E9DF]">
                    <div className="flex items-center border border-[#D5C5B2] rounded-md bg-white">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-[#5C4B3E] hover:bg-[#FAF8F5] font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 font-bold text-[#2A1E17]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-[#5C4B3E] hover:bg-[#FAF8F5] font-bold"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-bold text-[#821D24] text-sm">
                      {formatPrice(item.unitPrice * item.quantity, currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-[#E8DFD1] bg-[#F7F3EC] space-y-3">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#8C7665] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Coupon code (e.g. UTSAV15)"
                    className="w-full uppercase bg-white border border-[#D5C5B2] rounded-lg pl-8 pr-2 py-1.5 text-xs text-[#2A1E17] placeholder:normal-case focus:outline-hidden focus:border-[#821D24]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#821D24] text-white text-xs font-bold rounded-lg hover:bg-[#68141A] transition-colors"
                >
                  Apply
                </button>
              </div>
              {appliedPromo && (
                <div className="flex items-center justify-between text-[11px] text-[#1B4938] font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Applied &apos;{appliedPromo.code}&apos; ({appliedPromo.percent}% OFF)
                  </span>
                  <button
                    type="button"
                    onClick={() => setAppliedPromo(null)}
                    className="text-xs text-red-700 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
              {promoError && (
                <p className="text-[11px] text-red-600">{promoError}</p>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-[#E5DCD0]">
              <div className="flex justify-between text-[#5C4B3E]">
                <span>Bag Subtotal</span>
                <span>{formatPrice(rawSubtotal, currency)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#1B4938] font-medium">
                  <span>Festive Discount ({appliedPromo?.code})</span>
                  <span>-{formatPrice(discountAmount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#5C4B3E]">
                <span>Express Shipping</span>
                <span>{isFreeShipping ? 'FREE' : formatPrice(shippingFee, currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#2A1E17] pt-1.5 border-t border-[#E5DCD0]">
                <span>Grand Total</span>
                <span className="text-[#821D24]">{formatPrice(grandTotal, currency)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              id="proceed-to-checkout-btn"
              onClick={() => onProceedToCheckout(discountAmount, appliedPromo ? appliedPromo.code : '')}
              className="w-full bg-[#821D24] hover:bg-[#68141A] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Proceed to Express Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#8C7665]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1B4938]" />
              <span>100% Secure Encrypted Checkout • Silk Mark Genuine</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
