# Modern Demo

This demo is intended as the basis for a new CodePen. It uses React functional
components, the local TypeScript source, DOM-backed Cytoscape nodes, editable
controls inside some nodes, and add/delete interactions.

Run from the repository root:

```sh
npm install
npm run demo:modern
```

Then open the Vite URL printed in the terminal.

For CodePen, copy:

- `index.html` body markup into the HTML panel.
- `../../src/index.css`, then `src/styles.css`, into the CSS panel.
- `src/App.tsx` and `src/main.tsx` into the JS panel, with CodePen's TypeScript
  or Babel preprocessor enabled.

Change these local imports:

```ts
import { Edge, Graph, Node } from "../../../src";
import "../../../src/index.css";
```

to a CDN import, and remove the CSS import because the package CSS is copied
into the CSS panel:

```ts
import { Edge, Graph, Node } from "https://esm.sh/cytoscape-react@5.0.0";
```
