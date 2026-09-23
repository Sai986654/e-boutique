import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  deleteDoc,
  updateDoc,
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Saree, Order, BoutiqueSettings, SareeReview, SareeCollection } from '../types';
import { SAREES_DATA, INITIAL_COLLECTIONS } from '../data/sareesData';
import { getInitialReviewsForSaree } from '../data/initialReviews';

const SAREES_COLLECTION = 'sarees';
const ORDERS_COLLECTION = 'orders';
const SETTINGS_COLLECTION = 'settings';
const REVIEWS_COLLECTION = 'reviews';
const COLLECTIONS_COLLECTION = 'collections';
const SETTINGS_DOC_ID = 'global_config';

export const DEFAULT_BOUTIQUE_SETTINGS: BoutiqueSettings = {
  announcementText: 'Andhra Pradesh & Telangana Exclusive: Authentic Weaver-Direct Handlooms • Free Fall & Pico • 24–48h Express Delivery Across All Districts!',
  promoCode: 'UTSAV15',
  promoDiscountPercent: 15,
  expressDeliveryHours: '24–48h',
  freeTailoringActive: true,
  contactWhatsApp: '+91 98480 22338',
  contactPhone: '+91 98480 22338'
};

/**
 * Seed initial Telugu sarees catalog into Firestore if collection is empty
 */
export async function seedSareesCatalogIfEmpty(): Promise<Saree[]> {
  try {
    const snapshot = await getDocs(collection(db, SAREES_COLLECTION));
    if (!snapshot.empty) {
      const liveSarees = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Saree));
      return liveSarees;
    }

    // Collection is empty, write initial master data using batch
    const batch = writeBatch(db);
    for (const saree of SAREES_DATA) {
      const docRef = doc(db, SAREES_COLLECTION, saree.id);
      batch.set(docRef, saree);
    }
    // Also initialize default settings
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    batch.set(settingsRef, DEFAULT_BOUTIQUE_SETTINGS);

    await batch.commit();
    return SAREES_DATA;
  } catch (error) {
    console.warn('Firestore seed warning, falling back to local dataset:', error);
    return SAREES_DATA;
  }
}

/**
 * Real-time listener for Saree catalog changes in Firestore
 */
export function subscribeToSarees(onUpdate: (sarees: Saree[]) => void, onError?: (err: any) => void) {
  try {
    const unsub = onSnapshot(
      collection(db, SAREES_COLLECTION),
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(SAREES_DATA);
        } else {
          const list = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Saree));
          onUpdate(list);
        }
      },
      (error) => {
        console.warn('Live saree subscribe error:', error);
        if (onError) onError(error);
      }
    );
    return unsub;
  } catch (e) {
    console.warn('Failed to subscribe to sarees:', e);
    return () => {};
  }
}

/**
 * Add or Update a Saree in Firestore (Admin feature)
 */
export async function upsertSareeInFirestore(saree: Saree): Promise<boolean> {
  try {
    const sareeDocRef = doc(db, SAREES_COLLECTION, saree.id);
    await setDoc(sareeDocRef, {
      ...saree,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving saree to Firestore:', err);
    return false;
  }
}

/**
 * Delete a Saree from Firestore (Admin feature)
 */
export async function deleteSareeFromFirestore(sareeId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, SAREES_COLLECTION, sareeId));
    return true;
  } catch (err) {
    console.error('Error deleting saree from Firestore:', err);
    return false;
  }
}

/**
 * Save new customer order into Firestore live database
 */
export async function saveOrderToFirestore(order: Order): Promise<boolean> {
  try {
    const orderDocRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(orderDocRef, {
      ...order,
      createdAtFirestore: serverTimestamp(),
      syncedWithDatabase: true,
      regionTarget: 'AP & Telangana Express',
    });
    return true;
  } catch (error) {
    console.error('Error saving order to Firestore:', error);
    return false;
  }
}

/**
 * Update Order status in Firestore (Admin feature)
 */
export async function updateOrderStatusInFirestore(orderId: string, status: Order['status'], trackingNumber?: string): Promise<boolean> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const updateData: Record<string, any> = {
      status,
      lastUpdated: serverTimestamp()
    };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    await updateDoc(orderRef, updateData);
    return true;
  } catch (err) {
    console.error('Error updating order status:', err);
    return false;
  }
}

/**
 * Real-time listener for Orders in Firestore
 */
