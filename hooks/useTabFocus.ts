
import { useState, useEffect } from 'react';

export const useTabFocus = (onUnfocus?: () => void, onFocus?: () => void) => {
    const [isFocused, setIsFocused] = useState(true);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsFocused(false);
                onUnfocus?.();
            } else {
                setIsFocused(true);
                onFocus?.();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [onUnfocus, onFocus]);

    return isFocused;
};
