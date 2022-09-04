import React from 'react';


class NodeWrapper extends React.Component {
    constructor(props) {
        super(props);

        this._wrapper = React.createRef();
    }

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
            props.cy.add({'data': Object.assign({}, props, {'dom': this._wrapper.current})});
    }

    render () {
        let props = this.props;

        return (
            <div ref={this._wrapper} className="cytoscape-react-node">
                {props.children ? React.cloneElement(props.children, props) : null}
            </div>
        );
    }
}


export default NodeWrapper;
