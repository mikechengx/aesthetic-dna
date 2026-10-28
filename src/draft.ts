import { useEffect, useRef, useState } from 'react';
/** Save draft changes in the interaction itself, before an immediate refresh. */
export function useDraft<T>(
  initial: T,
  onChange: (value: T) => void,
): [T, (update: T | ((previous: T) => T)) => void] {
  const [value, setValue] = useState(initial),
    current = useRef(value);
  const set = (update: T | ((previous: T) => T)) => {
    const next = typeof update === 'function' ? (update as (p: T) => T)(current.current) : update;
    current.current = next;
    setValue(next);
    onChange(next);
  };
  useEffect(() => onChange(current.current), []);
  return [value, set];
}
