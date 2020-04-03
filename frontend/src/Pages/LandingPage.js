import React from "react";
import Button from "react-bootstrap/Button";

export default class LandingPage extends React.Component {
  render() {
    return (
      <div>
        <Button onClick={this.props.goToLobby}> Go To Lobby </Button>
        Landing
      </div>
    );
  }
}
