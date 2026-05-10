# cytoscape-react

Cytoscape graphs with React components as nodes.

`cytoscape-react` renders React node content into a DOM overlay managed by
[`cytoscape-dom-node`](https://github.com/mwri/cytoscape-dom-node), while
Cytoscape keeps ownership of graph layout, edges, selection, zooming, and
panning.

## Dependencies

- Cytoscape `^3.19.0`
- cytoscape-dom-node `^2.1.0`
- React `^17.0.2 || ^18.0.0 || ^19.0.0`
- React DOM `^17.0.2 || ^18.0.0 || ^19.0.0`

## Installation

```sh
npm install cytoscape-react cytoscape cytoscape-dom-node react react-dom
```

Import the package CSS once in your app:

```ts
import "cytoscape-react/index.css";
```

## Usage

```tsx
import { Edge, Graph, Node } from "cytoscape-react";

function MyGraph() {
  return (
    <Graph layoutParams={{ name: "cose" }}>
      <Node id="foo">
        <strong>Foo</strong>
      </Node>
      <Node id="bar">
        <label>
          Bar label
          <input defaultValue="editable" />
        </label>
      </Node>

      <Edge id="foo-bar" source="foo" target="bar" />
    </Graph>
  );
}
```

`Graph`, `Node`, and `Edge` remain named exports.

## Components

### Graph

`Graph` owns the Cytoscape core instance and injects it into child nodes and
edges.

Useful props:

- `cyParams`: additional Cytoscape constructor options. `container` is supplied
  by `Graph`.
- `domNodeOptions`: options forwarded to `cy.domNode()`. `domContainer` is
  supplied by `Graph`.
- `layoutParams`: Cytoscape layout options, defaulting to `{ name: "cose" }`.
- `layoutDebounce`: debounce delay for layout requests, defaulting to `100`.
- `onReady`: callback receiving the Cytoscape core and DOM-node renderer.

### Node

`Node` creates a Cytoscape node whose `data.dom` points at the rendered React
element.

Useful props:

- `id`: Cytoscape node id.
- `classes`: string or string array of Cytoscape classes.
- `data`: extra Cytoscape data fields.
- `position` or `renderedPosition`: initial position.
- `selected`, `locked`, `grabbable`, `selectable`: initial Cytoscape state.

### Edge

`Edge` creates a Cytoscape edge once both endpoint nodes exist. If either
endpoint is removed, the edge is removed too.

Useful props:

- `id`: Cytoscape edge id.
- `source`: source node id.
- `target`: target node id.
- `classes`: string or string array of Cytoscape classes.
- `data`: extra Cytoscape data fields.

## Compatibility

The v4 component names and core props are preserved:

- `Graph`, `Node`, `Edge`
- `cyParams`
- `layoutParams`
- `layoutDebounce`
- `classes`
- injected child props: `cytoInstance` and `layout`

Runtime `prop-types` were removed because the package is now authored in
TypeScript and publishes declaration files.

## Development

```sh
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
npm run docs
npm run check
```
