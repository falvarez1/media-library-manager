/**
 * Debug utilities for React Context state issues
 */

/**
 * Creates a debug wrapper for a reducer that logs all actions and state changes
 */
export function createDebugReducer<S, A>(
  reducer: (state: S, action: A) => S,
  name: string = 'Reducer'
): (state: S, action: A) => S {
  return (state: S, action: A) => {
    console.group(`[${name}] Action: ${(action as any).type}`);
    console.log('Previous State:', state);
    console.log('Action:', action);
    
    const newState = reducer(state, action);
    
    console.log('New State:', newState);
    console.log('State Changed:', state !== newState);
    console.groupEnd();
    
    // Verify state immutability
    if (state === newState && (action as any).type !== '@@INIT') {
      console.warn(`[${name}] WARNING: Reducer returned the same state reference!`);
    }
    
    return newState;
  };
}

/**
 * Verifies that a context value is actually changing
 */
export function verifyContextUpdate<T>(
  prevValue: T,
  newValue: T,
  contextName: string = 'Context'
): void {
  if (prevValue === newValue) {
    console.warn(`[${contextName}] Context value did not change (same reference)`);
  } else {
    console.log(`[${contextName}] Context value updated successfully`);
  }
}

/**
 * Creates a proxy wrapper for context value to track property access
 */
export function createContextProxy<T extends object>(
  contextValue: T,
  name: string = 'Context'
): T {
  return new Proxy(contextValue, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      console.log(`[${name}] Accessing property: ${String(prop)}`, value);
      return value;
    }
  });
}

/**
 * Checks if React is in StrictMode or Concurrent Mode
 */
export function detectReactMode(): {
  strictMode: boolean;
  concurrentMode: boolean;
} {
  // This is a heuristic check - not 100% reliable
  const isStrictMode = typeof (React as any).StrictMode !== 'undefined';
  const isConcurrentMode = typeof (React as any).unstable_ConcurrentMode !== 'undefined' ||
                           typeof (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentBatchConfig !== 'undefined';
  
  return {
    strictMode: isStrictMode,
    concurrentMode: isConcurrentMode
  };
}

/**
 * Force a synchronous update in React 18+
 */
export function forceSyncUpdate(callback: () => void): void {
  if (typeof (ReactDOM as any).flushSync !== 'undefined') {
    (ReactDOM as any).flushSync(callback);
  } else {
    callback();
  }
}