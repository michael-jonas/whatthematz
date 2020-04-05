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
    if (
      x > this.props.xMin &&
      x < this.props.xMax &&
      y > this.props.yMin &&
      y < this.props.yMax
    ) {
      this.concludeHunt();
    }
  };

  async concludeHunt() {
    const response = await fetch(
      `/conclude_hunt?huntId=${this.props.huntId}&winnerId=${this.props.userId}`,
      {
        method: "PUT",
      }
    );
    if (response.ok) {
      this.props.goToLobby();
    } else if (response.status !== 400) {
    } else {
      // toast an error?
    }
  }

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
