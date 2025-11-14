import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { showToast, Toaster } from './Toast';
import toast from 'react-hot-toast';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    custom: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

describe('Toast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Toaster component', () => {
    it('should render Toaster component', () => {
      render(<Toaster />);
      expect(screen.getByTestId('toaster')).toBeInTheDocument();
    });
  });

  describe('showToast.success', () => {
    it('should call toast.custom with success configuration', () => {
      showToast.success('Success message');

      expect(toast.custom).toHaveBeenCalledTimes(1);
      const [component, options] = (toast.custom as any).mock.calls[0];
      
      expect(options.duration).toBe(3000);
      expect(component).toBeDefined();
    });

    it('should create success toast with correct ARIA attributes', () => {
      showToast.success('Test success');
      
      const [toastComponent] = (toast.custom as any).mock.calls[0];
      const { container } = render(toastComponent({ visible: true, id: 'test-id' }));
      
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveAttribute('aria-live', 'polite');
      expect(alert).toHaveAttribute('aria-atomic', 'true');
    });

    it('should display the success message', () => {
      showToast.success('Operation successful');
      
      const [toastComponent] = (toast.custom as any).mock.calls[0];
      render(toastComponent({ visible: true, id: 'test-id' }));
      
      expect(screen.getByText('Operation successful')).toBeInTheDocument();
    });
  });

  describe('showToast.error', () => {
    it('should call toast.custom with error configuration', () => {
      showToast.error('Error message');

      expect(toast.custom).toHaveBeenCalledTimes(1);
      const [, options] = (toast.custom as any).mock.calls[0];
      
      expect(options.duration).toBe(4000); // Longer duration for errors
    });

    it('should create error toast with assertive ARIA attribute', () => {
      showToast.error('Test error');
      
      const [toastComponent] = (toast.custom as any).mock.calls[0];
      const { container } = render(toastComponent({ visible: true, id: 'test-id' }));
      
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('showToast.info', () => {
    it('should call toast.custom with info configuration', () => {
      showToast.info('Info message');

      expect(toast.custom).toHaveBeenCalledTimes(1);
      const [, options] = (toast.custom as any).mock.calls[0];
      
      expect(options.duration).toBe(3000);
    });

    it('should create info toast with polite ARIA attribute', () => {
      showToast.info('Test info');
      
      const [toastComponent] = (toast.custom as any).mock.calls[0];
      const { container } = render(toastComponent({ visible: true, id: 'test-id' }));
      
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('showToast.warning', () => {
    it('should call toast.custom with warning configuration', () => {
      showToast.warning('Warning message');

      expect(toast.custom).toHaveBeenCalledTimes(1);
      const [, options] = (toast.custom as any).mock.calls[0];
      
      expect(options.duration).toBe(3000);
    });

    it('should create warning toast with polite ARIA attribute', () => {
      showToast.warning('Test warning');
      
      const [toastComponent] = (toast.custom as any).mock.calls[0];
      const { container } = render(toastComponent({ visible: true, id: 'test-id' }));
      
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Toast dismiss functionality', () => {
    it('should have dismiss button with proper aria-label', () => {
      showToast.success('Test');
      
      const [toastComponent] = (toast.custom as any).mock.calls[0];
      render(toastComponent({ visible: true, id: 'test-id' }));
      
      const dismissButton = screen.getByLabelText('Dismiss notification');
      expect(dismissButton).toBeInTheDocument();
    });

    it('should call toast.dismiss when dismiss button is clicked', () => {
      showToast.success('Test');
      
      const [toastComponent] = (toast.custom as any).mock.calls[0];
      render(toastComponent({ visible: true, id: 'test-123' }));
      
      const dismissButton = screen.getByLabelText('Dismiss notification');
      dismissButton.click();
      
      expect(toast.dismiss).toHaveBeenCalledWith('test-123');
    });
  });

  describe('Toast visibility animation', () => {
    it('should apply slide-down animation when visible', () => {
      showToast.success('Test');
      
      const [toastComponent] = (toast.custom as any).mock.calls[0];
      const { container } = render(toastComponent({ visible: true, id: 'test-id' }));
      
      const toastElement = container.querySelector('.animate-slide-down');
      expect(toastElement).toBeInTheDocument();
    });

    it('should apply opacity-0 when not visible', () => {
      showToast.success('Test');
      
      const [toastComponent] = (toast.custom as any).mock.calls[0];
      const { container } = render(toastComponent({ visible: false, id: 'test-id' }));
      
      const toastElement = container.querySelector('.opacity-0');
      expect(toastElement).toBeInTheDocument();
    });
  });
});
