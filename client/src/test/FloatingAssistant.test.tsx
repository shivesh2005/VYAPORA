import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '../i18n';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';
import { FloatingAssistant } from '../components/layout/FloatingAssistant';

const renderFloatingAssistant = (initialRoute = '/') => {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <FloatingAssistant />
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </MemoryRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
};

describe('FloatingAssistant Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the floating toggle button with "Ask Shopping Assistant" on storefront pages', () => {
    renderFloatingAssistant('/');

    const toggleBtn = screen.getByRole('button', { name: /Ask Shopping Assistant|शॉपिंग सहायक से पूछें/i });
    expect(toggleBtn).toBeInTheDocument();
  });

  it('opens the chat drawer when the floating toggle button is clicked', () => {
    renderFloatingAssistant('/');

    const toggleBtn = screen.getByRole('button', { name: /Ask Shopping Assistant|शॉपिंग सहायक से पूछें/i });
    fireEvent.click(toggleBtn);

    // Dialog drawer should be open
    const dialog = screen.getByRole('dialog', { name: /Shopping Assistant Chat Drawer/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/VYAPORA Assistant|व्यापोरा शॉपिंग सहायक/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask e.g. headphones under ₹3,000|शॉपिंग से जुड़ा सवाल पूछें/i)).toBeInTheDocument();
  });

  it('closes the drawer when clicking the close button', () => {
    renderFloatingAssistant('/');

    // Open drawer
    const toggleBtn = screen.getByRole('button', { name: /Ask Shopping Assistant|शॉपिंग सहायक से पूछें/i });
    fireEvent.click(toggleBtn);

    const closeBtn = screen.getByRole('button', { name: /Close Assistant/i });
    fireEvent.click(closeBtn);

    // Drawer should be gone and toggle button visible again
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ask Shopping Assistant|शॉपिंग सहायक से पूछें/i })).toBeInTheDocument();
  });

  it('collapses the drawer when pressing the Escape key', () => {
    renderFloatingAssistant('/');

    // Open drawer
    const toggleBtn = screen.getByRole('button', { name: /Ask Shopping Assistant|शॉपिंग सहायक से पूछें/i });
    fireEvent.click(toggleBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    // Drawer should close
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ask Shopping Assistant|शॉपिंग सहायक से पूछें/i })).toBeInTheDocument();
  });

  it('is hidden on the full assistant page (/assistant and /ai-assistant)', () => {
    const { unmount } = renderFloatingAssistant('/assistant');
    expect(screen.queryByRole('button', { name: /Ask Shopping Assistant|शॉपिंग सहायक से पूछें/i })).not.toBeInTheDocument();
    unmount();

    renderFloatingAssistant('/ai-assistant');
    expect(screen.queryByRole('button', { name: /Ask Shopping Assistant|शॉपिंग सहायक से पूछें/i })).not.toBeInTheDocument();
  });

  it('is hidden on the checkout page (/checkout) to avoid blocking form fields', () => {
    renderFloatingAssistant('/checkout');
    expect(screen.queryByRole('button', { name: /Ask Shopping Assistant|शॉपिंग सहायक से पूछें/i })).not.toBeInTheDocument();
  });

  it('minimizes and expands the drawer without losing state', () => {
    renderFloatingAssistant('/');

    // Open drawer
    const toggleBtn = screen.getByRole('button', { name: /Ask Shopping Assistant|शॉपिंग सहायक से पूछें/i });
    fireEvent.click(toggleBtn);

    // Click Minimize
    const minBtn = screen.getByRole('button', { name: /Minimize/i });
    fireEvent.click(minBtn);

    // In minimized state, message body & input should not be shown
    expect(screen.queryByPlaceholderText(/Ask e.g. headphones/i)).not.toBeInTheDocument();

    // Click Expand
    const maxBtn = screen.getByRole('button', { name: /Expand/i });
    fireEvent.click(maxBtn);

    // Restores full drawer
    expect(screen.getByPlaceholderText(/Ask e.g. headphones/i)).toBeInTheDocument();
  });

  it('restores conversation history saved in sessionStorage', () => {
    sessionStorage.setItem(
      'vyapora_floating_assistant_msgs',
      JSON.stringify([
        { role: 'user', content: 'Show headphones under 5000', timestamp: '2026-10-14T10:00:00Z' },
        { role: 'assistant', content: 'Here are top matching headphones in your budget.', timestamp: '2026-10-14T10:00:01Z' },
      ])
    );

    renderFloatingAssistant('/');

    // Open drawer
    const toggleBtn = screen.getByRole('button', { name: /Ask Shopping Assistant|शॉपिंग सहायक से पूछें/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText('Show headphones under 5000')).toBeInTheDocument();
    expect(screen.getByText('Here are top matching headphones in your budget.')).toBeInTheDocument();
  });
});
