import { toast as sonnerToast } from "sonner";

/**
 * Modern, Mobile-Friendly Alert & Notification System
 * Built on Sonner with multi-type support, touch gestures,
 * interactive action alerts, and backward compatibility.
 */

// Helper to sanitize message / render options
const parseContent = (content) => {
  if (typeof content === "object" && content !== null && content.render) {
    return content.render;
  }
  return content;
};

export const toast = {
  /**
   * Success Alert (Emerald green, modern checkmark icon)
   */
  success: (message, options = {}) => {
    const text = parseContent(message);
    return sonnerToast.success(text, {
      duration: 3500,
      ...options
    });
  },

  /**
   * Error Alert (Crimson rose, warning/error icon)
   */
  error: (message, options = {}) => {
    const text = parseContent(message);
    return sonnerToast.error(text, {
      duration: 4500,
      ...options
    });
  },

  /**
   * Warning Alert (Amber gold, alert icon)
   */
  warning: (message, options = {}) => {
    const text = parseContent(message);
    return sonnerToast.warning(text, {
      duration: 4000,
      ...options
    });
  },

  /**
   * Alias for warning
   */
  warn: (message, options = {}) => {
    return toast.warning(message, options);
  },

  /**
   * Info Alert (Sky / Indigo, information icon)
   */
  info: (message, options = {}) => {
    const text = parseContent(message);
    return sonnerToast.info(text, {
      duration: 3500,
      ...options
    });
  },

  /**
   * Loading Alert (Smooth spinner, returns ID for updating)
   */
  loading: (message, options = {}) => {
    const text = parseContent(message);
    return sonnerToast.loading(text, {
      ...options
    });
  },

  /**
   * Standard Message Alert (Minimal clean pill)
   */
  message: (message, options = {}) => {
    const text = parseContent(message);
    return sonnerToast(text, {
      duration: 3500,
      ...options
    });
  },

  /**
   * Promise Alert (Automatically cycles: loading -> success / error)
   */
  promise: (promise, options = {}) => {
    return sonnerToast.promise(promise, {
      loading: options.loading || "Processing...",
      success: (data) =>
        typeof options.success === "function"
          ? options.success(data)
          : options.success || "Operation completed successfully!",
      error: (err) =>
        typeof options.error === "function"
          ? options.error(err)
          : options.error ||
            err?.data?.errorMessage ||
            err?.message ||
            "Something went wrong!",
      ...options
    });
  },

  /**
   * Interactive Action Alert (Message with actionable button, e.g. "Undo", "View")
   */
  action: (message, { actionLabel = "Action", onAction, description, ...options } = {}) => {
    return sonnerToast(message, {
      description,
      action: {
        label: actionLabel,
        onClick: onAction || (() => {})
      },
      duration: 5000,
      ...options
    });
  },

  /**
   * Mobile-Friendly Confirmation Alert (Replaces ugly browser window.confirm / alert)
   */
  confirm: (
    title,
    {
      description,
      onConfirm,
      onCancel,
      confirmText = "Confirm",
      cancelText = "Cancel",
      type = "warning"
    } = {}
  ) => {
    const toastFn = sonnerToast[type] || sonnerToast;
    return toastFn(title, {
      description,
      action: {
        label: confirmText,
        onClick: () => {
          if (onConfirm) onConfirm();
        }
      },
      cancel: {
        label: cancelText,
        onClick: () => {
          if (onCancel) onCancel();
        }
      },
      duration: 8000
    });
  },

  /**
   * Backward-compatibility for react-toastify's toast.update(id, { render, type, ... })
   */
  update: (id, options = {}) => {
    const { render, type = "success", isLoading, autoClose, ...rest } = options;
    const duration = typeof autoClose === "number" ? autoClose : 3000;
    const msg = render || "Completed!";

    if (type === "success") {
      return sonnerToast.success(msg, { id, duration, ...rest });
    }
    if (type === "error") {
      return sonnerToast.error(msg, { id, duration: duration || 4000, ...rest });
    }
    if (type === "warning" || type === "warn") {
      return sonnerToast.warning(msg, { id, duration, ...rest });
    }
    if (type === "info") {
      return sonnerToast.info(msg, { id, duration, ...rest });
    }
    return sonnerToast(msg, { id, duration, ...rest });
  },

  /**
   * Dismiss alert by ID or all alerts
   */
  dismiss: (id) => {
    return sonnerToast.dismiss(id);
  }
};

// Aliases
export const alert = toast;
export default toast;

