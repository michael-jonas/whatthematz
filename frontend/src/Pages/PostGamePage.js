import React from "react";
import Container from "react-bootstrap/Container";
import Player from "../Components/Player";
import Button from "react-bootstrap/Button";

export default class PostGamePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isBusy: false,
    };
  }

  render() {
    const winnersList = this.props.winnersList?.map((player, index) => (
      <Player
        key={player._id}
        name={player.nickname}
        score={player.score}
        avatarNum={player.avatar}
      />
    ));

    const playerList = this.props.players?.map((player) => (
      <Player
        key={player.uuid}
        name={player.name}
        avatarNum={player.avatar}
        score={player.score}
      />
    ));

    return (
      <Container>
        {/* <Button onClick={() => this.props.goToHunt()}>Go To Hunt</Button> */}
        <h5>
          <span style={{ color: "blue" }}>
            {this.props.winnersList[0].nickname}
          </span>{" "}
          won {this.props.sederName} game! Congratulations!
        </h5>
        <h5 style={{ marginTop: 20 }}>Afikoman Finders!</h5>
        <Container style={{ textAlign: "center" }} id="winnerList">
          {winnersList}
        </Container>
        <h5>Other players who are playing again</h5>
        <Container style={{ textAlign: "center" }} id="playerList">
          {playerList}
        </Container>
        <div style={{ textAlign: "center" }}>
          <Button
            // todo actually handle click
            style={{
              marginLeft: "20px",
              marginRight: "20px",
              borderRadius: "1rem",
            }}
          >
            Exit the room
          </Button>
          <Button
            onClick={() => this.props.joinNextLobby()}
            style={{
              marginLeft: "20px",
              marginRight: "20px",
              borderRadius: "1rem",
            }}
          >
            Play a new round
          </Button>
        </div>
      </Container>
    );
  }
}
