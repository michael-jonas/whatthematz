import React from "react";
import Container from "react-bootstrap/Container";
import Player from "../Components/Player";
import WelcomeAnnouncement from "../Components/WelcomeAnnouncement";
import WaitingAnnouncement from "../Components/WaitingAnnouncement";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import mapExample from "../Images/lobbyMapExample.png";
import Spinner from "react-bootstrap/Spinner";

export default class LobbyPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      justJoined: true,
      mapInstructions: true,
      isBusy: false,
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
    this.setState({
      isBusy: true,
    });
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
    } else {
      // toast an error?
      this.setState({
        isBusy: false,
      });
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
        <div style={{ textAlign: "center", paddingTop: "10px" }}>
          {this.props.isOwner && (
            <Button
              disabled={this.state.isBusy}
              onClick={() => this.startHunt()}
            >
              {this.state.isBusy ? (
                <Spinner animation="border" />
              ) : (
                "Start Hunt!"
              )}
            </Button>
          )}
        </div>
        <h4 style={{ marginTop: 30 }}>How to play</h4>
        <Nav
          className="justify-content-center"
          variant="pills"
          defaultActiveKey="map"
        >
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
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          {this.state.mapInstructions && (
            <input
              style={{ width: 300, height: 300 }}
              type="image"
              alt="map"
              src={mapExample}
            />
          )}
          {this.state.mapInstructions || "notMap"}
        </div>
      </Container>
    );
  }
}
