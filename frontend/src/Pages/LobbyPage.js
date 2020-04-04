import React from "react";
import Container from "react-bootstrap/Container";
import Player from "../Components/Player";
import WelcomeAnnouncement from "../Components/WelcomeAnnouncement";
import WaitingAnnouncement from "../Components/WaitingAnnouncement";
import Nav from "react-bootstrap/Nav";

export default class LobbyPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      justJoined: true,
      mapInstructions: true,
    };
  }

  componentDidMount() {
    this.timeout = setTimeout(
      () =>
        this.setState({
          justJoined: false,
        }),
      5000
    );
  }
  componentWillUnmount() {
    clearTimeout(this.timeout);
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

  render() {
    const playerList = this.props.players?.map((player) => (
      <Player key={player.name} name={player.name} score={player.score} />
    ));

    return (
      <Container>
        {this.state.justJoined ? (
          <WelcomeAnnouncement sederName={this.props.sederName} />
        ) : (
          <WaitingAnnouncement sederName={this.props.sederName} />
        )}
        <h4>Players in the room</h4>
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
