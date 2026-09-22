import { useState, useEffect, type FormEvent } from 'react';
import { 
  X, 
  Search, 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Database,
  ExternalLink,
  MessageCircle,
  Phone,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Order } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { fetchOrderByIdFromFirestore } from '../services/firestoreService';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  isDbLive: boolean;
  initialOrderId?: string;
  recentOrders?: Order[];
}

export function TrackOrderModal({
  isOpen,
  onClose,
  currency,
  isDbLive,
  initialOrderId = '',
  recentOrders = [],
}: TrackOrderModalProps) {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [loading, setLoading] = useState(false);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedAwb, setCopiedAwb] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Sync initialOrderId if provided
  useEffect(() => {
    if (initialOrderId) {
      setOrderIdInput(initialOrderId);
      handleSearch(initialOrderId);
    } else if (recentOrders.length > 0 && !searchedOrder && !hasSearched) {
      // Auto-preview most recent order if available
      setOrderIdInput(recentOrders[0].id);
      setSearchedOrder(recentOrders[0]);
      setHasSearched(true);
    }
  }, [initialOrderId, isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (idToSearch?: string) => {
    const targetId = (idToSearch !== undefined ? idToSearch : orderIdInput).trim();
    if (!targetId) {
      setErrorMessage('Please enter a valid Order ID (e.g., ORD-123456) or Courier AWB number.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setHasSearched(true);

    try {
      // First check local orders cache for instant response
      const localMatch = recentOrders.find(
        (o) => o.id.toLowerCase() === targetId.toLowerCase() || o.trackingNumber?.toLowerCase() === targetId.toLowerCase()
      );

      // Search Firestore live database
      const liveOrder = await fetchOrderByIdFromFirestore(targetId);

      if (liveOrder) {
        setSearchedOrder(liveOrder);
      } else if (localMatch) {
        setSearchedOrder(localMatch);
      } else {
        setSearchedOrder(null);
        setErrorMessage(`No order found matching "${targetId}". Please verify your Order ID from your confirmation email or SMS.`);
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      // Fallback to local matching if network error
      const localMatch = recentOrders.find(
        (o) => o.id.toLowerCase() === targetId.toLowerCase() || o.trackingNumber?.toLowerCase() === targetId.toLowerCase()
      );
      if (localMatch) {
        setSearchedOrder(localMatch);
      } else {
        setErrorMessage('Unable to connect to live tracking database. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleCopyAwb = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedAwb(true);
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Determine stage progression (0 to 4)
  const getStageIndex = (status: Order['status']): number => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return 4;
    if (s.includes('transit') || s.includes('dispatch') || s.includes('shipped') || s.includes('out for delivery')) return 3;
    if (s.includes('tailor') || s.includes('finish') || s.includes('pico') || s.includes('fall')) return 2;
    if (s.includes('loom') || s.includes('qc') || s.includes('inspect') || s.includes('sourced')) return 1;
    return 0; // Order Placed / Processing
  };

  const currentStageIndex = searchedOrder ? getStageIndex(searchedOrder.status) : 0;

  const trackingStages = [
    { 
      step: 1, 
      title: 'Order Placed', 
      telugu: 'ఆర్డర్ పూర్తయింది', 
      desc: 'Handloom cooperative notified' 
    },
    { 
      step: 2, 
      title: 'Loom QC & Silk Mark', 
      telugu: 'సిల్క్ మార్క్ ధృవీకరణ', 
      desc: 'Master weaver authenticity verified' 
    },
    { 
      step: 3, 
      title: 'Fall, Pico & Tailoring', 
      telugu: 'ఫాల్ & పీకో ఫినిషింగ్', 
      desc: 'Telugu drape edge work in progress' 
    },
    { 
      step: 4, 
      title: 'Regional Courier Dispatched', 
      telugu: 'కొరియర్ డిస్పాచ్', 
      desc: 'DTDC / AP TG Express in transit' 
    },
    { 
      step: 5, 
      title: 'Doorstep Delivery', 
      telugu: 'డెలివరీ చేయబడింది', 
      desc: 'Delivered at destination address' 
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        id="track-order-modal-container"
        className="bg-[#FAF8F5] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E8DFD1] overflow-hidden relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8DFD1] bg-[#F4EFEA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#821D24] text-white flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5 text-[#F5C767]" />
            </div>
            <div>
              <h2 className="font-serif-title text-xl font-bold text-[#2A1E17] flex items-center gap-2">
                <span>Track Order & Regional Delivery</span>
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-[#7A6757]">
                <span className="flex items-center gap-1">
                  <Database className={`w-3 h-3 ${isDbLive ? 'text-emerald-600' : 'text-amber-600'}`} />
                  {isDbLive ? 'Live Cloud Firestore Database' : 'Regional Express Dispatch'}
                </span>
                <span>•</span>
                <span>Andhra Pradesh & Telangana</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#5C4B3E] transition-colors cursor-pointer"
            aria-label="Close Track Order"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Search Box */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E0D5C7] shadow-2xs space-y-3">
            <label htmlFor="order-id-track-input" className="block text-xs font-bold text-[#2A1E17]">
              Enter Your Order ID or Courier AWB Tracking Number:
            </label>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8C7665] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="order-id-track-input"
                  type="text"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  placeholder="e.g. ORD-172938 or AWB-APTG8942"
                  className="w-full pl-9 pr-8 py-2.5 bg-[#FAF8F5] border border-[#D5C5B2] focus:border-[#821D24] rounded-lg text-xs font-mono font-bold text-[#2A1E17] focus:outline-hidden uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal"
                />
                {orderIdInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrderIdInput('');
                      setSearchedOrder(null);
                      setHasSearched(false);
                      setErrorMessage(null);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8C7665] hover:text-[#2A1E17]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !orderIdInput.trim()}
                className="px-5 py-2.5 bg-[#821D24] hover:bg-[#68141A] disabled:bg-[#B3A090] text-white font-bold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Tracking...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Track Status</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Sample / Recent Orders Chips */}
            {recentOrders.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-[#8C7665] font-medium">Recent Orders:</span>
                {recentOrders.slice(0, 3).map((ro) => (
                  <button
                    key={ro.id}
                    type="button"
                    onClick={() => {
                      setOrderIdInput(ro.id);
                      handleSearch(ro.id);
                    }}
                    className={`font-mono text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      searchedOrder?.id === ro.id
                        ? 'bg-[#821D24] text-white border-[#821D24]'
                        : 'bg-[#FAF3EA] text-[#821D24] border-[#E0D0BE] hover:bg-[#F3E7D5]'
                    }`}
                  >
                    {ro.id}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="text-center py-10 space-y-3 bg-white rounded-xl border border-[#E0D5C7] p-6">
              <div className="w-10 h-10 border-3 border-[#821D24] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium text-[#7A6757]">
                Searching live Andhra Pradesh & Telangana dispatch database for Order <strong className="font-mono text-[#821D24]">{orderIdInput}</strong>...
              </p>
            </div>
          )}

          {/* Error / Not Found View */}
          {!loading && errorMessage && (
            <div className="bg-[#FDF2F2] border border-[#F5C2C2] p-4 rounded-xl text-xs text-[#9B1C1C] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div className="space-y-1">
                <span className="font-bold block">Order Not Found</span>
                <p className="leading-relaxed">{errorMessage}</p>
                <div className="pt-2 text-[11px] text-[#7A6757]">
                  <strong>Need help?</strong> Orders placed in the boutique are assigned an ID in the format <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#E0D5C7]">ORD-XXXXXX</code>. You can also chat directly with our Telugu loom support on WhatsApp: <strong>+91 98480 22338</strong>.
                </div>
              </div>
            </div>
          )}

          {/* ORDER TRACKING RESULT */}
          {!loading && searchedOrder && (
            <div className="space-y-5 animate-fadeIn">
              {/* Order Overview Header Card */}
              <div className="bg-white rounded-xl border border-[#E0D5C7] p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8DFD1]">
                  <div>
                    <span className="text-[#8C7665] block text-[10px] uppercase font-bold tracking-wider">
                      Live Order Reference
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-[#821D24]">
                        {searchedOrder.id}
                      </span>
                      <button
                        onClick={() => handleCopyOrderId(searchedOrder.id)}
                        className="p-1 text-[#8C7665] hover:text-[#821D24] transition-colors rounded cursor-pointer"
                        title="Copy Order ID"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#8C7665] block text-[10px] uppercase font-bold tracking-wider">
                      Order Date
                    </span>
                    <span className="font-medium text-xs text-[#2A1E17]">
                      {searchedOrder.orderDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#8C7665] block text-[10px] uppercase font-bold tracking-wider">
                      AP/TG Delivery ETA
                    </span>
                    <span className="font-bold text-xs text-[#1B4938] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{searchedOrder.estimatedDelivery}</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[#8C7665] block text-[10px] uppercase font-bold tracking-wider">
                      Current Loom Status
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#EAF2ED] text-[#1B4938] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#C5E8D4]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{searchedOrder.status}</span>
                    </span>
                  </div>
                </div>

                {/* VISUAL 5-STAGE TRACKING STEPPER */}
                <div className="py-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase text-[#8C7665] tracking-wider">
                      Dispatch & Loom Finishing Progress:
                    </span>
                    <span className="text-[11px] font-semibold text-[#821D24]">
                      Stage {currentStageIndex + 1} of 5
                    </span>
                  </div>

                  {/* Horizontal progress bar */}
                  <div className="relative mb-6">
                    <div className="h-1.5 bg-[#EAE2D5] rounded-full w-full absolute top-3.5 -z-0" />
                    <div 
                      className="h-1.5 bg-[#821D24] rounded-full absolute top-3.5 -z-0 transition-all duration-700" 
                      style={{ width: `${(currentStageIndex / 4) * 100}%` }}
                    />

                    <div className="grid grid-cols-5 relative z-10">
                      {trackingStages.map((stage, idx) => {
                        const isCompleted = idx <= currentStageIndex;
                        const isCurrent = idx === currentStageIndex;

                        return (
                          <div key={stage.step} className="flex flex-col items-center text-center px-1">
                            <div 
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                                isCurrent
                                  ? 'bg-[#821D24] text-white ring-4 ring-[#F5E6D3] scale-110'
                                  : isCompleted
                                  ? 'bg-[#821D24] text-white'
                                  : 'bg-[#FAF8F5] text-[#9E8B7C] border-2 border-[#D5C5B2]'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="w-3.5 h-3.5 stroke-3" />
                              ) : (
                                <span>{stage.step}</span>
                              )}
                            </div>

                            <span className={`text-[10px] font-bold mt-2 leading-tight ${
                              isCurrent ? 'text-[#821D24]' : isCompleted ? 'text-[#2A1E17]' : 'text-[#9E8B7C]'
                            }`}>
                              {stage.title}
                            </span>
                            <span className="text-[9px] text-[#8C7665] mt-0.5 hidden sm:block">
                              {stage.telugu}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Milestone Detail Card */}
                  <div className="bg-[#FAF3EA] border border-[#EADBCC] rounded-lg p-3 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#821D24] text-white flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-[#F5C767]" />
                      </div>
                      <div>
                        <span className="font-bold text-[#2A1E17] block">
                          Current Milestone: {trackingStages[currentStageIndex].title} ({trackingStages[currentStageIndex].telugu})
                        </span>
                        <span className="text-[11px] text-[#7A6757]">
                          {trackingStages[currentStageIndex].desc}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-[#8C7665] block font-semibold uppercase">Express Courier</span>
                      <span className="text-xs font-bold text-[#821D24]">AP/TG Direct Express</span>
                    </div>
                  </div>
                </div>

                {/* Courier & AWB Tracking Section */}
                <div className="pt-3 border-t border-[#E8DFD1] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#821D24]" />
                    <span className="text-[#7A6757]">
                      Courier AWB: <strong className="font-mono text-[#2A1E17]">{searchedOrder.trackingNumber || 'APTG-EXPRESS-108'}</strong>
                    </span>
                    <button
                      onClick={() => handleCopyAwb(searchedOrder.trackingNumber || 'APTG-EXPRESS-108')}
                      className="p-1 text-[#8C7665] hover:text-[#821D24] transition-colors rounded cursor-pointer"
                      title="Copy AWB Tracking Number"
                    >
                      {copiedAwb ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Insured Handloom Transit</span>
                  </span>
                </div>
              </div>

              {/* Delivery Destination & Contact Details */}
              <div className="bg-white rounded-xl border border-[#E0D5C7] p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD1]">
                  <span className="text-xs font-bold text-[#2A1E17] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#821D24]" />
                    <span>Regional Delivery Destination</span>
                  </span>
                  <span className="text-[11px] font-semibold text-[#821D24] bg-[#FAF2E8] px-2 py-0.5 rounded">
                    {searchedOrder.customer.state}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#8C7665] uppercase font-bold block">Recipient Name</span>
                    <span className="font-bold text-[#2A1E17]">{searchedOrder.customer.fullName}</span>
                    <span className="text-[#7A6757] block mt-0.5">{searchedOrder.customer.phone}</span>
                    <span className="text-[#7A6757] block">{searchedOrder.customer.email}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#8C7665] uppercase font-bold block">Shipping Address</span>
                    <p className="text-[#2A1E17] leading-relaxed">
                      {searchedOrder.customer.addressLine}
                      {searchedOrder.customer.deliveryLandmark && (
                        <span className="block text-[#7A6757]">Near {searchedOrder.customer.deliveryLandmark}</span>
                      )}
                      <strong className="block text-[#2A1E17]">
                        {searchedOrder.customer.district || searchedOrder.customer.city}, {searchedOrder.customer.state} - {searchedOrder.customer.pincode}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Ordered Handlooms List */}
              <div className="bg-white rounded-xl border border-[#E0D5C7] p-4 sm:p-5 shadow-2xs space-y-3">
                <span className="text-xs font-bold text-[#2A1E17] block pb-2 border-b border-[#E8DFD1]">
                  Sarees in This Order ({searchedOrder.items.length}):
                </span>

                <div className="space-y-3">
                  {searchedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3.5 text-xs py-1 border-b border-[#F5EFE8] last:border-0">
                      <img
                        src={item.saree.images[0]}
                        alt={item.saree.name}
                        className="w-14 h-16 rounded-lg object-cover border border-[#E8DFD1] bg-[#FAF8F5] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-[#2A1E17] block truncate">{item.saree.name}</span>
                        {item.saree.teluguName && (
                          <span className="text-[10px] text-[#821D24] block truncate font-medium">
                            {item.saree.teluguName}
                          </span>
                        )}
                        <div className="text-[11px] text-[#7A6757] flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                          <span>Qty: {item.quantity}</span>
                          <span>•</span>
                          <span>{item.fallAndPico ? 'Free Fall & Pico Included' : 'Standard Loom'}</span>
                          <span>•</span>
                          <span>{item.blouseOption}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-[#821D24] block">
                          {formatPrice(item.unitPrice * item.quantity, currency)}
                        </span>
                        <span className="text-[10px] text-[#8C7665]">
                          {formatPrice(item.unitPrice, currency)} each
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#E8DFD1] flex justify-between text-sm font-bold text-[#2A1E17]">
                  <span>Total Amount:</span>
                  <span className="text-[#821D24]">{formatPrice(searchedOrder.total, currency)}</span>
                </div>
              </div>

              {/* Direct WhatsApp Dispatch Support */}
              <div className="bg-[#FAF3EA] border border-[#DECFBE] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <MessageCircle className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <span className="font-bold text-[#2A1E17] block">
                      Need Immediate Dispatch or Tailoring Assistance?
                    </span>
                    <span className="text-[11px] text-[#7A6757]">
                      Connect directly with our Hyderabad & Vijayawada Loom Care team on WhatsApp.
                    </span>
                  </div>
                </div>

                <a
                  href={`https://wa.me/919848022338?text=Hello%20Vastra%20Boutique,%20I%20would%20like%20an%20update%20on%20my%20Saree%20Order%20${searchedOrder.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold px-3.5 py-2 rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          )}

          {/* Initial Clean State: If nothing searched yet */}
          {!loading && !searchedOrder && !errorMessage && (
            <div className="text-center py-12 space-y-3 bg-white rounded-xl border border-[#E0D5C7] p-6">
              <div className="w-12 h-12 rounded-full bg-[#FAF3EA] text-[#821D24] flex items-center justify-center mx-auto shadow-2xs">
                <Package className="w-6 h-6 stroke-1.5" />
              </div>
              <h3 className="font-serif-title text-lg font-bold text-[#2A1E17]">
                Track Any Handloom Order in Real-Time
              </h3>
              <p className="text-xs text-[#7A6757] max-w-md mx-auto leading-relaxed">
                Enter your Order ID (received after checkout or via SMS) above to monitor the weaving status, Silk Mark verification, fall & pico tailoring, and express courier movement to your district.
              </p>
              <div className="pt-2 flex justify-center gap-4 text-[11px] text-[#8C7665]">
                <span>✓ 24–48h AP & TG Express</span>
                <span>✓ Silk Mark Certified</span>
                <span>✓ Direct Loom Dispatch</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
