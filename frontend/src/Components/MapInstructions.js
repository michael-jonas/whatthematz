import React from "react";
import mag from "../Images/mag.png";

import mapInstruction from "../Images/Instructions/mapMobile.png";

export default class MapInstructions extends React.Component {
  render() {
    return (
      <div
        style={{
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            backgroundColor: "white",
            opacity: 0.8,
            height: 90,
            width: "100%",
            zIndex: 500,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "10%",
            width: "80%",
            top: "20px",
            height: "52px",
            background: "#FFFFFF",
            boxShadow: "0px 1px 7px rgba(0, 0, 0, 0.13)",
            borderRadius: "10px",
            zIndex: 501,
            opacity: 1,
            fontSize: "14px",
            padding: "5px",
            display: "flex",
            alignItems: "center",
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
            <span style={{ color: "blue" }}>Hint 1:</span> Find the right city
            with the help of a few clues and some research!
          </div>
        </div>
        <img src={mapInstruction} style={{ width: "90%" }} alt="Example map" />
      </div>
    );
  }
}
