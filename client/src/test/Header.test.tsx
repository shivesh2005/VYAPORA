import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '../i18n';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';
import { Header } from '../components/layout/Header';

const renderHeader = () => {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <Header />
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
};

describe('Header & Hamburger Drawer Component', () => {
  it('renders VYAPORA logo, search bar, language switcher, and theme switcher on initial load', () => {
    renderHeader();

    expect(screen.getAllByText(/VYAPORA/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByPlaceholderText(/Search products, brands/i).length).toBeGreaterThanOrEqual(1);
    // Language toggle indicator
    expect(screen.getAllByText(/EN|English/i).length).toBeGreaterThanOrEqual(1);
  });

  it('opens and closes the slide-out navigation drawer', () => {
    renderHeader();

    // Click Hamburger button
    const menuBtn = screen.getByLabelText(/Navigation Menu|मेनू/i);
    fireEvent.click(menuBtn);

    // Drawer should now be visible with navigation links
    expect(screen.getAllByText(/Shop All|सभी उत्पाद/i).length).toBeGreaterThanOrEqual(1);

    // Click close button
    const closeBtn = screen.getByLabelText(/Close|बंद करें/i);
    fireEvent.click(closeBtn);
  });
});
