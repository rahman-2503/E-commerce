import { create } from 'zustand';

const CART_KEY = 'storepulse_cart';

function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return [] }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantName?: string;
  variantId?: string | null;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCart(),
  isOpen: false,
  addItem: (item) => {
    const items = get().items;
    const key = item.variantId || item.productId;
    const existing = items.find((i) => (i.variantId || i.productId) === key);
    if (existing) {
      const next = items.map((i) =>
        (i.variantId || i.productId) === key ? { ...i, quantity: i.quantity + item.quantity } : i,
      );
      saveCart(next);
      set({ items: next });
    } else {
      const next = [...items, item];
      saveCart(next);
      set({ items: next });
    }
  },
  removeItem: (productId, variantId) => {
    const next = get().items.filter((i) => (i.variantId || i.productId) !== (variantId || productId));
    saveCart(next);
    set({ items: next });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const next = get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i));
    saveCart(next);
    set({ items: next });
  },
  clearCart: () => { saveCart([]); set({ items: [] }); },
  toggleCart: () => set({ isOpen: !get().isOpen }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
