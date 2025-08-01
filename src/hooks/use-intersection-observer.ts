import * as React from "react";

export interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
  initialIsIntersecting?: boolean;
}

export interface UseIntersectionObserverReturn {
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | undefined;
}

export function useIntersectionObserver(
  elementRef: React.RefObject<Element | null>,
  {
    threshold = 0,
    root = null,
    rootMargin = "0%",
    freezeOnceVisible = false,
    initialIsIntersecting = false,
  }: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const [entry, setEntry] = React.useState<
    IntersectionObserverEntry | undefined
  >();
  const [isIntersecting, setIsIntersecting] = React.useState<boolean>(
    initialIsIntersecting
  );

  const frozen = React.useRef(false);

  React.useEffect(() => {
    const node = elementRef?.current; // DOM Ref
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen.current || !node) return;

    const observer = new IntersectionObserver(
      ([entry]: IntersectionObserverEntry[]) => {
        setEntry(entry);
        setIsIntersecting(entry.isIntersecting);

        if (entry.isIntersecting && freezeOnceVisible) {
          frozen.current = true;
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, threshold, root, rootMargin, freezeOnceVisible]);

  return {
    isIntersecting,
    entry,
  };
}

// Hook variant with callback for side effects
export function useIntersectionObserverCallback(
  elementRef: React.RefObject<Element | null>,
  callback: (entry: IntersectionObserverEntry, isIntersecting: boolean) => void,
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const { isIntersecting, entry } = useIntersectionObserver(
    elementRef,
    options
  );

  React.useEffect(() => {
    if (entry) {
      callback(entry, isIntersecting);
    }
  }, [entry, isIntersecting, callback]);

  return { isIntersecting, entry };
}
