# create-nodality-react

Scaffold a React + Vite project that renders [Nodality](https://github.com/nodalityjs/nodality)
specifications, prerendered to static HTML at build time.

```bash
npm create nodality-react@latest my-app
cd my-app
npm run build
```

Then open `dist/index.html` in a text editor. The content is there as real
markup, before any script runs.

## Two regimes, both first-class

Nodality has two surfaces, and its React component — `import Nodality from
"nodality/react"` — hosts either.

**1 — a specification.** `E` is what exists, `N` is what is done to it:

```js
export const elements = [
  { type: "wrap", id: "hero", children: [
      { type: "h1", id: "title", text: "Declared as data" },
  ]},
];
export const nodes = [
  { op: "blast", target: ["title"], color: "#1D6FE0", width: "2px" },
];
```

```jsx
<Nodality elements={elements} nodes={nodes} />
```

**2 — component code you own.** The classes the compiler emits, and which you
take ownership of after generation:

```jsx
const view = useMemo(() => () =>
  new Wrapper().set({ background: "#FFF7ED" })
    .add([ new Text(`count ${count}`).set({ size: "S5" }) ]), [count]);

<Nodality view={view} deps={[count]} />
```

`view` is a factory rather than an instance, so it is not rebuilt on every
parent render; `deps` says when it should be, with useEffect's meaning.

Neither is a fallback for the other. The pair is what a generator emits and
what the compiler consumes; the classes are what the compiler produces and what
a developer edits afterwards. A binding that supported only one would be
describing half the library.

### The difference that matters

**Only the specification survives the build.** After `npm run build`, block 1
is in `dist/index.html` as real markup; block 2 is not. A specification is
data, so the prerenderer can find it in the page and render it at build time. A
`view` is a closure over your module graph — it cannot be serialised into a
document, so it renders on the client only.

That is not a shortcoming of this component. It is the difference between data
and code, which is the distinction the library exists to draw. If you want a
block crawlable, express it as a specification. If you have taken ownership of
the emitted code, you have chosen the other regime and its trade-off.

## Dropping it into an existing React app

You do not need this scaffold. The component ships with Nodality itself
(1.3.25 and later), so any React 18+ project that has `nodality` installed can
use it directly:

```jsx
import Nodality from "nodality/react";
```

It has no dependencies beyond React and Nodality, and it is a client component
(`"use client"`), so it also works in the Next.js App Router.

The prerender step is separate and optional; without it you get a normal
client-rendered React component, and a crawler sees an empty div. It applies to
specifications only — see above.

## Prerendering, and why it is two passes

`npm run build` runs three commands:

```
vite build                                        # client bundle
vite build --ssr src/entry-server.jsx             # server bundle
node prerender.mjs                                # React → HTML, then Nodality
```

There are two renderers, so there are two passes. React renders the page
structure, leaving an empty host for each specification. Nodality then fills
each host inside a simulated DOM (`nodality/ssg`, which uses jsdom).

`prerender.mjs` finds the hosts by walking the document, not by being told what
your app contains: each `<Nodality>` emits its specification beside itself as
`<script type="application/json" data-nodality-for="…">`. Add a component
anywhere in the tree and it is prerendered too, with no change to the build
script. The specification travelling with the page is not a trick — it is the
same property the library is built on.

## Three things worth knowing

**The host div is externally managed.** It is rendered with an empty
`dangerouslySetInnerHTML`, which tells React to stop reconciling that subtree.
Without it, hydration fails with React #418/#423 and silently re-renders the
whole root on the client, because React's virtual tree says the div is empty
while the DOM says otherwise. `suppressHydrationWarning` is not sufficient —
it covers attributes and text, not extra element children.

**The effect is keyed on the specification by value, not on prop identity.** A
parent re-render creates fresh object literals; depending on those rebuilds the
whole subtree on every keystroke, losing focus, scroll position and animation
state. Click the counter in the scaffolded app — the block above it is not
rebuilt.

**Your page needs to declare a background.** Nodality writes explicit colours
into the elements it generates, and text defaults to `rgb(17,17,17)`. A browser
in dark mode will otherwise render dark text on a dark ground. The template
sets `color-scheme: light` and an explicit body background; keep that, or set
colours in your specification.

## Layout

```
index.html            shell, with the light ground and the SSR placeholder
prerender.mjs         React → HTML, then Nodality into each host
vite.config.js
src/spec.js           the (E, N) pair — imported by React AND the prerenderer
src/App.jsx           demo
src/main.jsx          hydrates when there is markup, mounts when there is not
src/entry-server.jsx  renderToString for the SSR pass
```

## Licence

MIT
