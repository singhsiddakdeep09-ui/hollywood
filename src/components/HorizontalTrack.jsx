import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Panel from "./Panel";
import { PANELS } from "../data/panels";

/*
  HorizontalTrack - the filmstrip.
  A pinned viewport; vertical scroll translates the track on X.
  Native vertical scroll is preserved (accessible, mobile-safe);
  only the visual movement is horizontal.
*/
export default function HorizontalTrack() {
  const wrap = useRef(null);
  const track = useRef(null);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // stacks vertically via CSS instead

    const ctx = gsap.context(() => {
      const el = track.current;
      const distance = () => el.scrollWidth - window.innerWidth;

      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          // scrub:true ties the horizontal x directly to scroll (no easing lag).
          // With scrub:<number>, x lags the raw scroll, so at the pin's end the
          // pin releases while the last panel hasn't finished sliding to centre -
          // that desync is the "blank → panel 4 reappears" glitch at the handoff.
          scrub: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          // Lower than the hero pin above so the hero refreshes first and this
          // track's start correctly includes the hero's pinned distance.
          refreshPriority: 1,
        },
      });

      // Each panel animates as it enters the centre of the viewport
      gsap.utils.toArray(".panel").forEach((p) => {
        gsap.from(p.querySelectorAll("[data-rise]"), {
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: p,
            containerAnimation: tween,
            start: "left center",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={wrap} className="track-wrap">
      <div ref={track} className="track">
        {PANELS.map((p, i) => (
          <Panel key={i} index={i} total={PANELS.length} {...p} />
        ))}
      </div>
    </section>
  );
}
