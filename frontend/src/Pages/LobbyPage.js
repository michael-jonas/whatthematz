import React from "react";
import Container from "react-bootstrap/Container";
import Player from "../Components/Player";
import WelcomeAnnouncement from "../Components/WelcomeAnnouncement";
import WaitingAnnouncement from "../Components/WaitingAnnouncement";

export default class LobbyPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      justJoined: true,
    };
  }

  componentDidMount() {
    setTimeout(
      () =>
        this.setState({
          justJoined: false,
        }),
      5000
    );
  }

  render() {
    const playerList = this.props.players?.map((player) => (
      <Player key={player.name} name={player.name} score={player.score} />
    ));

    return (
      <Container>
        <Container style={{ textAlign: "center" }}>
          {this.state.justJoined ? (
            <WelcomeAnnouncement sederName={this.props.sederName} />
          ) : (
            <WaitingAnnouncement sederName={this.props.sederName} />
          )}
        </Container>
        <h2>Players in the room</h2>
        <Container style={{ textAlign: "center" }} id="playerList">
          {playerList}
        </Container>
      </Container>
    );
  }
}
