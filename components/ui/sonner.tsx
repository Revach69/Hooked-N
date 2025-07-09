import React from 'react';
import Toast from 'react-native-toast-message';
export const Toaster: React.FC<React.ComponentProps<typeof Toast>> = (props) => (
  <Toast {...props} />
);