export function subscribeToOrders(onUpdate: (orders: Order[]) => void) {
  try {
    const unsub = onSnapshot(
      collection(db, ORDERS_COLLECTION),
      (snapshot) => {
        const orderList = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Order));
        orderList.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        onUpdate(orderList);
      },
      (err) => {
        console.warn('Live order subscribe error:', err);
      }
    );
    return unsub;
  } catch (e) {
    console.warn('Failed to subscribe to orders:', e);
    return () => {};
  }
}

/**
 * Real-time listener for Boutique Settings
 */
export function subscribeToSettings(onUpdate: (settings: BoutiqueSettings) => void) {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const unsub = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as BoutiqueSettings);
      } else {
        onUpdate(DEFAULT_BOUTIQUE_SETTINGS);
      }
    });
    return unsub;
  } catch (err) {
    console.warn('Failed to subscribe to settings:', err);
    return () => {};
  }
}

/**
 * Update Boutique Settings in Firestore (Admin feature)
 */
export async function updateBoutiqueSettingsInFirestore(settings: Partial<BoutiqueSettings>): Promise<boolean> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(docRef, settings, { merge: true });
    return true;
  } catch (err) {
    console.error('Error updating boutique settings:', err);
    return false;
  }
}

/**
 * Save customer inquiry or bespoke loom request
 */
export async function saveInquiryToFirestore(inquiry: {
  name: string;
  phone: string;
  city: string;
  state: string;
  notes: string;
}) {
  try {
    await addDoc(collection(db, 'inquiries'), {
      ...inquiry,
      timestamp: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error('Error saving inquiry:', err);
    return false;
  }
}

/**
 * Fetch a customer order by its Order ID from Firestore
 */
export async function fetchOrderByIdFromFirestore(orderIdInput: string): Promise<Order | null> {
  const cleanId = orderIdInput.trim();
  if (!cleanId) return null;

  try {
    // 1. Direct document lookup by ID
    const directDocRef = doc(db, ORDERS_COLLECTION, cleanId);
    const directSnap = await getDoc(directDocRef);
    if (directSnap.exists()) {
      return { ...directSnap.data(), id: directSnap.id } as Order;
    }

    // 2. Direct document lookup with uppercase (e.g. ord-1234 -> ORD-1234)
    if (cleanId.toUpperCase() !== cleanId) {
      const upperDocRef = doc(db, ORDERS_COLLECTION, cleanId.toUpperCase());
      const upperSnap = await getDoc(upperDocRef);
      if (upperSnap.exists()) {
        return { ...upperSnap.data(), id: upperSnap.id } as Order;
      }
    }

    // 3. Query by 'id' property if document ID was auto-generated
    const q1 = query(collection(db, ORDERS_COLLECTION), where('id', '==', cleanId));
    const snap1 = await getDocs(q1);
    if (!snap1.empty) {
      const docData = snap1.docs[0];
      return { ...docData.data(), id: docData.id } as Order;
    }

    // 4. Query with uppercase id
    const q2 = query(collection(db, ORDERS_COLLECTION), where('id', '==', cleanId.toUpperCase()));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      const docData = snap2.docs[0];
      return { ...docData.data(), id: docData.id } as Order;
    }

    // 5. Query by trackingNumber (AWB) in case the user pasted the AWB courier number!
    const q3 = query(collection(db, ORDERS_COLLECTION), where('trackingNumber', '==', cleanId));
    const snap3 = await getDocs(q3);
    if (!snap3.empty) {
      const docData = snap3.docs[0];
      return { ...docData.data(), id: docData.id } as Order;
    }

    return null;
  } catch (error) {
    console.error('Error fetching order by ID from Firestore:', error);
    throw error;
  }
}

/**
 * Real-time listener for customer reviews of a specific saree.
 * Combines Firestore documents with initial curated seed reviews
 * and local storage fallback for instantaneous rendering.
 */
export function subscribeToSareeReviews(
  sareeId: string,
  onUpdate: (reviews: SareeReview[]) => void,
  onError?: (err: any) => void
) {
  const initialCurated = getInitialReviewsForSaree(sareeId);

  // Load any locally cached reviews for this saree
  let localReviews: SareeReview[] = [];
  try {
    const raw = localStorage.getItem(`virasat_reviews_${sareeId}`);
    if (raw) {
      localReviews = JSON.parse(raw);
    }
  } catch {
    localReviews = [];
  }

  // Merge initial and local reviews
  const mergeReviews = (firestoreList: SareeReview[]): SareeReview[] => {
    const map = new Map<string, SareeReview>();

    // 1. Initial curated seed reviews
    initialCurated.forEach((r) => map.set(r.id, r));

    // 2. Locally cached reviews
    localReviews.forEach((r) => map.set(r.id, r));

    // 3. Firestore live reviews (authoritative)
    firestoreList.forEach((r) => map.set(r.id, r));

    const combined = Array.from(map.values());
    // Sort newest first
    combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return combined;
  };

  // Provide initial sync right away
  onUpdate(mergeReviews([]));

  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('sareeId', '==', sareeId)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const liveList = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        })) as SareeReview[];

        onUpdate(mergeReviews(liveList));
      },
      (err) => {
        console.warn('Reviews subscription error, falling back to local dataset:', err);
        if (onError) onError(err);
      }
    );

    return unsub;
  } catch (err) {
    console.warn('Failed to subscribe to reviews:', err);
    return () => {};
  }
}

