import { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Eye, 
  Check, 
  X, 
  Image as ImageIcon,
  Tag,
  Star,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { SareeCollection, Saree, CollectionCategory } from '../types';
import { 
  upsertCollectionInFirestore, 
  deleteCollectionFromFirestore 
} from '../services/firestoreService';

interface CollectionManagerProps {
  collections: SareeCollection[];
  sarees: Saree[];
  onViewSareesInCollection: (collection: SareeCollection) => void;
  onToast: (msg: string) => void;
}

export function CollectionManager({
  collections,
  sarees,
  onViewSareesInCollection,
  onToast,
}: CollectionManagerProps) {
  const [categoryFilter, setCategoryFilter] = useState<'all' | CollectionCategory>('all');
  const [editingCollection, setEditingCollection] = useState<SareeCollection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Quick cover image presets for Telugu handlooms
  const COVER_PRESETS = [
    { label: 'Pochampally Ikkat', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Gadwal Pattu Zari', url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Uppada Jamdani Light', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Dharmavaram Bridal', url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Mangalagiri Nizam', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Varalakshmi Festive', url: 'https://images.unsplash.com/photo-1610030469668-93510cb077fa?auto=format&fit=crop&w=1000&q=80' },
  ];

  const ACCENT_COLORS = [
    { name: 'Royal Crimson', hex: '#821D24' },
    { name: 'Temple Emerald', hex: '#1B4D3E' },
    { name: 'Golden Amber', hex: '#D97706' },
    { name: 'Deep Telugu Rust', hex: '#7C2D12' },
    { name: 'Nizam Forest Green', hex: '#047857' },
    { name: 'Festive Marigold', hex: '#B45309' },
  ];

  const filteredCollections = categoryFilter === 'all'
    ? collections
    : collections.filter((c) => c.category === categoryFilter);

  const getSareeCount = (col: SareeCollection) => {
    return sarees.filter((s) => {
      if (s.collectionIds && s.collectionIds.includes(col.id)) return true;
      if (col.filterTag && (s.fabric === col.filterTag || s.occasion === col.filterTag)) return true;
      return false;
    }).length;
  };

  const handleOpenAdd = () => {
    const newCol: SareeCollection = {
      id: `col-${Date.now().toString().slice(-5)}`,
      name: '',
      teluguName: '',
      slug: `collection-${Date.now().toString().slice(-4)}`,
      description: '',
      coverImage: COVER_PRESETS[0].url,
      featured: true,
      category: 'weave',
      filterTag: '',
      bannerTagline: 'Handwoven Telugu Artisan Collection',
      accentColor: '#821D24',
    };
    setEditingCollection(newCol);
    setIsModalOpen(true);
  };

  const handleEdit = (col: SareeCollection) => {
    setEditingCollection({ ...col });
    setIsModalOpen(true);
  };

  const handleDelete = async (col: SareeCollection) => {
    if (!window.confirm(`Are you sure you want to delete the collection "${col.name}"?`)) {
      return;
    }
    const ok = await deleteCollectionFromFirestore(col.id);
    if (ok) {
      onToast(`Deleted collection "${col.name}" successfully.`);
    } else {
      alert('Failed to delete collection from Firestore.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection || !editingCollection.name.trim()) return;

    setIsSaving(true);
    const ok = await upsertCollectionInFirestore(editingCollection);
    setIsSaving(false);

    if (ok) {
      onToast(`Saved collection "${editingCollection.name}" to live database!`);
      setIsModalOpen(false);
      setEditingCollection(null);
    } else {
      alert('Could not save collection. Please check connection.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8DFD1]">
        <div>
          <h3 className="font-serif-title text-xl font-bold text-[#2A1E17] flex items-center gap-2">
            <span>Saree Collections & Curations</span>
            <span className="text-xs bg-[#821D24] text-white px-2.5 py-0.5 rounded-full font-sans font-bold">
              {collections.length} Total
            </span>
          </h3>
          <p className="text-xs text-[#7A6757] mt-0.5">
            Organize sarees into thematic showcases like Pochampally Ikkat, Gadwal Pattu, and Wedding collections.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#821D24] hover:bg-[#68141A] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Collection</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[#7A6757] font-bold text-[11px] uppercase tracking-wider shrink-0 mr-1">
          Filter:
        </span>
        {[
          { id: 'all', label: 'All Collections' },
          { id: 'weave', label: 'Weave Masterpieces' },
          { id: 'occasion', label: 'Wedding & Festivals' },
          { id: 'curated', label: 'Curated Selections' },
          { id: 'region', label: 'Regional Clusters' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategoryFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              categoryFilter === tab.id
                ? 'bg-[#821D24] text-white shadow-xs'
                : 'bg-white border border-[#E3D3BE] text-[#4A3B32] hover:bg-[#FAF6F0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCollections.map((col) => {
          const sareeCount = getSareeCount(col);

          return (
            <div
              key={col.id}
              className="bg-white rounded-2xl border border-[#E8DFD1] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Cover Image Header */}
                <div className="relative aspect-16/9 bg-[#241215] overflow-hidden">
                  <img
                    src={col.coverImage}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span 
                      className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs"
                      style={{ backgroundColor: col.accentColor || '#821D24' }}
                    >
                      {col.category}
                    </span>

                    {col.featured && (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-[#F5C767] text-[#241215] px-2 py-0.5 rounded-full shadow-xs">
                        <Star className="w-3 h-3 fill-[#241215]" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  {/* Title on cover */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="font-serif-title text-base font-bold leading-tight">
                      {col.name}
                    </h4>
                    {col.teluguName && (
                      <p className="text-[11px] text-[#F5C767] font-medium mt-0.5">
                        {col.teluguName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-3">
                  {col.bannerTagline && (
                    <div className="text-[11px] font-bold text-[#821D24] uppercase tracking-wider">
                      {col.bannerTagline}
                    </div>
                  )}

                  <p className="text-xs text-[#5C4B3E] line-clamp-2 leading-relaxed">
                    {col.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F0E6D8] text-[11px]">
                    <span className="text-[#7A6757] flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#821D24]" />
                      <strong>{sareeCount}</strong> Sarees in Collection
                    </span>

                    {col.filterTag && (
                      <span className="bg-[#FAF2E8] text-[#821D24] px-2 py-0.5 rounded-md font-mono text-[10px] border border-[#DECFBE]">
                        Tag: {col.filterTag}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-3 bg-[#FAF8F5] border-t border-[#E8DFD1] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onViewSareesInCollection(col)}
                  className="px-3 py-1.5 bg-white hover:bg-[#FAF2E8] text-[#821D24] border border-[#D5C5B2] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Products ({sareeCount})</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleEdit(col)}
                    className="p-1.5 bg-white hover:bg-[#FAF2E8] text-[#4A3B32] hover:text-[#821D24] border border-[#D5C5B2] rounded-xl cursor-pointer transition-colors"
                    title="Edit Collection"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(col)}
                    className="p-1.5 bg-white hover:bg-rose-50 text-[#7A6757] hover:text-rose-700 border border-[#D5C5B2] rounded-xl cursor-pointer transition-colors"
                    title="Delete Collection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT COLLECTION MODAL */}
      {isModalOpen && editingCollection && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E8DFD1] overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 bg-[#241215] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif-title text-lg font-bold">
                  {editingCollection.name ? `Edit Collection: ${editingCollection.name}` : 'Create New Saree Collection'}
                </h3>
                <p className="text-xs text-[#E5DCD0]">
                  Configure collection branding, cover banner, and catalog tag filters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#2A1E17] block mb-1">
                    Collection Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCollection.name}
                    onChange={(e) => setEditingCollection({ ...editingCollection, name: e.target.value })}
                    placeholder="e.g. Royal Gadwal Pattu"
                    className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#2A1E17] block mb-1">
                    Telugu Script Title (తెలుగు పేరు)
                  </label>
                  <input
                    type="text"
                    value={editingCollection.teluguName || ''}
                    onChange={(e) => setEditingCollection({ ...editingCollection, teluguName: e.target.value })}
                    placeholder="e.g. రాచరిక గద్వాల పట్టు"
                    className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#2A1E17] block mb-1">
                    Category Type *
                  </label>
                  <select
                    value={editingCollection.category}
                    onChange={(e: any) => setEditingCollection({ ...editingCollection, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24] bg-white"
                  >
                    <option value="weave">Weave Masterpieces (Handloom Heritage)</option>
                    <option value="occasion">Wedding & Festivals (Pelli & Puja)</option>
                    <option value="curated">Curated Boutique Collections</option>
                    <option value="region">Regional Clusters (Telangana & AP)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#2A1E17] block mb-1">
                    Auto-Filter Tag (Fabric or Occasion)
                  </label>
                  <input
                    type="text"
                    value={editingCollection.filterTag || ''}
                    onChange={(e) => setEditingCollection({ ...editingCollection, filterTag: e.target.value })}
                    placeholder="e.g. Gadwal Silk or Bridal & Pelli"
                    className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-[#2A1E17] block mb-1">
                    Banner Tagline
                  </label>
                  <input
                    type="text"
                    value={editingCollection.bannerTagline || ''}
                    onChange={(e) => setEditingCollection({ ...editingCollection, bannerTagline: e.target.value })}
                    placeholder="e.g. Pure Zari Kuttu Perfection from Jogulamba"
                    className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-[#2A1E17] block mb-1">
                    Description & Artisan Heritage Lore
                  </label>
                  <textarea
                    rows={2}
                    value={editingCollection.description}
                    onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                    placeholder="Describe the weaving technique, GI-tag heritage, and uniqueness..."
                    className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                  />
                </div>

                {/* Cover Image */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="font-bold text-[#2A1E17] block">
                    Cover Banner Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={editingCollection.coverImage}
                    onChange={(e) => setEditingCollection({ ...editingCollection, coverImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                  />

                  {/* Quick Preset Selector */}
                  <div>
                    <span className="text-[10px] text-[#7A6757] font-bold block mb-1">
                      Quick Telugu Loom Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {COVER_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setEditingCollection({ ...editingCollection, coverImage: preset.url })}
                          className={`px-2 py-1 rounded-md text-[10px] border transition-colors cursor-pointer ${
                            editingCollection.coverImage === preset.url
                              ? 'bg-[#821D24] text-white border-[#821D24]'
                              : 'bg-[#FAF6F0] text-[#5C4B3E] border-[#DECFBE] hover:bg-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Preview */}
                  {editingCollection.coverImage && (
                    <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-[#D5C5B2] mt-2">
                      <img
                        src={editingCollection.coverImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Accent Color */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-[#2A1E17] block mb-1.5">
                    Accent Brand Color:
                  </label>
                  <div className="flex items-center gap-2">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setEditingCollection({ ...editingCollection, accentColor: c.hex })}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          editingCollection.accentColor === c.hex ? 'ring-2 ring-offset-2 ring-[#241215]' : ''
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {editingCollection.accentColor === c.hex && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured Toggle */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer bg-[#FAF8F5] p-3 rounded-xl border border-[#DECFBE]">
                    <input
                      type="checkbox"
                      checked={editingCollection.featured}
                      onChange={(e) => setEditingCollection({ ...editingCollection, featured: e.target.checked })}
                      className="w-4 h-4 accent-[#821D24] rounded-sm"
                    />
                    <div>
                      <span className="font-bold text-[#2A1E17] block">
                        Feature on Storefront Homepage
                      </span>
                      <span className="text-[10px] text-[#7A6757] block">
                        Showcase prominently in the top collections carousel and navigation pills.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8DFD1]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5C5B2] text-[#5C4B3E] font-bold hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-[#821D24] text-white font-bold hover:bg-[#68141A] transition-colors shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving Collection...' : 'Save & Publish Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
