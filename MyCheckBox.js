import React from 'react';
import { Platform } from 'react-native';

const MyCheckBox = (props) => {
  if (Platform.OS === 'web') {
    return (
      <input
        type="checkbox"
        checked={props.value}
        onChange={(e) => props.onValueChange(e.target.checked)}
        style={props.style}
      />
    );
  } else {
    const RNCheckBox = require('@react-native-community/checkbox').default;
    return <RNCheckBox {...props} />;
  }
};

export default MyCheckBox;
