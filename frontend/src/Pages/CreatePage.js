import React from "react";

import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

export default class CreatePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      sederName: props.sederName,
      canCreate: false,
    };
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleSederNameChange = this.handleSederNameChange.bind(this);
  }

  // Basic Form State Handlers
  canCreate() {
    this.setState((state) => ({
      canCreate: state.sederName.length > 0 && state.name.length > 0,
    }));
  }
  handleNameChange(event) {
    this.setState({
      name: event.target.value,
    });
    this.canJoin();
  }
  handleSederNameChange(event) {
    this.setState({
      sederName: event.target.value,
    });
    this.canJoin();
  }

  // Actions
  tryCreateSeder() {
    // fetch blah
    // wow no server guess we succeeded
    this.props.updateJoinedSeder(this.state.name, this.state.sederCode);
    this.props.goToLobby();
  }

  render() {
    return (
      <Form>
        <Form.Group controlId="SederCode">
          <Form.Label>Seder Code</Form.Label>
          <Form.Control
            autoComplete="off"
            maxLength="4"
            type="text"
            placeholder="Enter 4-letter code"
            value={this.state.sederCode}
            onChange={this.handleSederCodeChange}
          />
        </Form.Group>
        <Form.Group controlId="Nickname">
          <Form.Label>Name</Form.Label>
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
            Join Seder
          </Button>
        </div>
      </Form>
    );
  }
}
