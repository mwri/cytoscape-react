# cytoscape-react

Make Cytoscape nodes into React Components!

A demo is available at [codepen qBmbVPg](https://codepen.io/mwri/pen/qBmbVPg).

## Depenedencies

* cytoscape ^3.19.0
* react ^17.0.2
* react-dom ^17.0.2

## Usage instructions

There are siz classes made available by `cytoscape-react`, but you probably only need
to take any notice of three of them. Any meaningful implementation would generally
compel you to sub class `GraphWrapper` so that you can manage things like layout
behaviour, and sub class `Node` for components that are nodes.

A recommended starting point would be something like this:

```js
const CyReact = require('cytoscape-react');

class MyGraphWrapper extends CyReact.GraphWrapper {
    constructor () {
        super();

        this._debounced_layout = lodash.debounce(() => {
            this._layout = this._cy.layout({'name': 'cose-bilkent'});
            this._layout.run();
        }, 50, {'trailing': true});
    }

    layout (params = {}) {
        if (this._layout) {
            this._layout.stop();
            this._layout = undefined;
        }

        this._debounced_layout(params);
    }

    cyReady (cy) {
        this._cy = cy;
    }

    graphElementDidMount (el_component) {
        this.layout();
    }

    graphElementDidUpdate (el_component) {
        this.layout();
    }
}

class MyGraph extends CyReact.Graph {
    render () {
        return (
            <MyGraphWrapper>
                <CyReact.NodeWrapper key="foo" id="foo">
                    <CyReact.Node/>
                </CyReact.NodeWrapper>
                <CyReact.NodeWrapper key="bar" id="bar">
                    <CyReact.Node/>
                </CyReact.NodeWrapper>
                <CyReact.NodeWrapper key="bazzz" id="bazzz">
                    <CyReact.Node/>
                </CyReact.NodeWrapper>

                <CyReact.EdgeWrapper key="foo_bar" id="foo_bar" source="foo" target="bar"/>
                <CyReact.EdgeWrapper key="bar_bazzz" id="bar_bazzz" source="bar" target="bazzz"/>
            </MyGraphWrapper>
        );
    }
}
```

Here, the `CyReact.Node` component is used directly, and the result will be a
very plain render, showing the ID of the node in a div, however you can put
any component derived from `CyReact.Node` inside the `CyReact.NodeWrapper`
components. For example:

```js
class MagentaComponent extends CyReact.Node {
    render () {
        return (<div className="rp-node-b">magenta {this.props.id}</div>);
    }
}
```

For a simple demo see [codepen WNjoerd](https://codepen.io/mwri/pen/WNjoerd).
For a more interesting demo see [codepen qBmbVPg](https://codepen.io/mwri/pen/qBmbVPg).
