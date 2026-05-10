import { ReactNode, CSSProperties } from 'react';
import cytoscape from 'cytoscape';
import { DomNodeOptions, DomNodeRenderer } from 'cytoscape-dom-node';

/**
 * Props injected into `Graph`, `Node`, and `Edge` children for compatibility
 * with earlier cytoscape-react releases.
 */
interface CytoscapeReactChildProps {
    /**
     * Current Cytoscape core instance.
     */
    cytoInstance?: cytoscape.Core | null | undefined;
    /**
     * Request a graph layout run.
     */
    layout?: (() => void) | undefined;
}
/**
 * Class input accepted by Cytoscape element definitions.
 */
type ElementClasses = string | readonly string[];

/**
 * React Edge component.
 *
 * @packageDocumentation
 */

/**
 * Props accepted by {@link Edge}.
 */
interface EdgeProps extends CytoscapeReactChildProps {
    /**
     * Optional React content rendered once both endpoint nodes exist.
     */
    children?: ReactNode;
    /**
     * Cytoscape classes to apply to the backing edge.
     */
    classes?: ElementClasses;
    /**
     * Additional Cytoscape data fields. `id`, `source`, and `target` are supplied
     * by this component and override matching keys.
     */
    data?: Record<string, unknown>;
    /**
     * Unique Cytoscape edge id.
     */
    id: string;
    /**
     * Source node id.
     */
    source: string;
    /**
     * Target node id.
     */
    target: string;
}
/**
 * React component that creates and owns a Cytoscape edge once both endpoints
 * are present.
 */
declare function Edge({ children, classes, cytoInstance, data, id, layout, source, target, }: EdgeProps): ReactNode;

/**
 * React Graph component.
 *
 * @packageDocumentation
 */

/**
 * Props accepted by {@link Graph}.
 */
interface GraphProps {
    /**
     * Cytoscape-backed child nodes and edges.
     */
    children?: ReactNode;
    /**
     * Additional CSS class for the Cytoscape container element.
     */
    className?: string;
    /**
     * Cytoscape constructor options. The `container` option is always supplied
     * by this component.
     */
    cyParams?: cytoscape.CytoscapeOptions;
    /**
     * Options passed to `cy.domNode()`. `domContainer` is owned by this component.
     */
    domNodeOptions?: Omit<DomNodeOptions, "domContainer" | "dom_container">;
    /**
     * Whether the component should maintain a height based on its rendered width.
     */
    autoHeight?: boolean;
    /**
     * Container height divided by width when `autoHeight` is enabled.
     */
    heightRatio?: number;
    /**
     * Whether to call `cy.fit()` after resize observations.
     */
    fitOnResize?: boolean;
    /**
     * Cytoscape layout options used whenever children request layout.
     */
    layoutParams?: cytoscape.LayoutOptions;
    /**
     * Debounce delay for layout requests in milliseconds.
     */
    layoutDebounce?: number;
    /**
     * Called once the Cytoscape core and DOM node renderer are ready.
     */
    onReady?: (cy: cytoscape.Core, renderer: DomNodeRenderer) => void;
    /**
     * Inline style for the Cytoscape container element.
     */
    style?: CSSProperties;
}
/**
 * React component that owns a Cytoscape core instance and renders
 * {@link Node} and {@link Edge} children into it.
 */
declare function Graph({ autoHeight, children, className, cyParams, domNodeOptions, fitOnResize, heightRatio, layoutDebounce, layoutParams, onReady, style, }: GraphProps): ReactNode;

/**
 * React Node component.
 *
 * @packageDocumentation
 */

/**
 * Props accepted by {@link Node}.
 */
interface NodeProps extends CytoscapeReactChildProps {
    /**
     * React content rendered inside the DOM-backed Cytoscape node.
     */
    children?: ReactNode;
    /**
     * Cytoscape classes to apply to the backing node.
     */
    classes?: ElementClasses;
    /**
     * Additional Cytoscape data fields. `id` and `dom` are supplied by this
     * component and override matching keys.
     */
    data?: Record<string, unknown>;
    /**
     * Unique Cytoscape element id.
     */
    id: string;
    /**
     * Initial model position for the Cytoscape node.
     */
    position?: cytoscape.Position;
    /**
     * Initial rendered position for the Cytoscape node.
     */
    renderedPosition?: cytoscape.Position;
    /**
     * Initial selection state.
     */
    selected?: boolean;
    /**
     * Initial locked state.
     */
    locked?: boolean;
    /**
     * Initial grabbable state.
     */
    grabbable?: boolean;
    /**
     * Initial selectable state.
     */
    selectable?: boolean;
}
/**
 * React component that creates and owns a DOM-backed Cytoscape node.
 */
declare function Node({ children, classes, cytoInstance, data, grabbable, id, layout, locked, position, renderedPosition, selectable, selected, }: NodeProps): ReactNode;

export { type CytoscapeReactChildProps, Edge, type EdgeProps, type ElementClasses, Graph, type GraphProps, Node, type NodeProps };
