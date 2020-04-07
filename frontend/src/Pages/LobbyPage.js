import React from "react";
import Container from "react-bootstrap/Container";
import Player from "../Components/Player";
import WelcomeAnnouncement from "../Components/WelcomeAnnouncement";
import WaitingAnnouncement from "../Components/WaitingAnnouncement";

import Button from "react-bootstrap/Button";
import mapExample from "../Images/lobbyMapExample.png";
import Spinner from "react-bootstrap/Spinner";
import Countdown from "../Components/Countdown.js";
import Instructions from "../Components/Instructions.js";

import clipboard from "../Images/clipboard.png";
import { withToastManager } from "react-toast-notifications";

class LobbyPage extends React.Component {
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
  copyCodeToClipboard = () => {
    const el = document.createElement("textarea");
    el.value = this.props.roomCode;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    this.props.toastManager.add(`Code copied to clipboard!`, {
      appearance: "success",
    });
  };

  async startHunt() {
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
            <span id="roomCode" style={{ color: "blue" }}>
              {this.props.roomCode}
            </span>
            <input
              type="image"
              onClick={() => this.copyCodeToClipboard()}
              src={clipboard}
              width="20px"
              style={{ marginLeft: "5px", marginBottom: "-3px" }}
            />
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

        <Instructions />
      </Container>
    );
  }
}
export default withToastManager(LobbyPage);
