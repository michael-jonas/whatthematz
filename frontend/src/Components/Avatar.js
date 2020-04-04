import React from "react";

export default class Avatar extends React.Component {
  render() {
    return (
      <img
        className="Avatar"
        src={this.props.avatarUrl}
        alt={this.props.name}
      />
    );
  }
}
