import React from "react";

export default class WelcomeAnnouncement extends React.Component {
  render() {
    return (
      <h3>
        Welcome to <span style={{ color: "blue" }}>{this.props.sederName}</span>{" "}
        game room!
      </h3>
    );
  }
}
