import React from "react";

export default class WaitingAnnouncement extends React.Component {
  render() {
    return (
      <div style={{ fontSize: "20px" }}>
        <strong>
          Waiting for{" "}
          <span style={{ color: "#0066FF" }}>{this.props.sederName}</span> game
          room to start!
        </strong>
      </div>
    );
  }
}
