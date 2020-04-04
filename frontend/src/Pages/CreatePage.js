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
      canCreate: props.sederName.length > 0 && props.name.length > 0,
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
    this.canCreate();
  }
  handleSederNameChange(event) {
    this.setState({
      sederName: event.target.value,
    });
    this.canCreate();
  }

  // Actions
  async tryCreateSeder(retries) {
    const response = await fetch(
      `/create_seder?sederName=${this.state.sederName}&nickname=${this.state.name}`,
      {
        method: "POST",
      }
    );

    if (response.ok) {
      const json = await response.json();

      this.props.updateSederInfo(
        this.state.name,
        json.sederId,
        json.sederCode,
        json.sederName,
        huntId
      );
      this.props.goToLobby();
    } else if (response.status === 500 && retries < 3) {
      setTimeout(() => {
        this.tryCreateSeder(++retries);
      });
    } else {
      // Todo Toast a message?
    }
  }

  render() {
    return (
      <Container>
        <Form>
          <Form.Group controlId="SederName">
            <Form.Label>Seder Name</Form.Label>
            <Form.Control
              autoComplete="off"
              type="text"
              placeholder='Name your Seder (e.g. "Annie&apos;s Passover Dinner")'
              value={this.state.sederName}
              onChange={this.handleSederNameChange}
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
              disabled={!this.state.canCreate}
              variant="primary"
              onClick={() => this.tryCreateSeder(0)}
            >
              Create Seder
            </Button>
          </div>
        </Form>
      </Container>
    );
  }
}