/**
 * Submit a customer review and update the saree's aggregate rating & reviewCount
 */
export async function addReviewToFirestore(
  reviewData: Omit<SareeReview, 'id' | 'createdAt'>
): Promise<SareeReview> {
  const newReview: SareeReview = {
    ...reviewData,
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    verifiedPurchase: true,
  };

  // 1. Optimistically store in localStorage
  try {
    const storageKey = `virasat_reviews_${reviewData.sareeId}`;
    const raw = localStorage.getItem(storageKey);
    const existing: SareeReview[] = raw ? JSON.parse(raw) : [];
    existing.unshift(newReview);
    localStorage.setItem(storageKey, JSON.stringify(existing));
  } catch (e) {
    console.warn('Local review cache warning:', e);
  }

  // 2. Save document to Firestore
  try {
    const reviewDocRef = doc(db, REVIEWS_COLLECTION, newReview.id);
    await setDoc(reviewDocRef, {
      ...newReview,
      timestamp: serverTimestamp(),
    });

    // 3. Update the Saree's aggregate rating and reviewCount in Firestore
    try {
      const sareeDocRef = doc(db, SAREES_COLLECTION, reviewData.sareeId);
      const sareeSnap = await getDoc(sareeDocRef);
      if (sareeSnap.exists()) {
        const data = sareeSnap.data() as Saree;
        const currentCount = data.reviewCount || 1;
        const currentRating = data.rating || 5.0;
        const newCount = currentCount + 1;
        const newRating = Number(((currentRating * currentCount + reviewData.rating) / newCount).toFixed(1));

        await updateDoc(sareeDocRef, {
          rating: newRating,
          reviewCount: newCount,
        });
      }
    } catch (e) {
      console.warn('Saree rating aggregate update non-fatal:', e);
    }
  } catch (err) {
    console.warn('Firestore review creation warning (saved locally):', err);
  }

  return newReview;
}

/**
 * Seed initial Collections into Firestore if collection is empty
 */
export async function seedCollectionsIfEmpty(): Promise<SareeCollection[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS_COLLECTION));
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as SareeCollection));
    }

    const batch = writeBatch(db);
    for (const col of INITIAL_COLLECTIONS) {
      const docRef = doc(db, COLLECTIONS_COLLECTION, col.id);
      batch.set(docRef, col);
    }
    await batch.commit();
    return INITIAL_COLLECTIONS;
  } catch (error) {
    console.warn('Collections seed warning, using local presets:', error);
    return INITIAL_COLLECTIONS;
  }
}

/**
 * Real-time listener for Collections in Firestore
 */
export function subscribeToCollections(
  onUpdate: (collections: SareeCollection[]) => void,
  onError?: (err: any) => void
) {
  try {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS_COLLECTION),
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(INITIAL_COLLECTIONS);
        } else {
          const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as SareeCollection));
          onUpdate(list);
        }
      },
      (error) => {
        console.warn('Live collections subscribe error:', error);
        if (onError) onError(error);
      }
    );
    return unsub;
  } catch (e) {
    console.warn('Failed to subscribe to collections:', e);
    return () => {};
  }
}

/**
 * Add or Update a Collection in Firestore (Admin feature)
 */
export async function upsertCollectionInFirestore(col: SareeCollection): Promise<boolean> {
  try {
    const colDocRef = doc(db, COLLECTIONS_COLLECTION, col.id);
    await setDoc(colDocRef, {
      ...col,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving collection to Firestore:', err);
    return false;
  }
}

/**
 * Delete a Collection from Firestore (Admin feature)
 */
export async function deleteCollectionFromFirestore(collectionId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTIONS_COLLECTION, collectionId));
    return true;
  } catch (err) {
    console.error('Error deleting collection from Firestore:', err);
    return false;
  }
}


