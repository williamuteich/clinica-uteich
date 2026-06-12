import { useDebounce as useDebounceLib } from "use-debounce";

export function useDebounce<T>(value: T, delay = 500) {
    const [debouncedValue] = useDebounceLib(value, delay);
    return debouncedValue;
}