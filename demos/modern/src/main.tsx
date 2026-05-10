import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { DemoApp } from "./App";
import "./styles.css";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Missing demo root element.");
}

createRoot(rootElement).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
);
