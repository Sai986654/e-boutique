interface CategoryItem {
  id: string;
  name: string;
  teluguName?: string;
  count: string;
  image: string;
  desc: string;
}

interface CategoryPillsProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export function CategoryPills({ activeCategory, onSelectCategory }: CategoryPillsProps) {
  const collections: CategoryItem[] = [
    {
      id: 'all',
      name: 'All Telugu Weaves',
      teluguName: 'అన్ని చీరలు',
      count: 'Master AP & TG',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
      desc: 'All regional heirlooms'
    },
    {
      id: 'pochampally',
      name: 'Pochampally Ikkat',
      teluguName: 'పోచంపల్లి ఇక్కత్',
      count: 'Telangana GI Craft',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
      desc: 'Geometric double tie & dye'
    },
    {
      id: 'gadwal',
      name: 'Gadwal Pattu',
      teluguName: 'గద్వాల పట్టు',
      count: 'Kuttu Contrast Border',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80',
      desc: 'Pure cotton-silk interlocking'
    },
    {
      id: 'uppada',
      name: 'Uppada Jamdani',
      teluguName: 'ఉప్పాడ జామ్‌దాని',
      count: 'Kakinada Loom',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=400&q=80',
      desc: 'Featherlight non-mechanical zari'
    },
    {
      id: 'dharmavaram',
      name: 'Dharmavaram Pattu',
      teluguName: 'ధర్మవరం పట్టు',
      count: 'Anantapur Brocade',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
      desc: 'Heavy bridal temple zari'
    },
    {
      id: 'mangalagiri',
      name: 'Mangalagiri & Narayanpet',
      teluguName: 'మంగళగిరి & నారాయణపేట',
      count: 'Nizam Border',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
      desc: 'Crisp handspun daily & festive'
    },
    {
      id: 'bridal',
      name: 'Telugu Pelli Pattu',
      teluguName: 'పెళ్లి పట్టు చీరలు',
      count: 'Auspicious Red & Gold',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80',
      desc: 'Wedding muhurtham silks'
    },
    {
      id: 'one-gram-gold',
      name: '1-Gram Gold Ornaments',
      teluguName: 'ఒక గ్రాము ఆభరణాలు',
      count: 'Temple Jewellery & Sets',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
      desc: '24K micro gold kasu malas, vaddanams & jhumkas'
    },
  ];

  return (
    <section className="py-8 border-b border-[#EAE2D5] bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#2A1E17]">
              Andhra & Telangana Loom Clusters
            </h2>
            <p className="text-xs text-[#7A6757] mt-0.5">
              Direct artisan-woven treasures from Godavari, Yadadri, Jogulamba & Rayalaseema
            </p>
          </div>
          {activeCategory !== 'all' && (
            <button
              onClick={() => onSelectCategory('all')}
              className="text-xs font-semibold text-[#821D24] hover:underline cursor-pointer"
            >
              Reset to All
            </button>
          )}
        </div>

        {/* Horizontal scrollable category cards */}
        <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none">
          {collections.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`pill-cat-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`group flex items-center gap-3 p-2 pr-4 rounded-xl border transition-all shrink-0 cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#821D24] border-[#821D24] text-white shadow-sm'
                    : 'bg-white border-[#E5DCD0] hover:border-[#821D24]/40 text-[#2E241E] hover:bg-[#FDFBF7]'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-12 h-12 rounded-lg object-cover border border-black/10 shrink-0 group-hover:scale-105 transition-transform"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-[#2E241E]'}`}>
                      {cat.name}
                    </h3>
                  </div>
                  {cat.teluguName && (
                    <span className={`text-[10px] block ${isActive ? 'text-[#F3C56E]' : 'text-[#821D24]'}`}>
                      {cat.teluguName}
                    </span>
                  )}
                  <span className={`text-[10px] block mt-0.5 ${isActive ? 'text-[#F5E2D2]' : 'text-[#8C7665]'}`}>
                    {cat.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
