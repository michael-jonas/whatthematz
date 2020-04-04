import React from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import startSeder from "../logo.svg";

export default class LandingPage extends React.Component {
  render() {
    return (
      <Container>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          Select an option
        </div>
        <div style={{ margin: "auto", textAlign: "center" }}>
          <Button
            onClick={() => this.props.goToCreate()}
            style={{ margin: 20 }}
          >
            <img src={startSeder} alt="" />
            <div>Start a New Seder</div>
          </Button>
          <Button onClick={() => this.props.goToJoin()} style={{ margin: 20 }}>
            <img src={startSeder} alt="" />
            <div>Join a Seder</div>
          </Button>
        </div>
      </Container>
    );
  }
}
