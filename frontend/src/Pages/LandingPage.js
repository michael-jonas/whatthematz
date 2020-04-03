import React from "react";

import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

export default class LandingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      sederCode: props.sederCode,
      canJoin: false,
    };
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleSederCodeChange = this.handleSederCodeChange.bind(this);
  }

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

  render() {
    return (
      <>
        <Container style={{ marginTop: 20 }}>
          <h1>Join a Seder!</h1>
          <Form>
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
            <Button
              disabled={!this.state.canJoin}
              variant="primary"
              onClick={() => console.log(this.state.sederCode)}
            >
              Join Seder
            </Button>
          </Form>
        </Container>

        <Container style={{ marginTop: 20 }}>
          <h2>OR</h2>
        </Container>

        <Container style={{ marginTop: 20 }}>
          <Button>
            <h1>Create a Seder!</h1>
          </Button>
        </Container>
      </>
    );
  }
}
