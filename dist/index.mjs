// src/Edge.tsx
import { useCallback, useEffect, useMemo, useState } from "react";

// src/utils.ts
import {
  Children,
  cloneElement,
  isValidElement
} from "react";
function normaliseClasses(classes) {
  if (!classes) {
    return void 0;
  }
  return typeof classes === "string" ? classes : classes.join(" ");
}
function injectChildProps(children, props) {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return child;
    }
    return cloneElement(
      child,
      props
    );
  });
}

// src/Edge.tsx
import { jsx } from "react/jsx-runtime";
function Edge({
  children,
  classes,
  cytoInstance,
  data,
  id,
  layout = () => void 0,
  source,
  target
}) {
  const [isReady, setIsReady] = useState(false);
  const childProps = useMemo(
    () => ({
      cytoInstance,
      layout
    }),
    [cytoInstance, layout]
  );
  const syncEdge = useCallback(() => {
    const currentCy = cytoInstance;
    if (!currentCy) {
      setIsReady(false);
      return;
    }
    const sourceNode = currentCy.getElementById(source);
    const targetNode = currentCy.getElementById(target);
    const existingEdge = currentCy.getElementById(id);
    const endpointsExist = !sourceNode.empty() && !targetNode.empty();
    if (!endpointsExist) {
      if (!existingEdge.empty()) {
        existingEdge.remove();
        layout();
      }
      setIsReady(false);
      return;
    }
    const edgeData = {
      ...data,
      id,
      source,
      target
    };
    if (existingEdge.empty()) {
      const edgeDefinition = {
        data: edgeData
      };
      const className = normaliseClasses(classes);
      currentCy.add(
        className === void 0 ? edgeDefinition : {
          ...edgeDefinition,
          classes: className
        }
      );
    } else {
      existingEdge.data(edgeData);
      existingEdge.classes(normaliseClasses(classes) ?? "");
    }
    setIsReady(true);
    layout();
  }, [classes, cytoInstance, data, id, layout, source, target]);
  useEffect(() => {
    const currentCy = cytoInstance;
    if (!currentCy) {
      return void 0;
    }
    const handleNodeChange = () => {
      syncEdge();
    };
    syncEdge();
    currentCy.on("add remove", "node", handleNodeChange);
    return () => {
      currentCy.off("add remove", "node", handleNodeChange);
      currentCy.getElementById(id).remove();
      setIsReady(false);
      layout();
    };
  }, [cytoInstance, id, layout, syncEdge]);
  if (!isReady) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: "cytoscape-react-edge", children: injectChildProps(children, childProps) });
}

