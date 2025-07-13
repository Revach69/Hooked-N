import Toast, { ToastShowParams } from 'react-native-toast-message';

export type { ToastShowParams };

export type ToastArg = string | ToastShowParams;

export function toast(arg: ToastArg) {
  if (typeof arg === 'string') {
    Toast.show({ text1: arg });
  } else {
    Toast.show(arg);
  }
}

// Add convenience methods
toast.success = (message: string) => {
  Toast.show({
    type: 'success',
    text1: message,
  });
};

toast.error = (message: string) => {
  Toast.show({
    type: 'error',
    text1: message,
  });
};

toast.info = (message: string) => {
  Toast.show({
    type: 'info',
    text1: message,
  });
};

toast.warning = (message: string) => {
  Toast.show({
    type: 'warning',
    text1: message,
  });
};

export default toast;
