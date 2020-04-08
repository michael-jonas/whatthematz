import React from "react";
import { withToastManager } from "react-toast-notifications";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

class JoinPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      roomCode: "",
      canJoin: false,
      isBusy: false,
    };
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleRoomCodeChange = this.handleRoomCodeChange.bind(this);
  }

  // Basic Form State Handlers
  canJoin() {
    this.setState((state) => ({
      canJoin: state.roomCode.length === 4 && state.name.length > 0,
    }));
  }

  handleNameChange(event) {
    this.setState({
      name: event.target.value,
    });
    this.canJoin();
  }
  handleRoomCodeChange(event) {
    this.setState({
      roomCode: event.target.value,
    });
    this.canJoin();
  }

  // Actions
  async tryJoinSeder(retries) {
    this.setState({
      isBusy: true,
    });
    const response = await fetch(
      `/api/join_seder?roomCode=${this.state.roomCode.toUpperCase()}&nickname=${
        this.state.name
      }`,
      {
        method: "POST",
      }
    );

    if (response.ok) {
      const json = await response.json();
      this.props.updateInfo(
        this.state.name,
        json.userId,
        json.sederId,
        this.state.roomCode.toUpperCase(),
        json.sederName,
        json.huntId,
        false,
        json.isActive
      );
      this.props.goToLobby(json?.queued ?? false);
    } else if (response.status === 400) {
      this.props.toastManager.add("Room Code not found", {
        appearance: "error",
      });
      this.setState({
        isBusy: false,
      });
    } else if (response.status === 500 && retries < 3) {
      setTimeout(() => {
        this.tryJoinSeder(++retries);
      }, 1000);
    } else {
      this.props.toastManager.add(
        "Hmm, something went wrong. Try again in a little bit!",
        {
          appearance: "error",
        }
      );
      this.setState({
        isBusy: false,
      });
    }
  }

  render() {
    return (
      <Container>
        <Form>
          <Form.Group controlId="roomCode">
            <Form.Label>Room code</Form.Label>
            <Form.Control
              style={{ textTransform: "uppercase" }}
              autoComplete="off"
              maxLength="4"
              type="text"
              placeholder="Enter your 4 letter room code"
              value={this.state.roomCode}
              onChange={this.handleRoomCodeChange}
            />
          </Form.Group>
          <Form.Group controlId="Nickname">
            <Form.Label>Treasure hunter name</Form.Label>
            <Form.Control
              type="text"
              autoComplete="off"
              placeholder="Enter your name"
              value={this.state.name}
              onChange={this.handleNameChange}
            />
          </Form.Group>

          <div style={{ textAlign: "center" }}>
            {!this.state.canJoin ? (
              <Button
                style={{
                  borderRadius: "1rem",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                }}
                disabled={true}
                variant="secondary"
              >
                {this.state.isBusy ? (
                  <Spinner animation="border" />
                ) : (
                  "Join the seder"
                )}
              </Button>
            ) : (
              <Button
                style={{
                  borderRadius: "1rem",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  backgroundColor: "#0066ff",
                }}
                variant="primary"
                onClick={() => this.tryJoinSeder()}
              >
                {this.state.isBusy ? (
                  <Spinner animation="border" />
                ) : (
                  "Join the seder"
                )}
              </Button>
            )}
          </div>
        </Form>
      </Container>
    );
  }
}
export default withToastManager(JoinPage);
