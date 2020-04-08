import React from "react";
import Avatar from "./Avatar";

// Receives just a name? Score? A little pre-gen Avatar? A colour?

export default class Player extends React.Component {
  render() {
    return (
      <>
        <div
          style={{
            marginTop: 10,
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 52,
              background: "#FFF8FC",
              padding: 0,
              border: "1px solid #C4C4C4",
              borderRadius: "26px",
            }}
          >
            <Avatar avatarNum={this.props.avatarNum} name={this.props.name} />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              marginLeft: "10px",
            }}
          >
            <div
              style={{
                fontFamily: "Source Sans Pro",
                fontStyle: "normal",
                fontWeight: "600",
                fontSize: "12px",
                lineHeight: "130%",
              }}
            >
              {this.props.name}
            </div>
            <div
              style={{
                fontFamily: "Source Sans Pro",
                fontStyle: "normal",
                fontWeight: "normal",
                fontSize: "12px",
                lineHeight: "130%",
              }}
              className={"light"}
            >
              {this.props.score} point{this.props.score === 1 ? false : "s"}{" "}
              total
            </div>
          </div>
        </div>
        <div style={{ height: 0, border: "1px solid #EDEDED" }} />
      </>
    );
  }
}
