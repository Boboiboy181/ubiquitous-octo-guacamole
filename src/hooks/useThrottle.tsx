import { useCallback, useRef } from 'react';

export function useThrottle<T extends (...args: any[]) => void>(callback: T, delay: number) {
    const lastCall = useRef<number | null>(null);

    return useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now();
            if (lastCall.current === null || now - lastCall.current >= delay) {
                lastCall.current = now;
                callback(...args);
            }
        },
        [callback, delay],
    );
}
