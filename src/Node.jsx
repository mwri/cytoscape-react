import React from 'react';


class Node extends React.Component {
    componentDidMount() {
        const { props } = this;

        if (props.cdm_cb) { props.cdm_cb(this); }
    }

    componentDidUpdate() {
        const { props } = this;

        if (props.cdu_cb) { props.cdu_cb(this); }
    }

    render() {
        const { id } = this.props;

        return (<div className="cytoscape-react-node-default">{id}</div>);
    }
}

export default Node;
