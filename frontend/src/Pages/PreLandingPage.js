import React from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

export default class PreLandingPage extends React.Component {
  render() {
    return (
      <>
        <div
          style={{
            backgroundColor: "rgba(0, 102, 255, 0.95)",
            color: "white",
            marginTop: "-10px",
            fontFamily: "Montserrat",
            fontStyle: "normal",
          }}
        >
          <Container
            style={{
              paddingTop: "20px",
              paddingLeft: "15px",
              paddingRight: "15px",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                letterSpacing: "0.1em",
              }}
            >
              FLATTEN THE BREAD
            </div>
            <div
              style={{
                fontWeight: "normal",
                fontSize: "14px",
              }}
            >
              Keeping a popular Passover tradition going while social distancing
            </div>
            <div
              style={{
                height: 42,
                width: "80%",
                left: "10%",
                lineHeight: 1.2,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  height: "100%",
                  alignItems: "center",
                  flexDirection: "row",
                  textAlign: "center",
                  backgroundColor: "white",
                }}
              >
                <div
                  style={{
                    height: "auto",
                    textAlign: "center",
                    fontSize: "12px",
                  }}
                >
                  <span style={{ color: "blue" }}>Hint 1:</span>{" "}
                  <span style={{ fontWeight: "normal" }}>
                    Search, discovery, and puzzling adventure
                  </span>
                </div>
              </div>
            </div>
          </Container>
        </div>
        <Container></Container>
      </>
    );
  }
}
