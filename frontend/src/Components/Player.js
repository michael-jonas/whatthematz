import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Avatar from "./Avatar";

// Receives just a name? Score? A little pre-gen Avatar? A colour?

export default class Player extends React.Component {
  render() {
    return (
      <>
        <Row style={{ marginTop: 10, marginBottom: 10 }}>
          <Col xs={"auto"} style={{ width: 50, padding: 0 }}>
            <Avatar avatarNum={this.props.avatarNum} name={this.props.name} />
          </Col>
          <Col>
            <Row>{this.props.name}</Row>
            <Row bsPrefix={"row light"}>{this.props.score} points total</Row>
          </Col>
        </Row>
        <div style={{ height: 0, border: "1px solid #EDEDED" }} />
      </>
    );
  }
}
