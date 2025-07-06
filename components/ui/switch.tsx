import React from 'react';
import { Switch as RNSwitch, SwitchProps } from 'react-native';

const Switch = React.forwardRef<RNSwitch, SwitchProps>((props, ref) => (
  <RNSwitch ref={ref} {...props} />
));

Switch.displayName = 'Switch';

export { Switch };
