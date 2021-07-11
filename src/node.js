const React     = require('react');
const ReactDOM  = require('react-dom');


class Node extends React.Component {
    componentDidMount () {
        let props = this.props;

        if (props._cdm_cb)
            props._cdm_cb(this);
    }

    componentDidUpdate () {
        let props = this.props;

        if (props._cdu_cb)
            props._cdu_cb(this);
    }

    render () {
        return (<div className="cytoscape-react-node-default">{this.props.id}</div>);
    }
}


module.exports = {
    'Node': Node,
};
