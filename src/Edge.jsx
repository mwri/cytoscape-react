import { PropTypes } from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';

/**
 * Cytoscape edge React component.
 *
 * @component
 * @returns {React.ReactElement} component
 */
function Edge({
    cytoInstance, id, source, target, children, layout,
}) {
    const domRef = useRef();
    const [missing, setMissing] = useState(2);

    function addEdge(cyEdgeData) {
        cytoInstance.add({ data: cyEdgeData });
    }

    function missingNodeCount(source2, target2) {
        let missingCount = 2;
        const cytoSourceNode = cytoInstance.getElementById(source2);
        if (cytoSourceNode.length === 1) { missingCount -= 1; }
        const cytoTargetNode = cytoInstance.getElementById(target2);
        if (cytoTargetNode.length === 1) { missingCount -= 1; }
        return missingCount;
    }

    useEffect(() => {
        const nowMissing = missingNodeCount(source, target);
        if (nowMissing !== missing) { setMissing(nowMissing); }
        if (nowMissing === 0) { addEdge({ id, source, target }); }

        function onAddNode(ev) {
            const evId = ev.target.id();
            if (evId === source || evId === target) {
                const postEvMissing = missingNodeCount(source, target);
                if (postEvMissing !== missing) { setMissing(postEvMissing); }
                if (postEvMissing === 0) { addEdge({ id, source, target }); }
            }
        }

        function onRemoveNode(ev) {
            const evId = ev.target.id();

            if (evId === source || evId === target) {
                const postEvMissing = missingNodeCount(source, target);
                if (postEvMissing !== missing) { setMissing(postEvMissing); }
                if (postEvMissing > 0) { cytoInstance.getElementById(id).remove(); }
            }
        }

        cytoInstance.on('add', 'node', onAddNode);
        cytoInstance.on('remove', 'node', onRemoveNode);

        return () => {
            cytoInstance.getElementById(id).remove();
            cytoInstance.off('add', 'node', onAddNode);
            cytoInstance.off('remove', 'node', onRemoveNode);
        };
    }, []);

    useEffect(() => {
        layout();
    }, [id, children]);

    if (missing > 0) { return null; }

    function newChild(c) {
        return React.cloneElement(c, { cytoInstance, layout });
    }

    const edges = React.Children.map(children, newChild);

    return (
        <div ref={domRef} className="cytoscape-react-edge">
            {edges}
        </div>
    );
}

Edge.propTypes = {
    id: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
    cytoInstance: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
    layout: PropTypes.func,
};

Edge.defaultProps = {
    cytoInstance: null,
    children: [],
    layout: () => {},
};

export default Edge;
