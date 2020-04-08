import React from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import startSeder from "../Images/Landing/start.png";
import joinSeder from "../Images/Landing/join.png";

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
            className="normal-button"
            style={{
              margin: 10,
              backgroundColor: "white",
              color: "black",
              height: "140px",
              width: "140px",
              borderRadius: "8px",
            }}
          >
            <img src={startSeder} style={{}} alt="" />
            <div style={{ fontSize: "12px" }}>Start a New Seder</div>
          </Button>
          <Button
            id="joinSederButton"
            onClick={() => this.props.goToJoin()}
            className="normal-button"
            style={{
              margin: 10,
              backgroundColor: "white",
              color: "black",
              height: "140px",
              width: "140px",
              borderRadius: "8px",
            }}
          >
            <img src={joinSeder} alt="" />
            <div style={{ fontSize: "12px" }}>Join a Seder</div>
          </Button>
        </div>
      </Container>
    );
  }
}
