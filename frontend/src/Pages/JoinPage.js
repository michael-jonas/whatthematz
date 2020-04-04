import React from "react";

import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

export default class JoinPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      sederCode: props.sederCode,
      canJoin: props.sederCode.length === 4 && props.name.length > 0,
    };
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleSederCodeChange = this.handleSederCodeChange.bind(this);
  }

  // Basic Form State Handlers
  canJoin() {
    this.setState((state) => ({
      canJoin: state.sederCode.length === 4 && state.name.length > 0,
    }));
  }
  handleNameChange(event) {
    this.setState({
      name: event.target.value,
    });
    this.canJoin();
  }
  handleSederCodeChange(event) {
    this.setState({
      sederCode: event.target.value,
    });
    this.canJoin();
  }

  // Actions
  tryJoinSeder() {
    // fetch blah
    // wow no server guess we succeeded
    this.props.updateJoinedSeder(this.state.name, this.state.sederCode);
    this.props.goToLobby();
  }

  render() {
    return (
      <Container>
        <Form>
          <Form.Group controlId="SederCode">
            <Form.Label>Seder Code</Form.Label>
            <Form.Control
              autoComplete="off"
              maxLength="4"
              type="text"
              placeholder="Enter your 4 letter room code"
              value={this.state.sederCode}
              onChange={this.handleSederCodeChange}
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
