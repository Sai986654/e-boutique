import { useState, type FormEvent } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Scissors, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  Heart,
  Shield,
  Share2
} from 'lucide-react';
import { FAQS } from '../data/sareesData';

interface FooterProps {
  onOpenStylist: () => void;
  onOpenDrapeGuide: () => void;
  onOpenOrders: () => void;
  onOpenTrackOrder?: () => void;
  onSelectCategory: (cat: string) => void;
  onOpenAdmin?: () => void;
  onOpenShare?: () => void;
}

export function Footer({
  onOpenStylist,
  onOpenDrapeGuide,
  onOpenOrders,
  onOpenTrackOrder,
  onSelectCategory,
  onOpenAdmin,
  onOpenShare,
}: FooterProps) {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (emailInput.trim() && emailInput.includes('@')) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-[#1C0E11] text-[#FAF5ED] border-t border-[#381B20]">
      {/* FAQ Accordion Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-[#36191E]">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[10px] uppercase tracking-widest text-[#F3C56E] font-bold">
            Customer Guidance & FAQs
          </span>
          <h2 className="font-serif-title text-2xl sm:text-3xl font-bold mt-1 text-[#FAF5ED]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[#BFAEA0] mt-2">
            Silk Mark verification, blouse measurements, fall & pico, and regional 24–48h express delivery across AP & Telangana.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="border border-[#381E23] rounded-xl overflow-hidden bg-[#241317] transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between text-xs sm:text-sm font-medium text-[#FAF5ED] hover:text-[#F3C56E] transition-colors"
                >
                  <span className="font-semibold pr-4">{faq.q}</span>
                  <span className="text-[#F3C56E] font-mono text-base shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-[#C5B4A5] leading-relaxed border-t border-[#381E23]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D13D47] inline-block"></span>
              <span className="font-serif-title text-2xl font-bold tracking-wider text-[#FAF5ED]">
                VIRASAT
              </span>
              <span className="text-[10px] bg-[#3B191F] text-[#F3C56E] font-bold px-2 py-0.5 rounded border border-[#52252C]">
                AP & TG
              </span>
            </div>
            <p className="text-xs text-[#BFAEA0] leading-relaxed">
              Celebrating the weaver heritage of Andhra Pradesh and Telangana. Connecting lovers of authentic handloom directly with master weavers of Pochampally, Gadwal, Uppada, and Dharmavaram with verified Silk Mark authenticity.
            </p>
            <div className="space-y-1.5 pt-2 text-xs text-[#C5B4A5]">
              <p className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#F3C56E]" />
                <span>24–48h Express Shipping across all AP & TG districts</span>
              </p>
              <p className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#F3C56E]" />
                <span>Complimentary Fall & Pico edge finish on every saree</span>
              </p>
              <p className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#F3C56E]" />
                <span>Hassle-free 7-day regional return and exchange policy</span>
              </p>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="lg:col-span-2 space-y-3 text-xs">
            <h3 className="font-serif-title font-bold text-sm tracking-wider uppercase text-[#F3C56E]">
              Regional Weaves
            </h3>
            <ul className="space-y-2 text-[#C5B4A5]">
              <li>
                <button onClick={() => onSelectCategory('pochampally')} className="hover:text-[#FAF5ED] transition-colors cursor-pointer">
                  Pochampally Ikkat (TG)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('gadwal')} className="hover:text-[#FAF5ED] transition-colors cursor-pointer">
                  Gadwal Pattu (TG)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('uppada')} className="hover:text-[#FAF5ED] transition-colors cursor-pointer">
                  Uppada Jamdani (AP)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('dharmavaram')} className="hover:text-[#FAF5ED] transition-colors cursor-pointer">
                  Dharmavaram Pattu (AP)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('mangalagiri')} className="hover:text-[#FAF5ED] transition-colors cursor-pointer">
                  Mangalagiri & Narayanpet
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('bridal')} className="hover:text-[#FAF5ED] transition-colors cursor-pointer">
                  Telugu Pelli Bridal Sarees
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <h3 className="font-serif-title font-bold text-sm tracking-wider uppercase text-[#F3C56E]">
              Concierge & Services
            </h3>
            <ul className="space-y-2 text-[#C5B4A5]">
              <li>
                <button onClick={onOpenStylist} className="hover:text-[#FAF5ED] transition-colors flex items-center gap-1.5 cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5 text-[#F3C56E]" />
                  <span>Vastra AI Saree Stylist</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenDrapeGuide} className="hover:text-[#FAF5ED] transition-colors cursor-pointer">
                  Telugu Nivi Draping Tutorials
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenTrackOrder || onOpenOrders} 
                  className="hover:text-[#F3C56E] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5 text-[#F3C56E]" />
                  <span>Track Your Regional Delivery (Order ID)</span>
                </button>
              </li>
              {onOpenShare && (
                <li>
                  <button 
                    onClick={onOpenShare} 
                    className="hover:text-[#F3C56E] text-rose-200 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#F3C56E]" />
                    <span>Share Boutique App (WhatsApp, QR)</span>
                  </button>
                </li>
              )}
              {onOpenAdmin && (
                <li>
                  <button 
                    onClick={onOpenAdmin} 
                    className="hover:text-[#F3C56E] text-amber-200/90 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#F3C56E]" />
                    <span>Store Admin & Feature Studio</span>
                  </button>
                </li>
              )}
              <li>
                <span className="text-[#8C7665]">Free Fall & Pico Service Included</span>
              </li>
              <li>
                <span className="text-[#8C7665]">Custom Blouse Stitching in Hyderabad</span>
              </li>
            </ul>
          </div>

          {/* Boutique Contact */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <h3 className="font-serif-title font-bold text-sm tracking-wider uppercase text-[#F3C56E]">
              Boutique Studio
            </h3>
            <div className="space-y-2 text-[#C5B4A5]">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F3C56E] shrink-0 mt-0.5" />
                <span>Heritage Flagship: Jubilee Hills Road No. 36, Hyderabad, Telangana & Dwaraka Nagar, Visakhapatnam, AP</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F3C56E] shrink-0" />
                <span>WhatsApp Saree Concierge: +91 98480 22338</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F3C56E] shrink-0" />
                <span>support@virasatsarees.com</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-[#36191E] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8C7665] gap-3">
          <p>© 2026 Virasat Telugu Saree Boutique & Online Store. Weaver-Direct AP & Telangana Handlooms.</p>
          <div className="flex items-center gap-4 text-[#A69384]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F3C56E]" />
              Silk Mark Authorized
            </span>
            <span>•</span>
            <span>All 59 Districts Express Delivery</span>
            <span>•</span>
            <span>7-Day Easy Exchange</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
