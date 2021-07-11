const React     = require('react');
const ReactDOM  = require('react-dom');


class NodeWrapper extends React.Component {
    componentDidMount () {
        let props = this.props;

        if (props.cy)
            this._init_cy();
    }

    componentDidUpdate (prev_props) {
        let props = this.props;

        if (props.cy && !prev_props.cy)
            this._init_cy();
    }

    _init_cy () {
        let props = this.props;

        if (!props.cy)
            return;

        if (props.cy.getElementById(props.id).length === 0)
            props.cy.add({'data': Object.assign({}, props, {'dom': ReactDOM.findDOMNode(this)})});
    }

    render () {
        let props = this.props;

        return (
            <div className="cytoscape-react-node">
                {props.children ? React.cloneElement(props.children, props) : null}
            </div>
        );
    }
}


module.exports = {
    'NodeWrapper': NodeWrapper,
};
