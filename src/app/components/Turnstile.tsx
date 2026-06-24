"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface TurnstileProps {
  onVerify: (token: string) => void;
  siteKey: string;
}

export function Turnstile({ onVerify, siteKey }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const renderWidget = () => {
      if (
        typeof window !== "undefined" &&
        (window as any).turnstile &&
        containerRef.current &&
        !widgetIdRef.current
      ) {
        widgetIdRef.current = (window as any).turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            onVerify(token);
          },
        });
      }
    };

    if (typeof window !== "undefined" && (window as any).turnstile) {
      renderWidget();
    } else {
      const interval = setInterval(() => {
        if (typeof window !== "undefined" && (window as any).turnstile) {
          clearInterval(interval);
          renderWidget();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      if (widgetIdRef.current && typeof window !== "undefined" && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
        } catch (e) {
          console.error(e);
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onVerify]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />
      <div ref={containerRef} className="flex justify-center my-2" />
    </>
  );
}
