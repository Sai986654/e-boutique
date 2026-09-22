import { useState } from 'react';
import { X, BookOpen, Check, Sparkles, ArrowRight } from 'lucide-react';
import { DRAPING_STYLES } from '../data/sareesData';

interface DrapeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShopCategory: (category: string) => void;
}

export function DrapeGuideModal({ isOpen, onClose, onShopCategory }: DrapeGuideModalProps) {
  if (!isOpen) return null;

  const [activeDrapeIndex, setActiveDrapeIndex] = useState(0);
  const activeDrape = DRAPING_STYLES[activeDrapeIndex] || DRAPING_STYLES[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        id="drape-guide-modal-container"
        className="bg-[#FAF8F5] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#E8DFD1] overflow-hidden relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8DFD1] bg-[#F4EFEA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#821D24]" />
            <div>
              <h2 className="font-serif-title text-xl font-bold text-[#2A1E17]">
                Master Saree Draping Guide
              </h2>
              <span className="text-[11px] text-[#7A6757] block">
                Heritage folds, pleating secrets & modern silhouettes
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#5C4B3E] transition-colors cursor-pointer"
            aria-label="Close drape guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Style Selector Tabs */}
        <div className="px-6 py-3 bg-[#FAF2E8] border-b border-[#EADFCF] flex items-center gap-2 overflow-x-auto text-xs">
          {DRAPING_STYLES.map((style, idx) => (
            <button
              key={style.id}
              onClick={() => setActiveDrapeIndex(idx)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                activeDrapeIndex === idx
                  ? 'bg-[#821D24] text-white shadow-xs'
                  : 'bg-white text-[#56453A] border border-[#E0D5C7] hover:bg-[#FAF8F5]'
              }`}
            >
              {style.name}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E0D5C7] space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-[#821D24] font-bold mb-1">
                <span>{activeDrape.origin}</span>
                <span className="bg-[#FAF2E8] px-2.5 py-0.5 rounded-full text-[11px]">
                  {activeDrape.bestFor}
                </span>
              </div>

              <h3 className="font-serif-title text-2xl font-bold text-[#2A1E17]">
                {activeDrape.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4B3E] mt-1 leading-relaxed">
                {activeDrape.description}
              </p>
            </div>

            {/* Step by step */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]">
                Step-by-Step Pleating Instructions:
              </h4>

              <div className="space-y-2">
                {activeDrape.steps.map((stepText, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EBE3D8] text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#821D24] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {sIdx + 1}
                    </span>
                    <span className="text-[#3F332B] leading-relaxed flex-1">
                      {stepText}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tip Box */}
            <div className="p-3.5 rounded-xl bg-[#FAF2E8] border border-[#DECFBE] flex items-start gap-2.5 text-xs">
              <Sparkles className="w-4 h-4 text-[#C89933] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#821D24] block font-bold">Atelier Pro Stylist Tip:</strong>
                <span className="text-[#4E3F35] mt-0.5 block">{activeDrape.proTip}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8DFD1] bg-[#F7F3EC] flex items-center justify-between text-xs">
          <span className="text-[#7A6757]">
            Every saree from our boutique includes complimentary Fall & Pico finishing.
          </span>
          <button
            onClick={() => {
              onClose();
              onShopCategory('all');
            }}
            className="bg-[#821D24] hover:bg-[#68141A] text-white font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Shop Matching Sarees</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
