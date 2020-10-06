import React from "react";
import Container from "react-bootstrap/Container";
import { withToastManager } from "react-toast-notifications";
import matzah from "../Images/afikomen.png";

class WaldoPage extends React.Component {
  handleClickEvent = (e) => {
    const img = document.getElementById("waldoImg");

    this.xMin = img.width * this.props.boundingBox[0];
    this.yMin = img.height * this.props.boundingBox[1];
    this.xMax =
      img.width * (this.props.boundingBox[0] + this.props.boundingBox[2]);
    this.yMax =
      img.height * (this.props.boundingBox[1] + this.props.boundingBox[3]);

    const x = e.pageX - img.offsetLeft;
    const y = e.pageY - img.offsetTop;

    if (
      x > this.xMin - 3 &&
      x < this.xMax + 3 &&
      y > this.yMin - 3 &&
      y < this.yMax + 3
    ) {
      this.props.toastManager.add("Congratulations, you found the afikoman!", {
        appearance: "success",
      });
      this.props.concludeHuntHandler();
    }
  };

  onImageLoad() {}

  render() {
    return (
      <Container>
        <div
          style={{
            marginTop: 20,
            marginBottom: 20,
            fontWeight: 600,
            fontSize: "16px",
          }}
        >
          Spot the Afikoman hidden away!
          <img
            src={matzah}
            alt={"afikoman"}
            style={{
              height: "33px",
              width: "33px",
              float: "right",
            }}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <img
            id="waldoImg"
            alt="FindTheAfikoman"
            onLoad={() => this.onImageLoad()}
            src={`${this.props.apiUrl}/api/get_image?huntId=${this.props.huntId}`}
            style={{
              maxWidth: "100%",
            }}
            onClick={(e) => this.handleClickEvent(e)}
          />
        </div>
      </Container>
    );
  }
}
export default withToastManager(WaldoPage);
