import { useRef, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
  VideoHero - scroll-scrubbed lens video.
  Vertical scroll maps to video.currentTime (the "zoom into the lens" beat).
  Falls back to a static poster + CSS zoom if the browser won't scrub.
*/
export default function VideoHero() {
  const section = useRef(null);
  const videoRef = useRef(null);
  const titleRef = useRef(null);
  const [canScrub, setCanScrub] = useState(true);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const video = videoRef.current;
    if (!video) return;

    // Scope every GSAP object to this section so cleanup can fully revert the
    // pin. A bare trigger.kill() leaves the pin-spacer/transform behind, which
    // under React StrictMode's mount→cleanup→mount desyncs the scrub. ctx.revert()
    // undoes the pin cleanly - same pattern HorizontalTrack uses.
    const ctx = gsap.context(() => {}, section);

    const build = () => {
      const duration = video.duration;
      if (!duration || Number.isNaN(duration)) {
        setCanScrub(false);
        return;
      }

      ctx.add(() => {
        // Pin the hero and scrub the video across the pinned distance.
        ScrollTrigger.create({
          trigger: section.current,
          start: "top top",
          end: "+=250%",           // scroll distance the scrub occupies
          pin: true,
          // Higher priority = refreshed first. This hero pin sits above the
          // horizontal track and adds pinned scroll distance; it MUST be
          // measured before the track so the track's start includes that
          // distance. Without it the track's start is 1800px too low and the
          // pin/spacer misalign, glitching the track→headline handoff.
          refreshPriority: 2,
          scrub: reduce ? false : 1,
          onUpdate: (self) => {
            if (reduce) return;
            const t = self.progress * duration;
            // guard: only seek when ready to avoid mobile stalls
            if (video.readyState >= 2) video.currentTime = t;
          },
        });

        // Title pulls focus then releases as you scroll into the lens
        if (!reduce) {
          gsap.to(titleRef.current, {
            scrollTrigger: {
              trigger: section.current,
              start: "top top",
              end: "+=120%",
              scrub: 1,
            },
            opacity: 0,
            scale: 1.15,
            filter: "blur(12px)",
            ease: "none",
          });
        }
      });

      // The hero pin is created asynchronously (on loadedmetadata), which
      // inserts its pin spacer AFTER the track below has already measured its
      // start/end. Refresh so every downstream trigger recomputes against the
      // final layout - otherwise the track→headline handoff jumps.
      ScrollTrigger.refresh();
    };

    let onMeta;
    if (video.readyState >= 1) build();
    else {
      onMeta = () => build();
      video.addEventListener("loadedmetadata", onMeta, { once: true });
    }

    return () => {
      if (onMeta) video.removeEventListener("loadedmetadata", onMeta);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={section} className="hero">
      <div className="hero-media">
        <video
          ref={videoRef}
          className="hero-video"
          src={`${import.meta.env.BASE_URL}media/hero.mp4`}
          poster={`${import.meta.env.BASE_URL}media/hero-poster.jpg`}
          muted
          playsInline
          preload="auto"
          onError={() => setCanScrub(false)}
        />
        {!canScrub && <div className="hero-fallback-zoom" />}
        <div className="hero-vignette" />
      </div>

      <div ref={titleRef} className="hero-title">

        <h1>
          Does the<br />internet<br />sell tickets?
        </h1>
        <p className="hero-sub" style={{ maxWidth: "100%", fontSize: "1rem" }}>
          A project by Red Pandas based on the analysis of hollywood movies released in 2024.
        </p>
      </div>

      <div className="hero-scrollcue mono" aria-hidden="true">
        scroll ↓
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          right: "40px",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: 0.75
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Logo"
          style={{
            height: "150px",
            width: "auto"
          }}
        />
        <span
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "4px",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontWeight: "800",
            fontSize: "1.1rem",
            color: "#ffffff",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            whiteSpace: "nowrap",
            textShadow: "0 2px 10px rgba(0,0,0,0.8), 0 0 5px rgba(0,0,0,0.5)"
          }}
        >
          Red Pandas
        </span>
      </div>
    </section>
  );
}
