"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class EdgeWrapper extends _react.default.Component {
  constructor() {
    super();
    this.state = {
      'missing': null
    };
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
    let missing = 2 - props.cy.getElementById(props.source).length - props.cy.getElementById(props.target).length;
    this.setState({
      'missing': missing
    });

    if (missing > 0) {
      this._wait_for_missing_cb = function (ev) {
        let target = ev.target;
        let id = target.id();
        let props = this.props;
        let state = this.state;
        let missing = state.missing;

        if (id === props.source || id === props.target) {
          missing -= 1;
          this.setState({
            'missing': missing
          });

          if (missing === 0) {
            props.cy.off('add', 'node', this._wait_for_missing_cb);
            this._wait_for_missing_cb = undefined;
          }
        }
      }.bind(this);

      props.cy.on('add', 'node', this._wait_for_missing_cb);
    }
  }

  render() {
    let props = this.props;
    let state = this.state;

    if (state.missing === 0) {
      if (props.cy.getElementById(props.id).length === 0) {
        props.cy.add({
          'data': props
        });
      }
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "cytoscape-react-edge"
    }, props.children ? /*#__PURE__*/_react.default.cloneElement(props.children, props) : null);
  }

}

var _default = EdgeWrapper;
exports.default = _default;