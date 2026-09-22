import { SareeReview } from '../types';

export const INITIAL_SAREE_REVIEWS: Record<string, SareeReview[]> = {
  'sar-ap-01': [
    {
      id: 'rev-01-01',
      sareeId: 'sar-ap-01',
      customerName: 'Sravani Reddy',
      city: 'Hyderabad, Telangana',
      rating: 5,
      comment: 'The double ikkat geometric precision in real life is breathtaking! The Telia diamond pattern is razor-sharp, and the crimson border has a royal sheen. Draped it for my sister’s Pelli in Gachibowli and received countless compliments.',
      createdAt: '2026-03-12T14:20:00Z',
      verifiedPurchase: true,
    },
    {
      id: 'rev-01-02',
      sareeId: 'sar-ap-01',
      customerName: 'Padmavathi K.',
      city: 'Vijayawada, AP',
      rating: 5,
      comment: 'Authentic Pochampally handloom quality. The Silk Mark certificate and tag were provided in the packaging. The drape is light, crisp, and comfortable all through the wedding ceremony.',
      createdAt: '2026-02-28T09:15:00Z',
      verifiedPurchase: true,
    },
    {
      id: 'rev-01-03',
      sareeId: 'sar-ap-01',
      customerName: 'Lavanya M.',
      city: 'Warangal, Telangana',
      rating: 5,
      comment: 'Ordered with custom blouse tailoring service — the fit was flawless! Delivered within 36 hours via AP/TG express courier.',
      createdAt: '2026-02-14T18:40:00Z',
      verifiedPurchase: true,
    }
  ],
  'sar-ap-02': [
    {
      id: 'rev-02-01',
      sareeId: 'sar-ap-02',
      customerName: 'Anuradha Varma',
      city: 'Visakhapatnam, AP',
      rating: 5,
      comment: 'The Kuttu interlock contrast border is pure artistry. You can feel the real weaver craft at the border joint. The contrast between Peacock blue and mustard zari is majestic for Varalakshmi Vratam.',
      createdAt: '2026-03-05T11:30:00Z',
      verifiedPurchase: true,
    },
    {
      id: 'rev-02-02',
      sareeId: 'sar-ap-02',
      customerName: 'Kavitha Rao',
      city: 'Secunderabad, Telangana',
      rating: 5,
      comment: 'Super fast delivery in Hyderabad. The zari border has true heirloom weight without making the body heavy. Worth every rupee.',
      createdAt: '2026-01-20T16:10:00Z',
      verifiedPurchase: true,
    }
  ],
  'sar-ap-03': [
    {
      id: 'rev-03-01',
      sareeId: 'sar-ap-03',
      customerName: 'Madhavi G.',
      city: 'Rajahmundry, AP',
      rating: 5,
      comment: 'Uppada Jamdani sarees are famous for their featherlight weave, and this one exceeded expectations. Can easily slip through a ring, yet the floral buttas gleam like real gold threads!',
      createdAt: '2026-03-01T10:00:00Z',
      verifiedPurchase: true,
    }
  ],
  'sar-ap-04': [
    {
      id: 'rev-04-01',
      sareeId: 'sar-ap-04',
      customerName: 'Deepa Chandrasekhar',
      city: 'Tirupati, AP',
      rating: 5,
      comment: 'Heirloom Dharmavaram bridal silk. Heavy rich pallu with peacock motifs. Draped like royalty for our family muhurtham.',
      createdAt: '2026-02-22T13:45:00Z',
      verifiedPurchase: true,
    }
  ],
  'sar-ap-05': [
    {
      id: 'rev-05-01',
      sareeId: 'sar-ap-05',
      customerName: 'Revathi S.',
      city: 'Guntur, AP',
      rating: 5,
      comment: 'Mangalagiri Nizam border is crisp and timeless. The cotton-silk texture is so breathable in Andhra summers while looking formal and polished.',
      createdAt: '2026-03-10T08:30:00Z',
      verifiedPurchase: true,
    }
  ],
  'sar-ap-06': [
    {
      id: 'rev-06-01',
      sareeId: 'sar-ap-06',
      customerName: 'Shalini N.',
      city: 'Nizamabad, Telangana',
      rating: 5,
      comment: 'Narayanpet weaves have such sentimental value in our family. The contrast temple border and double shades look divine.',
      createdAt: '2026-02-18T17:20:00Z',
      verifiedPurchase: true,
    }
  ]
};

export function getInitialReviewsForSaree(sareeId: string): SareeReview[] {
  return INITIAL_SAREE_REVIEWS[sareeId] || [
    {
      id: `rev-default-${sareeId}`,
      sareeId: sareeId,
      customerName: 'Rukmini K.',
      city: 'Hyderabad, Telangana',
      rating: 5,
      comment: 'Splendid authentic handloom drape. The silk sheen and zari detailing reflect true master artisan craftsmanship from the weaver clusters.',
      createdAt: '2026-02-10T12:00:00Z',
      verifiedPurchase: true,
    }
  ];
}
