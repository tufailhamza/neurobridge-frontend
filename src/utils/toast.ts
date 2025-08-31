import { useToast } from '../context/ToastContext';

export const useToastUtils = () => {
  const { showToast } = useToast();

  const showSystemError = (message: string, subtitle?: string) => {
    showToast({
      title: 'System Error',
      message,
      subtitle,
      contactEmail: 'info@neurobridge.co',
      type: 'error',
      duration: 8000, // Longer duration for errors
    });
  };

  const showInfo = (message: string, subtitle?: string) => {
    showToast({
      title: 'Information',
      message,
      subtitle,
      type: 'info',
      duration: 5000,
    });
  };

  const showSuccess = (message: string, subtitle?: string) => {
    showToast({
      title: 'Success',
      message,
      subtitle,
      type: 'success',
      duration: 4000,
    });
  };

  const showWarning = (message: string, subtitle?: string) => {
    showToast({
      title: 'Warning',
      message,
      subtitle,
      type: 'warning',
      duration: 6000,
    });
  };

  const showCustomError = (
    title: string,
    message: string,
    subtitle?: string,
    contactEmail?: string
  ) => {
    showToast({
      title,
      message,
      subtitle,
      contactEmail: contactEmail || 'info@neurobridge.co',
      type: 'error',
      duration: 8000,
    });
  };

  return {
    showSystemError,
    showInfo,
    showSuccess,
    showWarning,
    showCustomError,
  };
};
