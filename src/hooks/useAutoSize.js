// modified from 
// https://github.com/ruizguille/tech-trends-chatbot/blob/master/frontend/src/hooks/useAutosize.js
// (MIT License)

import React from 'react';

export default function useAutosize(value) {
  const ref = React.useRef(null);
  const [borderWidth, setBorderWidth] = React.useState(0);

  React.useLayoutEffect(() => {
    const style = window.getComputedStyle(ref.current);
    setBorderWidth(parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth));
  }, []);

  React.useLayoutEffect(() => {
    ref.current.style.height = 'inherit';
    ref.current.style.height = `${ref.current.scrollHeight + borderWidth}px`;
  }, [value, borderWidth]);

  return ref;
}