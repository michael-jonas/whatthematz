import React from "react";
import mag from "../Images/magpink.png";

export default class About extends React.Component {
  // Picture
  // floating fixed length hint
  // blurb underneath
  render() {
    return (
      <>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            position: "relative",
            marginBottom: "-70px",
          }}
        >
          <img
            style={{
              marginTop: "12px",
              marginBottom: "30px",
              width: "90%",
              borderRadius: "50%",
            }}
            alt={"headshot"}
            src={this.props.img}
          />

          <div
            style={{
              fontFamily: "Muli",
              fontSize: "15px",
              fontWeight: "normal",
              backgroundColor: "white",
              margin: "auto",
              width: "90%",
              paddingLeft: "10px",
              paddingRight: "30px",
              paddingTop: "5px",
              paddingBottom: "5px",
              color: "black",
              marginBottom: "15px",
              marginTop: "15px",
              letterSpacing: "0.03rem",
              position: "relative",
              bottom: 85,
              display: "flex",
              alignItems: "center",
              boxShadow: "0px 1px 7px rgba(0, 0, 0, 0.13)",
              borderRadius: "10px",
              justifyContent: "center",
            }}
          >
            <img
              src={mag}
              alt={"magnifying glass"}
              style={{
                height: "33px",
                width: "33px",
                marginTop: "-2px",
                marginRight: "2px",
              }}
            />
            <div>
              <span>
                <span style={{ color: "#0066FF", height: "100%" }}>
                  Hint {this.props.number}:
                </span>{" "}
                <span>{this.props.nameText}</span>{" "}
              </span>
            </div>
          </div>
          <div
            style={{
              position: "relative",
              paddingLeft: "20px",
              paddingRight: "20px",
              bottom: 85,
              fontFamily: "Source Sans Pro",
              fontStyle: "normal",
              fontWeight: "normal",
              lineHeight: "130%",
              color: "#424242",
              textAlign: "left",
            }}
          >
            {this.props.text}
          </div>
          <div
            style={{
              height: 0,
              width: "100%",
              border: "2px solid #EAEAEA",
              position: "relative",
              bottom: 75,
            }}
          />
        </div>
      </>
    );
  }
}
