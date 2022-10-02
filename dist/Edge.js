"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

var _propTypes = require("prop-types");

var _react = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Cytoscape edge React component.
 *
 * @component
 * @returns {React.ReactElement} component
 */
function Edge(_ref) {
  let {
    cytoInstance,
    id,
    source,
    target,
    children,
    layout
  } = _ref;
  const domRef = (0, _react.useRef)();
  const [missing, setMissing] = (0, _react.useState)(2);

  function addEdge(cyEdgeData) {
    cytoInstance.add({
      data: cyEdgeData
    });
  }

  function missingNodeCount(source2, target2) {
    let missingCount = 2;
    const cytoSourceNode = cytoInstance.getElementById(source2);

    if (cytoSourceNode.length === 1) {
      missingCount -= 1;
    }

    const cytoTargetNode = cytoInstance.getElementById(target2);

    if (cytoTargetNode.length === 1) {
      missingCount -= 1;
    }

    return missingCount;
  }

  (0, _react.useEffect)(() => {
    const nowMissing = missingNodeCount(source, target);

    if (nowMissing !== missing) {
      setMissing(nowMissing);
    }

    if (nowMissing === 0) {
      addEdge({
        id,
        source,
        target
      });
    }

    function onAddNode(ev) {
      const evId = ev.target.id();

      if (evId === source || evId === target) {
        const postEvMissing = missingNodeCount(source, target);

        if (postEvMissing !== missing) {
          setMissing(postEvMissing);
        }

        if (postEvMissing === 0) {
          addEdge({
            id,
            source,
            target
          });
        }
      }
    }

    function onRemoveNode(ev) {
      const evId = ev.target.id();

      if (evId === source || evId === target) {
        const postEvMissing = missingNodeCount(source, target);

        if (postEvMissing !== missing) {
          setMissing(postEvMissing);
        }

        if (postEvMissing > 0) {
          cytoInstance.getElementById(id).remove();
        }
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
  (0, _react.useEffect)(() => {
    layout();
  }, [id, children]);

  if (missing > 0) {
    return null;
  }

  function newChild(c) {
    return /*#__PURE__*/_react.default.cloneElement(c, {
      cytoInstance,
      layout
    });
  }

  const edges = _react.default.Children.map(children, newChild);

  return /*#__PURE__*/_react.default.createElement("div", {
    ref: domRef,
    className: "cytoscape-react-edge"
  }, edges);
}

Edge.propTypes = {
  id: _propTypes.PropTypes.string.isRequired,
  source: _propTypes.PropTypes.string.isRequired,
  target: _propTypes.PropTypes.string.isRequired,
  cytoInstance: _propTypes.PropTypes.any,
  // eslint-disable-line react/forbid-prop-types
  children: _propTypes.PropTypes.oneOfType([_propTypes.PropTypes.arrayOf(_propTypes.PropTypes.node), _propTypes.PropTypes.node]),
  layout: _propTypes.PropTypes.func
};
Edge.defaultProps = {
  cytoInstance: null,
  children: [],
  layout: () => {}
};
var _default = Edge;
exports.default = _default;