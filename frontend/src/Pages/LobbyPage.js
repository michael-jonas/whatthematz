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
      </Container>
    );
  }
}
