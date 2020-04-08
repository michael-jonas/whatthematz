import React from "react";
import Container from "react-bootstrap/Container";
import Player from "../Components/Player";
import Button from "react-bootstrap/Button";
import { withToastManager } from "react-toast-notifications";

class PostGamePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isBusy: false,
    };
  }

  tryJoinNextLobby() {
    if (this.props.currentTimeRemaining > 0) {
      this.props.toastManager.add(
        "Wait until everyone is finished before playing again, you don't want to leave someone behind!",
        {
          appearance: "warning",
        }
      );
    } else {
      this.props.joinNextLobby();
    }
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
        <div style={{ fontSize: "18px", marginTop: "27px", fontWeight: "600" }}>
          <span style={{ color: "#0066FF" }}>
            {this.props.winnersList[0].nickname}
          </span>{" "}
          won {this.props.sederName} game! Congratulations!
        </div>
        <div style={{ marginTop: 10, fontWeight: "600", fontSize: "16px" }}>
          Afikoman Finders!
        </div>
        <Container style={{ textAlign: "center" }} id="winnerList">
          {winnersList}
        </Container>
        {this.props.players?.length > 0 && (
          <>
            <div style={{ marginTop: 10, fontWeight: "600", fontSize: "16px" }}>
              Other players who are playing again
            </div>
            <Container style={{ textAlign: "center" }} id="playerList">
              {playerList}
            </Container>
          </>
        )}
        {this.props.currentTimeRemaining > 0 && (
          <div style={{ marginTop: "10px" }}>
            <span style={{ color: "#0066FF" }}>
              {this.props.currentTimeRemaining}
            </span>{" "}
            seconds until hunt ends.
          </div>
        )}

        <div style={{ marginTop: 15, textAlign: "center" }}>
          <Button
            onClick={() => {
              sessionStorage.clear();
              window.location.reload();
            }}
            variant="outline-primary"
            style={{
              marginLeft: "20px",
              marginRight: "10px",
              background: "#FFFFFF",
              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.08)",
              borderRadius: "25.5px",
              borderColor: "#999999",
              color: "#999999",
            }}
          >
            Exit the room
          </Button>

          <Button
            onClick={() => this.tryJoinNextLobby()}
            style={{
              marginLeft: "11px",
              borderRadius: "25.5px",
            }}
          >
            Play a new round
          </Button>
        </div>
      </Container>
    );
  }
}
export default withToastManager(PostGamePage);
