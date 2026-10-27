export function requiredElement<T extends Element>(
  root: ParentNode,
  selector: string,
  owner: string,
): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing ${owner} element: ${selector}`);
  return element;
}

export interface Debounced<A extends unknown[]> {
  (...args: A): void;
  flush(): void;
  cancel(): void;
}

export function debounce<A extends unknown[]>(
  run: (...args: A) => void,
  delayMs: number,
): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: A | undefined;

  const flush = () => {
    clearTimeout(timer);
    timer = undefined;
    if (pending === undefined) return;
    const args = pending;
    pending = undefined;
    run(...args);
  };

  const debounced = (...args: A) => {
    pending = args;
    clearTimeout(timer);
    timer = setTimeout(flush, delayMs);
  };
  debounced.flush = flush;
  debounced.cancel = () => {
    clearTimeout(timer);
    timer = undefined;
    pending = undefined;
  };
  return debounced;
}
