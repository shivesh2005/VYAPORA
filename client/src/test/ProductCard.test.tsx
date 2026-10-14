import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '../i18n';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ProductCard } from '../components/product/ProductCard';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { Product } from '../types';

const mockProduct: Product = {
  _id: 'prod123',
  title: 'Vanguard Horizon Pro ANC Headphones',
  slug: 'vanguard-horizon-pro-anc',
  description: 'Studio sound with 45mm drivers and 60h battery',
  brand: 'Vanguard',
  category: 'Audio & Sound',
  images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e'],
  price: 6499,
  compareAtPrice: 9999,
  discountBadge: '35% OFF',
  sku: 'VAN-001',
  stock: 40,
  variants: [],
  sellerId: 'seller1',
  rating: 4.8,
  numReviews: 120,
  tags: ['audio', 'headphones'],
  isPublished: true,
  isFeatured: true,
  createdAt: '2026-01-01',
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <BrowserRouter>{ui}</BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

describe('ProductCard Component', () => {
  it('renders product title, brand and formatted INR price', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Vanguard Horizon Pro ANC Headphones')).toBeInTheDocument();
    expect(screen.getByText('Vanguard')).toBeInTheDocument();
    expect(screen.getByText('₹6,499')).toBeInTheDocument();
    expect(screen.getByText('35% OFF')).toBeInTheDocument();
  });
});
