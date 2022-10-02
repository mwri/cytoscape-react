import Cytoscape from 'cytoscape';
import CyDomNode from 'cytoscape-dom-node';
import lodash from 'lodash';
import { PropTypes } from 'prop-types';
import React, {
    useEffect, useRef, useState,
} from 'react';

Cytoscape.use(CyDomNode);

/**
 * Cytoscape graph React component.
 *
 * @component
 * @returns {React.ReactElement} component
 */
function Graph({
    cyParams, layoutParams, layoutDebounce, children,
}) {
    const [ready, setReady] = useState(false);
    const domRef = useRef(null);
    const cytoscapeRef = useRef(null);
    const layoutRef = useRef(null);

    function runLayout() {
        if (layoutRef.current !== null) {
            layoutRef.current.stop();
        }
        layoutRef.current = cytoscapeRef.current.layout(layoutParams);
        layoutRef.current.run();
    }

    const debouncedRunLayout = lodash.debounce(runLayout, layoutDebounce);

    useEffect(() => {
        const augmentedCyParams = {
            container: domRef.current,
            style: [{
                selector: 'node',
                style: { 'background-opacity': 0, shape: 'rectangle' },
            }],
            ...cyParams,
        };

        const cy = Cytoscape(augmentedCyParams);
        cy.domNode({ dom_container: domRef.current.querySelector('.cytoscape-react-nodes-and-edges') });
        cytoscapeRef.current = cy;
        setReady(true);

        const resizeObserver = new ResizeObserver(
            lodash.debounce(() => {
                const style = getComputedStyle(domRef.current);
                domRef.current.style.height = `${Math.round(Number(style.width.replace('px', '')) / 2)}px`;
                cy.fit();
            }, 300),
        );

        resizeObserver.observe(domRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        debouncedRunLayout();
    }, [ready, layoutParams]);

    let nodesAndEdges = [];
    if (cytoscapeRef.current !== null) {
        nodesAndEdges = React.Children.map(children, (c) => React.cloneElement(c, {
            cytoInstance: cytoscapeRef.current,
            layout: debouncedRunLayout,
        }));
    }

    return (
        <div ref={domRef} className="cytoscape-react-cy-container">
            <div className="cytoscape-react-nodes-and-edges">
                {nodesAndEdges}
            </div>
        </div>
    );
}

Graph.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
    layoutParams: PropTypes.shape({}),
    cyParams: PropTypes.shape({}),
    layoutDebounce: PropTypes.number,
};

Graph.defaultProps = {
    cyParams: {},
    layoutParams: {},
    layoutDebounce: 100,
};

export default Graph;
