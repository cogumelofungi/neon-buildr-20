import { useLayoutEffect, useMemo, useRef } from "react";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

interface VturbPlayerProps {
  videoId: string;
  accountId: string;
  className?: string;
  /** Forces script to reload on each mount (useful for dialogs/popups) */
  reloadScriptOnMount?: boolean;
}

const VTURB_HOST = "scripts.converteai.net";

function pauseAndResetMedia(el: Element) {
  try {
    if (el instanceof HTMLMediaElement) {
      el.pause();
      // Some players throw if currentTime is read-only at that moment
      try {
        el.currentTime = 0;
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
}

function isVturbResourceElement(el: Element) {
  // Most common artifacts: iframe/video/audio/scripts from converteai/vturb
  const hasVturbSrc = (src: string) =>
    src.includes("converteai.net") || src.includes("vturb.com") || src.includes("b-cdn.net");

  if (el instanceof HTMLIFrameElement) {
    return hasVturbSrc(el.src || "");
  }
  if (el instanceof HTMLScriptElement) {
    return hasVturbSrc(el.src || "");
  }
  if (el instanceof HTMLVideoElement || el instanceof HTMLAudioElement) {
    const src = (el.currentSrc || el.src || "").toString();
    return hasVturbSrc(src);
  }
  return false;
}

const VturbPlayer = ({ videoId, accountId, className = "", reloadScriptOnMount = false }: VturbPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const playerId = useMemo(() => `vid-${videoId}`, [videoId]);
  const scriptId = useMemo(() => `vturb-script-${accountId}-${videoId}`, [accountId, videoId]);
  const scriptSrc = useMemo(
    () => `https://${VTURB_HOST}/${accountId}/players/${videoId}/v4/player.js`,
    [accountId, videoId]
  );

  useLayoutEffect(() => {
    const container = containerRef.current;

    // 1) Cleanup orphaned artifacts: sometimes the provider moves DOM nodes to <body>,
    // which can result in a fullscreen player/overlay at the top of the page.
    const vturbContainers = Array.from(document.querySelectorAll('[data-vturb-container="1"]'));

    // Remove any vturb-smartplayer that isn't inside one of our containers.
    document.querySelectorAll("vturb-smartplayer").forEach((node) => {
      const el = node as HTMLElement;
      const isInsideAnyContainer = vturbContainers.some((c) => c.contains(el));
      if (!isInsideAnyContainer) {
        try {
          (el as unknown as { pause?: () => void; stop?: () => void }).pause?.();
          (el as unknown as { pause?: () => void; stop?: () => void }).stop?.();
        } catch {
          // ignore
        }
        el.remove();
      }
    });

    // Remove Vturb iframes/media that are not inside one of our containers.
    document.querySelectorAll("iframe, audio, video").forEach((node) => {
      if (!isVturbResourceElement(node)) return;
      const isInsideAnyContainer = vturbContainers.some((c) => c.contains(node));
      if (!isInsideAnyContainer) {
        try {
          pauseAndResetMedia(node);
        } catch {
          // ignore
        }
        try {
          node.remove();
        } catch {
          // ignore
        }
      }
    });

    // 2) Remove duplicate instances of THIS player that may have been left behind
    // (common with React 18 StrictMode mount/unmount/mount).
    document.querySelectorAll("vturb-smartplayer").forEach((node) => {
      const el = node as HTMLElement;
      const isSamePlayer = el.id === playerId;
      if (!isSamePlayer) return;

      const isInsideThisContainer = !!container && container.contains(el);
      if (!isInsideThisContainer) {
        try {
          // Some implementations may expose stop/pause
          (el as unknown as { pause?: () => void; stop?: () => void }).pause?.();
          (el as unknown as { pause?: () => void; stop?: () => void }).stop?.();
        } catch {
          // ignore
        }
        el.remove();
      }
    });

    // 2) Ensure script is present.
    // If used inside dialogs/popups, the provider script may not auto-reinitialize when the element is recreated.
    // In that case we force-reload the script (cache-busted) on each mount.
    if (reloadScriptOnMount) {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = reloadScriptOnMount ? `${scriptSrc}?v=${Date.now()}` : scriptSrc;
      script.async = true;
      script.dataset.vturb = "1";
      document.head.appendChild(script);
    }

    // 3) Cleanup on unmount: stop media created inside the container.
    return () => {
      const c = containerRef.current;
      if (c) {
        c.querySelectorAll("audio, video").forEach((media) => pauseAndResetMedia(media));

        // Some players inject iframes inside the container
        c.querySelectorAll("iframe").forEach((iframe) => {
          try {
            iframe.remove();
          } catch {
            // ignore
          }
        });
      }


      if (reloadScriptOnMount) {
        const s = document.getElementById(scriptId);
        if (s) s.remove();
      }
    };
  }, [playerId, scriptId, scriptSrc, reloadScriptOnMount]);

  return (
    <div ref={containerRef} data-vturb-container="1" className={className}>
      <vturb-smartplayer
        key={playerId}
        id={playerId}
        style={{ display: "block", margin: "0 auto", width: "100%", height: "100%" }}
      />
    </div>
  );
};

// Declare the custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "vturb-smartplayer": DetailedHTMLProps<HTMLAttributes<HTMLElement> & { id: string }, HTMLElement>;
    }
  }
}

export default VturbPlayer;
