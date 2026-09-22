import { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Send, 
  Check, 
  Lightbulb, 
  ShoppingBag,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Saree } from '../types';
import { SAREES_DATA } from '../data/sareesData';
import { formatPrice } from '../utils/formatCurrency';

interface AISareeStylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  onSelectSaree: (saree: Saree) => void;
  onQuickAdd: (saree: Saree) => void;
}

export function AISareeStylistModal({
  isOpen,
  onClose,
  currency,
  onSelectSaree,
  onQuickAdd,
}: AISareeStylistModalProps) {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'guided' | 'chat'>('guided');
  
  // Guided criteria
  const [occasion, setOccasion] = useState('Wedding / Reception');
  const [timeOfDay, setTimeOfDay] = useState('Evening Banquet');
  const [vibe, setVibe] = useState('Royal Heritage');
  const [palette, setPalette] = useState('Crimson & Gold');
  const [userPrompt, setUserPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  // Recommendations result
  const [recommendationResult, setRecommendationResult] = useState<{
    headline: string;
    advice: string;
    stylingTip: string;
    jewelryTip: string;
    drapeTip: string;
    recommendedSarees: Saree[];
  } | null>(null);

  const handleGenerateAdvice = (customPromptText?: string) => {
    setLoading(true);

    setTimeout(() => {
      let filtered: Saree[] = [];
      let adviceText = '';
      let jewelry = '';
      let drape = '';

      const query = (customPromptText || `${occasion} ${timeOfDay} ${vibe} ${palette}`).toLowerCase();

      if (query.includes('organza') || query.includes('lightweight') || query.includes('pastel') || query.includes('cocktail') || query.includes('reception')) {
        filtered = SAREES_DATA.filter((s) => s.fabric === 'Organza Silk' || s.fabric === 'Tissue Silk' || s.occasion === 'Reception & Cocktail');
        adviceText = 'For a modern evening reception, sheer organzas or liquid tissue silks reflect chandelier light mesmerizingly without feeling heavy.';
        jewelry = 'Pair with uncut diamond Polki earrings, soft pearl chokers, or contemporary solitaires.';
        drape = 'Modern Belted drape with delicate floating shoulder pleats.';
      } else if (query.includes('wedding') || query.includes('bridal') || query.includes('pelli') || query.includes('royal') || query.includes('heavy') || query.includes('kanjivaram') || query.includes('red') || query.includes('crimson')) {
        filtered = SAREES_DATA.filter((s) => s.occasion === 'Bridal & Pelli' || s.fabric === 'Kanjeevaram Silk' || s.fabric === 'Gadwal Silk' || s.fabric === 'Dharmavaram Silk');
        adviceText = 'For an auspicious Telugu wedding or Pelli, nothing commands reverence like pure Gadwal Kuttu contrast silk or Dharmavaram heavy zari brocade with temple motifs.';
        jewelry = 'Traditional 22K Temple jewelry with antique Lakshmi motifs and mango harams.';
        drape = 'Classic Nivi drape with razor-sharp 5-inch pleats and an expansive aanchal pinned on the left shoulder.';
      } else if (query.includes('haldi') || query.includes('mehendi') || query.includes('sangeet') || query.includes('yellow') || query.includes('green')) {
        filtered = SAREES_DATA.filter((s) => s.occasion === 'Sangeet & Mehendi' || s.fabric === 'Tussar Silk' || s.fabric === 'Georgette');
        adviceText = 'Vibrant botanical shades like Marigold Yellow Tussar or Sage Khaddi Georgette allow fluid dance movement while radiating auspicious warmth.';
        jewelry = 'Floral jewelry with pearls or oxidized silver accents.';
        drape = 'Seedha Pallu (front drape) or pleated pallu fastened with a jeweled waistbelt.';
      } else {
        filtered = SAREES_DATA.slice(0, 3);
        adviceText = 'A harmonious balance of artisanal handloom silk and timeless zari detailing tailored to your preference.';
        jewelry = 'Jhumkas with delicate emerald drops.';
        drape = 'Effortless classic Nivi drape with neat accordion folds.';
      }

      if (filtered.length === 0) {
        filtered = SAREES_DATA.slice(0, 3);
      }

      setRecommendationResult({
        headline: `Curated for ${occasion} (${timeOfDay})`,
        advice: adviceText,
        stylingTip: `Opt for a custom sweetheart or deep round neckline blouse to complement the ${filtered[0]?.weave || 'heritage weave'}.`,
        jewelryTip: jewelry,
        drapeTip: drape,
        recommendedSarees: filtered.slice(0, 3),
      });

      setLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        id="ai-stylist-modal-container"
        className="bg-[#FAF8F5] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#E8DFD1] overflow-hidden relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8DFD1] bg-[#241215] text-[#FAF5ED] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#3D1E23] text-[#F3C56E]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-title text-xl font-bold">
                Vastra AI • Personal Saree Stylist
              </h2>
              <span className="text-[11px] text-[#D4C3B5] block">
                Intelligent weave, silhouette & jewelry advisor
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#FAF5ED] transition-colors cursor-pointer"
            aria-label="Close stylist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="px-6 py-3 bg-[#FAF2E8] border-b border-[#EADFCF] flex items-center justify-between text-xs">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('guided')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                mode === 'guided'
                  ? 'bg-[#821D24] text-white shadow-xs'
                  : 'bg-white text-[#5C4B3E] border border-[#E0D5C7]'
              }`}
            >
              Guided Occasion Finder
            </button>
            <button
              onClick={() => setMode('chat')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                mode === 'chat'
                  ? 'bg-[#821D24] text-white shadow-xs'
                  : 'bg-white text-[#5C4B3E] border border-[#E0D5C7]'
              }`}
            >
              Ask Stylist Prompt
            </button>
          </div>
          <span className="text-[11px] text-[#8C7665] hidden sm:inline">
            Matches verified real handloom catalog
          </span>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* GUIDED FINDER INPUTS */}
          {mode === 'guided' && (
            <div className="space-y-4 text-xs bg-white p-4 sm:p-5 rounded-xl border border-[#E0D5C7]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#4A3B32] mb-1.5">
                    1. Celebration / Event
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#D5C5B2] rounded-lg p-2 text-xs text-[#2A1E17]"
                  >
                    <option value="Wedding / Reception">Wedding & Pheras</option>
                    <option value="Sister or Best Friend's Wedding">Sister or Best Friend&apos;s Wedding</option>
                    <option value="Sangeet & Cocktail Night">Sangeet & Cocktail Night</option>
                    <option value="Haldi / Mehendi Ceremony">Haldi / Mehendi Ceremony</option>
                    <option value="Diwali / Durga Puja Festivity">Diwali / Durga Puja Festivity</option>
                    <option value="Farewell or High-Profile Dinner">Farewell or High-Profile Dinner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#4A3B32] mb-1.5">
                    2. Time & Setting
                  </label>
                  <select
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#D5C5B2] rounded-lg p-2 text-xs text-[#2A1E17]"
                  >
                    <option value="Evening Chandelier Banquet">Evening Banquet (Warm Chandelier Light)</option>
                    <option value="Morning Sunlit Mandap">Morning Sunlit Mandap / Temple</option>
                    <option value="Afternoon Garden Soirée">Afternoon Garden Soirée</option>
                    <option value="Late Night Cocktail Lounge">Late Night Cocktail Lounge</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#4A3B32] mb-1.5">
                    3. Desired Drape Vibe
                  </label>
                  <select
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#D5C5B2] rounded-lg p-2 text-xs text-[#2A1E17]"
                  >
                    <option value="Royal Heritage">Royal Heritage & Pure Zari Brocade</option>
                    <option value="Lightweight Floating Grace">Featherweight & Floating (Organza / Georgette)</option>
                    <option value="Contemporary Metallic Glow">Contemporary Metallic Sheen (Tissue Silk)</option>
                    <option value="Understated Artisanal Chic">Understated Artisanal Chic (Chanderi / Tussar)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#4A3B32] mb-1.5">
                    4. Color Palette Tone
                  </label>
                  <select
                    value={palette}
                    onChange={(e) => setPalette(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#D5C5B2] rounded-lg p-2 text-xs text-[#2A1E17]"
                  >
                    <option value="Crimson & Gold">Auspicious Crimson, Vermilion & Rani Pink</option>
                    <option value="Pastel Lavender & Blush">Modern Pastel Lavender, Blush & Mint</option>
                    <option value="Marigold & Emerald">Vibrant Marigold Yellow & Emerald Green</option>
                    <option value="Royal Cobalt & Midnight">Regal Cobalt Blue & Midnight Gold</option>
                    <option value="Ivory & Champagne">Ethereal Ivory, Champagne & Gold</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  id="ai-generate-advice-btn"
                  type="button"
                  onClick={() => handleGenerateAdvice()}
                  disabled={loading}
                  className="bg-[#821D24] hover:bg-[#68141A] text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-[#F5C767]" />
                  )}
                  <span>{loading ? 'Consulting Weave Database...' : 'Get Bespoke Saree Styling'}</span>
                </button>
              </div>
            </div>
          )}

          {/* CHAT / NATURAL LANGUAGE INPUT */}
          {mode === 'chat' && (
            <div className="space-y-3 text-xs bg-white p-4 sm:p-5 rounded-xl border border-[#E0D5C7]">
              <label className="block font-bold text-[#4A3B32]">
                Describe your dream look in plain words:
              </label>
              <div className="relative">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="e.g., I need a breathable pastel saree under ₹25,000 for my sister's morning wedding that looks royal without weighing me down..."
                  rows={3}
                  className="w-full bg-[#FAF8F5] border border-[#D5C5B2] rounded-xl p-3 text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#821D24]"
                />
              </div>

              {/* Sample Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-[#7A6757] font-semibold py-0.5">Quick styles:</span>
                {[
                  'Bridal Red Kanjivaram',
                  'Pastel Lavender Cocktail Organza',
                  'Lightweight Haldi Yellow Tussar',
                  'Modern Rose Gold Tissue Silk',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setUserPrompt(tag);
                      handleGenerateAdvice(tag);
                    }}
                    className="text-[11px] bg-[#FAF2E8] hover:bg-[#821D24] text-[#821D24] hover:text-white px-2.5 py-1 rounded-full border border-[#E5DCD0] transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleGenerateAdvice(userPrompt)}
                  disabled={loading || !userPrompt.trim()}
                  className="bg-[#821D24] hover:bg-[#68141A] text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask Stylist</span>
                </button>
              </div>
            </div>
          )}

          {/* AI ADVICE & RECOMMENDATION CARDS */}
          {recommendationResult && (
            <div className="space-y-4 animate-fadeIn">
              {/* Advice Box */}
              <div className="bg-[#FAF2E8] p-4 sm:p-5 rounded-2xl border border-[#DECFBE] space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[#821D24]" />
                  <h3 className="font-serif-title text-lg font-bold text-[#2A1E17]">
                    {recommendationResult.headline}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-[#4A3B32] leading-relaxed">
                  {recommendationResult.advice}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-[#E5DCD0]">
                  <div className="bg-white/80 p-2.5 rounded-lg border border-[#E8DFD1]">
                    <span className="text-[10px] uppercase font-bold text-[#821D24] block">Blouse Pairing</span>
                    <span className="text-[#3E3128] mt-0.5 block">{recommendationResult.stylingTip}</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-lg border border-[#E8DFD1]">
                    <span className="text-[10px] uppercase font-bold text-[#821D24] block">Jewelry Harmony</span>
                    <span className="text-[#3E3128] mt-0.5 block">{recommendationResult.jewelryTip}</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-lg border border-[#E8DFD1]">
                    <span className="text-[10px] uppercase font-bold text-[#821D24] block">Signature Drape</span>
                    <span className="text-[#3E3128] mt-0.5 block">{recommendationResult.drapeTip}</span>
                  </div>
                </div>
              </div>

              {/* Matched Saree Cards */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#2A1E17] mb-3">
                  Top Recommended Weaves From Our Atelier:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {recommendationResult.recommendedSarees.map((saree) => (
                    <div
                      key={saree.id}
                      className="bg-white rounded-xl border border-[#E0D5C7] overflow-hidden shadow-2xs flex flex-col justify-between"
                    >
                      <div className="relative aspect-3/4 overflow-hidden bg-[#F3EFE9]">
                        <img
                          src={saree.images[0]}
                          alt={saree.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {saree.fabric}
                        </span>
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <h5 className="font-bold text-xs text-[#2A1E17] line-clamp-1">
                            {saree.name}
                          </h5>
                          <span className="text-[11px] font-bold text-[#821D24] block mt-0.5">
                            {formatPrice(saree.price, currency)}
                          </span>
                        </div>

                        <div className="flex gap-1.5 pt-1">
                          <button
                            onClick={() => {
                              onSelectSaree(saree);
                              onClose();
                            }}
                            className="flex-1 bg-[#FAF3EA] hover:bg-[#821D24] text-[#821D24] hover:text-white border border-[#DECFBE] text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </button>

                          <button
                            onClick={() => {
                              onQuickAdd(saree);
                              onClose();
                            }}
                            className="flex-1 bg-[#821D24] hover:bg-[#68141A] text-white text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
