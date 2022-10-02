"use strict";

require("core-js/modules/web.dom-collections.iterator.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _propTypes = require("prop-types");

var _react = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Cytoscape node React component.
 *
 * @component
 * @returns {React.ReactElement} component
 */
function Node(_ref) {
  let {
    cytoInstance,
    id,
    children,
    layout,
    classes
  } = _ref;
  const domRef = (0, _react.useRef)();
  (0, _react.useEffect)(() => {
    const data = {
      id,
      dom: domRef.current
    };
    cytoInstance.add({
      data,
      classes
    });
    return () => {
      cytoInstance.getElementById(id).remove();
    };
  }, []);
  (0, _react.useEffect)(() => {
    layout();
  }, [id, children]);

  function newChild(c) {
    return /*#__PURE__*/_react.default.cloneElement(c, {
      cytoInstance,
      layout
    });
  }

  const nodes = _react.default.Children.map(children, newChild);

  return /*#__PURE__*/_react.default.createElement("div", {
    ref: domRef,
    className: "cytoscape-react-node"
  }, nodes);
}

Node.propTypes = {
  id: _propTypes.PropTypes.string.isRequired,
  cytoInstance: _propTypes.PropTypes.any,
  // eslint-disable-line react/forbid-prop-types
  children: _propTypes.PropTypes.oneOfType([_propTypes.PropTypes.arrayOf(_propTypes.PropTypes.node), _propTypes.PropTypes.node]).isRequired,
  layout: _propTypes.PropTypes.func,
  classes: _propTypes.PropTypes.arrayOf(_propTypes.PropTypes.string)
};
Node.defaultProps = {
  cytoInstance: null,
  layout: () => {},
  classes: []
};
var _default = Node;
exports.default = _default;