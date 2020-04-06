import React from "react";
import Container from "react-bootstrap/Container";
import Player from "../Components/Player";
import WelcomeAnnouncement from "../Components/WelcomeAnnouncement";
import WaitingAnnouncement from "../Components/WaitingAnnouncement";

import Button from "react-bootstrap/Button";
import mapExample from "../Images/lobbyMapExample.png";
import Spinner from "react-bootstrap/Spinner";
import Countdown from "../Components/Countdown.js";

import matzahInstruction1 from "../Images/Instructions/matzah1Mobile.png";
import matzahInstruction2 from "../Images/Instructions/matzah2Mobile.png";

import MapInstructions from "../Components/MapInstructions";
import WaldoInstructions from "../Components/WaldoInstructions";

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
    document
      .getElementById("discover")
      .classList.replace("btn-outline-primary", "btn-primary");
    document
      .getElementById("waldo")
      .classList.replace("btn-primary", "btn-outline-primary");
    this.setState({
      mapInstructions: true,
    });
  }

  showWaldoInstructions() {
    document
      .getElementById("waldo")
      .classList.replace("btn-outline-primary", "btn-primary");
    document
      .getElementById("discover")
      .classList.replace("btn-primary", "btn-outline-primary");
    this.setState({
      mapInstructions: false,
    });
  }

  async startHunt() {
    // this.setState({
    //   isBusy: true,
    // });
    // // const response = await fetch(`/trigger_hunt?huntId=${this.props.huntId}`, {
    // //   method: "PUT",
    // // });
    // if (response.ok) {
    //   // TODO countdown timer
    //   this.props.goToHunt();
    // } else if (response.status !== 400 && retries < 3) {
    //   setTimeout(() => {
    //     this.startHunt(++retries);
    //   }, 1000);
    // } else {
    //   // toast an error?
    //   this.setState({
    //     isBusy: false,
    //   });
    // }
    this.props.socket.emit(
      "trigger_hunt_socket",
      { huntId: this.props.huntId },
      (data) => {
        //console.log(data);
      }
    );
  }

  render() {
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
        <div>
          <h6>
            ROOM CODE:{" "}
            <span style={{ color: "blue" }}>{this.props.roomCode}</span>
          </h6>
        </div>
        {this.props.showCountdown ? (
          <div>
            <span>
              Starting in <Countdown startingCount={3} /> seconds!
            </span>
          </div>
        ) : this.state.justJoined ? (
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

        <h4 style={{ marginTop: 30, marginBottom: 15 }}>How to play</h4>

        <Button
          style={{
            fontSize: 12,
            borderRadius: "1rem",
            margin: 10,
          }}
          onClick={() => this.showMapInstructions()}
          id="discover"
        >
          Discover the Location
        </Button>
        <Button
          variant="outline-primary"
          style={{
            fontSize: 12,
            borderRadius: "1rem",
          }}
          onClick={() => this.showWaldoInstructions()}
          id="waldo"
        >
          Find the Afikoman
        </Button>

        <div style={{ textAlign: "center", marginTop: "10px" }}>
          {this.state.mapInstructions ? (
            <MapInstructions />
          ) : (
            <WaldoInstructions />
          )}
        </div>
      </Container>
    );
  }
}
