"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Node extends _react.default.Component {
  componentDidMount() {
    const {
      props
    } = this;

    if (props.cdm_cb) {
      props.cdm_cb(this);
    }
  }

  componentDidUpdate() {
    const {
      props
    } = this;

    if (props.cdu_cb) {
      props.cdu_cb(this);
    }
  }

  render() {
    const {
      id
    } = this.props;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "cytoscape-react-node-default"
    }, id);
  }

}

var _default = Node;
exports.default = _default;