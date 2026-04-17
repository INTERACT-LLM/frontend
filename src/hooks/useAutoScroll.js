// modified from 
// https://github.com/ruizguille/tech-trends-chatbot/blob/master/frontend/src/hooks/useAutoScroll.js
// (MIT License)

import React from 'react';

const SCROLL_THRESHOLD = 10;

export default function useAutoScroll(active) {
  const scrollContentRef = React.useRef(null);
  const isDisabled = React.useRef(false);
  const prevScrollTop = React.useRef(null);

  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      const { scrollHeight, clientHeight, scrollTop } = document.documentElement;
      if (!isDisabled.current && scrollHeight - clientHeight > scrollTop) {
        document.documentElement.scrollTo({
          top: scrollHeight - clientHeight,
          behavior: 'smooth'
        });
      }
    });

    if (scrollContentRef.current) {
      resizeObserver.observe(scrollContentRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, []);

  React.useLayoutEffect(() => {
    if (!active) {
      isDisabled.current = true;
      return;
    }

    function onScroll() {
      const { scrollHeight, clientHeight, scrollTop } = document.documentElement;
      if (
        !isDisabled.current &&
        window.scrollY < prevScrollTop.current &&
        scrollHeight - clientHeight > scrollTop + SCROLL_THRESHOLD
      ) {
        isDisabled.current = true;
      } else if (
        isDisabled.current &&
        scrollHeight - clientHeight <= scrollTop + SCROLL_THRESHOLD
      ) {
        isDisabled.current = false;
      }
      prevScrollTop.current = window.scrollY;
    }
    
    isDisabled.current = false;
    prevScrollTop.current = document.documentElement.scrollTop;
    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, [active]);

  return scrollContentRef;
}