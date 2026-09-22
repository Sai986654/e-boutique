import { useState, type FormEvent } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  QrCode, 
  Lock, 
  Sparkles,
  ArrowRight,
  Database,
  MapPin
} from 'lucide-react';
import { CartItem, CustomerInfo, Order } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { AP_TELANGANA_DISTRICTS } from '../data/sareesData';
import { saveOrderToFirestore } from '../services/firestoreService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: string;
  discountAmount: number;
  promoCode: string;
  onOrderSuccess: (order: Order) => void;
  onOpenTrackOrder?: (orderId: string) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  items,
  currency,
  discountAmount,
  promoCode,
  onOrderSuccess,
  onOpenTrackOrder,
}: CheckoutModalProps) {
  if (!isOpen) return null;

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod' | 'netbanking'>('upi');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbSaved, setDbSaved] = useState(false);

  // Customer Form with AP / Telangana state & district selection
  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: '',
    email: '',
    phone: '',
    addressLine: '',
    city: '',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '',
    deliveryLandmark: '',
  });

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const rawSubtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingFee = rawSubtotal >= 10000 ? 0 : 500;
  const grandTotal = Math.max(0, rawSubtotal - discountAmount + shippingFee);

  const availableDistricts = AP_TELANGANA_DISTRICTS[customer.state] || [];

  const handleStateChange = (newState: 'Andhra Pradesh' | 'Telangana') => {
    const defaultDist = newState === 'Telangana' ? 'Hyderabad' : 'Visakhapatnam (Vizag)';
    setCustomer(prev => ({
      ...prev,
      state: newState,
      district: defaultDist,
    }));
  };

  const validateShipping = () => {
    const errs: Record<string, string> = {};
    if (!customer.fullName.trim()) errs.fullName = 'Full name is required';
    if (!customer.email.trim() || !customer.email.includes('@')) errs.email = 'Valid email is required';
    if (!customer.phone.trim() || customer.phone.replace(/\D/g, '').length < 10) {
      errs.phone = '10-digit mobile number required';
    }
    if (!customer.addressLine.trim()) errs.addressLine = 'Street address / Door No. required';
    if (!customer.city.trim()) errs.city = 'Town / City is required';
    if (!customer.pincode.trim() || customer.pincode.length < 6) {
      errs.pincode = 'Valid 6-digit Pincode required (e.g. 500001, 530001)';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToPayment = (e: FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep('payment');
    }
  };

  const handleCompleteOrder = async () => {
    setIsSubmitting(true);
    const orderId = `VIR-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNum = `APTG${Math.floor(10000000 + Math.random() * 90000000)}IN`;
    const today = new Date();
    const deliveryDate = new Date();
    // Fast delivery across AP & Telangana: 2 days
    deliveryDate.setDate(today.getDate() + 2);

    const newOrder: Order = {
      id: orderId,
      orderDate: today.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
      items: [...items],
      subtotal: rawSubtotal,
      discount: discountAmount,
      shipping: shippingFee,
      total: grandTotal,
      currency: currency,
      customer: { ...customer },
      paymentMethod: paymentMethod,
      status: 'Order Placed',
      estimatedDelivery: deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
      trackingNumber: trackingNum,
      source: 'online-store',
    };

    // Save directly to Firestore Cloud Database
    const firestoreResult = await saveOrderToFirestore(newOrder);
    setDbSaved(firestoreResult);

    setCreatedOrder(newOrder);
    onOrderSuccess(newOrder);
    setIsSubmitting(false);
    setStep('confirmation');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        id="checkout-modal-container"
        className="bg-[#FAF8F5] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E8DFD1] overflow-hidden relative max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8DFD1] bg-[#F4EFEA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#821D24]" />
            <div>
              <h2 className="font-serif-title text-xl font-bold text-[#2A1E17]">
                {step === 'confirmation' ? 'ఆర్డర్ విజయవంతమైంది! (Order Confirmed)' : 'AP & Telangana Express Checkout'}
              </h2>
              <span className="text-[11px] text-[#7A6757] block">
                Direct loom dispatch to all pin codes in Andhra Pradesh & Telangana
              </span>
            </div>
          </div>
          {step !== 'confirmation' && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 text-[#5C4B3E] transition-colors"
              aria-label="Close checkout"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Stepper Indicator */}
        {step !== 'confirmation' && (
          <div className="px-6 py-3 bg-[#FAF2E8] border-b border-[#EADFCF] flex items-center justify-center gap-4 text-xs font-semibold">
            <span className={`flex items-center gap-1.5 ${step === 'shipping' ? 'text-[#821D24]' : 'text-[#7A6757]'}`}>
              <span className="w-5 h-5 rounded-full bg-[#821D24] text-white flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Delivery Address (చిరునామా)</span>
            </span>
            <span className="text-[#D5C5B2]">•</span>
            <span className={`flex items-center gap-1.5 ${step === 'payment' ? 'text-[#821D24]' : 'text-[#7A6757]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'payment' ? 'bg-[#821D24] text-white' : 'bg-[#E5DCD0] text-[#7A6757]'
              }`}>
                2
              </span>
              <span>Payment & Cloud Sync</span>
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* STEP 1: SHIPPING FORM */}
          {step === 'shipping' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4 text-xs">
              {/* State Selection */}
              <div className="bg-[#FAF2E8] p-3 rounded-xl border border-[#E3D3BF]">
                <label className="block font-bold text-[#821D24] mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>Select Delivery State (రాష్ట్రం):</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Telangana', 'Andhra Pradesh'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStateChange(st)}
                      className={`py-2 px-3 rounded-lg font-bold text-xs transition-all border ${
                        customer.state === st
                          ? 'bg-[#821D24] text-white border-[#821D24] shadow-xs'
                          : 'bg-white text-[#4A3B32] border-[#D5C5B2] hover:bg-[#F3EDE3]'
                      }`}
                    >
                      {st} {st === 'Telangana' ? '(తెలంగాణ)' : '(ఆంధ్రప్రదేశ్)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Full Name (పూర్తి పేరు) *</label>
                  <input
                    type="text"
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    placeholder="e.g. Sai Krishna / Sravani Reddy"
                    className="w-full bg-white border border-[#D5C5B2] rounded-lg px-3 py-2 text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#821D24]"
                  />
                  {formErrors.fullName && <p className="text-[11px] text-red-600 mt-0.5">{formErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Mobile Number (ఫోన్ నెంబర్) *</label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="98480 12345 (10-digit mobile)"
                    className="w-full bg-white border border-[#D5C5B2] rounded-lg px-3 py-2 text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#821D24]"
                  />
                  {formErrors.phone && <p className="text-[11px] text-red-600 mt-0.5">{formErrors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4A3B32] mb-1">Email Address (ఆర్డర్ రశీదు & ట్రాకింగ్) *</label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="saikrishna@example.com"
                  className="w-full bg-white border border-[#D5C5B2] rounded-lg px-3 py-2 text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#821D24]"
                />
                {formErrors.email && <p className="text-[11px] text-red-600 mt-0.5">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block font-semibold text-[#4A3B32] mb-1">Door No., Flat / Building & Colony *</label>
                <input
                  type="text"
                  value={customer.addressLine}
                  onChange={(e) => setCustomer({ ...customer, addressLine: e.target.value })}
                  placeholder="e.g. Flat 302, Sri Nilayam, Jubilee Hills / Benz Circle"
                  className="w-full bg-white border border-[#D5C5B2] rounded-lg px-3 py-2 text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#821D24]"
                />
                {formErrors.addressLine && <p className="text-[11px] text-red-600 mt-0.5">{formErrors.addressLine}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">District (జిల్లా) *</label>
                  <select
                    value={customer.district}
                    onChange={(e) => setCustomer({ ...customer, district: e.target.value })}
                    className="w-full bg-white border border-[#D5C5B2] rounded-lg px-2.5 py-2 text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#821D24]"
                  >
                    {availableDistricts.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Town / City (నగరం/గ్రామం) *</label>
                  <input
                    type="text"
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    placeholder="Hyderabad / Vijayawada / Guntur"
                    className="w-full bg-white border border-[#D5C5B2] rounded-lg px-3 py-2 text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#821D24]"
                  />
                  {formErrors.city && <p className="text-[11px] text-red-600 mt-0.5">{formErrors.city}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Pincode (పిన్ కోడ్) *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={customer.pincode}
                    onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                    placeholder="e.g. 500033"
                    className="w-full bg-white border border-[#D5C5B2] rounded-lg px-3 py-2 text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#821D24]"
                  />
                  {formErrors.pincode && <p className="text-[11px] text-red-600 mt-0.5">{formErrors.pincode}</p>}
                </div>
              </div>

              {/* Order quick summary */}
              <div className="pt-3 border-t border-[#E8DFD1] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#7A6757]">Total Payable ({items.length} sarees):</span>
                  <span className="text-base font-bold text-[#821D24] ml-2">
                    {formatPrice(grandTotal, currency)}
                  </span>
                  <span className="text-[10px] text-emerald-700 block">Free Express Delivery Across AP & TG</span>
                </div>

                <button
                  type="submit"
                  id="checkout-proceed-btn"
                  className="bg-[#821D24] hover:bg-[#68141A] text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD & CLOUD SYNC */}
          {step === 'payment' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-[#2A1E17] text-sm mb-2">
                  Select Payment Method (చెల్లింపు విధానం):
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-[#821D24] bg-[#FAF1E8] font-bold text-[#821D24]'
                        : 'border-[#E0D5C7] bg-white text-[#4A3B32]'
                    }`}
                  >
                    <QrCode className="w-5 h-5 mx-auto mb-1 text-[#821D24]" />
                    <span>Instant UPI (PhonePe/GPay)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#821D24] bg-[#FAF1E8] font-bold text-[#821D24]'
                        : 'border-[#E0D5C7] bg-white text-[#4A3B32]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1 text-[#821D24]" />
                    <span>Cards (Debit/Credit)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'border-[#821D24] bg-[#FAF1E8] font-bold text-[#821D24]'
                        : 'border-[#E0D5C7] bg-white text-[#4A3B32]'
                    }`}
                  >
                    <Lock className="w-5 h-5 mx-auto mb-1 text-[#821D24]" />
                    <span>Net Banking (SBI/Andhra)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#821D24] bg-[#FAF1E8] font-bold text-[#821D24]'
                        : 'border-[#E0D5C7] bg-white text-[#4A3B32]'
                    }`}
                  >
                    <Truck className="w-5 h-5 mx-auto mb-1 text-[#821D24]" />
                    <span>Cash on Delivery</span>
                  </button>
                </div>
              </div>

              {/* Payment Details Container */}
              <div className="bg-white p-4 rounded-xl border border-[#E0D5C7]">
                {paymentMethod === 'upi' && (
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="p-3 bg-[#FAF8F5] border border-[#D5C5B2] rounded-xl shrink-0">
                      <div className="w-28 h-28 bg-[#2A1E17] p-2 rounded-lg flex items-center justify-center text-white text-[10px]">
                        <div className="grid grid-cols-3 gap-1 w-full h-full p-1 bg-white rounded">
                          <div className="bg-[#2A1E17] rounded-xs"></div>
                          <div className="bg-[#FAF8F5]"></div>
                          <div className="bg-[#2A1E17] rounded-xs"></div>
                          <div className="bg-[#FAF8F5]"></div>
                          <div className="bg-[#821D24] rounded-xs"></div>
                          <div className="bg-[#FAF8F5]"></div>
                          <div className="bg-[#2A1E17] rounded-xs"></div>
                          <div className="bg-[#FAF8F5]"></div>
                          <div className="bg-[#2A1E17] rounded-xs"></div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#2A1E17] block">
                        Scan QR with PhonePe, Google Pay, Paytm, or BHIM
                      </span>
                      <p className="text-[11px] text-[#7A6757]">
                        Or UPI ID: <strong className="text-[#821D24]">virasat.teluguhandlooms@okaxis</strong>
                      </p>
                      <span className="inline-block text-[10px] text-[#1B4938] bg-[#EAF2ED] px-2 py-0.5 rounded font-medium mt-1">
                        ✓ Secured by Firebase Firestore Cloud Database
                      </span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A3B32] mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="•••• •••• •••• 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#D5C5B2] rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#4A3B32] mb-1">Valid Thru</label>
                        <input
                          type="text"
                          placeholder="MM / YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#D5C5B2] rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#4A3B32] mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#D5C5B2] rounded-lg p-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <p className="text-xs text-[#5C4B3E]">
                    Supported across all banks in AP & Telangana: State Bank of India (SBI), Andhra Bank / Union Bank, HDFC, ICICI, Kotak, and Axis Bank.
                  </p>
                )}

                {paymentMethod === 'cod' && (
                  <p className="text-xs text-[#5C4B3E]">
                    Cash on delivery is supported for Hyderabad, Vijayawada, Vizag, Guntur, Warangal, and all AP & Telangana districts. Please keep exact cash or PhonePe QR ready upon delivery.
                  </p>
                )}
              </div>

              {/* Order Delivery Confirmation Recap */}
              <div className="p-3 bg-[#F4EFEA] rounded-xl space-y-1 text-xs text-[#5C4B3E]">
                <div className="flex justify-between">
                  <span>Shipping Region:</span>
                  <span className="font-semibold text-[#2A1E17] text-right">
                    {customer.district}, {customer.state} ({customer.pincode})
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#2A1E17] pt-1.5 border-t border-[#E0D5C7]">
                  <span>Total Payable:</span>
                  <span className="text-[#821D24]">{formatPrice(grandTotal, currency)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="text-xs font-semibold text-[#7A6757] hover:underline"
                >
                  ← Edit Address
                </button>

                <button
                  type="button"
                  id="checkout-complete-order-btn"
                  disabled={isSubmitting}
                  onClick={handleCompleteOrder}
                  className="bg-[#821D24] hover:bg-[#68141A] disabled:opacity-60 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  {isSubmitting ? (
                    <span>Syncing to Firestore...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#F5C767]" />
                      <span>Confirm & Place Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER CONFIRMED */}
          {step === 'confirmation' && createdOrder && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#EBF3ED] text-[#1B4938] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2A1E17]">
                  ధన్యవాదాలు! Order Confirmed
                </h3>
                <p className="text-xs text-[#7A6757] mt-1">
                  Your order has been recorded into the live Firestore database and dispatched to the master weavers.
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 bg-[#E8F6EE] text-[#1B4938] px-3 py-1 rounded-full text-xs font-semibold border border-[#C5E8D4]">
                  <Database className="w-3.5 h-3.5" />
                  <span>Firestore Document Saved: orders/{createdOrder.id}</span>
                </div>
              </div>

              {/* Order Receipt Card */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E0D5C7] text-left text-xs space-y-3 shadow-2xs max-w-lg mx-auto">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD1]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8C7665]">Order Number</span>
                    <span className="block font-mono font-bold text-sm text-[#821D24]">
                      {createdOrder.id}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#8C7665]">AP/TG Delivery ETA</span>
                    <span className="block font-bold text-sm text-[#1B4938]">
                      {createdOrder.estimatedDelivery} (2 Days)
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#8C7665] block">
                    Ordered Sarees ({createdOrder.items.length})
                  </span>
                  {createdOrder.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-xs text-[#2A1E17]">
                      <span>
                        {it.saree.name} x {it.quantity}
                      </span>
                      <span className="font-medium">{formatPrice(it.unitPrice * it.quantity, currency)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#E8DFD1] flex justify-between text-sm font-bold text-[#2A1E17]">
                  <span>Total Paid:</span>
                  <span className="text-[#821D24]">{formatPrice(createdOrder.total, currency)}</span>
                </div>

                <div className="text-[11px] text-[#7A6757] pt-1">
                  Destination: <strong>{createdOrder.customer.addressLine}, {createdOrder.customer.district}, {createdOrder.customer.state} ({createdOrder.customer.pincode})</strong>.
                  <br />
                  Tracking number: <span className="font-mono text-[#2A1E17] font-semibold">{createdOrder.trackingNumber}</span>.
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {onOpenTrackOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTrackOrder(createdOrder.id);
                    }}
                    className="inline-flex items-center gap-2 bg-[#FAF2E8] hover:bg-[#F3E7D5] text-[#821D24] border border-[#DECFBE] font-bold py-2.5 px-6 rounded-full text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track This Order Now</span>
                  </button>
                )}

                <button
                  id="checkout-close-success-btn"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 bg-[#821D24] hover:bg-[#68141A] text-white font-bold py-2.5 px-6 rounded-full text-xs shadow-md transition-colors cursor-pointer"
                >
                  <span>Continue Shopping Handlooms</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
