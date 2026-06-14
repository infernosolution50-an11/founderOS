import { toast as sonnerToast } from "sonner";

export const toast = {
  success(message: string) {
    return sonnerToast.success(message);
  },
  error(message: string, retry?: () => void) {
    return sonnerToast.error(message, retry ? { action: { label: "Retry", onClick: retry } } : undefined);
  },
  warning(message: string) {
    return sonnerToast.warning(message);
  },
  info(message: string) {
    return sonnerToast.info(message);
  }
};
