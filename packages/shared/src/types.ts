export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  basePrice: number;
  images: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  categoryId: string;
  category?: Category;
  variants?: ProductVariant[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  variantId: string | null;
  quantity: number;
  product: Product;
  variant?: ProductVariant | null;
}

export interface Cart {
  items: CartItem[];
  total: number;
  discount: number;
  couponCode: string | null;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  couponCode: string | null;
  status: OrderStatus;
  shippingAddress: Address;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: Pick<User, 'id' | 'name'>;
  rating: number;
  title: string;
  body: string;
  images: string[];
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FLAT';
  value: number;
  minOrderValue: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
