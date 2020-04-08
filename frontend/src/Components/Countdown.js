import React from "react";

export default class Countdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: this.props.startingCount };
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    if (this.state.count > 0) {
      this.setState(function (state, props) {
        let x = state.count - (state.count > 0 ? 1 : 0);
        return {
          count: x,
        };
      });

      // this.setState({count: this.state.count - 1});}
    }
  }

  render() {
    return <span style={{ color: this.props.color }}>{this.state.count}</span>;
  }
}
