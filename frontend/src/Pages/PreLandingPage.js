import React from "react";
import { withToastManager } from "react-toast-notifications";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Instructions from "../Components/Instructions";

import mag from "../Images/magpink.png";

class PreLandingPage extends React.Component {
  blueColor = "rgba(0, 102, 255, 0.95)";

  constructor(props) {
    super(props);
    this.state = {
      learnMoreShown: false,
    };
  }

  render() {
    return (
      <>
        <div
          style={{
            backgroundColor: this.blueColor,
            color: "white",
            marginTop: "-10px",
            fontFamily: "Montserrat",
            fontStyle: "normal",
            height: "260px",
          }}
        >
          <Container
            style={{
              paddingTop: "31px",
              paddingLeft: "18px",
              paddingRight: "18px",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                letterSpacing: "0.1em",
                lineHeight: "120%",
                fontFamily: "Source Sans Pro",
                fontWeight: 600,
              }}
            >
              FLATTEN THE BREAD
            </div>
            <div
              style={{
                fontWeight: "normal",
                fontSize: "14px",
                marginTop: "5px",
                fontFamily: "Muli",
              }}
            >
              Keeping a popular Passover tradition going while social distancing
            </div>

            <div
              style={{
                fontFamily: "Muli",
                fontSize: "15px",
                fontWeight: "normal",
                backgroundColor: "white",
                margin: "auto",
                width: "100%",
                paddingLeft: "10px",
                paddingRight: "30px",
                paddingTop: "5px",
                paddingBottom: "5px",
                color: "black",
                borderRadius: "10px",
                marginTop: "15px",
                display: "flex",
                letterSpacing: "0.03rem",
              }}
            >
              <img
                src={mag}
                alt={"magnifying glass"}
                style={{
                  height: "33px",
                  width: "33px",
                  marginTop: "4px",
                  marginRight: "10px",
                }}
              />
              <div>
                <span style={{ color: "#0066FF" }}>Hint 1:</span> Search,
                discovery, and puzzling adventure!
              </div>
            </div>

            <div style={{ marginTop: "25px" }}>
              <Button
                onClick={() => {
                  // this.props.toastManager.add(
                  //   "Under construction, come back later!",
                  //   {
                  //     appearance: "warning",
                  //   }
                  // );
                  // this.setState(function (state, props) {
                  //   return {
                  //     // TODO: turn this on
                  //     learnMoreShown: !state.learnMoreShown,
                  //     //learnMoreShown: false,
                  //   };
                  // });
                  this.props.goToAbout();
                }}
                style={{
                  backgroundColor: this.blueColor,
                  color: "white",
                  borderRadius: "20px",
                  borderColor: "white",
                  fontSize: "14px",
                  paddingLeft: "15px",
                  paddingRight: "15px",
                  width: "140px",
                  fontFamily: "Lato",
                  marginRight: "5px",
                }}
              >
                About the team
              </Button>
              <Button
                onClick={() => this.props.goToLanding()}
                style={{
                  backgroundColor: "white",
                  color: this.blueColor,
                  borderRadius: "20px",
                  borderColor: "white",
                  fontSize: "14px",
                  paddingLeft: "15px",
                  paddingRight: "15px",
                  width: "140px",
                  fontFamily: "Lato",
                }}
              >
                Play
              </Button>
            </div>
          </Container>
        </div>
        <div style={{ width: "100%" }}>
          <Instructions />
        </div>
      </>
    );
  }
}
export default withToastManager(PreLandingPage);
