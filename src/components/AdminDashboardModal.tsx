import { useState, type FormEvent } from 'react';
import { 
  X, 
  Package, 
  ShoppingBag, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Save, 
  Truck, 
  MapPin, 
  Sparkles,
  Database,
  ArrowRight,
  LogOut,
  AlertCircle,
  Layers,
  Filter
} from 'lucide-react';
import { Saree, Order, BoutiqueSettings, FabricType, OccasionType, WeaveType, Telugustate, SareeCollection } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { useAdminAuth } from '../context/AdminAuthContext';
import { 
  upsertSareeInFirestore, 
  deleteSareeFromFirestore, 
  updateOrderStatusInFirestore,
  updateBoutiqueSettingsInFirestore 
} from '../services/firestoreService';
import { INITIAL_COLLECTIONS } from '../data/sareesData';
import { AiImageStudioUploader } from './AiImageStudioUploader';
import { CollectionManager } from './CollectionManager';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  sarees: Saree[];
  collections?: SareeCollection[];
  orders: Order[];
  settings: BoutiqueSettings;
  currency: string;
  isDbLive: boolean;
}

export function AdminDashboardModal({
  isOpen,
  onClose,
  sarees,
  collections,
  orders,
  settings,
  currency,
  isDbLive,
}: AdminDashboardModalProps) {
  const { adminUser, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'inventory' | 'collections' | 'orders' | 'settings'>('inventory');

  const collectionsList = collections && collections.length > 0 ? collections : INITIAL_COLLECTIONS;
  const [inventoryCollectionFilter, setInventoryCollectionFilter] = useState<string>('all');

  // Form states for Saree Add / Edit
  const [editingSaree, setEditingSaree] = useState<Saree | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Settings form states
  const [announcement, setAnnouncement] = useState(settings.announcementText);
  const [promoCode, setPromoCode] = useState(settings.promoCode);
  const [promoDiscount, setPromoDiscount] = useState(settings.promoDiscountPercent);
  const [deliveryHours, setDeliveryHours] = useState(settings.expressDeliveryHours);
  const [freeTailoring, setFreeTailoring] = useState(settings.freeTailoringActive);
  const [whatsApp, setWhatsApp] = useState(settings.contactWhatsApp);

  // Filter in Admin Orders
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleOpenAddSaree = () => {
    const newSaree: Saree = {
      id: `sar-custom-${Date.now().toString().slice(-4)}`,
      name: '',
      subtitle: '',
      teluguName: '',
      fabric: 'Pochampally Ikkat',
      weave: 'Double Ikkat Weave',
      origin: 'Pochampally, Yadadri Bhuvanagiri, Telangana',
      stateRegion: 'Telangana',
      district: 'Yadadri Bhuvanagiri',
      occasion: 'Bridal & Pelli',
      color: 'Crimson Red',
      colorHex: '#821D24',
      price: 24000,
      originalPrice: 28000,
      rating: 5.0,
      reviewCount: 1,
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'],
      tags: ['Telugu Handloom', 'New Arrival'],
      isBestseller: false,
      isNewArrival: true,
      isSilkMarkCertified: true,
      blouseIncluded: true,
      blouseDetails: 'Unstitched contrast silk blouse piece included (0.8m).',
      zariType: 'Pure Gold Zari',
      care: 'Dry clean only. Store in muslin cloth.',
      description: 'Handcrafted master weave from Telangana/Andhra Pradesh artisan cluster.',
      length: '5.5 meters saree + 0.8m blouse',
      weight: '650 grams',
      inStock: true,
    };
    setEditingSaree(newSaree);
    setIsFormOpen(true);
  };

  const handleEditSaree = (saree: Saree) => {
    setEditingSaree({ ...saree });
    setIsFormOpen(true);
  };

  const handleSaveSaree = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingSaree || !editingSaree.name || !editingSaree.price) return;
    setIsSaving(true);
    const ok = await upsertSareeInFirestore(editingSaree);
    setIsSaving(false);
    if (ok) {
      triggerToast(`Saved "${editingSaree.name}" to live database!`);
      setIsFormOpen(false);
      setEditingSaree(null);
    } else {
      alert('Could not save saree to Firestore. Please verify internet connection.');
    }
  };

  const handleDeleteSaree = async (sareeId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the store catalog?`)) return;
    const ok = await deleteSareeFromFirestore(sareeId);
    if (ok) {
      triggerToast(`Deleted "${name}" successfully.`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const ok = await updateOrderStatusInFirestore(orderId, newStatus);
    if (ok) {
      triggerToast(`Order #${orderId} status updated to: ${newStatus}`);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    const ok = await updateBoutiqueSettingsInFirestore({
      announcementText: announcement,
      promoCode,
      promoDiscountPercent: Number(promoDiscount),
      expressDeliveryHours: deliveryHours,
      freeTailoringActive: freeTailoring,
      contactWhatsApp: whatsApp,
      contactPhone: whatsApp,
    });
    setIsSaving(false);
    if (ok) {
      triggerToast('Boutique features and announcement bar updated in live database!');
    }
  };

  const filteredOrders = orderStatusFilter === 'All'
    ? orders
    : orders.filter((o) => o.status === orderStatusFilter);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div 
        className="w-full max-w-5xl bg-[#FAF8F5] h-full flex flex-col shadow-2xl border-l border-[#E8DFD1]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <header className="p-4 sm:p-6 bg-[#241215] text-white border-b border-[#4D272E] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#821D24] text-[#F5C767] flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-title text-xl sm:text-2xl font-bold">
                  Boutique Management Studio
                </h2>
                <span className="text-[10px] bg-[#821D24] text-[#F5C767] font-bold px-2 py-0.5 rounded-full">
                  Admin Mode
                </span>
              </div>
              <p className="text-xs text-[#E5DCD0] mt-0.5">
                Logged in as <strong>{adminUser?.email || 'saikrishnask990@gmail.com'}</strong> • {adminUser?.role === 'superadmin' ? 'Store Owner' : 'Manager'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs bg-black/30 px-3 py-1.5 rounded-xl border border-white/10 text-emerald-300">
              <Database className="w-3.5 h-3.5" />
              <span>{isDbLive ? 'Live Cloud Firestore Connected' : 'Local Fallback'}</span>
            </div>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-[#FAF2E8] px-4 sm:px-6 py-2.5 border-b border-[#E8DFD1] flex items-center gap-2 sm:gap-3 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('inventory');
              setIsFormOpen(false);
            }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-[#821D24] text-white shadow-xs'
                : 'text-[#4A3B32] hover:bg-white/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Saree Catalog ({sarees.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('collections');
              setIsFormOpen(false);
            }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'collections'
                ? 'bg-[#821D24] text-white shadow-xs'
                : 'text-[#4A3B32] hover:bg-white/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Collections ({collectionsList.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('orders');
              setIsFormOpen(false);
            }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#821D24] text-white shadow-xs'
                : 'text-[#4A3B32] hover:bg-white/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Customer Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#821D24] text-white shadow-xs'
                : 'text-[#4A3B32] hover:bg-white/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store Settings & Announcements</span>
          </button>
        </div>

        {/* Toast Notification in Admin */}
        {successToast && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              {!isFormOpen ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8DFD1]">
                    <div>
                      <h3 className="font-serif-title text-xl font-bold text-[#2A1E17]">
                        Handcrafted Saree Inventory
                      </h3>
                      <p className="text-xs text-[#7A6757] mt-0.5">
                        Manage regional weaves, pricing, blouse specifications, and live stock
                      </p>
                    </div>

                    <button
                      onClick={handleOpenAddSaree}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#821D24] text-white text-xs font-bold shadow-md hover:bg-[#68141A] transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#F5C767]" />
                      <span>Add New Telugu Saree</span>
                    </button>
                  </div>

                  {/* Collection Filter & Quick Stats Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#E8DFD1]">
                    <div className="flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-[#821D24]" />
                      <span className="text-xs font-bold text-[#4A3B32]">Collection:</span>
                      <select
                        value={inventoryCollectionFilter}
                        onChange={(e) => setInventoryCollectionFilter(e.target.value)}
                        className="p-1.5 rounded-lg border border-[#D5C5B2] text-xs bg-white text-[#2A1E17] font-medium"
                      >
                        <option value="all">All Sarees ({sarees.length})</option>
                        {collectionsList.map((col) => (
                          <option key={col.id} value={col.id}>{col.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-[#7A6757]">
                        AI Draped: <strong className="text-[#821D24]">{sarees.filter(s => !!s.aiModelImage).length}</strong>
                      </span>
                      {inventoryCollectionFilter !== 'all' && (
                        <button
                          onClick={() => setInventoryCollectionFilter('all')}
                          className="text-[#821D24] font-bold hover:underline"
                        >
                          Clear Filter
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sarees Table */}
                  <div className="bg-white rounded-2xl border border-[#E0D5C7] overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF8F5] text-[#7A6757] border-b border-[#E8DFD1]">
                          <tr>
                            <th className="p-3">Saree / Weave</th>
                            <th className="p-3">Region & Origin</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Occasion</th>
                            <th className="p-3">AI Model Drape</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE7DC]">
                          {sarees
                            .filter((saree) => {
                              if (inventoryCollectionFilter === 'all') return true;
                              const col = collectionsList.find(c => c.id === inventoryCollectionFilter);
                              if (!col) return true;
                              if (saree.collectionIds && saree.collectionIds.includes(col.id)) return true;
                              if (col.filterTag && (saree.fabric === col.filterTag || saree.occasion === col.filterTag)) return true;
                              return false;
                            })
                            .map((saree) => (
                            <tr key={saree.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <img
                                      src={saree.images[0]}
                                      alt={saree.name}
                                      className="w-12 h-12 rounded-lg object-cover border border-[#E0D5C7] shrink-0"
                                    />
                                    {saree.aiModelImage && (
                                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#821D24] text-[#F5C767] rounded-full flex items-center justify-center text-[9px] shadow-xs" title="Has AI Model Drape">
                                        ✨
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-bold text-[#2A1E17] block">
                                      {saree.name}
                                    </span>
                                    {saree.teluguName && (
                                      <span className="text-[10px] text-[#821D24] font-medium block">
                                        {saree.teluguName}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-[#8C7665]">
                                      {saree.fabric} • {saree.weave}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="inline-block bg-[#FAF2E8] text-[#821D24] font-bold text-[10px] px-2 py-0.5 rounded-full border border-[#DECFBE]">
                                  {saree.stateRegion}
                                </span>
                                <span className="text-[10px] text-[#7A6757] block mt-0.5 max-w-xs truncate">
                                  {saree.origin}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="font-bold text-[#821D24] text-xs">
                                  {formatPrice(saree.price, currency)}
                                </span>
                                {saree.originalPrice > saree.price && (
                                  <span className="text-[10px] text-[#9A8778] line-through block">
                                    {formatPrice(saree.originalPrice, currency)}
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                <span className="text-[11px] text-[#4A3B32]">{saree.occasion}</span>
                              </td>
                              <td className="p-3">
                                {saree.aiModelImage ? (
                                  <div className="flex items-center gap-1.5">
                                    <img
                                      src={saree.aiModelImage}
                                      alt="AI Model"
                                      className="w-8 h-10 object-cover rounded-md border border-[#821D24]/30"
                                    />
                                    <span className="text-[10px] font-bold text-[#821D24] bg-[#FAF2E8] px-1.5 py-0.5 rounded border border-[#DECFBE]">
                                      Draped
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleEditSaree(saree)}
                                    className="text-[10px] text-[#7A6757] hover:text-[#821D24] underline cursor-pointer"
                                  >
                                    + Add AI Drape
                                  </button>
                                )}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    saree.inStock
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {saree.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleEditSaree(saree)}
                                    className="p-1.5 rounded-lg bg-[#FAF2E8] hover:bg-[#821D24] hover:text-white text-[#821D24] transition-colors cursor-pointer"
                                    title="Edit Saree & AI Studio"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSaree(saree.id, saree.name)}
                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition-colors cursor-pointer"
                                    title="Delete Saree"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                /* Edit / Add Saree Form */
                <form onSubmit={handleSaveSaree} className="bg-white p-6 rounded-2xl border border-[#E0D5C7] space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD1]">
                    <h3 className="font-serif-title text-xl font-bold text-[#2A1E17]">
                      {editingSaree?.name ? `Edit: ${editingSaree.name}` : 'Add New Handcrafted Saree'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="text-xs text-[#7A6757] hover:underline"
                    >
                      Cancel
                    </button>
                  </div>

                  {editingSaree && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="font-bold text-[#2A1E17] block mb-1">Saree Name (English) *</label>
                        <input
                          type="text"
                          required
                          value={editingSaree.name}
                          onChange={(e) => setEditingSaree({ ...editingSaree, name: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                          placeholder="e.g. Pochampally Double Ikkat Silk"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#2A1E17] block mb-1">Telugu Script Name (తెలుగు పేరు)</label>
                        <input
                          type="text"
                          value={editingSaree.teluguName || ''}
                          onChange={(e) => setEditingSaree({ ...editingSaree, teluguName: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                          placeholder="e.g. పోచంపల్లి ఇక్కత్ పట్టు చీర"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-bold text-[#2A1E17] block mb-1">Subtitle / Craft Note</label>
                        <input
                          type="text"
                          value={editingSaree.subtitle}
                          onChange={(e) => setEditingSaree({ ...editingSaree, subtitle: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                          placeholder="e.g. Master Weave from Yadadri with Pure Gold Zari"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#2A1E17] block mb-1">Fabric Cluster</label>
                        <select
                          value={editingSaree.fabric}
                          onChange={(e: any) => setEditingSaree({ ...editingSaree, fabric: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24] bg-white"
                        >
                          <option value="Pochampally Ikkat">Pochampally Ikkat (Telangana)</option>
                          <option value="Gadwal Silk">Gadwal Silk (Jogulamba)</option>
                          <option value="Uppada Jamdani">Uppada Jamdani (Kakinada)</option>
                          <option value="Dharmavaram Silk">Dharmavaram Silk (Rayalaseema)</option>
                          <option value="Mangalagiri Cotton Silk">Mangalagiri Cotton Silk</option>
                          <option value="Narayanpet Handloom">Narayanpet Handloom</option>
                          <option value="Venkatagiri Silk">Venkatagiri Silk</option>
                          <option value="Kanjeevaram Silk">Kanjeevaram Silk</option>
                          <option value="Organza Silk">Organza Silk</option>
                          <option value="Tissue Silk">Tissue Silk</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-[#2A1E17] block mb-1">State & Region Target *</label>
                        <select
                          value={editingSaree.stateRegion}
                          onChange={(e: any) => setEditingSaree({ ...editingSaree, stateRegion: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24] bg-white"
                        >
                          <option value="Telangana">Telangana</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="South India Heritage">South India Heritage</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-[#2A1E17] block mb-1">Price (₹ INR) *</label>
                        <input
                          type="number"
                          required
                          value={editingSaree.price}
                          onChange={(e) => setEditingSaree({ ...editingSaree, price: Number(e.target.value) })}
                          className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#2A1E17] block mb-1">Original MSRP (₹ INR)</label>
                        <input
                          type="number"
                          value={editingSaree.originalPrice}
                          onChange={(e) => setEditingSaree({ ...editingSaree, originalPrice: Number(e.target.value) })}
                          className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#2A1E17] block mb-1">Auspicious Occasion</label>
                        <select
                          value={editingSaree.occasion}
                          onChange={(e: any) => setEditingSaree({ ...editingSaree, occasion: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24] bg-white"
                        >
                          <option value="Bridal & Pelli">Bridal & Pelli</option>
                          <option value="Varalakshmi Vratam & Puja">Varalakshmi Vratam & Puja</option>
                          <option value="Sreemantham & Seemantham">Sreemantham & Seemantham</option>
                          <option value="Ugadi & Sankranti Festive">Ugadi & Sankranti Festive</option>
                          <option value="Reception & Cocktail">Reception & Cocktail</option>
                          <option value="Sangeet & Mehendi">Sangeet & Mehendi</option>
                          <option value="Office & Daily Grace">Office & Daily Grace</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-[#2A1E17] block mb-1">Stock Availability</label>
                        <div className="flex items-center gap-4 mt-2">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="inStock"
                              checked={editingSaree.inStock === true}
                              onChange={() => setEditingSaree({ ...editingSaree, inStock: true })}
                              className="accent-[#821D24]"
                            />
                            <span>Ready in Stock</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="inStock"
                              checked={editingSaree.inStock === false}
                              onChange={() => setEditingSaree({ ...editingSaree, inStock: false })}
                              className="accent-[#821D24]"
                            />
                            <span>Out of Stock</span>
                          </label>
                        </div>
                      </div>

                      {/* Assign to Curated Saree Collections */}
                      <div className="sm:col-span-2">
                        <label className="font-bold text-[#2A1E17] block mb-1">
                          Assign to Collections & Categories
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#DECFBE]">
                          {collectionsList.map((col) => {
                            const isChecked = editingSaree.collectionIds?.includes(col.id) || false;
                            return (
                              <label key={col.id} className="flex items-center gap-2 cursor-pointer text-xs">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const current = editingSaree.collectionIds || [];
                                    const updated = e.target.checked
                                      ? [...current, col.id]
                                      : current.filter(id => id !== col.id);
                                    setEditingSaree({ ...editingSaree, collectionIds: updated });
                                  }}
                                  className="accent-[#821D24] rounded-sm"
                                />
                                <span className="truncate">{col.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-bold text-[#2A1E17] block mb-1">
                          Product Saree Images & AI Model Dressing Studio
                        </label>
                        <AiImageStudioUploader
                          currentImageUrl={editingSaree.images[0] || ''}
                          modelImageUrl={editingSaree.aiModelImage || ''}
                          sareeName={editingSaree.name}
                          fabric={editingSaree.fabric}
                          color={editingSaree.color}
                          onImageSelected={(compressedDataUrl) => {
                            const updated = [...editingSaree.images];
                            updated[0] = compressedDataUrl;
                            setEditingSaree({ ...editingSaree, images: updated });
                          }}
                          onModelImageSelected={(modelImageUrl) => {
                            const updatedImages = editingSaree.images.includes(modelImageUrl)
                              ? editingSaree.images
                              : [editingSaree.images[0], modelImageUrl, ...editingSaree.images.slice(1)];
                            setEditingSaree({
                              ...editingSaree,
                              aiModelImage: modelImageUrl,
                              images: updatedImages,
                            });
                          }}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-bold text-[#2A1E17] block mb-1">Description & Weaving Lore</label>
                        <textarea
                          rows={3}
                          value={editingSaree.description}
                          onChange={(e) => setEditingSaree({ ...editingSaree, description: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8DFD1]">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 rounded-xl border border-[#D5C5B2] text-xs font-bold text-[#4A3B32] hover:bg-[#FAF8F5]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2 rounded-xl bg-[#821D24] text-white text-xs font-bold hover:bg-[#68141A] transition-colors shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Syncing to Firestore...' : 'Save & Publish Saree'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: COLLECTIONS MANAGEMENT */}
          {activeTab === 'collections' && (
            <CollectionManager
              collections={collectionsList}
              sarees={sarees}
              onViewSareesInCollection={(col) => {
                setInventoryCollectionFilter(col.id);
                setActiveTab('inventory');
                triggerToast(`Showing sarees in "${col.name}" collection`);
              }}
              onToast={triggerToast}
            />
          )}

          {/* TAB 3: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8DFD1]">
                <div>
                  <h3 className="font-serif-title text-xl font-bold text-[#2A1E17]">
                    Live AP & Telangana Customer Orders
                  </h3>
                  <p className="text-xs text-[#7A6757] mt-0.5">
                    Update fulfillment stages: Loom Sourcing, Fall & Pico, Dispatch, and Delivery
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#7A6757] font-semibold">Filter Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="p-2 rounded-xl border border-[#D5C5B2] bg-white text-xs text-[#2A1E17] font-bold"
                  >
                    <option value="All">All Orders ({orders.length})</option>
                    <option value="Order Placed">Order Placed</option>
                    <option value="Loom Sourcing & QC">Loom Sourcing & QC</option>
                    <option value="Fall & Pico Finishing">Fall & Pico Finishing</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-[#E0D5C7] p-6">
                  <p className="text-xs text-[#7A6757]">No orders matching the selected status.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-[#E0D5C7] p-5 shadow-2xs space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EFE7DC]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif-title text-base font-bold text-[#2A1E17]">
                              Order #{order.id}
                            </span>
                            <span className="text-[10px] bg-[#FAF2E8] text-[#821D24] font-bold px-2 py-0.5 rounded-full border border-[#DECFBE]">
                              {order.customer.district || order.customer.city}, {order.customer.state}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#7A6757]">
                            Placed on {order.orderDate} • Customer: {order.customer.fullName} ({order.customer.phone})
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-serif-title text-lg font-bold text-[#821D24]">
                            {formatPrice(order.total, currency)}
                          </span>
                          <span className="text-[10px] text-[#7A6757] block">
                            Paid via {order.paymentMethod.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 bg-[#FAF8F5] rounded-xl border border-[#EFE7DC]">
                            <img
                              src={item.saree.images[0]}
                              alt={item.saree.name}
                              className="w-12 h-12 rounded-lg object-cover border border-[#E0D5C7]"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-[#2A1E17] block leading-tight">
                                {item.saree.name}
                              </span>
                              <span className="text-[10px] text-[#821D24]">
                                Qty: {item.quantity} • {item.fallAndPico ? 'Free Fall & Pico Included' : ''}
                              </span>
                              {item.blouseOption !== 'unstitched' && (
                                <span className="text-[10px] text-[#5C4B3E] block">
                                  Blouse: {item.blouseOption} ({item.blouseMeasurements?.neckStyle})
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Status Update Control */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EFE7DC] bg-[#FAF2E8]/40 p-3 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#821D24]" />
                          <span className="text-xs font-bold text-[#2A1E17]">Update Stage:</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {(['Order Placed', 'Loom Sourcing & QC', 'Fall & Pico Finishing', 'Dispatched', 'Delivered'] as const).map(
                            (st) => (
                              <button
                                key={st}
                                onClick={() => handleUpdateOrderStatus(order.id, st)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                                  order.status === st
                                    ? 'bg-[#821D24] text-white border-[#821D24] shadow-xs'
                                    : 'bg-white text-[#4A3B32] border-[#D5C5B2] hover:bg-[#FAF8F5]'
                                }`}
                              >
                                {st}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SETTINGS & ANNOUNCEMENTS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#2A1E17]">
                  Storewide Feature Management
                </h3>
                <p className="text-xs text-[#7A6757] mt-0.5">
                  Update customer notices, promotional coupon rates, tailoring offers, and concierge numbers
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E0D5C7] shadow-2xs space-y-5 text-xs">
                <div>
                  <label className="font-bold text-[#2A1E17] block mb-1">
                    Announcement Bar Text (Top Banner)
                  </label>
                  <textarea
                    rows={2}
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                  />
                  <span className="text-[10px] text-[#7A6757] block mt-1">
                    Displayed prominently to customers across Andhra Pradesh and Telangana.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#2A1E17] block mb-1">Active Coupon Code</label>
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24] font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#2A1E17] block mb-1">Discount Rate (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={promoDiscount}
                      onChange={(e) => setPromoDiscount(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#2A1E17] block mb-1">AP & TG Delivery Window</label>
                    <input
                      type="text"
                      value={deliveryHours}
                      onChange={(e) => setDeliveryHours(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                      placeholder="e.g. 24–48h"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#2A1E17] block mb-1">WhatsApp Saree Concierge</label>
                    <input
                      type="text"
                      value={whatsApp}
                      onChange={(e) => setWhatsApp(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                      placeholder="+91 98480 22338"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#FAF2E8] rounded-xl border border-[#E5DCD0]">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold text-[#2A1E17] block">Complimentary Telugu Fall & Pico Finishing</span>
                      <span className="text-[10px] text-[#7A6757]">
                        Enable free edge stitching for all orders placed in AP & Telangana
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={freeTailoring}
                      onChange={(e) => setFreeTailoring(e.target.checked)}
                      className="w-4 h-4 accent-[#821D24] cursor-pointer"
                    />
                  </label>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="w-full py-3 rounded-xl bg-[#821D24] text-white text-xs font-bold hover:bg-[#68141A] transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Syncing to Live Database...' : 'Save Settings to Firestore'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
