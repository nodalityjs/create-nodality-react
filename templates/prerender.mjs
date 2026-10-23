// Build-time prerender: React to HTML, then Nodality into the hosts React left.
//
// Without this step a crawler sees `<div id="root"></div>` and nothing else —
// which is the failure mode Nodality's prerendering exists to fix, and which a
// client-only React integration reintroduces. Two passes, because there are
// two renderers: React produces the page structure, Nodality fills each
// specification host inside it.
import { readFile, writeFile } from "node:fs/promises";
import { prerender } from "nodality/ssg";

const OUT = "dist/index.html";

// ── pass 1 · React ───────────────────────────────────────────────────
const { render } = await import("./dist-server/entry-server.js");
const shell = await readFile("dist/index.html", "utf8");
await writeFile(OUT, shell.replace("<!--app-html-->", render()), "utf8");

// ── pass 2 · Nodality ────────────────────────────────────────────────
// Every <Nodality> emitted its specification beside its host, so this walks
// the document rather than being told what the app contains. Add a component,
// and it is prerendered too, with no change here.
let filled = 0;
const { bytes } = await prerender({
  template: OUT,
  output: OUT,
  mount: "#root",
  build: async (window) => {
    const { Des } = await import("nodality");
    const specs = window.document.querySelectorAll("script[data-nodality-for]");

    for (const tag of specs) {
      const id = tag.getAttribute("data-nodality-for");
      if (!window.document.getElementById(id)) continue;

      const { elements, nodes = [], defs } = JSON.parse(tag.textContent);
      const d = new Des();
      if (defs) d.defs(defs);
      d.nodes(nodes)
        .add(elements)
        .set({ mount: "#" + id, code: false, elements: false, layout: false });

      // Des.set() appends its code panel to document.body. Hidden is not
      // enough at build time — it would be serialised into every page.
      d._preEl?.remove();
      d._codeEl?.remove();
      filled++;
    }
  },
});

console.log(`prerendered ${filled} specification host(s) → ${OUT} (${bytes} bytes)`);
