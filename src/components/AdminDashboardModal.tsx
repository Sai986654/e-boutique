import { useState, useRef, type FormEvent } from 'react';
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
  Filter,
  Crown,
  Languages,
  Loader2
} from 'lucide-react';
import { Saree, Order, BoutiqueSettings, FabricType, OccasionType, WeaveType, Telugustate, SareeCollection, ProductDepartment } from '../types';
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
import { translateEnglishToTelugu } from '../utils/teluguTranslator';

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
  const [adminDeptFilter, setAdminDeptFilter] = useState<ProductDepartment>('all');

  const sareeCount = sarees.filter(s => s.productType !== 'ornament').length;
  const ornamentCount = sarees.filter(s => s.productType === 'ornament').length;

  // Form states for Saree Add / Edit
  const [editingSaree, setEditingSaree] = useState<Saree | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Auto-translation to Telugu state
  const [autoTranslateTelugu, setAutoTranslateTelugu] = useState<boolean>(true);
  const [isTranslatingTelugu, setIsTranslatingTelugu] = useState<boolean>(false);
  const [teluguSuggestions, setTeluguSuggestions] = useState<string[]>([]);
  const translateDebounceRef = useRef<any>(null);

  const handleEnglishNameChange = (val: string, dept: 'saree' | 'ornament') => {
    setEditingSaree((prev) => prev ? { ...prev, name: val } : null);

    if (!autoTranslateTelugu || !val.trim()) {
      if (!val.trim()) {
        setTeluguSuggestions([]);
      }
      return;
    }

    if (translateDebounceRef.current) {
      clearTimeout(translateDebounceRef.current);
    }

    setIsTranslatingTelugu(true);
    translateDebounceRef.current = setTimeout(async () => {
      try {
        // 1. Instant domain & phonetic translation
        const res = await translateEnglishToTelugu(val, dept);
        if (res.telugu) {
          setEditingSaree((prev) => prev ? { ...prev, teluguName: res.telugu } : null);
          setTeluguSuggestions(res.suggestions);
        }

        // 2. Background query to backend / Gemini for contextual refinement
        try {
          const apiRes = await fetch('/api/translate/telugu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: val, department: dept }),
          });
          if (apiRes.ok) {
            const data = await apiRes.json();
            if (data.success && data.teluguText) {
              setEditingSaree((prev) => prev ? { ...prev, teluguName: data.teluguText } : null);
              if (data.suggestions && data.suggestions.length > 0) {
                setTeluguSuggestions(Array.from(new Set([...data.suggestions, ...res.suggestions])));
              }
            }
          }
        } catch {
          // Client translation is already applied
        }
      } catch (err) {
        console.error('Translation error:', err);
      } finally {
        setIsTranslatingTelugu(false);
      }
    }, 250);
  };

  const handleManualTranslate = async (dept: 'saree' | 'ornament') => {
    if (!editingSaree || !editingSaree.name.trim()) return;
    setIsTranslatingTelugu(true);
    try {
      const res = await translateEnglishToTelugu(editingSaree.name, dept);
      if (res.telugu) {
        setEditingSaree((prev) => prev ? { ...prev, teluguName: res.telugu } : null);
        setTeluguSuggestions(res.suggestions);
      }

      try {
        const apiRes = await fetch('/api/translate/telugu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: editingSaree.name, department: dept }),
        });
        if (apiRes.ok) {
          const data = await apiRes.json();
          if (data.success && data.teluguText) {
            setEditingSaree((prev) => prev ? { ...prev, teluguName: data.teluguText } : null);
            if (data.suggestions && data.suggestions.length > 0) {
              setTeluguSuggestions(Array.from(new Set([...data.suggestions, ...res.suggestions])));
            }
          }
        }
      } catch {
        // Fallback
      }
    } finally {
      setIsTranslatingTelugu(false);
    }
  };

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
      productType: 'saree',
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

  const handleOpenAddOrnament = () => {
    const newOrnament: Saree = {
      id: `orn-custom-${Date.now().toString().slice(-4)}`,
      name: '',
      subtitle: '',
      teluguName: '',
      productType: 'ornament',
      ornamentType: 'Haram & Long Necklace',
      goldPurity: '1-Gram Gold Plated (One Gram Gold)',
      gemstones: 'Kempu Stones, Emeralds & Basara Pearls',
      fabric: 'One Gram Gold Ornaments',
      weave: 'Temple Nakshi Jewellery',
      origin: 'Hyderabad Old City, Telangana',
      stateRegion: 'Telangana',
      district: 'Hyderabad Old City',
      occasion: 'Bridal & Pelli',
      color: '1-Gram Antique Gold',
      colorHex: '#C89933',
      price: 6500,
      originalPrice: 8500,
      rating: 5.0,
      reviewCount: 1,
      images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80'],
      tags: ['1-Gram Gold', 'Temple Jewelry', 'New Arrival'],
      isBestseller: false,
      isNewArrival: true,
      isSilkMarkCertified: false,
      blouseIncluded: false,
      blouseDetails: 'Includes 3-inch 1-gram gold plated link chain extender & luxury velvet jewelry box.',
      zariType: 'One Gram Gold Real Zari',
      care: 'Avoid direct perfume, sweat and moisture. Clean with soft cotton cloth. Store in airtight velvet box.',
      description: 'Exquisitely handcrafted One Gram Gold micro-electroplated temple ornament. Engineered with a durable copper-brass base and rich antique matte gold finish.',
      length: '24 inches adjustable necklace + chain extender',
      weight: '85 grams',
      inStock: true,
      collectionIds: ['col-one-gram-gold'],
    };
    setEditingSaree(newOrnament);
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
            <span>Store Catalog ({sarees.length})</span>
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
                      <h3 className="font-serif-title text-xl font-bold text-[#2A1E17] flex items-center gap-2">
                        <span>Store Catalog Inventory & Studio</span>
                        <span className="text-xs font-sans font-semibold bg-[#FAF2E8] text-[#821D24] px-2.5 py-0.5 rounded-full border border-[#DECFBE]">
                          {sarees.length} Total
                        </span>
                      </h3>
                      <p className="text-xs text-[#7A6757] mt-0.5">
                        Manage Handloom Sarees ({sareeCount}) & One Gram Gold Ornaments ({ornamentCount})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handleOpenAddSaree}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#821D24] text-white text-xs font-bold shadow-xs hover:bg-[#68141A] transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-[#F5C767]" />
                        <span>+ Add Handloom Saree</span>
                      </button>

                      <button
                        onClick={handleOpenAddOrnament}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#996515] via-[#B8860B] to-[#8C5D14] text-white text-xs font-bold shadow-xs hover:brightness-110 transition-all cursor-pointer border border-[#E5C158]/40"
                      >
                        <Crown className="w-4 h-4 text-[#FFF3B8]" />
                        <span>+ Add 1-Gram Gold Ornament</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter & Quick Stats Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#E8DFD1]">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-bold text-[#4A3B32]">View:</span>
                      <div className="inline-flex rounded-lg bg-[#EFE7DC] p-0.5 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setAdminDeptFilter('all')}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            adminDeptFilter === 'all'
                              ? 'bg-[#821D24] text-white shadow-xs'
                              : 'text-[#5C4D41] hover:text-[#2A1E17]'
                          }`}
                        >
                          All ({sarees.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminDeptFilter('sarees')}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            adminDeptFilter === 'sarees'
                              ? 'bg-[#821D24] text-white shadow-xs'
                              : 'text-[#5C4D41] hover:text-[#2A1E17]'
                          }`}
                        >
                          🥻 Sarees ({sareeCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminDeptFilter('ornaments')}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            adminDeptFilter === 'ornaments'
                              ? 'bg-[#996515] text-white shadow-xs'
                              : 'text-[#5C4D41] hover:text-[#2A1E17]'
                          }`}
                        >
                          👑 1-Gram Gold ({ornamentCount})
                        </button>
                      </div>

                      <div className="h-4 w-px bg-[#D5C5B2] mx-1 hidden sm:block" />

                      <div className="flex items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5 text-[#821D24]" />
                        <span className="text-xs font-bold text-[#4A3B32]">Collection:</span>
                        <select
                          value={inventoryCollectionFilter}
                          onChange={(e) => setInventoryCollectionFilter(e.target.value)}
                          className="p-1 rounded-lg border border-[#D5C5B2] text-xs bg-white text-[#2A1E17] font-medium"
                        >
                          <option value="all">All Collections</option>
                          {collectionsList.map((col) => (
                            <option key={col.id} value={col.id}>{col.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-[#7A6757]">
                        AI Draped: <strong className="text-[#821D24]">{sarees.filter(s => !!s.aiModelImage).length}</strong>
                      </span>
                      {(inventoryCollectionFilter !== 'all' || adminDeptFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setInventoryCollectionFilter('all');
                            setAdminDeptFilter('all');
                          }}
                          className="text-[#821D24] font-bold hover:underline cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sarees & Ornaments Table */}
                  <div className="bg-white rounded-2xl border border-[#E0D5C7] overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF8F5] text-[#7A6757] border-b border-[#E8DFD1]">
                          <tr>
                            <th className="p-3">Item / Department</th>
                            <th className="p-3">Category & Origin</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Occasion</th>
                            <th className="p-3">AI Model Drape</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE7DC]">
                          {sarees
                            .filter((item) => {
                              if (adminDeptFilter === 'sarees' && item.productType === 'ornament') return false;
                              if (adminDeptFilter === 'ornaments' && item.productType !== 'ornament') return false;
                              if (inventoryCollectionFilter === 'all') return true;
                              const col = collectionsList.find(c => c.id === inventoryCollectionFilter);
                              if (!col) return true;
                              if (item.collectionIds && item.collectionIds.includes(col.id)) return true;
                              if (col.filterTag && (item.fabric === col.filterTag || item.occasion === col.filterTag)) return true;
                              return false;
                            })
                            .map((item) => (
                            <tr key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <img
                                      src={item.images[0]}
                                      alt={item.name}
                                      className="w-12 h-12 rounded-lg object-cover border border-[#E0D5C7] shrink-0"
                                    />
                                    {item.aiModelImage && (
                                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#821D24] text-[#F5C767] rounded-full flex items-center justify-center text-[9px] shadow-xs" title="Has AI Model Drape">
                                        ✨
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-[#2A1E17]">
                                        {item.name}
                                      </span>
                                      {item.productType === 'ornament' ? (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-[#FFF8E6] text-[#996515] border border-[#E5C158]/40">
                                          👑 1-Gram Gold
                                        </span>
                                      ) : (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-[#FDF2F4] text-[#821D24] border border-[#821D24]/20">
                                          🥻 Saree
                                        </span>
                                      )}
                                    </div>
                                    {item.teluguName && (
                                      <span className="text-[10px] text-[#821D24] font-medium block">
                                        {item.teluguName}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-[#8C7665]">
                                      {item.productType === 'ornament' 
                                        ? `${item.ornamentType || 'Temple Jewelry'} • ${item.goldPurity || '1-Gram Gold Plated'}`
                                        : `${item.fabric} • ${item.weave}`}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded-full border ${
                                  item.productType === 'ornament'
                                    ? 'bg-[#FFF8E6] text-[#996515] border-[#E5C158]/40'
                                    : 'bg-[#FAF2E8] text-[#821D24] border-[#DECFBE]'
                                }`}>
                                  {item.productType === 'ornament' ? '1-Gram Gold' : item.stateRegion}
                                </span>
                                <span className="text-[10px] text-[#7A6757] block mt-0.5 max-w-xs truncate">
                                  {item.origin}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="font-bold text-[#821D24] text-xs">
                                  {formatPrice(item.price, currency)}
                                </span>
                                {item.originalPrice > item.price && (
                                  <span className="text-[10px] text-[#9A8778] line-through block">
                                    {formatPrice(item.originalPrice, currency)}
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                <span className="text-[11px] text-[#4A3B32]">{item.occasion}</span>
                              </td>
                              <td className="p-3">
                                {item.aiModelImage ? (
                                  <div className="flex items-center gap-1.5">
                                    <img
                                      src={item.aiModelImage}
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
                                    onClick={() => handleEditSaree(item)}
                                    className="text-[10px] text-[#7A6757] hover:text-[#821D24] underline cursor-pointer"
                                  >
                                    + Add AI Drape
                                  </button>
                                )}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    item.inStock
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {item.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleEditSaree(item)}
                                    className="p-1.5 rounded-lg bg-[#FAF2E8] hover:bg-[#821D24] hover:text-white text-[#821D24] transition-colors cursor-pointer"
                                    title="Edit Item & AI Studio"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSaree(item.id, item.name)}
                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition-colors cursor-pointer"
                                    title="Delete Item"
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
                /* Edit / Add Item Form (Dynamic for Saree vs 1-Gram Gold Ornament) */
                <form onSubmit={handleSaveSaree} className="bg-white p-6 rounded-2xl border border-[#E0D5C7] space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD1]">
                    <div>
                      <h3 className="font-serif-title text-xl font-bold text-[#2A1E17] flex items-center gap-2">
                        {editingSaree?.productType === 'ornament' ? '👑' : '🥻'}
                        {editingSaree?.name 
                          ? `Edit: ${editingSaree.name}` 
                          : editingSaree?.productType === 'ornament' 
                            ? 'Add New 1-Gram Gold Ornament' 
                            : 'Add New Handcrafted Saree'}
                      </h3>
                      <p className="text-xs text-[#7A6757] mt-0.5">
                        {editingSaree?.productType === 'ornament'
                          ? 'Micro-electroplated One Gram Gold temple jewelry (separate from real solid gold)'
                          : 'Authentic regional master weave from Telangana & Andhra Pradesh handloom clusters'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="text-xs text-[#7A6757] hover:underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {editingSaree && (
                    <div className="space-y-6">
                      {/* Department Switcher */}
                      <div className="bg-[#FAF2E8] p-3.5 rounded-xl border border-[#E8DFD1] flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-[#2A1E17] block">Product Department</span>
                          <span className="text-[11px] text-[#7A6757]">
                            Switch between Handloom Saree and 1-Gram Gold Ornament catalog specifications
                          </span>
                        </div>
                        <div className="inline-flex rounded-xl bg-white p-1 border border-[#D5C5B2] shadow-2xs">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSaree({
                                ...editingSaree,
                                productType: 'saree',
                                fabric: editingSaree.fabric === 'One Gram Gold Ornaments' ? 'Pochampally Ikkat' : editingSaree.fabric,
                                weave: editingSaree.weave === 'Temple Nakshi Jewellery' ? 'Double Ikkat Weave' : editingSaree.weave,
                              });
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                              editingSaree.productType !== 'ornament'
                                ? 'bg-[#821D24] text-white shadow-xs'
                                : 'text-[#5C4D41] hover:text-[#2A1E17]'
                            }`}
                          >
                            <span>🥻 Handloom Saree</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSaree({
                                ...editingSaree,
                                productType: 'ornament',
                                fabric: 'One Gram Gold Ornaments',
                                weave: editingSaree.weave === 'Double Ikkat Weave' ? 'Temple Nakshi Jewellery' : editingSaree.weave,
                                ornamentType: editingSaree.ornamentType || 'Haram & Long Necklace',
                                goldPurity: editingSaree.goldPurity || '1-Gram Gold Plated (One Gram Gold)',
                                gemstones: editingSaree.gemstones || 'Kempu Stones, Emeralds & Basara Pearls',
                                isSilkMarkCertified: false,
                                blouseIncluded: false,
                                blouseDetails: editingSaree.blouseDetails && !editingSaree.blouseDetails.includes('blouse')
                                  ? editingSaree.blouseDetails
                                  : 'Includes 3-inch 1-gram gold plated link chain extender & luxury velvet jewelry box.',
                                collectionIds: editingSaree.collectionIds?.includes('col-one-gram-gold')
                                  ? editingSaree.collectionIds
                                  : [...(editingSaree.collectionIds || []), 'col-one-gram-gold'],
                              });
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                              editingSaree.productType === 'ornament'
                                ? 'bg-gradient-to-r from-[#996515] to-[#B8860B] text-white shadow-xs'
                                : 'text-[#5C4D41] hover:text-[#2A1E17]'
                            }`}
                          >
                            <span>👑 1-Gram Gold Ornament</span>
                          </button>
                        </div>
                      </div>

                      {editingSaree.productType === 'ornament' ? (
                        /* ========================================================
                           1-GRAM GOLD ORNAMENT SPECIFICATIONS
                           ======================================================== */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-bold text-[#2A1E17] block">Ornament Title (English) *</label>
                              <span className="text-[10px] text-[#996515] font-semibold">Type in English</span>
                            </div>
                            <input
                              type="text"
                              required
                              value={editingSaree.name}
                              onChange={(e) => handleEnglishNameChange(e.target.value, 'ornament')}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515]"
                              placeholder="e.g. 1-Gram Gold Kasu Mala Haram with Kempu Stones"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-bold text-[#2A1E17] flex items-center gap-1.5">
                                <Languages className="w-3.5 h-3.5 text-[#996515]" />
                                <span>Telugu Title (తెలుగు పేరు)</span>
                              </label>
                              <div className="flex items-center gap-2">
                                {isTranslatingTelugu && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-[#996515] font-semibold animate-pulse">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Translating...
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setAutoTranslateTelugu(!autoTranslateTelugu)}
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    autoTranslateTelugu
                                      ? 'bg-[#FFF8E6] text-[#996515] border border-[#E5C158]/60 shadow-2xs'
                                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                                  }`}
                                  title="Toggle automatic conversion to Telugu as you type in English"
                                >
                                  <Sparkles className="w-2.5 h-2.5 text-[#B8860B]" />
                                  <span>Auto: {autoTranslateTelugu ? 'ON' : 'OFF'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleManualTranslate('ornament')}
                                  className="text-[10px] text-[#996515] hover:underline font-bold cursor-pointer"
                                  title="Convert English to Telugu now"
                                >
                                  ⚡ Convert
                                </button>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={editingSaree.teluguName || ''}
                              onChange={(e) => setEditingSaree({ ...editingSaree, teluguName: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515]"
                              placeholder="e.g. ఒక గ్రాము బంగారం కాసుల పేరు హారం"
                            />
                            {teluguSuggestions.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span className="text-[10px] text-[#7A6757] font-semibold flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5 text-[#B8860B]" /> Suggestions:
                                </span>
                                {teluguSuggestions.map((sug, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setEditingSaree({ ...editingSaree, teluguName: sug })}
                                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer border ${
                                      editingSaree.teluguName === sug
                                        ? 'bg-[#996515] text-white border-[#996515] shadow-2xs'
                                        : 'bg-[#FFF8E6] hover:bg-[#996515] text-[#996515] hover:text-white border-[#E5C158]/50'
                                    }`}
                                  >
                                    {sug}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="sm:col-span-2">
                            <label className="font-bold text-[#2A1E17] block mb-1">Subtitle / Craft Note</label>
                            <input
                              type="text"
                              value={editingSaree.subtitle}
                              onChange={(e) => setEditingSaree({ ...editingSaree, subtitle: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515]"
                              placeholder="e.g. Micro-electroplated temple jewelry with basara pearls & antique matte finish"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-[#2A1E17] block mb-1">Ornament Category *</label>
                            <select
                              value={editingSaree.ornamentType || 'Haram & Long Necklace'}
                              onChange={(e: any) => setEditingSaree({ ...editingSaree, ornamentType: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515] bg-white font-medium"
                            >
                              <option value="Haram & Long Necklace">Haram & Long Necklace (హారం / గుట్టపూసలు)</option>
                              <option value="Choker & Short Necklace">Choker & Short Necklace (కంఠాభరణం / చోకర్)</option>
                              <option value="Vaddanam & Waist Belt">Vaddanam & Waist Belt (వడ్డాణం)</option>
                              <option value="Jhumkas & Earrings">Jhumkas & Earrings (బుట్టలు / జుంకీలు)</option>
                              <option value="Bangles & Kadas">Bangles & Kadas (గాజులు / కంకణాలు)</option>
                              <option value="Maang Tikka & Vanki">Maang Tikka & Vanki (పాపిడి బిళ్ళ / వంకీ)</option>
                              <option value="Complete Bridal Set">Complete Bridal Set (సంపూర్ణ పెళ్ళి సెట్)</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-bold text-[#2A1E17] block mb-1">
                              Gold Plating & Finish (One Gram Gold) *
                            </label>
                            <select
                              value={editingSaree.goldPurity || '1-Gram Gold Plated (One Gram Gold)'}
                              onChange={(e) => setEditingSaree({ ...editingSaree, goldPurity: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515] bg-white font-medium"
                            >
                              <option value="1-Gram Gold Plated (One Gram Gold)">1-Gram Gold Plated (One Gram Gold)</option>
                              <option value="Micro Gold Electroplated (Antique Matte)">Micro Gold Electroplated (Antique Matte)</option>
                              <option value="High-Lustre 1-Gram Yellow Gold Finish">High-Lustre 1-Gram Yellow Gold Finish</option>
                              <option value="Dual-Tone 1-Gram Gold & Silver Plated">Dual-Tone 1-Gram Gold & Silver Plated</option>
                            </select>
                            <span className="text-[10px] text-[#996515] block mt-0.5 font-medium">
                              ⚠️ Note: This is One Gram Gold micro-electroplated temple jewelry (copper/brass core, NOT solid gold).
                            </span>
                          </div>

                          <div>
                            <label className="font-bold text-[#2A1E17] block mb-1">Gemstones & Pearls</label>
                            <input
                              type="text"
                              value={editingSaree.gemstones || ''}
                              onChange={(e) => setEditingSaree({ ...editingSaree, gemstones: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515]"
                              placeholder="e.g. Kempu Rubies, Emeralds & Basara Pearls"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-[#2A1E17] block mb-1">Jewelry Craft Motif / Workmanship</label>
                            <select
                              value={editingSaree.weave}
                              onChange={(e: any) => setEditingSaree({ ...editingSaree, weave: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515] bg-white font-medium"
                            >
                              <option value="Temple Nakshi Jewellery">Temple Nakshi Jewellery (నగిషీ కళ)</option>
                              <option value="Guttapusalu Cluster Pearls">Guttapusalu Cluster Pearls (గుట్టపూసలు)</option>
                              <option value="Double Ikkat Weave">Kasu Mala Coins (కాసుల పేరు)</option>
                              <option value="Kadwa Weave">Kundan & Polki Work (కుందన్)</option>
                              <option value="Zari Brocade">Filigree Heritage Work (జాలీ పని)</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-bold text-[#2A1E17] block mb-1">Artisan Origin / Hub *</label>
                            <input
                              type="text"
                              value={editingSaree.origin}
                              onChange={(e) => setEditingSaree({ ...editingSaree, origin: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515]"
                              placeholder="e.g. Hyderabad Old City, Telangana"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-[#2A1E17] block mb-1">State / Region Target</label>
                            <select
                              value={editingSaree.stateRegion}
                              onChange={(e: any) => setEditingSaree({ ...editingSaree, stateRegion: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515] bg-white"
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
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515]"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-[#2A1E17] block mb-1">Original MSRP (₹ INR)</label>
                            <input
                              type="number"
                              value={editingSaree.originalPrice}
                              onChange={(e) => setEditingSaree({ ...editingSaree, originalPrice: Number(e.target.value) })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515]"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-[#2A1E17] block mb-1">Auspicious Occasion</label>
                            <select
                              value={editingSaree.occasion}
                              onChange={(e: any) => setEditingSaree({ ...editingSaree, occasion: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515] bg-white font-medium"
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
                            <label className="font-bold text-[#2A1E17] block mb-1">Gross Weight</label>
                            <input
                              type="text"
                              value={editingSaree.weight}
                              onChange={(e) => setEditingSaree({ ...editingSaree, weight: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515]"
                              placeholder="e.g. 85 grams (approx)"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-[#2A1E17] block mb-1">Dimensions / Length</label>
                            <input
                              type="text"
                              value={editingSaree.length}
                              onChange={(e) => setEditingSaree({ ...editingSaree, length: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515]"
                              placeholder="e.g. 24 inches necklace + adjustable chain extender"
                            />
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
                                  className="accent-[#996515]"
                                />
                                <span>Ready in Stock</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="inStock"
                                  checked={editingSaree.inStock === false}
                                  onChange={() => setEditingSaree({ ...editingSaree, inStock: false })}
                                  className="accent-[#996515]"
                                />
                                <span>Out of Stock</span>
                              </label>
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="font-bold text-[#2A1E17] block mb-1">
                              Fastening Chain & Packaging Box
                            </label>
                            <input
                              type="text"
                              value={editingSaree.blouseDetails}
                              onChange={(e) => setEditingSaree({ ...editingSaree, blouseDetails: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515]"
                              placeholder="e.g. Includes 3-inch 1-gram gold plated link chain extender & luxury velvet jewelry box."
                            />
                          </div>

                          {/* Assign to Collections */}
                          <div className="sm:col-span-2">
                            <label className="font-bold text-[#2A1E17] block mb-1">
                              Assign to Collections & Jewelry Sets
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
                                      className="accent-[#996515] rounded-sm"
                                    />
                                    <span className="truncate">{col.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Photos and AI Studio */}
                          <div className="sm:col-span-2">
                            <label className="font-bold text-[#2A1E17] block mb-1">
                              Ornament Photos & AI Model Studio
                            </label>
                            <AiImageStudioUploader
                              currentImageUrl={editingSaree.images[0] || ''}
                              modelImageUrl={editingSaree.aiModelImage || ''}
                              sareeName={editingSaree.name}
                              fabric="One Gram Gold"
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
                            <label className="font-bold text-[#2A1E17] block mb-1">Description & Craft Lore</label>
                            <textarea
                              rows={3}
                              value={editingSaree.description}
                              onChange={(e) => setEditingSaree({ ...editingSaree, description: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="font-bold text-[#2A1E17] block mb-1">Jewelry Care & Preservation Instructions</label>
                            <input
                              type="text"
                              value={editingSaree.care}
                              onChange={(e) => setEditingSaree({ ...editingSaree, care: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#996515]"
                              placeholder="e.g. Avoid direct contact with water, perfumes, and sprays. Store in airtight velvet box. Wipe with dry cotton cloth."
                            />
                          </div>
                        </div>
                      ) : (
                        /* ========================================================
                           HANDLOOM SAREE SPECIFICATIONS
                           ======================================================== */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-bold text-[#2A1E17] block">Saree Name (English) *</label>
                              <span className="text-[10px] text-[#821D24] font-semibold">Type in English</span>
                            </div>
                            <input
                              type="text"
                              required
                              value={editingSaree.name}
                              onChange={(e) => handleEnglishNameChange(e.target.value, 'saree')}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                              placeholder="e.g. Pochampally Double Ikkat Silk"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-bold text-[#2A1E17] flex items-center gap-1.5">
                                <Languages className="w-3.5 h-3.5 text-[#821D24]" />
                                <span>Telugu Script Name (తెలుగు పేరు)</span>
                              </label>
                              <div className="flex items-center gap-2">
                                {isTranslatingTelugu && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-[#821D24] font-semibold animate-pulse">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Translating...
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setAutoTranslateTelugu(!autoTranslateTelugu)}
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    autoTranslateTelugu
                                      ? 'bg-[#FAF2E8] text-[#821D24] border border-[#DECFBE] shadow-2xs'
                                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                                  }`}
                                  title="Toggle automatic conversion to Telugu as you type in English"
                                >
                                  <Sparkles className="w-2.5 h-2.5 text-[#B8860B]" />
                                  <span>Auto: {autoTranslateTelugu ? 'ON' : 'OFF'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleManualTranslate('saree')}
                                  className="text-[10px] text-[#821D24] hover:underline font-bold cursor-pointer"
                                  title="Convert English to Telugu now"
                                >
                                  ⚡ Convert
                                </button>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={editingSaree.teluguName || ''}
                              onChange={(e) => setEditingSaree({ ...editingSaree, teluguName: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                              placeholder="e.g. పోచంపల్లి ఇక్కత్ పట్టు చీర"
                            />
                            {teluguSuggestions.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span className="text-[10px] text-[#7A6757] font-semibold flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5 text-[#B8860B]" /> Suggestions:
                                </span>
                                {teluguSuggestions.map((sug, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setEditingSaree({ ...editingSaree, teluguName: sug })}
                                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer border ${
                                      editingSaree.teluguName === sug
                                        ? 'bg-[#821D24] text-white border-[#821D24] shadow-2xs'
                                        : 'bg-[#FAF2E8] hover:bg-[#821D24] text-[#821D24] hover:text-white border-[#DECFBE]'
                                    }`}
                                  >
                                    {sug}
                                  </button>
                                ))}
                              </div>
                            )}
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
                            <label className="font-bold text-[#2A1E17] block mb-1">Fabric Cluster *</label>
                            <select
                              value={editingSaree.fabric}
                              onChange={(e: any) => setEditingSaree({ ...editingSaree, fabric: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24] bg-white font-medium"
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
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24] bg-white font-medium"
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
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24] bg-white font-medium"
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
                            <label className="font-bold text-[#2A1E17] block mb-1">Weave Type</label>
                            <select
                              value={editingSaree.weave}
                              onChange={(e: any) => setEditingSaree({ ...editingSaree, weave: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24] bg-white font-medium"
                            >
                              <option value="Double Ikkat Weave">Double Ikkat Weave</option>
                              <option value="Kuttu Contrast Border">Kuttu Contrast Border</option>
                              <option value="Jamdani Zari Weave">Jamdani Zari Weave</option>
                              <option value="Broad Temple Border">Broad Temple Border</option>
                              <option value="Nizam Zari Border">Nizam Zari Border</option>
                              <option value="Kadwa Weave">Kadwa Weave</option>
                              <option value="Korvai Border">Korvai Border</option>
                              <option value="Zari Brocade">Zari Brocade</option>
                              <option value="Hand Painted Kalamkari">Hand Painted Kalamkari</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-bold text-[#2A1E17] block mb-1">Zari Embellishment</label>
                            <select
                              value={editingSaree.zariType}
                              onChange={(e: any) => setEditingSaree({ ...editingSaree, zariType: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24] bg-white font-medium"
                            >
                              <option value="Pure Gold Zari">Pure Gold Zari</option>
                              <option value="Tested Fine Zari">Tested Fine Zari</option>
                              <option value="Silver Resham Zari">Silver Resham Zari</option>
                              <option value="Antique Zari">Antique Zari</option>
                              <option value="One Gram Gold Real Zari">One Gram Gold Real Zari</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-bold text-[#2A1E17] block mb-1">Silk Mark Certification</label>
                            <div className="flex items-center gap-4 mt-2">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="isSilkMarkCertified"
                                  checked={editingSaree.isSilkMarkCertified === true}
                                  onChange={() => setEditingSaree({ ...editingSaree, isSilkMarkCertified: true })}
                                  className="accent-[#821D24]"
                                />
                                <span>Certified 100% Pure Silk</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="isSilkMarkCertified"
                                  checked={editingSaree.isSilkMarkCertified === false}
                                  onChange={() => setEditingSaree({ ...editingSaree, isSilkMarkCertified: false })}
                                  className="accent-[#821D24]"
                                />
                                <span>Standard Handloom</span>
                              </label>
                            </div>
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

                          <div className="sm:col-span-2">
                            <label className="font-bold text-[#2A1E17] block mb-1">Blouse Specifications</label>
                            <input
                              type="text"
                              value={editingSaree.blouseDetails}
                              onChange={(e) => setEditingSaree({ ...editingSaree, blouseDetails: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-[#D5C5B2] focus:outline-hidden focus:border-[#821D24]"
                              placeholder="e.g. Unstitched contrast silk blouse piece included (0.8m)."
                            />
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
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8DFD1]">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 rounded-xl border border-[#D5C5B2] text-xs font-bold text-[#4A3B32] hover:bg-[#FAF8F5] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`px-6 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                        editingSaree?.productType === 'ornament'
                          ? 'bg-gradient-to-r from-[#996515] to-[#B8860B] hover:brightness-110'
                          : 'bg-[#821D24] hover:bg-[#68141A]'
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      <span>
                        {isSaving 
                          ? 'Syncing to Firestore...' 
                          : editingSaree?.productType === 'ornament' 
                            ? 'Save & Publish 1-Gram Gold Ornament' 
                            : 'Save & Publish Saree'}
                      </span>
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
