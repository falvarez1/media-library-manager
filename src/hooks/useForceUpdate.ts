import { useState, useCallback } from 'react';

/**
 * Custom hook that forces a component to re-render
 * Useful for debugging context state issues
 */
export const useForceUpdate = () => {
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => {
    setTick(tick => tick + 1);
  }, []);
  return forceUpdate;
};

export default useForceUpdate;