import React from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import startSeder from "../Images/Landing/start.png";
import joinSeder from "../Images/Landing/join.png";

export default class LandingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { canNext: false };
  }
  createHighlight = false;
  joinHighlight = false;

  setCreate = () => {
    document
      .getElementById("createSederButton")
      .className.replace("normal-button", "highlight-button");

    document
      .getElementById("joinSederButton")
      .className.replace("highlight-button", "normal-button");

    this.createHighlight = true;
    this.joinHighlight = false;

    this.setState({ canNext: true });
  };

  setJoin = () => {
    document
      .getElementById("joinSederButton")
      .className.replace("normal-button", "highlight-button");

    document
      .getElementById("createSederButton")
      .className.replace("highlight-button", "normal-button");

    this.createHighlight = false;
    this.joinHighlight = true;

    this.setState({ canNext: true });
  };

  render() {
    return (
      <Container style={{ position: "relative" }}>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          Select an option
        </div>
        <div style={{ margin: "auto", textAlign: "center" }}>
          <Button
            id="createSederButton"
            onClick={() => this.setCreate()}
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
            onClick={() => this.setJoin()}
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
        <Button
          disabled={!this.state.canNext}
          onClick={() => {
            this.createHighlight
              ? this.props.goToCreate()
              : this.props.goToJoin();
          }}
          style={{
            position: "relative",
            left: "250px",
            width: "114px",
            borderRadius: "25.5px",
            marginTop: "10px",
          }}
        >
          Next
        </Button>
      </Container>
    );
  }
}
