const React     = require('react');
const ReactDOM  = require('react-dom');
const Cytoscape = require('cytoscape');
const CyDomNode = require('cytoscape-dom-node');


Cytoscape.use(CyDomNode);


class GraphWrapper extends React.Component {
    constructor () {
        super();

        this.state = {'cy': null};
    }

    componentDidMount () {
        let props = this.props;

        let cy_params = Object.assign({
            'container': ReactDOM.findDOMNode(this).querySelector('.cytoscape-react-cy-container'),
            'style': [{
                'selector': 'node',
                'style':    {'background-opacity': 0, 'shape': 'rectangle'},
            }],
        }, props.cy_params || {});

        let cy = Cytoscape(cy_params);
        cy.domNode({'dom_container': ReactDOM.findDOMNode(this).querySelector('.cytoscape-react-nodes-and-edges')});

        this.setState({'cy': cy});

        this.cyReady(cy);
    }

    render () {
        let state = this.state;

        let nodes_and_edges = state.cy
            ? this.props.children.map((c) => React.cloneElement(c, {
                    'cy':      state.cy,
                    '_cdm_cb': this.graphElementDidMount.bind(this),
                    '_cdu_cb': this.graphElementDidUpdate.bind(this),
                }))
            : [];

        return (
            <div>
                <div className="cytoscape-react-cy-container">
                    <div className="cytoscape-react-nodes-and-edges">
                        {nodes_and_edges}
                    </div>
                </div>
            </div>
        );
    }

    cyReady (_cy) {
    }

    graphElementDidMount (_el_component) {
    }

    graphElementDidUpdate (_el_component) {
    }
}


module.exports = {
    'GraphWrapper': GraphWrapper,
};
