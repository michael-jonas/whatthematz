import React from "react";

import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

export default class JoinPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      roomCode: "",
      canJoin: false,
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
    const response = await fetch(
      `/join_seder?roomCode=${this.state.roomCode.toUpperCase()}&nickname=${
        this.state.name
      }`,
      {
        method: "POST",
      }
    );

    if (response.ok) {
      const json = await response.json();
      this.props.updateSederInfo(
        this.state.name,
        json.sederId,
        this.state.roomCode.toUpperCase(),
        json.sederName,
        json.huntId,
        false
      );
      this.props.goToLobby();
    } else if (response.status === 400) {
      // Todo Toast "room code not found"
    } else if (response.status === 500 && retries < 3) {
      setTimeout(() => {
        this.tryJoinSeder(++retries);
      }, 1000);
    } else {
      // Todo Toast a fail message?
    }
  }

  render() {
    return (
      <Container>
        <Form>
          <Form.Group controlId="roomCode">
            <Form.Label>Room Code</Form.Label>
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
            <Form.Label>Treasure Hunter Name</Form.Label>
            <Form.Control
              type="text"
              autoComplete="off"
              placeholder="Enter your name"
              value={this.state.name}
              onChange={this.handleNameChange}
            />
          </Form.Group>

          <div style={{ textAlign: "center" }}>
            <Button
              style={{ borderRadius: "1rem", width: 220 }}
              disabled={!this.state.canJoin}
              variant="primary"
              onClick={() => this.tryJoinSeder()}
            >
              Join the Seder
            </Button>
          </div>
        </Form>
      </Container>
    );
  }
}