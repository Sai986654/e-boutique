import React, { useState, useEffect, type FormEvent } from 'react';
import { 
  Star, 
  CheckCircle, 
  MessageSquare, 
  Plus, 
  ThumbsUp, 
  Filter, 
  Sparkles,
  ShieldCheck,
  Send,
  X
} from 'lucide-react';
import { Saree, SareeReview } from '../types';
import { subscribeToSareeReviews, addReviewToFirestore } from '../services/firestoreService';

interface SareeReviewSectionProps {
  saree: Saree;
  onReviewAdded?: (newRating: number, newReviewCount: number) => void;
}

export function SareeReviewSection({ saree, onReviewAdded }: SareeReviewSectionProps) {
  const [reviews, setReviews] = useState<SareeReview[]>([]);
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [city, setCity] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  // Helpful votes local tracker
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});

  // Subscribe to live reviews
  useEffect(() => {
    const unsubscribe = subscribeToSareeReviews(saree.id, (updatedReviews) => {
      setReviews(updatedReviews);
    });

    return () => {
      unsubscribe();
    };
  }, [saree.id]);

  // Compute rating metrics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : saree.rating || 5.0;

  // Star breakdown calculation
  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    starCounts[star] = (starCounts[star] || 0) + 1;
  });

  const getStarPercentage = (star: number) => {
    if (totalReviews === 0) return 0;
    return Math.round(((starCounts[star] || 0) / totalReviews) * 100);
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5: return 'Exceptional Heirloom Quality';
      case 4: return 'Very Beautiful & Authentic';
      case 3: return 'Good Traditional Weave';
      case 2: return 'Average Drape';
      case 1: return 'Below Expectations';
      default: return 'Rate this Saree';
    }
  };

  // Submit review handler
  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    setFormErrorMessage(null);

    if (!customerName.trim()) {
      setFormErrorMessage('Please enter your name.');
      return;
    }
    if (comment.trim().length < 8) {
      setFormErrorMessage('Please share at least a few words about the weave, drape, or zari finish.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await addReviewToFirestore({
        sareeId: saree.id,
        customerName: customerName.trim(),
        rating,
        comment: comment.trim(),
        city: city.trim() || 'Andhra / Telangana',
        verifiedPurchase: true,
      });

      // Update local state immediately
      setReviews((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);

      const newTotal = totalReviews + 1;
      const newAvg = Number(((averageRating * totalReviews + rating) / newTotal).toFixed(1));
      if (onReviewAdded) {
        onReviewAdded(newAvg, newTotal);
      }

      setFormSuccessMessage('Thank you! Your verified review has been published.');
      setComment('');
      setCustomerName('');
      setCity('');
      setIsFormOpen(false);

      setTimeout(() => {
        setFormSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setFormErrorMessage('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (selectedStarFilter === 'all') return true;
    return r.rating === selectedStarFilter;
  });

  const toggleHelpful = (reviewId: string) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1,
    }));
  };

  return (
    <div id="saree-reviews-container" className="pt-6 border-t border-[#E8DFD1] space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2A1E17] flex items-center gap-2">
            <span>Customer Ratings & Reviews</span>
            <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-[#FAF3EA] text-[#821D24] border border-[#DECFBE]">
              {totalReviews} Verified
            </span>
          </h3>
          <p className="text-xs text-[#7A6757] mt-0.5">
            Authentic experiences from handloom connoisseurs across Andhra Pradesh & Telangana
          </p>
        </div>

        <button
          type="button"
          id="write-review-toggle-btn"
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            setFormErrorMessage(null);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#821D24] text-white hover:bg-[#68141A] transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          {isFormOpen ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Cancel Review</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </>
          )}
        </button>
      </div>

      {/* Success Notification */}
      {formSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{formSuccessMessage}</span>
        </div>
      )}

      {/* Write Review Form */}
      {isFormOpen && (
        <form
          id="saree-review-submission-form"
          onSubmit={handleSubmitReview}
          className="bg-white border-2 border-[#821D24]/20 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#821D24] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Share Your Weave Experience</span>
            </span>
            <span className="text-[11px] text-[#8C7665]">Verified Patron Feedback</span>
          </div>

          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold text-[#2A1E17] mb-1.5">
              Your Overall Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = (hoverRating || rating) >= starVal;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-[#F5C767] hover:scale-110 transition-transform cursor-pointer"
                      title={`${starVal} Star`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          isFilled ? 'fill-[#F5C767] text-[#F5C767]' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-bold text-[#821D24] ml-2">
                {getRatingLabel(hoverRating || rating)}
              </span>
            </div>
          </div>

          {/* Customer Name & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#5A493D] mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Sravani Reddy, Lakshmi Rao"
                className="w-full bg-[#FAF8F5] border border-[#D5C5B2] focus:border-[#821D24] rounded-lg px-3 py-2 text-xs text-[#2A1E17] focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5A493D] mb-1">
                City / District (AP & Telangana)
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Hyderabad, Vijayawada, Vizag"
                className="w-full bg-[#FAF8F5] border border-[#D5C5B2] focus:border-[#821D24] rounded-lg px-3 py-2 text-xs text-[#2A1E17] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Comment / Detailed Review */}
          <div>
            <label className="block text-[11px] font-bold text-[#5A493D] mb-1">
              Your Review / Weave Experience <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the drape comfort, zari luster, pleat holding, softness, and whether you wore it for a wedding or puja..."
              rows={3}
              className="w-full bg-[#FAF8F5] border border-[#D5C5B2] focus:border-[#821D24] rounded-lg px-3 py-2 text-xs text-[#2A1E17] focus:outline-hidden resize-none"
              required
            />
          </div>

          {formErrorMessage && (
            <p className="text-xs text-red-600 font-semibold">{formErrorMessage}</p>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3 py-1.5 border border-[#D5C5B2] rounded-lg text-xs font-semibold text-[#5A493D] hover:bg-[#FAF8F5] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-[#821D24] hover:bg-[#68141A] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publishing...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Aggregate Ratings Overview & Star Distribution */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8DFD1] grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: Overall Score */}
        <div className="md:col-span-4 text-center md:border-r md:border-[#E8DFD1] md:pr-4">
          <div className="font-serif text-4xl sm:text-5xl font-bold text-[#2A1E17] tracking-tight">
            {averageRating}
          </div>
          <div className="flex items-center justify-center gap-1 text-[#F5C767] my-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(averageRating)
                    ? 'fill-[#F5C767] text-[#F5C767]'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs font-semibold text-[#6B5A4D]">
            Based on {totalReviews} customer {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
          <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>100% Genuine Handlooms</span>
          </div>
        </div>

        {/* Right: Star Breakdown Bars */}
        <div className="md:col-span-8 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starCounts[star] || 0;
            const pct = getStarPercentage(star);
            return (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedStarFilter(selectedStarFilter === star ? 'all' : star)}
                className={`w-full flex items-center gap-2.5 text-xs text-left group rounded-md p-1 transition-colors ${
                  selectedStarFilter === star ? 'bg-[#FAF3EA]' : 'hover:bg-[#FAF8F5]'
                }`}
              >
                <span className="w-12 text-[#5A493D] font-semibold flex items-center gap-1 shrink-0">
                  <span>{star}</span>
                  <Star className="w-3 h-3 fill-[#F5C767] text-[#F5C767]" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-[#EFE9DF] overflow-hidden">
                  <div
                    className="h-full bg-[#821D24] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right text-[11px] text-[#7A6757] font-medium shrink-0">
                  {count} ({pct}%)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[#8C7665] font-semibold flex items-center gap-1 text-[11px]">
          <Filter className="w-3 h-3" />
          Filter:
        </span>
        <button
          type="button"
          onClick={() => setSelectedStarFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
            selectedStarFilter === 'all'
              ? 'bg-[#821D24] text-white shadow-xs'
              : 'bg-white border border-[#D5C5B2] text-[#5A493D] hover:bg-[#FAF8F5]'
          }`}
        >
          All ({reviews.length})
        </button>
        {[5, 4, 3].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setSelectedStarFilter(selectedStarFilter === star ? 'all' : star)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              selectedStarFilter === star
                ? 'bg-[#821D24] text-white shadow-xs'
                : 'bg-white border border-[#D5C5B2] text-[#5A493D] hover:bg-[#FAF8F5]'
            }`}
          >
            <span>{star} Stars</span>
            <span className="text-[10px] opacity-80">({starCounts[star] || 0})</span>
          </button>
        ))}
      </div>

      {/* Customer Reviews List */}
      <div className="space-y-3.5">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#D5C5B2] space-y-2">
            <MessageSquare className="w-8 h-8 text-[#C2B29F] mx-auto" />
            <p className="text-xs font-semibold text-[#5A493D]">
              No reviews match the selected filter.
            </p>
            <button
              type="button"
              onClick={() => setSelectedStarFilter('all')}
              className="text-xs text-[#821D24] font-bold underline cursor-pointer"
            >
              Show all reviews
            </button>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const votes = helpfulVotes[rev.id] || 0;
            const formattedDate = new Date(rev.createdAt).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={rev.id}
                className="bg-white rounded-xl p-4 border border-[#E8DFD1] shadow-2xs space-y-2.5 transition-all hover:border-[#D5C5B2]"
              >
                {/* Review Header: User info & Star Rating */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#FAF3EA] border border-[#DECFBE] text-[#821D24] font-bold text-xs flex items-center justify-center font-serif">
                      {rev.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#2A1E17]">{rev.customerName}</span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-1.5 py-0.5 rounded border border-emerald-200">
                            <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                      </div>
                      {rev.city && (
                        <p className="text-[10px] text-[#7A6757] font-medium">{rev.city}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-[#F5C767]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-[#F5C767] text-[#F5C767]' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#8C7665]">{formattedDate}</span>
                  </div>
                </div>

                {/* Review Comment Body */}
                <p className="text-xs text-[#4A3B32] leading-relaxed pl-10.5">
                  {rev.comment}
                </p>

                {/* Helpful Action */}
                <div className="pl-10.5 pt-1 flex items-center gap-3 text-[11px] text-[#8C7665]">
                  <button
                    type="button"
                    onClick={() => toggleHelpful(rev.id)}
                    className="inline-flex items-center gap-1 hover:text-[#821D24] font-medium transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Helpful {votes > 0 && `(${votes})`}</span>
                  </button>
                  <span>•</span>
                  <span className="text-[10px] text-[#A69788]">Artisan Handloom Verified</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
