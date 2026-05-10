"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Edge: () => Edge,
  Graph: () => Graph,
  Node: () => Node
});
module.exports = __toCommonJS(index_exports);

// src/Edge.tsx
var import_react2 = require("react");

// src/utils.ts
var import_react = require("react");
function normaliseClasses(classes) {
  if (!classes) {
    return void 0;
  }
  return typeof classes === "string" ? classes : classes.join(" ");
}
function injectChildProps(children, props) {
  return import_react.Children.map(children, (child) => {
    if (!(0, import_react.isValidElement)(child)) {
      return child;
    }
    return (0, import_react.cloneElement)(
      child,
      props
    );
  });
}

// src/Edge.tsx
var import_jsx_runtime = require("react/jsx-runtime");
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
  const [isReady, setIsReady] = (0, import_react2.useState)(false);
  const childProps = (0, import_react2.useMemo)(
    () => ({
      cytoInstance,
      layout
    }),
    [cytoInstance, layout]
  );
  const syncEdge = (0, import_react2.useCallback)(() => {
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
  (0, import_react2.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cytoscape-react-edge", children: injectChildProps(children, childProps) });
}

// src/Graph.tsx
var import_cytoscape = __toESM(require("cytoscape"));
var import_cytoscape_dom_node = __toESM(require("cytoscape-dom-node"));
var import_react3 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
var isDomNodeRegistered = false;
function registerCytoscapeDomNode() {
  if (isDomNodeRegistered) {
    return;
  }
  import_cytoscape.default.use(import_cytoscape_dom_node.default);
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
  const containerRef = (0, import_react3.useRef)(null);
  const cytoscapeContainerRef = (0, import_react3.useRef)(null);
  const domNodeLayerRef = (0, import_react3.useRef)(null);
  const cytoscapeRef = (0, import_react3.useRef)(null);
  const layoutRef = (0, import_react3.useRef)(null);
  const layoutTimerRef = (0, import_react3.useRef)(null);
  const autoHeightRef = (0, import_react3.useRef)(autoHeight);
  const cyParamsRef = (0, import_react3.useRef)(cyParams);
  const domNodeOptionsRef = (0, import_react3.useRef)(domNodeOptions);
  const fitOnResizeRef = (0, import_react3.useRef)(fitOnResize);
  const heightRatioRef = (0, import_react3.useRef)(heightRatio);
  const layoutParamsRef = (0, import_react3.useRef)(layoutParams);
  const onReadyRef = (0, import_react3.useRef)(onReady);
  const [cytoInstance, setCytoInstance] = (0, import_react3.useState)(null);
  const clearLayoutTimer = (0, import_react3.useCallback)(() => {
    if (layoutTimerRef.current) {
      clearTimeout(layoutTimerRef.current);
      layoutTimerRef.current = null;
    }
  }, []);
  const runLayoutNow = (0, import_react3.useCallback)(() => {
    const currentCy = cytoscapeRef.current;
    if (!currentCy || currentCy.destroyed() || currentCy.elements().empty()) {
      return;
    }
    layoutRef.current?.stop();
    layoutRef.current = currentCy.layout(layoutParamsRef.current);
    layoutRef.current.run();
  }, []);
  const requestLayout = (0, import_react3.useCallback)(() => {
    clearLayoutTimer();
    layoutTimerRef.current = setTimeout(() => {
      layoutTimerRef.current = null;
      runLayoutNow();
    }, layoutDebounce);
  }, [clearLayoutTimer, layoutDebounce, runLayoutNow]);
  (0, import_react3.useEffect)(() => {
    layoutParamsRef.current = layoutParams;
    requestLayout();
  }, [layoutParams, requestLayout]);
  (0, import_react3.useEffect)(() => {
    autoHeightRef.current = autoHeight;
    cyParamsRef.current = cyParams;
    domNodeOptionsRef.current = domNodeOptions;
    fitOnResizeRef.current = fitOnResize;
    heightRatioRef.current = heightRatio;
    onReadyRef.current = onReady;
  }, [autoHeight, cyParams, domNodeOptions, fitOnResize, heightRatio, onReady]);
  (0, import_react3.useEffect)(() => {
    const container = containerRef.current;
    const cytoscapeContainer = cytoscapeContainerRef.current;
    const domNodeLayer = domNodeLayerRef.current;
    if (!container || !cytoscapeContainer || !domNodeLayer) {
      return void 0;
    }
    registerCytoscapeDomNode();
    const cy = (0, import_cytoscape.default)({
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { ref: containerRef, className: containerClassName, style, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "div",
      {
        ref: cytoscapeContainerRef,
        className: "cytoscape-react-cytoscape-container"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ref: domNodeLayerRef, className: "cytoscape-react-nodes-and-edges", children: cytoInstance ? injectChildProps(children, childProps) : null })
  ] });
}

// src/Node.tsx
var import_react4 = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
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
  const domRef = (0, import_react4.useRef)(null);
  const childProps = (0, import_react4.useMemo)(
    () => ({
      cytoInstance,
      layout
    }),
    [cytoInstance, layout]
  );
  (0, import_react4.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { ref: domRef, className: "cytoscape-react-node", children: injectChildProps(children, childProps) });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Edge,
  Graph,
  Node
});
//# sourceMappingURL=index.cjs.map