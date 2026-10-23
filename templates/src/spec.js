// The specification, as data.
//
// This file is imported by BOTH the React app and the build-time
// prerenderer. Neither owns it, and neither transforms it: the same two
// arrays produce the runtime DOM and the crawlable HTML. That is the whole
// point of the integration — the UI is a value you can import, diff, send
// over a wire, validate, or generate.

/** E — what exists. */
export const elements = [
  {
    type: "wrap",
    id: "hero",
    children: [
      { type: "h1", id: "title", text: "Declared as data" },
      {
        type: "p",
        text:
          "This block was not written as components. It is a plain array of " +
          "objects, rendered by Nodality inside a React tree — and prerendered " +
          "to HTML at build time, so a crawler sees it with JavaScript off.",
      },
      {
        type: "a",
        text: "Read the docs",
        url: "https://nodalityjs.github.io/",
        background: "#1D6FE0",
        color: "white",
        block: true,
        width: "200px",
        align: "center",
      },
    ],
  },
];

/** N — what is done to it. */
export const nodes = [
  { op: "blast", target: ["title"], color: "#1D6FE0", width: "2px" },
];
