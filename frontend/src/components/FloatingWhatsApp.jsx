import React from 'react';
import { useCart } from '../context/CartContext';

export const FloatingWhatsApp = () => {
  const { settings } = useCart();
  const waUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
    'Hello Pizza Hub! I want to order delicious pizza.'
  )}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noreferrer"
      className="floating-whatsapp"
      title="Chat on WhatsApp"
      aria-label="Direct WhatsApp Order"
    >
      💬
    </a>
  );
};