// src/Graph.tsx
import cytoscape from "cytoscape";
import registerDomNode from "cytoscape-dom-node";
import {
  useCallback as useCallback2,
  useEffect as useEffect2,
  useRef,
  useState as useState2
} from "react";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var isDomNodeRegistered = false;
function registerCytoscapeDomNode() {
  if (isDomNodeRegistered) {
    return;
  }
  cytoscape.use(registerDomNode);
  isDomNodeRegistered = true;
}
var defaultNodeStyle = [
  {
    selector: "node",
    style: {
      "background-opacity": 0,
      shape: "rectangle"
    }
  }
];
function Graph({
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
  style
}) {
  const containerRef = useRef(null);
  const cytoscapeContainerRef = useRef(null);
  const domNodeLayerRef = useRef(null);
  const cytoscapeRef = useRef(null);
  const layoutRef = useRef(null);
  const layoutTimerRef = useRef(null);
  const autoHeightRef = useRef(autoHeight);
  const cyParamsRef = useRef(cyParams);
  const domNodeOptionsRef = useRef(domNodeOptions);
  const fitOnResizeRef = useRef(fitOnResize);
  const heightRatioRef = useRef(heightRatio);
  const layoutParamsRef = useRef(layoutParams);
  const onReadyRef = useRef(onReady);
  const [cytoInstance, setCytoInstance] = useState2(null);
  const clearLayoutTimer = useCallback2(() => {
    if (layoutTimerRef.current) {
      clearTimeout(layoutTimerRef.current);
      layoutTimerRef.current = null;
    }
  }, []);
  const runLayoutNow = useCallback2(() => {
    const currentCy = cytoscapeRef.current;
    if (!currentCy || currentCy.destroyed() || currentCy.elements().empty()) {
      return;
    }
    layoutRef.current?.stop();
    layoutRef.current = currentCy.layout(layoutParamsRef.current);
    layoutRef.current.run();
  }, []);
  const requestLayout = useCallback2(() => {
    clearLayoutTimer();
    layoutTimerRef.current = setTimeout(() => {
      layoutTimerRef.current = null;
      runLayoutNow();
    }, layoutDebounce);
  }, [clearLayoutTimer, layoutDebounce, runLayoutNow]);
  useEffect2(() => {
    layoutParamsRef.current = layoutParams;
    requestLayout();
  }, [layoutParams, requestLayout]);
  useEffect2(() => {
    autoHeightRef.current = autoHeight;
    cyParamsRef.current = cyParams;
    domNodeOptionsRef.current = domNodeOptions;
    fitOnResizeRef.current = fitOnResize;
    heightRatioRef.current = heightRatio;
    onReadyRef.current = onReady;
  }, [autoHeight, cyParams, domNodeOptions, fitOnResize, heightRatio, onReady]);
  useEffect2(() => {
    const container = containerRef.current;
    const cytoscapeContainer = cytoscapeContainerRef.current;
    const domNodeLayer = domNodeLayerRef.current;
    if (!container || !cytoscapeContainer || !domNodeLayer) {
      return void 0;
    }
    registerCytoscapeDomNode();
    const cy = cytoscape({
      container: cytoscapeContainer,
      style: defaultNodeStyle,
      ...cyParamsRef.current
    });
    const renderer = cy.domNode({
      ...domNodeOptionsRef.current,
      domContainer: domNodeLayer
    });
    cytoscapeRef.current = cy;
    setCytoInstance(cy);
    onReadyRef.current?.(cy, renderer);
    const resizeObserver = new ResizeObserver(() => {
      if (autoHeightRef.current) {
        container.style.height = `${String(
          Math.round(container.getBoundingClientRect().width * heightRatioRef.current)
        )}px`;
      }
      cy.resize();
      if (fitOnResizeRef.current) {
        cy.fit();
      }
    });
    resizeObserver.observe(container);
    return () => {
      clearLayoutTimer();
      resizeObserver.disconnect();
      layoutRef.current?.stop();
      renderer.destroy();
      cy.destroy();
      cytoscapeRef.current = null;
      setCytoInstance(null);
    };
  }, [clearLayoutTimer]);
  const childProps = {
    cytoInstance,
    layout: requestLayout
  };
  const containerClassName = ["cytoscape-react-cy-container", className].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsxs("div", { ref: containerRef, className: containerClassName, style, children: [
    /* @__PURE__ */ jsx2(
      "div",
      {
        ref: cytoscapeContainerRef,
        className: "cytoscape-react-cytoscape-container"
      }
    ),
    /* @__PURE__ */ jsx2("div", { ref: domNodeLayerRef, className: "cytoscape-react-nodes-and-edges", children: cytoInstance ? injectChildProps(children, childProps) : null })
  ] });
}

// src/Node.tsx
import { useEffect as useEffect3, useMemo as useMemo2, useRef as useRef2 } from "react";
import { jsx as jsx3 } from "react/jsx-runtime";
function Node({
  children,
  classes,
  cytoInstance,
  data,
  grabbable,
  id,
  layout = () => void 0,
  locked,
  position,
  renderedPosition,
  selectable,
  selected
}) {
  const domRef = useRef2(null);
  const childProps = useMemo2(
    () => ({
      cytoInstance,
      layout
    }),
    [cytoInstance, layout]
  );
  useEffect3(() => {
    const currentCy = cytoInstance;
    const domElement = domRef.current;
    if (!currentCy || !domElement) {
      return void 0;
    }
    const existingElement = currentCy.getElementById(id);
    if (!existingElement.empty()) {
      existingElement.remove();
    }
    const nodeDefinition = {
      data: {
        ...data,
        dom: domElement,
        id
      }
    };
    const className = normaliseClasses(classes);
    if (className !== void 0) {
      nodeDefinition.classes = className;
    }
    if (grabbable !== void 0) {
      nodeDefinition.grabbable = grabbable;
    }
    if (locked !== void 0) {
      nodeDefinition.locked = locked;
    }
    if (position !== void 0) {
      nodeDefinition.position = position;
    }
    if (renderedPosition !== void 0) {
      nodeDefinition.renderedPosition = renderedPosition;
    }
    if (selectable !== void 0) {
      nodeDefinition.selectable = selectable;
    }
    if (selected !== void 0) {
      nodeDefinition.selected = selected;
    }
    currentCy.add(nodeDefinition);
    layout();
    return () => {
      currentCy.getElementById(id).remove();
      layout();
    };
  }, [
    classes,
    cytoInstance,
    data,
    grabbable,
    id,
    layout,
    locked,
    position,
    renderedPosition,
    selectable,
    selected
  ]);
  return /* @__PURE__ */ jsx3("div", { ref: domRef, className: "cytoscape-react-node", children: injectChildProps(children, childProps) });
}
export {
  Edge,
  Graph,
  Node
};
//# sourceMappingURL=index.mjs.map