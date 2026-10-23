import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.jsx";

const root = document.getElementById("root");

// `npm run build` prerenders, so in production there is markup to hydrate.
// `npm run dev` serves an empty shell, so there is not.
if (root.hasChildNodes()) {
  hydrateRoot(root, <StrictMode><App /></StrictMode>);
} else {
  createRoot(root).render(<StrictMode><App /></StrictMode>);
}
