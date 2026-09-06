"use client";

import { useCallback, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import IntroScreen from "@/components/intro/IntroScreen";
import { siteConfig } from "@/config/siteConfig";

// useLayoutEffect would warn during SSR; this component renders on both sides.
const useBeforePaint =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Decides whether the opening screen is due, and keeps the site behind it
 * inert while it is on screen.
 *
 * `children` is server-rendered and simply passed through, so all the marketing
 * content is still in the initial HTML for crawlers even while the intro plays.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const [showIntro, setShowIntro] = useState(siteConfig.intro.enabled);

  // Runs before paint, so a returning visitor never sees a frame of the intro.
  useBeforePaint(() => {
    if (!siteConfig.intro.enabled) {
      setShowIntro(false);
      return;
    }
    if (document.documentElement.getAttribute("data-intro") === "seen") {
      setShowIntro(false);
    }
  }, []);

  const handleEnter = useCallback(() => {
    try {
      if (siteConfig.intro.showOncePerSession) {
        window.sessionStorage.setItem(siteConfig.intro.sessionKey, "1");
      }
    } catch {
      // Storage blocked: the intro will simply play again next navigation.
    }
    document.documentElement.setAttribute("data-intro", "seen");
    document.documentElement.style.removeProperty("background-color");
    setShowIntro(false);
  }, []);

  return (
    <>
      {showIntro && <IntroScreen onEnter={handleEnter} />}
      <div inert={showIntro ? true : undefined}>{children}</div>
    </>
  );
}

export default SiteShell;
