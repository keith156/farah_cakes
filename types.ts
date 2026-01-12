
export interface Cake {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
}

export interface CartItem extends Cake {
  quantity: number;
}

export enum AdminView {
  DASHBOARD = 'DASHBOARD',
  CAKES = 'CAKES',
  COUPONS = 'COUPONS',
  CATEGORIES = 'CATEGORIES'
}
