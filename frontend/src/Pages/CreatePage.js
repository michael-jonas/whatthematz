import React from "react";

import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

export default class CreatePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      sederName: "",
      canCreate: false,
      isBusy: false,
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
    this.setState({
      isBusy: true,
    });
    const response = await fetch(
      `/api/create_seder?sederName=${this.state.sederName}&nickname=${this.state.name}`,
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
        json.roomCode,
        json.sederName,
        json.huntId,
        true,
        false
      );
      this.props.goToLobby(false);
    } else if (response.status === 500 && retries < 3) {
      setTimeout(() => {
        this.tryCreateSeder(++retries);
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
            {!this.state.canCreate ? (
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
                  "Create seder"
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
                disabled={this.state.isBusy}
                variant="primary"
                onClick={() => this.tryCreateSeder(0)}
              >
                {this.state.isBusy ? (
                  <Spinner animation="border" />
                ) : (
                  "Create seder"
                )}
              </Button>
            )}
          </div>
        </Form>
      </Container>
    );
  }
}
