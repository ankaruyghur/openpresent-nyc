import type { KeyboardEvent } from 'react';

/**
 * Trigger an activation handler on Enter/Space, matching how a real <button>
 * behaves — for use on div-based interactive tiles.
 */
export function activateOnKey<T extends Element>(activate: () => void) {
  return (e: KeyboardEvent<T>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate();
    }
  };
}
