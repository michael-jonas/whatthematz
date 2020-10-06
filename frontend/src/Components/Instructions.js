import MapInstructions from "../Components/MapInstructions";
import WaldoInstructions from "../Components/WaldoInstructions";
import React from "react";
import Button from "react-bootstrap/Button";

export default class Instructions extends React.Component {
  constructor(props) {
    super(props);
    this.state = { mapInstructions: true };
  }
  showMapInstructions() {
    document
      .getElementById("discover")
      .classList.replace("btn-outline-primary", "btn-primary");
    document
      .getElementById("waldo")
      .classList.replace("btn-primary", "btn-outline-primary");
    this.setState({
      mapInstructions: true,
    });
  }

  showWaldoInstructions() {
    document
      .getElementById("waldo")
      .classList.replace("btn-outline-primary", "btn-primary");
    document
      .getElementById("discover")
      .classList.replace("btn-primary", "btn-outline-primary");
    this.setState({
      mapInstructions: false,
    });
  }
  render() {
    return (
      <div style={{ width: "100%" }}>
        <div
          style={{
            marginTop: 30,
            marginBottom: 0,
            fontWeight: "600",
            marginLeft: "5%",
            fontSize: "16px",
          }}
        >
          How to play
        </div>
        <Button
          style={{
            fontSize: 12,
            height: "38px",
            fontFamily: "Muli",
            borderRadius: "1rem",
            marginLeft: "5%",
            marginTop: 10,
            marginBottom: 10,
            marginRight: 10,
          }}
          onClick={() => this.showMapInstructions()}
          id="discover"
        >
          Locate the city
        </Button>
        <Button
          variant="outline-primary"
          style={{
            fontSize: 12,
            height: "38px",
            borderRadius: "1rem",
            fontFamily: "Muli",
          }}
          onClick={() => this.showWaldoInstructions()}
          id="waldo"
        >
          Find the afikoman
        </Button>
        <div
          style={{
            textAlign: "center",
            marginTop: "10px",
            fontWeight: "normal",
          }}
        >
          {this.state.mapInstructions ? (
            <MapInstructions />
          ) : (
            <WaldoInstructions />
          )}
        </div>
      </div>
    );
  }
}
