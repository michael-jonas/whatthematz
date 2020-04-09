import React from "react";
import davidheadshot from "../Images/TeamMembers/davidheadshot.jpg";
import danielheadshot from "../Images/TeamMembers/danielheadshot.jpg";
import jonasheadshot from "../Images/TeamMembers/jonasheadshot.png";
import allisonheadshot from "../Images/TeamMembers/allisonheadshot.png";
import About from "./About";

export default class AboutTeam extends React.Component {
  render() {
    const members = [
      {
        nameText: "Daniel Weisdorf, Frontend Developer",
        img: danielheadshot,
        text: (
          <>
            I'd like to say that I developed the entire website, but I have to
            admit that David helped sprinkle a few bugs into my otherwise
            flawless code. I'm currently an Engineering student at the
            University of Waterloo, and am{" "}
            <a href="mailto:daniel.weisdorf@edu.uwaterloo.ca">
              actively looking for coop positions
            </a>
            ! I hope you enjoy the site, and chag sameach!
          </>
        ),
      },
      {
        nameText: "Allison Kapps, UX Designer",
        img: allisonheadshot,
        text:
          "They say there's a first time for everything, but I still never thought I'd have to convince my team to not 'just ship the figma design'. I currently work at Shift Technology in Paris as a UX product designer. Paris isn't as romantic when you're stuck indoors, but at least the pastries are still yummy... Oh wait. Chag sameach everyone!",
      },
      {
        nameText: "David Weisdorf, Software Developer",
        img: davidheadshot,
        text:
          "When I'm not writing bugs, I'm blaming other people for the bugs I wrote. I like to think of them as happy little features. I work as a software developer full time but have never truly done full stack web, so this has been a very fun project to get started with. Please enjoy and chag sameach!",
      },
      {
        nameText: "Michael Jonas, Product",
        img: jonasheadshot,
        text:
          "I wrote some code, but David rewrote a lot of that code (to everyone's benefit). The idea for FlattenTheBread came from a joke I made during a video call with my mom. True story! I currently work as a Hardware Engineer at Kepler Communications in downtown Toronto where I design electronics for spacecraft. Stay safe and chag sameach!",
      },
    ];

    const aboutList = members.map((person, index) => (
      <About
        key={person.nameText}
        nameText={person.nameText}
        img={person.img}
        text={person.text}
        number={index + 1}
      />
    ));

    // const memberList = members.map((person) => (
    //   <div
    //     class="memberInfo"
    //     style={{ position: "relative", marginBottom: "80px" }}
    //   >
    //     <div style={{ textAlign: "center" }}>
    //       <img
    //         style={{
    //           marginTop: "12px",
    //           marginBottom: "30px",
    //           width: "100%",
    //           borderRadius: "50%",
    //         }}
    //         alt={"headshot"}
    //         src={person.img}
    //       ></img>
    //     </div>
    //     <div
    //       style={{
    //         fontFamily: "Muli",
    //         fontSize: "15px",
    //         fontWeight: "normal",
    //         backgroundColor: "white",
    //         margin: "auto",
    //         width: "100%",
    //         paddingLeft: "10px",
    //         paddingRight: "30px",
    //         paddingTop: "5px",
    //         paddingBottom: "5px",
    //         color: "black",
    //         borderRadius: "10px",
    //         marginBottom: "15px",
    //         marginTop: "15px",
    //         marginBottom: "15px",
    //         display: "flex",
    //         letterSpacing: "0.03rem",
    //         position: "absolute",
    //         bottom: 70,
    //         display: "flex",
    //         alignItems: "center",
    //       }}
    //     >
    //       <img
    //         src={mag}
    //         alt={"magnifying glass"}
    //         style={{
    //           height: "33px",
    //           width: "33px",
    //           marginTop: "-2px",
    //           marginRight: "2px",
    //         }}
    //       />
    //       <div>
    //         <span>
    //           <span style={{ color: "#0066FF", height: "100%" }}>Hint 1:</span>{" "}
    //           <span>{person.nameText}</span>{" "}
    //         </span>
    //       </div>
    //     </div>
    //     <div
    //       style={{
    //         // position: "relative",
    //         // left: 10,
    //         // right: 10,
    //         top: 10,
    //         // bottom: -10,
    //         fontFamily: "Source Sans Pro",
    //         fontStyle: "normal",
    //         fontWeight: "normal",
    //         lineHeight: "130%",
    //         color: "#424242",
    //         textAlign: "left",
    //       }}
    //     >
    //       {person.text}
    //     </div>
    //   </div>
    // ));

    return (
      <div
        style={{
          backgroundColor: "#F7F7F7",
          width: "100%",
          paddingTop: "20px",
        }}
      >
        <div style={{ padding: "5px", fontSize: "16px", textAlign: "center" }}>
          FlattenTheBread
        </div>
        <div style={{ fontWeight: "normal", padding: "10px" }}>
          Faced with the challenge of keeping traditions alive while stuck at
          home due to Covid-19, we decided to build a fun game to replace the
          Afikoman hunt we all know and love. Faced with a serious time crunch,
          and a hit-or-miss deadline, we worked around the clock for the past
          four days to bring you this online treasure hunt.
        </div>
        <div style={{ textAlign: "center" }}>The team</div>
        <div style={{ marginTop: "10px" }}>{aboutList}</div>
      </div>
    );
  }
}
