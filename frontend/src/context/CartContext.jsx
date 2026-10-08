import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('pizzahub_react_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [settings, setSettings] = useState({
    restaurant_name: 'Pizza Hub',
    phone_number: '+92 300 1234567',
    whatsapp_number: '923001234567',
    email: 'orders@pizzahub.com',
    currency: 'Rs.',
    delivery_fee: 150,
    free_delivery_threshold: 2500,
    is_24_hours_open: true,
    announcement_banner: '🔥 24/7 Delivery Available! Free Delivery on orders above Rs. 2500 with code PIZZAFIRST!'
  });

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('pizzahub_react_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch live settings from backend API
  useEffect(() => {
    fetch('/api/settings/')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.warn('Could not load settings:', err));
  }, []);

  const addToCart = (product, sizeName, unitPrice, quantity = 1) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.id === product.id && it.size_name === sizeName
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        next[existingIdx].subtotal = next[existingIdx].quantity * next[existingIdx].unit_price;
        return next;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            slug: product.slug,
            image_url: product.image_url || '/placeholder-pizza.jpg',
            size_name: sizeName,
            unit_price: parseFloat(unitPrice),
            quantity: quantity,
            subtotal: parseFloat(unitPrice) * quantity
          }
        ];
      }
    });
  };

  const updateQuantity = (index, delta) => {
    setCart((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;

      next[index].quantity += delta;
      if (next[index].quantity <= 0) {
        next.splice(index, 1);
      } else {
        next[index].subtotal = next[index].quantity * next[index].unit_price;
      }
      return next;
    });
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (coupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Calculations
  const cartCount = cart.reduce((sum, it) => sum + it.quantity, 0);
  const cartSubtotal = cart.reduce((sum, it) => sum + it.unit_price * it.quantity, 0);

  const cartDeliveryFee =
    cartSubtotal > 0
      ? cartSubtotal >= (settings.free_delivery_threshold || 2500)
        ? 0
        : settings.delivery_fee || 150
      : 0;

  const cartDiscount = appliedCoupon ? appliedCoupon.discount_amount || 0 : 0;
  const cartTotal = Math.max(0, cartSubtotal + cartDeliveryFee - cartDiscount);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        cartDeliveryFee,
        cartDiscount,
        cartTotal,
        appliedCoupon,
        settings,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
