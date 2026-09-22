import { Sparkles, ShieldCheck, Scissors, Truck, ArrowRight, MapPin } from 'lucide-react';

interface HeroBannerProps {
  onShopCollection: () => void;
  onOpenStylist: () => void;
  onOpenDrapeGuide: () => void;
  onOpenTrackOrder?: () => void;
}

export function HeroBanner({ onShopCollection, onOpenStylist, onOpenDrapeGuide, onOpenTrackOrder }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden bg-[#241215] text-[#FAF8F5] border-b border-[#3B1F23]">
      {/* Background Decorative Pattern & Glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#C89933_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#821D24]/30 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3D1E23] border border-[#5C2E34] text-[#F3C56E] text-xs font-semibold tracking-wider uppercase shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-[#F3C56E]" />
              <span>Andhra Pradesh & Telangana Artisan Looms</span>
            </div>

            <h1 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#FAF5ED]">
              తెలుగు సంస్కృతి వైభవం. <span className="text-[#E5B556] italic font-normal block sm:inline">Pochampally, Gadwal & Uppada</span>.
            </h1>

            <p className="text-sm sm:text-base text-[#D4C3B5] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Direct handloom treasures from master weaver cooperatives in <strong>Pochampally, Jogulamba Gadwal, Uppada, Dharmavaram, Mangalagiri, and Narayanpet</strong>. Certified pure silk with live Firestore cloud database synchronization and 24-48h express delivery across all AP & Telangana districts.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                id="hero-shop-collection-btn"
                onClick={onShopCollection}
                className="inline-flex items-center gap-2 bg-[#FAF5ED] hover:bg-white text-[#241215] px-6 py-3 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Shop AP & TG Handlooms</span>
                <ArrowRight className="w-4 h-4 text-[#821D24]" />
              </button>

              <button
                id="hero-ai-stylist-btn"
                onClick={onOpenStylist}
                className="inline-flex items-center gap-2 bg-[#422026] hover:bg-[#532931] text-[#FAF5ED] border border-[#6B3740] px-5 py-3 rounded-full text-sm font-medium transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#F3C56E]" />
                <span>Vastra Telugu Stylist</span>
              </button>

              <button
                id="hero-drape-guide-btn"
                onClick={onOpenDrapeGuide}
                className="text-xs text-[#D4C3B5] hover:text-[#FAF5ED] underline underline-offset-4 font-medium px-2 py-2"
              >
                Nivi Drape Guide
              </button>
            </div>
          </div>

          {/* Right Featured Editorial Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#4D272E] bg-[#1E0D10] group">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
                  alt="Pochampally Double Ikkat Pure Silk"
                  className="w-full h-[380px] sm:h-[440px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating badge over image */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#241215]/90 backdrop-blur-md border border-[#522931] p-3.5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#F3C56E] font-bold block">
                      GI Tagged Masterpiece
                    </span>
                    <span className="font-serif-title text-base font-bold text-white block">
                      Pochampally Double Ikkat
                    </span>
                    <span className="text-[#C5B4A5] text-[11px]">
                      Yadadri Bhuvanagiri, Telangana • Pure Telia Zari
                    </span>
                  </div>
                  <button
                    onClick={onShopCollection}
                    className="bg-[#821D24] hover:bg-[#9B252E] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0"
                  >
                    Explore
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Value Propositions */}
        <div className="mt-12 pt-8 border-t border-[#442227] grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#3D1E23] text-[#F3C56E] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#FAF5ED]">Silk Mark & GI Tagged</h2>
              <p className="text-[11px] text-[#A69384] mt-0.5">100% Authentic Handloom Certification</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#3D1E23] text-[#F3C56E] shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#FAF5ED]">Free Fall & Pico</h2>
              <p className="text-[11px] text-[#A69384] mt-0.5">Telugu neckline custom blouse tailoring</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#3D1E23] text-[#F3C56E] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-semibold text-[#FAF5ED]">AP & TG Express Dispatch</h2>
                {onOpenTrackOrder && (
                  <button
                    onClick={onOpenTrackOrder}
                    className="text-[10px] text-[#F3C56E] hover:underline font-bold cursor-pointer"
                  >
                    Track
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#A69384] mt-0.5">Hyd, Vizag, Vijayawada in 24-48h</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#3D1E23] text-[#F3C56E] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#FAF5ED]">Direct Weaver Looms</h2>
              <p className="text-[11px] text-[#A69384] mt-0.5">Pochampally, Gadwal & Uppada Clusters</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
