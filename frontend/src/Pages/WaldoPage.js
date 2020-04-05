import React from "react";
import Container from "react-bootstrap/Container";

export default class WaldoPage extends React.Component {

  constructor(props) {
    super(props);
  }

  handleClickEvent = (e) => {

    const img = document.getElementById("waldoImg");

    this.xMin = img.width * this.props.boundingBox[0];
    this.yMin = img.height * this.props.boundingBox[1];
    this.xMax = img.width * (this.props.boundingBox[0] + this.props.boundingBox[2]);
    this.yMax = img.height * (this.props.boundingBox[1] + this.props.boundingBox[3]);
    
    const x = e.pageX - img.offsetLeft;
    const y = e.pageY - img.offsetTop;

    if (x > this.xMin && x < this.xMax && y > this.yMin && y < this.yMax) {
      this.props.concludeHuntHandler();
      this.props.goToPostGame();
    }
  };

  onImageLoad() {}

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
