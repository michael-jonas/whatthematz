import React from "react";
import Container from "react-bootstrap/Container";
import Player from "../Components/Player";
import WelcomeAnnouncement from "../Components/WelcomeAnnouncement";
import WaitingAnnouncement from "../Components/WaitingAnnouncement";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";

export default class LobbyPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      justJoined: true,
      mapInstructions: true,
    };
  }

  componentDidMount() {
    if (!this.props.isOwner) {
      this.timeout = setTimeout(
        () =>
          this.setState({
            justJoined: false,
          }),
        5000
      );
    }
  }
  componentWillUnmount() {
    if (!this.props.isOwner) {
      clearTimeout(this.timeout);
    }
  }

  showMapInstructions() {
    this.setState({
      mapInstructions: true,
    });
  }

  showWaldoInstructions() {
    this.setState({
      mapInstructions: false,
    });
  }

  async startHunt(retries) {
    const response = await fetch(`/trigger_hunt?huntId=${this.props.huntId}`, {
      method: "PUT",
    });

    if (response.ok) {
      // TODO countdown timer
      this.props.goToHunt();
    } else if (response.status !== 400 && retries < 3) {
      setTimeout(() => {
        this.startHunt(++retries);
      }, 1000);
    }
  }

  render() {
    const playerList = this.props.players?.map((player) => (
      <Player key={player.uuid} name={player.name} score={player.score} />
    ));

    return (
      <Container>
        {/* <Button onClick={() => this.props.goToHunt()}>Go To Hunt</Button> */}
        <div>
          <h6>
            ROOM CODE:{" "}
            <span style={{ color: "blue" }}>{this.props.roomCode}</span>
          </h6>
          {this.props.isOwner && (
            <Button onClick={() => this.startHunt()}>Start Hunt!</Button>
          )}
        </div>
        {this.state.justJoined ? (
          <WelcomeAnnouncement sederName={this.props.sederName} />
        ) : (
          <WaitingAnnouncement sederName={this.props.sederName} />
        )}
        <h4 style={{ marginTop: 20 }}>Players in the room</h4>
        <Container style={{ textAlign: "center" }} id="playerList">
          {playerList}
        </Container>
        <h4 style={{ marginTop: 30 }}>How to play</h4>
        <Nav variant="pills" defaultActiveKey="map">
          <Nav.Item>
            <Nav.Link
              onSelect={() => this.showMapInstructions()}
              eventKey="map"
            >
              Discover the location
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              onSelect={() => this.showWaldoInstructions()}
              eventKey="waldo"
            >
              Find the Afikoman
            </Nav.Link>
          </Nav.Item>
        </Nav>
        {this.state.mapInstructions ? "map" : "notMap"}
      </Container>
    );
  }
}
