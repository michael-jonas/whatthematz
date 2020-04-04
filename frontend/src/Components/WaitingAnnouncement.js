import React from "react";

export default class WaitingAnnouncement extends React.Component {
  render() {
    return (
      <h3>
        Waiting for{" "}
        <span style={{ color: "blue" }}>{this.props.sederName}</span> game room
        to start!
      </h3>
    );
  }
}
