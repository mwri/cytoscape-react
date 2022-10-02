import { PropTypes } from 'prop-types';
import React, { useEffect, useRef } from 'react';

/**
 * Cytoscape node React component.
 *
 * @component
 * @returns {React.ReactElement} component
 */
function Node({
    cytoInstance, id, children, layout, classes,
}) {
    const domRef = useRef();

    useEffect(() => {
        const data = { id, dom: domRef.current };
        cytoInstance.add({ data, classes });

        return () => {
            cytoInstance.getElementById(id).remove();
        };
    }, []);

    useEffect(() => {
        layout();
    }, [id, children]);

    function newChild(c) {
        return React.cloneElement(c, { cytoInstance, layout });
    }

    const nodes = React.Children.map(children, newChild);

    return (
        <div ref={domRef} className="cytoscape-react-node">
            {nodes}
        </div>
    );
}

Node.propTypes = {
    id: PropTypes.string.isRequired,
    cytoInstance: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
    layout: PropTypes.func,
    classes: PropTypes.arrayOf(PropTypes.string),
};

Node.defaultProps = {
    cytoInstance: null,
    layout: () => {},
    classes: [],
};

export default Node;
