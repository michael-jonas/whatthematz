import React from "react";
import Container from "react-bootstrap/Container";

export default class WaldoPage extends React.Component {
  handleClickEvent = (e) => {
    const x = e.pageX - this.offsetLeft;
    const y = e.pageY - this.offsetTop;

    if (x > this.xMin && x < this.xMax && y > this.yMin && y < this.yMax) {
      this.concludeHunt();
    }
  };

  onImageLoad() {
    const img = document.getElementById("waldoImg");
    this.width = img.width;
    this.height = img.height;
    this.offsetLeft = img.offsetLeft;
    this.offsetTop = img.offsetTop;

    this.xMin = img.width * this.props.boundingBox[0];
    this.yMin = img.height * this.props.boundingBox[1];
    this.xMax =
      img.width * (this.props.boundingBox[0] + this.props.boundingBox[2]);
    this.yMax =
      img.height * (this.props.boundingBox[1] + this.props.boundingBox[3]);
  }

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
            onLoad={() => this.onImageLoad()}
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
