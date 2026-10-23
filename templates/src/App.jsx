import { useMemo, useState } from "react";
import { Text, Wrapper } from "nodality";
import Nodality from "nodality/react";
import { elements, nodes } from "./spec.js";

export default function App() {
  const [count, setCount] = useState(0);

  // Regime 2 — component code. `useMemo` on the factory, not on the instance,
  // so the block rebuilds when `count` changes and not before.
  const counterView = useMemo(
    () => () =>
      new Wrapper()
        .set({ background: "#FFF7ED", pad: [{ a: "1rem" }], radius: "0.5rem" })
        .add([
          new Text(`Built from component code — count ${count}`).set({
            size: "S5",
            font: "Arial",
            color: "#9A3412",
          }),
        ]),
    [count],
  );

  return (
    <main style={{ font: "16px/1.6 system-ui, sans-serif", maxWidth: 720, margin: "3rem auto", padding: "0 1rem" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>Nodality in React</h1>
      <p style={{ color: "#667", marginTop: 0 }}>
        Two regimes, both first-class. React owns the page in each case.
      </p>

      <h2 style={{ fontSize: "1rem", color: "#667", marginBottom: 0 }}>
        1 &middot; a specification — <code>(E, N)</code> as data
      </h2>
      <Nodality elements={elements} nodes={nodes} />

      <h2 style={{ fontSize: "1rem", color: "#667", marginBottom: "0.5rem" }}>
        2 &middot; component code you own
      </h2>
      <Nodality view={counterView} deps={[count]} />

      <hr style={{ margin: "2rem 0", border: 0, borderTop: "1px solid #e5e7eb" }} />

      <button onClick={() => setCount(count + 1)} style={{ font: "inherit", padding: "0.5rem 1rem" }}>
        Increment ({count})
      </button>
      <p style={{ color: "#667" }}>
        Block 2 rebuilds, because <code>deps</code> says it depends on the
        count. Block 1 does not — its specification has not changed.
      </p>
      <p style={{ color: "#667" }}>
        After <code>npm run build</code>, block 1 is in <code>dist/index.html</code>{" "}
        as real markup and block 2 is not. A specification is data and survives
        the build; a <code>view</code> is a closure and cannot.
      </p>
    </main>
  );
}
