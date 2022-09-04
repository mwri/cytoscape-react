"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.object.assign.js");

var _react = _interopRequireDefault(require("react"));

var _cytoscape = _interopRequireDefault(require("cytoscape"));

var _cytoscapeDomNode = _interopRequireDefault(require("cytoscape-dom-node"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_cytoscape.default.use(_cytoscapeDomNode.default);

class GraphWrapper extends _react.default.Component {
  constructor() {
    super();
    this.state = {
      'cy': null
    };
    this._wrapper = /*#__PURE__*/_react.default.createRef();
  }

  componentDidMount() {
    let props = this.props;
    let cy_params = Object.assign({
      'container': this._wrapper.current.querySelector('.cytoscape-react-cy-container'),
      'style': [{
        'selector': 'node',
        'style': {
          'background-opacity': 0,
          'shape': 'rectangle'
        }
      }]
    }, props.cy_params || {});
    let cy = (0, _cytoscape.default)(cy_params);
    cy.domNode({
      'dom_container': this._wrapper.current.querySelector('.cytoscape-react-nodes-and-edges')
    });
    this.setState({
      'cy': cy
    });
    this.cyReady(cy);
  }

  render() {
    let state = this.state;
    let nodes_and_edges = state.cy ? _react.default.Children.map(this.props.children, c => /*#__PURE__*/_react.default.cloneElement(c, {
      'cy': state.cy,
      '_cdm_cb': this.graphElementDidMount.bind(this),
      '_cdu_cb': this.graphElementDidUpdate.bind(this)
    })) : [];
    return /*#__PURE__*/_react.default.createElement("div", {
      ref: this._wrapper
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "cytoscape-react-cy-container"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "cytoscape-react-nodes-and-edges"
    }, nodes_and_edges)));
  }

  cyReady(_cy) {}

  graphElementDidMount(_el_component) {}

  graphElementDidUpdate(_el_component) {}

}

var _default = GraphWrapper;
exports.default = _default;