"use client";

import { useEffect } from "react";

export default function TallyEmbed() {
  useEffect(() => {
    const src = "https://tally.so/widgets/embed.js";
    const load = () => {
      if (typeof (window as { Tally?: { loadEmbeds: () => void } }).Tally !== "undefined") {
        (window as { Tally?: { loadEmbeds: () => void } }).Tally!.loadEmbeds();
      }
    };
    if (document.querySelector(`script[src="${src}"]`)) {
      load();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = load;
    s.onerror = load;
    document.body.appendChild(s);
  }, []);

  return (
    <iframe
      data-tally-src="https://tally.so/embed/QKOdNY?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
      loading="lazy"
      width="100%"
      height={157}
      frameBorder={0}
      title="Get early access to CaseKit"
    />
  );
}
