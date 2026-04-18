import { create } from 'zustand';

export interface CartItem {
  productId: string;
  name: string;
  imageUrl: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (newItem) => {
    const items = get().items;
    const existing = items.find(
      (i) => i.productId === newItem.productId && i.size === newItem.size
    );
    if (existing) {
      set({
        items: items.map((i) =>
          i.productId === newItem.productId && i.size === newItem.size
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        ),
      });
    } else {
      set({ items: [...items, newItem] });
    }
  },

  removeItem: (productId, size) =>
    set({ items: get().items.filter((i) => !(i.productId === productId && i.size === size)) }),

  updateQuantity: (productId, size, quantity) =>
    set({
      items: get().items.map((i) =>
        i.productId === productId && i.size === size ? { ...i, quantity } : i
      ),
    }),

  clearCart: () => set({ items: [] }),

  total: () => get().items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),

  itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
}));
