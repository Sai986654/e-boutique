import { X, Package, Clock, MapPin, Truck, Database, Search, ArrowRight } from 'lucide-react';
import { Order } from '../types';
import { formatPrice } from '../utils/formatCurrency';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  currency: string;
  isDbLive: boolean;
  onOpenTrackOrder?: (orderId?: string) => void;
}

export function OrdersModal({ isOpen, onClose, orders, currency, isDbLive, onOpenTrackOrder }: OrdersModalProps) {
  if (!isOpen) return null;

  const trackingStages = [
    { title: 'Order Placed', desc: 'Handloom cooperative notified' },
    { title: 'Loom Sourcing & QC', desc: 'GI & Silk Mark verification' },
    { title: 'Fall & Pico Finishing', desc: 'Telugu drape edge finishing' },
    { title: 'Dispatched', desc: 'AP/TG Express Courier' },
    { title: 'Delivered', desc: 'Delivered at doorstep' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        id="orders-modal-container"
        className="bg-[#FAF8F5] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#E8DFD1] overflow-hidden relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8DFD1] bg-[#F4EFEA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#821D24]" />
            <div>
              <h2 className="font-serif-title text-xl font-bold text-[#2A1E17]">
                My Orders & Live Firestore Tracking ({orders.length})
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-[#7A6757]">
                <span className="flex items-center gap-1">
                  <Database className={`w-3 h-3 ${isDbLive ? 'text-emerald-600' : 'text-amber-600'}`} />
                  {isDbLive ? 'Synced to Cloud Firestore Database' : 'Local state fallback'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenTrackOrder && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTrackOrder();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#821D24] text-white hover:bg-[#68141A] rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                title="Input any Order ID or Courier AWB"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Track by Order ID</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 text-[#5C4B3E] transition-colors cursor-pointer"
              aria-label="Close orders"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Package className="w-12 h-12 text-[#9E8B7C] mx-auto stroke-1" />
              <h3 className="font-serif-title text-lg font-bold text-[#2A1E17]">
                No orders in this session yet
              </h3>
              <p className="text-xs text-[#7A6757] max-w-sm mx-auto">
                Place an order for any Pochampally, Gadwal, or Uppada saree to experience live Firestore database tracking, or input an existing Order ID to check its live delivery status!
              </p>
              {onOpenTrackOrder && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenTrackOrder();
                  }}
                  className="inline-flex items-center gap-2 bg-[#821D24] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md hover:bg-[#68141A] transition-colors cursor-pointer mt-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Enter Order ID to Track</span>
                </button>
              )}
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                id={`order-card-${order.id}`}
                className="bg-white rounded-xl border border-[#E0D5C7] overflow-hidden shadow-2xs space-y-4 p-4 sm:p-5"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E8DFD1] text-xs">
                  <div>
                    <span className="text-[#7A6757] block text-[10px] uppercase font-bold">Order ID</span>
                    <span className="font-mono font-bold text-sm text-[#821D24]">{order.id}</span>
                  </div>

                  <div>
                    <span className="text-[#7A6757] block text-[10px] uppercase font-bold">Placed Date</span>
                    <span className="font-medium text-[#2A1E17]">{order.orderDate}</span>
                  </div>

                  <div>
                    <span className="text-[#7A6757] block text-[10px] uppercase font-bold">Total Paid</span>
                    <span className="font-bold text-[#821D24]">{formatPrice(order.total, currency)}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[#7A6757] block text-[10px] uppercase font-bold">Loom Status</span>
                    <span className="inline-flex items-center gap-1 bg-[#EAF2ED] text-[#1B4938] text-[11px] font-bold px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span>{order.status}</span>
                    </span>
                  </div>
                </div>

                {/* Tracking Stepper */}
                <div className="py-2">
                  <span className="text-[11px] font-bold uppercase text-[#8C7665] block mb-3">
                    Dispatch & Finishing Milestones:
                  </span>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {trackingStages.map((stage, sIdx) => {
                      const isComplete = sIdx <= 1; // realistic in-progress stage
                      const isCurrent = sIdx === 1;
                      return (
                        <div key={stage.title} className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1.5 transition-colors ${
                            isComplete ? 'bg-[#821D24] text-white' : 'bg-[#EAE2D5] text-[#7A6757]'
                          }`}>
                            {sIdx + 1}
                          </div>
                          <span className={`text-[10px] font-semibold leading-tight ${
                            isCurrent ? 'text-[#821D24] font-bold' : isComplete ? 'text-[#2A1E17]' : 'text-[#9E8B7C]'
                          }`}>
                            {stage.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items in this order */}
                <div className="pt-2 border-t border-[#E8DFD1] space-y-2">
                  <span className="text-[11px] font-bold uppercase text-[#8C7665] block">
                    Sarees in This Order:
                  </span>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-xs">
                      <img
                        src={item.saree.images[0]}
                        alt={item.saree.name}
                        className="w-12 h-14 rounded-md object-cover border border-[#E8DFD1] shrink-0"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-[#2A1E17] block">{item.saree.name}</span>
                        <span className="text-[11px] text-[#7A6757]">
                          Qty: {item.quantity} • {item.fallAndPico ? 'Fall & Pico Added' : 'Standard'} • {item.blouseOption}
                        </span>
                      </div>
                      <span className="font-bold text-[#821D24]">
                        {formatPrice(item.unitPrice * item.quantity, currency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping info footer */}
                <div className="pt-2 border-t border-[#E8DFD1] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#7A6757]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#821D24]" />
                    Delivering to: {order.customer.fullName} • {order.customer.district || order.customer.city}, {order.customer.state} ({order.customer.pincode})
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-mono text-[#2A1E17]">
                      <Truck className="w-3.5 h-3.5 text-[#821D24]" />
                      AWB: {order.trackingNumber}
                    </span>
                    {onOpenTrackOrder && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenTrackOrder(order.id);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#821D24] hover:text-[#68141A] bg-[#FAF2E8] hover:bg-[#F3E7D5] px-2.5 py-1 rounded-md border border-[#DECFBE] transition-colors cursor-pointer"
                      >
                        <span>Full Tracking</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
