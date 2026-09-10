import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import VideoHero from "./components/VideoHero";
import HorizontalTrack from "./components/HorizontalTrack";
import MainScatter from "./components/MainScatter";
import Validation from "./components/Validation";
import "./App.css";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const refresh = () => ScrollTrigger.refresh();
    const ctx = gsap.context(() => {
      ScrollTrigger.refresh();
    }, root);
    // Late layout shifts (video metadata, web fonts, charts sizing) move the
    // pinned sections' boundaries; re-measure once everything has settled so
    // the pin handoffs stay glitch-free.
    window.addEventListener("load", refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    const t = setTimeout(refresh, 400);
    return () => {
      window.removeEventListener("load", refresh);
      clearTimeout(t);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={root}>
      <VideoHero />
      <HorizontalTrack />
      <MainScatter />
      <Validation />
    </div>
  );
}
