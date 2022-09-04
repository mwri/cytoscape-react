"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.object.assign.js");

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class NodeWrapper extends _react.default.Component {
  constructor(props) {
    super(props);
    this._wrapper = /*#__PURE__*/_react.default.createRef();
  }

  componentDidMount() {
    let props = this.props;
    if (props.cy) this._init_cy();
  }

  componentDidUpdate(prev_props) {
    let props = this.props;
    if (props.cy && !prev_props.cy) this._init_cy();
  }

  _init_cy() {
    let props = this.props;
    if (!props.cy) return;
    if (props.cy.getElementById(props.id).length === 0) props.cy.add({
      'data': Object.assign({}, props, {
        'dom': this._wrapper.current
      })
    });
  }

  render() {
    let props = this.props;
    return /*#__PURE__*/_react.default.createElement("div", {
      ref: this._wrapper,
      className: "cytoscape-react-node"
    }, props.children ? /*#__PURE__*/_react.default.cloneElement(props.children, props) : null);
  }

}

var _default = NodeWrapper;
exports.default = _default;