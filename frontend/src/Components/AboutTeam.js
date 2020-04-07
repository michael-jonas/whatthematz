import React from "react";
import Container from "react-bootstrap/Container";
import davidheadshot from "../Images/TeamMembers/davidheadshot.jpg";
import mag from "../Images/mag.png";

export default class AboutTeam extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const members = [
      {
        nameText: "David Weisdorf, Software Developer",
        img: davidheadshot,
      },
      {
        nameText: "Daniel Weisdorf, Web Developer",
        img: davidheadshot,
      },
      {
        nameText: "Michael Jonas, Ideas Guy",
        img: davidheadshot,
      },
      {
        nameText: "Allison Kapps, UX Designer",
        img: davidheadshot,
      },
    ];

    const memberList = members.map((person) => (
      <div class="memberInfo" style={{ position: "relative" }}>
        <div style={{ textAlign: "center" }}>
          <img
            style={{
              margin: "auto",
              marginTop: "12px",
              marginBottom: "30px",
              height: "50vw",
              width: "50vw",
              borderRadius: "25vw",
            }}
            src={person.img}
          ></img>
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
            marginBottom: "15px",
            marginTop: "15px",
            marginBottom: "15px",
            display: "flex",
            letterSpacing: "0.03rem",
            position: "absolute",
            bottom: 0,
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
              marginLeft: "10px",
            }}
          />
          <div>
            <span>
              <span style={{ color: "blue", height: "100%" }}>Hint 1:</span>{" "}
              <span>{person.nameText}</span>{" "}
            </span>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
          }}
        >
          This is an extended about me section.
        </div>
      </div>
    ));

    return (
      <div
        style={{
          backgroundColor: "#F7F7F7",
          width: "100%",
        }}
      >
        <Container>
          {/* const playerList = this.props.players?.map((player) => (
        <Player
            key={player.uuid}
            name={player.name}
            avatarNum={player.avatar}
            score={player.score}
        />
        )); */}

          <div style={{ marginTop: "10px" }}>{memberList}</div>
        </Container>
      </div>
    );
  }
}
