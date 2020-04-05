import React from "react";
import Container from "react-bootstrap/Container";
import Player from "../Components/Player";
import WelcomeAnnouncement from "../Components/WelcomeAnnouncement";
import WaitingAnnouncement from "../Components/WaitingAnnouncement";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import mapExample from "../Images/lobbyMapExample.png";
import Spinner from "react-bootstrap/Spinner";

export default class PostGamePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isBusy: false,
    };
  }

  render() {
    let winnerPlayerList = [];

    for (let i = 0; i < this.props.winnerList.length; i++) {
      for (let j = 0; j < this.props.playerList.length; j++) {
        if (this.props.playerList[j].uuid === winnerList[i]) {
          winnerPlayerList.push(this.props.playerList.splice(j, 1));
          break;
        }
      }
    }

    // const playerList = this.props.players?.map((player) => (
    //   <Player key={player.uuid} name={player.name} avatarNum={player.avatar} />
    // ));

    const winnerList = this.props.winnerPlayerList?.map((player, index) => (
      <Player
        key={player.uuid}
        name={player.name}
        avatarNum={player.avatar}
        place={index}
      />
    ));

    return (
      <Container>
        {/* <Button onClick={() => this.props.goToHunt()}>Go To Hunt</Button> */}
        <h4>
          <span style={{ color: "blue" }}>{this.props.winnerList[0]}</span> won{" "}
          {this.props.sederName} game! Congratulations!
        </h4>
        <h5 style={{ marginTop: 20 }}>Afikoman Finders!</h5>
        <Container style={{ textAlign: "center" }} id="playerList">
          {winnerList}
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
