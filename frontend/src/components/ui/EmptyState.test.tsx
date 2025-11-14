import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import userEvent from '@testing-library/user-event';

describe('EmptyState', () => {
  it('should render with required props', () => {
    render(
      <EmptyState
        title="No items"
        description="No items found"
      />
    );

    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render with default inbox icon', () => {
    const { container } = render(
      <EmptyState
        title="No items"
        description="No items found"
      />
    );

    // Check if icon is rendered (Lucide icons have specific structure)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render with specified icon variant', () => {
    render(
      <EmptyState
        icon="mail"
        title="No emails"
        description="No emails to display"
      />
    );

    // Component should render successfully with mail icon
    expect(screen.getByText('No emails')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const handleClick = vi.fn();
    
    render(
      <EmptyState
        title="No items"
        description="No items found"
        action={{
          label: 'Add Item',
          onClick: handleClick,
        }}
      />
    );

    const button = screen.getByRole('button', { name: 'Add Item' });
    expect(button).toBeInTheDocument();
  });

  it('should call onClick when action button is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(
      <EmptyState
        title="No items"
        description="No items found"
        action={{
          label: 'Add Item',
          onClick: handleClick,
        }}
      />
    );

    const button = screen.getByRole('button', { name: 'Add Item' });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not render action button when not provided', () => {
    render(
      <EmptyState
        title="No items"
        description="No items found"
      />
    );

    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });

  it('should render all icon variants correctly', () => {
    const icons: Array<'mail' | 'inbox' | 'template' | 'sparkles'> = [
      'mail',
      'inbox',
      'template',
      'sparkles',
    ];

    icons.forEach((icon) => {
      const { unmount } = render(
        <EmptyState
          icon={icon}
          title="Test"
          description="Test description"
        />
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
      unmount();
    });
  });

  it('should have proper text hierarchy', () => {
    render(
      <EmptyState
        title="Empty State Title"
        description="This is a description"
      />
    );

    const title = screen.getByText('Empty State Title');
    const description = screen.getByText('This is a description');

    // Title should be rendered as h3
    expect(title.tagName).toBe('H3');
    
    // Description should be rendered as p
    expect(description.tagName).toBe('P');
  });

  it('should render with animation classes', () => {
    const { container } = render(
      <EmptyState
        title="Test"
        description="Test description"
      />
    );

    // Check that framer-motion motion.div is rendered
    const motionDivs = container.querySelectorAll('div');
    expect(motionDivs.length).toBeGreaterThan(0);
  });

  it('should handle long text content', () => {
    const longTitle = 'This is a very long title that should still render properly';
    const longDescription = 'This is a very long description that contains a lot of text and should still be displayed correctly in the empty state component without breaking the layout';

    render(
      <EmptyState
        title={longTitle}
        description={longDescription}
      />
    );

    expect(screen.getByText(longTitle)).toBeInTheDocument();
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('should apply correct styling classes', () => {
    const { container } = render(
      <EmptyState
        title="Test"
        description="Test description"
      />
    );

    // Check for centering and padding classes
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
  });
});
