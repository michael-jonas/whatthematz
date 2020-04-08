import React from "react";

export default class WelcomeAnnouncement extends React.Component {
  render() {
    return (
      <div style={{ fontSize: "20px" }}>
        <strong>
          Welcome to{" "}
          <span style={{ color: "#0066FF" }}>{this.props.sederName}</span> game
          room
        </strong>
      </div>
    );
  }
}
