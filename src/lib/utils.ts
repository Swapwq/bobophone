/**
 * Creates a debounced version of a callback function
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A cleanup function to clear the timeout
 */
export function debounce<T extends (...args: any[]) => void | Promise<void>>(
    callback: T,
    delay: number
): () => void {
    let timeoutId: NodeJS.Timeout;

    // Execute the debounced callback
    timeoutId = setTimeout(callback, delay);

    // Return cleanup function
    return () => clearTimeout(timeoutId);
}

/**
 * Configuration options for debounced async operations
 */
export interface DebouncedAsyncOptions<T> {
    /** The async function to execute */
    callback: () => Promise<T>;
    /** Delay in milliseconds before executing the callback */
    delay: number;
    /** Optional validation function to check before executing */
    validate?: () => boolean;
    /** Optional callback when operation starts */
    onStart?: () => void;
    /** Optional callback when operation completes successfully */
    onSuccess?: (result: T) => void;
    /** Optional callback when operation fails */
    onError?: (error: unknown) => void;
    /** Optional callback that always runs after completion */
    onFinally?: () => void;
}

/**
 * Creates a debounced async operation with lifecycle callbacks
 * @param options - Configuration options for the debounced operation
 * @returns A cleanup function to cancel the pending operation
 */
export function debouncedAsync<T>(options: DebouncedAsyncOptions<T>): () => void {
    const {
        callback,
        delay,
        validate,
        onStart,
        onSuccess,
        onError,
        onFinally,
    } = options;

    const timeoutId = setTimeout(async () => {
        // Run validation check if provided
        if (validate && !validate()) {
            return;
        }

        try {
            onStart?.();
            const result = await callback();
            onSuccess?.(result);
        } catch (error) {
            onError?.(error);
        } finally {
            onFinally?.();
        }
    }, delay);

    // Return cleanup function
    return () => clearTimeout(timeoutId);
}
