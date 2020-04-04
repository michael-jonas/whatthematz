import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";

import LandingPage from "./Pages/LandingPage";
import LobbyPage from "./Pages/LobbyPage";
import HuntPage from "./Pages/HuntPage";
import { Pages } from "./Globals/Enums";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: Pages.LANDING,
      name: "",
      sederCode: "",
      huntId: "",
      sederName: "Weenie Hut Jr",
    };
  }

  playerList = [
    {
      name: "bob",
      score: 0,
    },
    {
      name: "ted",
      score: 3,
    },
  ];

  goToLobby = () => {
    this.setState({ currentPage: Pages.LOBBY });
  };
  goToLanding = () => {
    this.setState({ currentPage: Pages.LANDING });
  };
  goToHunt = () => {
    this.setState({ currentPage: Pages.HUNT });
  };

  updateJoinedSeder = (name, sederCode) => {
    this.setState({
      name: name,
      sederCode: sederCode,
    });
  };

  updateCreatedSeder = (name, sederCode, sederName) => {
    this.setState({
      name: name,
      sederCode: sederCode,
      sederName: sederName,
    });
  };

  render() {
    return (
      <div>
        <Navbar
          expand="xs"
          bg="dark"
          variant="dark"
          style={{ marginBottom: 20 }}
        >
          <Navbar.Toggle />
          <Navbar.Brand style={{ textAlign: "center" }}>
            <img
              alt=""
              src={logo}
              width="30"
              height="30"
              className="d-inline-block align-top"
            />
            UnleavenTheCurve
          </Navbar.Brand>
          <Navbar.Collapse></Navbar.Collapse>
        </Navbar>
        {this.state.currentPage === Pages.LANDING && (
          <LandingPage
            name={this.state.name}
            sederCode={this.state.sederCode}
            goToLobby={this.goToLobby}
            updateJoinedSeder={this.updateJoinedSeder}
          />
        )}
        {this.state.currentPage === Pages.LOBBY && (
          <LobbyPage
            name={this.state.name}
            players={this.playerList}
            sederCode={this.state.sederCode}
            sederName={this.state.sederName}
            goToLanding={this.goToLanding}
            goToHunt={this.goToHunt}
          />
        )}
        {this.state.currentPage === Pages.HUNT && (
          <HuntPage
            name={this.state.name}
            sederCode={this.state.sederCode}
            goToLanding={this.goToLanding}
            goToLobby={this.goToLobby}
          />
        )}
      </div>
    );
  }
}

export default App;
