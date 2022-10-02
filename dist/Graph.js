"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

var _cytoscape = _interopRequireDefault(require("cytoscape"));

var _cytoscapeDomNode = _interopRequireDefault(require("cytoscape-dom-node"));

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = require("prop-types");

var _react = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

_cytoscape.default.use(_cytoscapeDomNode.default);
/**
 * Cytoscape graph React component.
 *
 * @component
 * @returns {React.ReactElement} component
 */


function Graph(_ref) {
  let {
    cyParams,
    layoutParams,
    layoutDebounce,
    children
  } = _ref;
  const [ready, setReady] = (0, _react.useState)(false);
  const domRef = (0, _react.useRef)(null);
  const cytoscapeRef = (0, _react.useRef)(null);
  const layoutRef = (0, _react.useRef)(null);

  function runLayout() {
    if (layoutRef.current !== null) {
      layoutRef.current.stop();
    }

    layoutRef.current = cytoscapeRef.current.layout(layoutParams);
    layoutRef.current.run();
  }

  const debouncedRunLayout = _lodash.default.debounce(runLayout, layoutDebounce);

  (0, _react.useEffect)(() => {
    const augmentedCyParams = _objectSpread({
      container: domRef.current,
      style: [{
        selector: 'node',
        style: {
          'background-opacity': 0,
          shape: 'rectangle'
        }
      }]
    }, cyParams);

    const cy = (0, _cytoscape.default)(augmentedCyParams);
    cy.domNode({
      dom_container: domRef.current.querySelector('.cytoscape-react-nodes-and-edges')
    });
    cytoscapeRef.current = cy;
    setReady(true);
    const resizeObserver = new ResizeObserver(_lodash.default.debounce(() => {
      const style = getComputedStyle(domRef.current);
      domRef.current.style.height = "".concat(Math.round(Number(style.width.replace('px', '')) / 2), "px");
      cy.fit();
    }, 300));
    resizeObserver.observe(domRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  (0, _react.useEffect)(() => {
    debouncedRunLayout();
  }, [ready, layoutParams]);
  let nodesAndEdges = [];

  if (cytoscapeRef.current !== null) {
    nodesAndEdges = _react.default.Children.map(children, c => /*#__PURE__*/_react.default.cloneElement(c, {
      cytoInstance: cytoscapeRef.current,
      layout: debouncedRunLayout
    }));
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    ref: domRef,
    className: "cytoscape-react-cy-container"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "cytoscape-react-nodes-and-edges"
  }, nodesAndEdges));
}

Graph.propTypes = {
  children: _propTypes.PropTypes.oneOfType([_propTypes.PropTypes.arrayOf(_propTypes.PropTypes.node), _propTypes.PropTypes.node]).isRequired,
  layoutParams: _propTypes.PropTypes.shape({}),
  cyParams: _propTypes.PropTypes.shape({}),
  layoutDebounce: _propTypes.PropTypes.number
};
Graph.defaultProps = {
  cyParams: {},
  layoutParams: {},
  layoutDebounce: 100
};
var _default = Graph;
exports.default = _default;