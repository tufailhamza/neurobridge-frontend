'use client';

import { useToastUtils } from '../utils/toast';

export const ToastDemo: React.FC = () => {
  const {
    showSystemError,
    showInfo,
    showSuccess,
    showWarning,
    showCustomError,
  } = useToastUtils();

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-b">Toast System Demo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => showSystemError(
            "Looks like something's not working right",
            "Please try again"
          )}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Show System Error
        </button>

        <button
          onClick={() => showInfo(
            "This is an informational message",
            "You can use this for general updates"
          )}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Show Info
        </button>

        <button
          onClick={() => showSuccess(
            "Operation completed successfully",
            "Your changes have been saved"
          )}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Show Success
        </button>

        <button
          onClick={() => showWarning(
            "Please review your input",
            "Some fields may need attention"
          )}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          Show Warning
        </button>

        <button
          onClick={() => showCustomError(
            "Custom Error Title",
            "This is a custom error message",
            "With custom subtitle",
            "custom@neurobridge.co"
          )}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Show Custom Error
        </button>
      </div>
    </div>
  );
};
