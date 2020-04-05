import React from "react";
import logo from "../logo.svg";
import Container from "react-bootstrap/Container";

export default class HuntPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleClickEvent = (e) => {
    const img = document.getElementById("waldoImg");
    const x = e.pageX - img.offsetLeft;
    const y = e.pageY - img.offsetTop;
    console.log(`(${x}, ${y})`);
  };
  render() {
    return (
      <Container>
        <h5 style={{ marginTop: 10, marginBottom: 20 }}>
          Spot the Afikoman hidden away!
        </h5>
        <div style={{ textAlign: "center" }}>
          <img
            id="waldoImg"
            src={`http://localhost:3000/get_image?huntId=${this.props.huntId}`}
            style={{
              maxWidth: "95%",
            }}
            onClick={(e) => this.handleClickEvent(e)}
          />
        </div>
      </Container>
    );
  }
}
