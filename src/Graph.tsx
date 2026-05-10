/**
 * React Graph component.
 *
 * @packageDocumentation
 */

import cytoscape from "cytoscape";
import registerDomNode, {
  type DomNodeOptions,
  type DomNodeRenderer,
} from "cytoscape-dom-node";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { injectChildProps } from "./utils";

let isDomNodeRegistered = false;

/**
 * Register the cytoscape-dom-node extension once for this module instance.
 */
function registerCytoscapeDomNode(): void {
  if (isDomNodeRegistered) {
    return;
  }

  cytoscape.use(registerDomNode);
  isDomNodeRegistered = true;
}

/**
 * Props accepted by {@link Graph}.
 */
export interface GraphProps {
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

const defaultNodeStyle: cytoscape.StylesheetJson = [
  {
    selector: "node",
    style: {
      "background-opacity": 0,
      shape: "rectangle",
    },
  },
];

/**
 * React component that owns a Cytoscape core instance and renders
 * {@link Node} and {@link Edge} children into it.
 */
export function Graph({
  autoHeight = true,
  children,
  className,
  cyParams = {},
  domNodeOptions = {},
  fitOnResize = true,
  heightRatio = 0.5,
  layoutDebounce = 100,
  layoutParams = { name: "cose" },
  onReady,
  style,
}: GraphProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const cytoscapeContainerRef = useRef<HTMLDivElement>(null);
  const domNodeLayerRef = useRef<HTMLDivElement>(null);
  const cytoscapeRef = useRef<cytoscape.Core | null>(null);
  const layoutRef = useRef<cytoscape.Layouts | null>(null);
  const layoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeFrameRef = useRef<number | null>(null);
  const autoHeightRef = useRef(autoHeight);
  const cyParamsRef = useRef(cyParams);
  const domNodeOptionsRef = useRef(domNodeOptions);
  const fitOnResizeRef = useRef(fitOnResize);
  const heightRatioRef = useRef(heightRatio);
  const layoutParamsRef = useRef(layoutParams);
  const onReadyRef = useRef(onReady);
  const [cytoInstance, setCytoInstance] = useState<cytoscape.Core | null>(null);

  const clearLayoutTimer = useCallback(() => {
    if (layoutTimerRef.current) {
      clearTimeout(layoutTimerRef.current);
      layoutTimerRef.current = null;
    }
  }, []);

  const clearResizeFrame = useCallback(() => {
    if (resizeFrameRef.current !== null) {
      window.cancelAnimationFrame(resizeFrameRef.current);
    }
    resizeFrameRef.current = null;
  }, []);

  const runLayoutNow = useCallback(() => {
    const currentCy = cytoscapeRef.current;

    if (!currentCy || currentCy.destroyed() || currentCy.elements().empty()) {
      return;
    }

    layoutRef.current?.stop();
    layoutRef.current = currentCy.layout(layoutParamsRef.current);
    layoutRef.current.run();
  }, []);

  const requestLayout = useCallback(() => {
    clearLayoutTimer();
    layoutTimerRef.current = setTimeout(() => {
      layoutTimerRef.current = null;
      runLayoutNow();
    }, layoutDebounce);
  }, [clearLayoutTimer, layoutDebounce, runLayoutNow]);

  useEffect(() => {
    layoutParamsRef.current = layoutParams;
    requestLayout();
  }, [layoutParams, requestLayout]);

  useEffect(() => {
    autoHeightRef.current = autoHeight;
    cyParamsRef.current = cyParams;
    domNodeOptionsRef.current = domNodeOptions;
    fitOnResizeRef.current = fitOnResize;
    heightRatioRef.current = heightRatio;
    onReadyRef.current = onReady;
  }, [autoHeight, cyParams, domNodeOptions, fitOnResize, heightRatio, onReady]);

  useEffect(() => {
    const container = containerRef.current;
    const cytoscapeContainer = cytoscapeContainerRef.current;
    const domNodeLayer = domNodeLayerRef.current;

    if (!container || !cytoscapeContainer || !domNodeLayer) {
      return undefined;
    }

    registerCytoscapeDomNode();

    const cy = cytoscape({
      container: cytoscapeContainer,
      style: defaultNodeStyle,
      ...cyParamsRef.current,
    });
    const renderer = cy.domNode({
      ...domNodeOptionsRef.current,
      domContainer: domNodeLayer,
    });

    cytoscapeRef.current = cy;
    setCytoInstance(cy);
    onReadyRef.current?.(cy, renderer);

    const resizeObserver = new ResizeObserver(() => {
      if (resizeFrameRef.current !== null) {
        return;
      }

      resizeFrameRef.current = window.requestAnimationFrame(() => {
        resizeFrameRef.current = null;

        if (autoHeightRef.current) {
          container.style.height = `${String(
            Math.round(
              container.getBoundingClientRect().width * heightRatioRef.current,
            ),
          )}px`;
        }

        cy.resize();
        if (fitOnResizeRef.current) {
          cy.fit();
        }
      });
    });

    resizeObserver.observe(container);

    return () => {
      clearLayoutTimer();
      clearResizeFrame();
      resizeObserver.disconnect();
      layoutRef.current?.stop();
      renderer.destroy();
      cy.destroy();
      cytoscapeRef.current = null;
      setCytoInstance(null);
    };
  }, [clearLayoutTimer, clearResizeFrame]);

  const childProps = {
    cytoInstance,
    layout: requestLayout,
  };
  const containerClassName = ["cytoscape-react-cy-container", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={containerRef} className={containerClassName} style={style}>
      <div
        ref={cytoscapeContainerRef}
        className="cytoscape-react-cytoscape-container"
      />
      <div ref={domNodeLayerRef} className="cytoscape-react-nodes-and-edges">
        {cytoInstance ? injectChildProps(children, childProps) : null}
      </div>
    </div>
  );
}

export default Graph;
