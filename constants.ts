
import { Cake, Coupon } from './types';

export const WHATSAPP_NUMBER = '+256758339221';

export const INITIAL_CATEGORIES: string[] = [
  'Birthday',
  'Wedding',
  'Anniversary',
  'Custom',
  'Tea Cakes'
];

export const INITIAL_CAKES: Cake[] = [
  {
    id: '1',
    name: 'Velvet Rose Celebration',
    description: 'A luxurious red velvet cake topped with fresh roses and edible gold leaf.',
    price: 150000,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop',
    category: 'Wedding'
  },
  {
    id: '2',
    name: 'Midnight Chocolate Truffle',
    description: 'Triple layered Belgian chocolate sponge with dark ganache filling.',
    price: 85000,
    imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=1000&auto=format&fit=crop',
    category: 'Birthday'
  },
  {
    id: '3',
    name: 'Vanilla Bean Cloud',
    description: 'Light and airy vanilla sponge with Madagascan vanilla buttercream.',
    price: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1000&auto=format&fit=crop',
    category: 'Custom'
  },
  {
    id: '4',
    name: 'Sunshine Lemon Drizzle',
    description: 'Zesty lemon sponge with a sharp citrus glaze and candied peels.',
    price: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1519340333755-5672c7c9042d?q=80&w=1000&auto=format&fit=crop',
    category: 'Tea Cakes'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  { code: 'SWEET10', discountPercent: 10 },
  { code: 'FARAH20', discountPercent: 20 }
];
