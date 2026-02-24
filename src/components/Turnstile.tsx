import React, { useEffect, useRef } from 'react';

interface TurnstileProps {
    siteKey: string;
    onSuccess: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
}

declare global {
    interface Window {
        turnstile: any;
        onTurnstileLoaded: () => void;
    }
}

export const Turnstile: React.FC<TurnstileProps> = ({ siteKey, onSuccess, onError, onExpire }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const callbacksRef = useRef({ onSuccess, onError, onExpire });

    useEffect(() => {
        callbacksRef.current = { onSuccess, onError, onExpire };
    }, [onSuccess, onError, onExpire]);

    useEffect(() => {
        const scriptId = 'cloudflare-turnstile-script';
        let script = document.getElementById(scriptId) as HTMLScriptElement;

        const initializeTurnstile = () => {
            if (window.turnstile && containerRef.current && !widgetIdRef.current) {
                widgetIdRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    callback: (token: string) => callbacksRef.current.onSuccess(token),
                    'error-callback': () => callbacksRef.current.onError?.(),
                    'expired-callback': () => callbacksRef.current.onExpire?.(),
                });
            }
        };

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
            script.onload = initializeTurnstile;
        } else if (window.turnstile) {
            initializeTurnstile();
        }

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, [siteKey]);

    return <div ref={containerRef} />;
};
