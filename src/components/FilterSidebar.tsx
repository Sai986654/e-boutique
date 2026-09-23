import { RotateCcw, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { FabricType, OccasionType, WeaveType, ProductDepartment } from '../types';
import { formatPrice } from '../utils/formatCurrency';

interface FilterSidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  selectedDepartment?: ProductDepartment;
  onSelectDepartment?: (dept: ProductDepartment) => void;
  selectedFabrics: FabricType[];
  onToggleFabric: (fabric: FabricType) => void;
  selectedOccasions: OccasionType[];
  onToggleOccasion: (occasion: OccasionType) => void;
  selectedWeaves: WeaveType[];
  onToggleWeave: (weave: WeaveType) => void;
  silkMarkOnly: boolean;
  onToggleSilkMark: () => void;
  maxPrice: number;
  onMaxPriceChange: (val: number) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  currency: string;
}

export function FilterSidebar({
  isOpenMobile,
  onCloseMobile,
  selectedDepartment = 'all',
  onSelectDepartment,
  selectedFabrics,
  onToggleFabric,
  selectedOccasions,
  onToggleOccasion,
  selectedWeaves,
  onToggleWeave,
  silkMarkOnly,
  onToggleSilkMark,
  maxPrice,
  onMaxPriceChange,
  onResetFilters,
  activeFilterCount,
  currency,
}: FilterSidebarProps) {
  const fabrics: FabricType[] = [
    'One Gram Gold Ornaments',
    'Pochampally Ikkat',
    'Gadwal Silk',
    'Uppada Jamdani',
    'Dharmavaram Silk',
    'Mangalagiri Cotton Silk',
    'Narayanpet Handloom',
    'Venkatagiri Silk',
    'One Gram Gold Zari',
    'Kanjeevaram Silk',
    'Katan Silk',
    'Organza Silk',
    'Chanderi',
    'Tussar Silk',
    'Tissue Silk',
    'Georgette',
    'Linen Silk',
  ];

  const occasions: OccasionType[] = [
    'Bridal & Pelli',
    'Sreemantham & Seemantham',
    'Ugadi & Sankranti Festive',
    'Varalakshmi Vratam & Puja',
    'Reception & Cocktail',
    'Sangeet & Mehendi',
    'Office & Daily Grace',
  ];

  const weaves: WeaveType[] = [
    'Temple Nakshi Jewellery',
    'Guttapusalu Cluster Pearls',
    'Double Ikkat Weave',
    'Kuttu Contrast Border',
    'Jamdani Zari Weave',
    'Broad Temple Border',
    'Nizam Zari Border',
    'Kadwa Weave',
    'Korvai Border',
    'Zari Brocade',
    'Hand Painted Kalamkari',
    'Meenakari',
  ];

  const content = (
    <div className="space-y-6 text-xs">
      {/* Title & Clear */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD1]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#821D24]" />
          <h3 className="font-serif-title text-base font-bold text-[#2A1E17]">
            Filter Boutique
          </h3>
          {activeFilterCount > 0 && (
            <span className="bg-[#821D24] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#821D24] hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Department Selector */}
      {onSelectDepartment && (
        <div className="p-3 bg-white rounded-xl border border-[#E0D5C7] space-y-2">
          <span className="font-bold text-[#2A1E17] block">Department</span>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { id: 'all', label: 'All Items (అన్నీ)' },
              { id: 'sarees', label: '🥻 Handloom Sarees (చీరలు)' },
              { id: 'ornaments', label: '👑 1-Gram Gold Ornaments (ఆభరణాలు)' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelectDepartment(d.id as any)}
                className={`py-1.5 px-2.5 rounded-lg text-left font-semibold text-xs transition-all cursor-pointer ${
                  selectedDepartment === d.id
                    ? 'bg-[#821D24] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#4A3B32] hover:bg-[#F3ECE1]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Silk Mark Certified Toggle */}
      <div className="p-3 bg-white rounded-xl border border-[#E0D5C7]">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex flex-col">
            <span className="font-bold text-[#2A1E17]">Silk Mark Certified</span>
            <span className="text-[10px] text-[#7A6757]">100% Genuine Silk Organization</span>
          </div>
          <input
            type="checkbox"
            checked={silkMarkOnly}
            onChange={onToggleSilkMark}
            className="w-4 h-4 accent-[#821D24] rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Max Price Slider */}
      <div className="space-y-2">
        <div className="flex justify-between font-bold text-[#2A1E17]">
          <span>Max Budget</span>
          <span className="text-[#821D24]">{formatPrice(maxPrice, currency)}</span>
        </div>
        <input
          type="range"
          min={5000}
          max={60000}
          step={2500}
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
          className="w-full accent-[#821D24] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#8C7665]">
          <span>{formatPrice(5000, currency)}</span>
          <span>{formatPrice(60000, currency)}</span>
        </div>
      </div>

      {/* Occasion Filter */}
      <div className="space-y-2">
        <h4 className="font-bold uppercase tracking-wider text-[#2A1E17] text-[11px]">
          Occasion & Telugu Festivities
        </h4>
        <div className="space-y-1.5">
          {occasions.map((occ) => {
            const isChecked = selectedOccasions.includes(occ);
            return (
              <label
                key={occ}
                className="flex items-center gap-2 cursor-pointer text-[#4A3B32] hover:text-[#2A1E17]"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleOccasion(occ)}
                  className="w-3.5 h-3.5 accent-[#821D24] rounded"
                />
                <span>{occ}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Fabric Filter */}
      <div className="space-y-2 pt-2 border-t border-[#E8DFD1]">
        <h4 className="font-bold uppercase tracking-wider text-[#2A1E17] text-[11px]">
          Handloom Silk Fabric
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {fabrics.map((fab) => {
            const isChecked = selectedFabrics.includes(fab);
            return (
              <label
                key={fab}
                className="flex items-center gap-2 cursor-pointer text-[#4A3B32] hover:text-[#2A1E17]"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleFabric(fab)}
                  className="w-3.5 h-3.5 accent-[#821D24] rounded"
                />
                <span>{fab}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Weave Type */}
      <div className="space-y-2 pt-2 border-t border-[#E8DFD1]">
        <h4 className="font-bold uppercase tracking-wider text-[#2A1E17] text-[11px]">
          Artisan Weaving Craft
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {weaves.map((w) => {
            const isChecked = selectedWeaves.includes(w);
            return (
              <label
                key={w}
                className="flex items-center gap-2 cursor-pointer text-[#4A3B32] hover:text-[#2A1E17]"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleWeave(w)}
                  className="w-3.5 h-3.5 accent-[#821D24] rounded"
                />
                <span>{w}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 pr-6">
        <div className="sticky top-28 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DFD1]">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 lg:hidden flex justify-start animate-fadeIn">
          <div 
            className="w-4/5 max-w-xs bg-[#FAF8F5] h-full shadow-2xl p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-serif-title font-bold text-lg text-[#2A1E17]">Filters</span>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-full text-[#7A6757] hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
            <div className="mt-6 pt-4 border-t border-[#E8DFD1]">
              <button
                onClick={onCloseMobile}
                className="w-full bg-[#821D24] text-white py-2.5 rounded-xl font-bold text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
