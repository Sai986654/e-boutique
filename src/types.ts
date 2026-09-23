export type ProductDepartment = 'all' | 'sarees' | 'ornaments';

export type FabricType = 
  | 'Pochampally Ikkat'
  | 'Gadwal Silk'
  | 'Uppada Jamdani'
  | 'Dharmavaram Silk'
  | 'Mangalagiri Cotton Silk'
  | 'Narayanpet Handloom'
  | 'Venkatagiri Silk'
  | 'One Gram Gold Zari'
  | 'One Gram Gold Ornaments'
  | 'Kanjeevaram Silk' 
  | 'Katan Silk' 
  | 'Organza Silk' 
  | 'Chanderi' 
  | 'Tussar Silk' 
  | 'Georgette' 
  | 'Tissue Silk'
  | 'Linen Silk';

export type OccasionType = 
  | 'Bridal & Pelli' 
  | 'Sreemantham & Seemantham'
  | 'Ugadi & Sankranti Festive' 
  | 'Varalakshmi Vratam & Puja' 
  | 'Reception & Cocktail' 
  | 'Sangeet & Mehendi' 
  | 'Office & Daily Grace';

export type WeaveType = 
  | 'Double Ikkat Weave'
  | 'Kuttu Contrast Border'
  | 'Jamdani Zari Weave'
  | 'Broad Temple Border'
  | 'Nizam Zari Border'
  | 'Temple Nakshi Jewellery'
  | 'Guttapusalu Cluster Pearls'
  | 'Kadwa Weave' 
  | 'Korvai Border' 
  | 'Zari Brocade' 
  | 'Hand Painted Kalamkari'
  | 'Meenakari';

export type Telugustate = 'Andhra Pradesh' | 'Telangana';
export type TeluguState = Telugustate;

export type CollectionCategory = 'weave' | 'occasion' | 'curated' | 'region';

export interface SareeCollection {
  id: string;
  name: string;
  teluguName?: string;
  slug: string;
  description: string;
  coverImage: string;
  featured: boolean;
  category: CollectionCategory;
  filterTag: string;
  bannerTagline?: string;
  accentColor?: string;
}

export interface AiModelDrapeOption {
  id: string;
  name: string;
  description: string;
  setting: string;
  jewelryStyle: string;
  drapeStyle: string;
  previewThumbnail: string;
}

export interface Saree {
  id: string;
  name: string;
  subtitle: string;
  teluguName?: string;
  productType?: 'saree' | 'ornament';
  ornamentType?: 
    | 'Haram & Long Necklace'
    | 'Choker & Short Necklace'
    | 'Vaddanam & Waist Belt'
    | 'Jhumkas & Earrings'
    | 'Bangles & Kadas'
    | 'Maang Tikka & Vanki'
    | 'Complete Bridal Set';
  goldPurity?: string;
  gemstones?: string;
  fabric: FabricType;
  weave: WeaveType;
  origin: string; // e.g., 'Pochampally, Yadadri Bhuvanagiri, Telangana'
  stateRegion: Telugustate | 'South India Heritage';
  district?: string;
  occasion: OccasionType;
  color: string;
  colorHex: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  images: string[];
  tags: string[];
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isSilkMarkCertified: boolean;
  blouseIncluded: boolean;
  blouseDetails: string;
  zariType: 'Pure Gold Zari' | 'Tested Fine Zari' | 'Silver Resham Zari' | 'Antique Zari' | 'Antique Antique Zari' | 'One Gram Gold Real Zari';
  care: string;
  description: string;
  length: string;
  weight: string;
  inStock: boolean;
  savedAtPrice?: number;
  savedAtDate?: string;
  previousPrice?: number;
  collectionIds?: string[];
  aiModelImage?: string;
  updatedAt?: any;
}

export interface WishlistPriceDrop {
  sareeId: string;
  saree: Saree;
  savedAtPrice: number;
  currentPrice: number;
  dropAmount: number;
  percentageDrop: number;
}

export interface SareeReview {
  id: string;
  sareeId: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  city?: string;
  createdAt: string; // ISO date string
  verifiedPurchase?: boolean;
}

export type BlouseOption = 'unstitched' | 'standard-stitched' | 'custom-tailored';

export interface BlouseMeasurement {
  bust: string;
  waist: string;
  blouseLength: string;
  sleeveLength: string;
  neckStyle: 'Round Deep' | 'Sweetheart' | 'V-Neck' | 'Boat Neck' | 'High Collar' | 'Traditional Telugu Square Neck';
}

export interface CartItem {
  id: string;
  saree: Saree;
  quantity: number;
  fallAndPico: boolean;
  blouseOption: BlouseOption;
  blouseMeasurements?: BlouseMeasurement;
  petticoatAddon: boolean;
  unitPrice: number;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  district?: string;
  state: 'Andhra Pradesh' | 'Telangana';
  pincode: string;
  deliveryLandmark?: string;
}

export interface Order {
  id: string;
  orderDate: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: string;
  customer: CustomerInfo;
  paymentMethod: 'upi' | 'card' | 'cod' | 'netbanking';
  status: 'Order Placed' | 'Loom Sourcing & QC' | 'Fall & Pico Finishing' | 'Dispatched' | 'Delivered';
  estimatedDelivery: string;
  trackingNumber: string;
  source?: 'online-store';
  createdAtFirestore?: any;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rateFromINR: number;
}

export interface BoutiqueSettings {
  announcementText: string;
  promoCode: string;
  promoDiscountPercent: number;
  expressDeliveryHours: string;
  freeTailoringActive: boolean;
  contactWhatsApp: string;
  contactPhone: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'superadmin' | 'store_manager';
}

