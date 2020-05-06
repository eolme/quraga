import { useState, useCallback } from 'react';

export default function useDOMRef() {
  const [el, setEl] = useState(null);
  const ref = useCallback(node => {
    if (node !== null) {
      setEl(node);
    }
  }, []);
  return [el, ref];
}
