import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

describe('UI Atomic Components', () => {
  it('renders Button with text and handles loading state', () => {
    const { rerender } = render(<Button variant="gradient">Launch Cloud</Button>);
    expect(screen.getByText('Launch Cloud')).toBeInTheDocument();

    rerender(<Button isLoading>Launch Cloud</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders Badge with custom variants', () => {
    render(<Badge variant="violet">VYAPORA PRO</Badge>);
    expect(screen.getByText('VYAPORA PRO')).toBeInTheDocument();
  });
});
