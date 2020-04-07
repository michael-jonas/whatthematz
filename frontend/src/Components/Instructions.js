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
      <>
        <h4 style={{ marginTop: 30, marginBottom: 15 }}>How to play</h4>
        <Button
          style={{
            fontSize: 12,
            borderRadius: "1rem",
            margin: 10,
          }}
          onClick={() => this.showMapInstructions()}
          id="discover"
        >
          Discover the Location
        </Button>
        <Button
          variant="outline-primary"
          style={{
            fontSize: 12,
            borderRadius: "1rem",
          }}
          onClick={() => this.showWaldoInstructions()}
          id="waldo"
        >
          Find the Afikoman
        </Button>
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          {this.state.mapInstructions ? (
            <MapInstructions />
          ) : (
            <WaldoInstructions />
          )}
        </div>
      </>
    );
  }
}
