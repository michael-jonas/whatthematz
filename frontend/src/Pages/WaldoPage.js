import React from "react";
import logo from "../logo.svg";
import Container from "react-bootstrap/Container";

export default class HuntPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Container>
        <h5 style={{ marginTop: 10, marginBottom: 20 }}>
          Spot the Afikoman hidden away!
        </h5>
      </Container>
    );
  }
}
