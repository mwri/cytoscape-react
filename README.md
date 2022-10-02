# cytoscape-react

Make Cytoscape nodes into React Components!

A demo is available at [codepen qBmbVPg](https://codepen.io/mwri/pen/qBmbVPg).

Version 4 is a complete rewrite for React functional components, and quite
a bit simpler, currently.

## Depenedencies

* cytoscape ^3.19.0
* react ^17.0.2
* react-dom ^17.0.2

## Usage instructions

There are three components made available by `cytoscape-react`.
A recommended starting point would be something like this:

```js
import { Graph, Node, Edge } from 'cytoscape-react';

function MyGraph() {
    return (
        <Graph layoutParams={{ name: 'cose' }}>
            <Node key="foo" id="foo"> <YourComponent /> </Node>
            <Node key="bar" id="bar"> <YourOtherComponent /> </Node>
            <Node key="baz" id="baz"> <YetAnotherCompontOfYours /> </Node>

            <Edge key="foo_bar" id="foo_bar" source="foo" target="bar" />
            <Edge key="bar_baz" id="bar_baz" source="bar" target="baz" />
        </Graph>
    );
}

For a simple demo see [codepen WNjoerd](https://codepen.io/mwri/pen/WNjoerd).
For a more interesting demo see [codepen qBmbVPg](https://codepen.io/mwri/pen/qBmbVPg).
