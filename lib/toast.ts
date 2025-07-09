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

export default toast;
