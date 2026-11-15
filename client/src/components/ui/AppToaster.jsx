import { Toaster } from "sonner";

/**
 * Modern, Mobile-Friendly Global Alert Toaster
 * - Stacked cards with smooth 3D depth
 * - Swipe-to-dismiss gesture on touch screens (iOS & Android)
 * - Safe margin & non-obtrusive top-center positioning (won't block keyboards)
 * - Rich vibrant status indicators (Success, Error, Warning, Info, Loading)
 * - Adapts to OS/App Dark and Light modes
 */
const AppToaster = () => {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      expand={false}
      visibleToasts={4}
      duration={3500}
      offset="20px"
      toastOptions={{
        className: "sonner-toast-modern",
        style: {
          borderRadius: "14px",
          fontFamily: "inherit",
          fontSize: "0.875rem",
          fontWeight: "500",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)"
        }
      }}
    />
  );
};

export default AppToaster;

