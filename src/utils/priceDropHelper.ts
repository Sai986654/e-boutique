import { Saree, WishlistPriceDrop } from '../types';

/**
 * Checks for price drops between items stored in the user's wishlist
 * and the latest live catalog prices from Firestore.
 */
export function checkWishlistPriceDrops(
  wishlist: Saree[],
  catalog: Saree[]
): WishlistPriceDrop[] {
  if (!wishlist || wishlist.length === 0) return [];

  const priceDrops: WishlistPriceDrop[] = [];

  for (const wishItem of wishlist) {
    // Find the latest live catalog version of this saree
    const liveItem = catalog.find((c) => c.id === wishItem.id) || wishItem;

    // Benchmark price: what the saree was priced at when saved or prior price
    const savedPrice = wishItem.savedAtPrice ?? wishItem.price;
    const currentPrice = liveItem.price;

    if (currentPrice < savedPrice) {
      const dropAmount = savedPrice - currentPrice;
      const percentageDrop = Math.round((dropAmount / savedPrice) * 100);

      priceDrops.push({
        sareeId: wishItem.id,
        saree: {
          ...liveItem,
          savedAtPrice: savedPrice,
        },
        savedAtPrice: savedPrice,
        currentPrice,
        dropAmount,
        percentageDrop,
      });
    }
  }

  return priceDrops;
}

/**
 * Calculates total savings across all price-dropped wishlist items
 */
export function calculateWishlistTotalSavings(priceDrops: WishlistPriceDrop[]): number {
  return priceDrops.reduce((sum, drop) => sum + drop.dropAmount, 0);
}
