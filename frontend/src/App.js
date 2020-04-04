import React from "react";
import logo from "./logo.svg";
import backButton from "./Images/return-button-2.png";
import "./App.css";
import Navbar from "react-bootstrap/Navbar";

import LandingPage from "./Pages/LandingPage";
import CreatePage from "./Pages/CreatePage";
import JoinPage from "./Pages/JoinPage";
import LobbyPage from "./Pages/LobbyPage";
import HuntPage from "./Pages/HuntPage";
import { Pages } from "./Globals/Enums";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: Pages.LOBBY,
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
  goToCreate = () => {
    this.setState({ currentPage: Pages.CREATE });
  };
  goToJoin = () => {
    this.setState({ currentPage: Pages.JOIN });
  };
  goToHunt = () => {
    this.setState({ currentPage: Pages.HUNT });
  };

  handleBackButton = () => {
    switch (this.state.currentPage) {
      case Pages.LOBBY:
        // Warn leaving lobby
        this.goToLanding();
        break;
      case Pages.CREATE:
      case Pages.JOIN:
        this.goToLanding();
        break;
      case Pages.HUNT:
        // unsure
        break;
      default:
        break;
    }
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
          //bg="dark"
          variant="light"
          style={{ marginBottom: 20 }}
        >
          <Navbar.Toggle />
          <Navbar.Brand
            style={{
              position: "absolute",
              left: "50%",
              transform: "translatex(-50%)",
            }}
          >
            <img
              alt=""
              src={logo}
              width="30"
              height="30"
              className="d-inline-block align-top"
            />
            UnleavenTheCurve
          </Navbar.Brand>
          {this.state.currentPage !== Pages.LANDING && (
            <input
              style={{ width: 40, height: 40 }}
              type="image"
              alt="Back"
              src={backButton}
              onClick={() => this.handleBackButton()}
            />
          )}
        </Navbar>
        {this.state.currentPage === Pages.LANDING && (
          <LandingPage goToCreate={this.goToCreate} goToJoin={this.goToJoin} />
        )}
        {this.state.currentPage === Pages.CREATE && (
          <CreatePage
            name={this.state.name}
            sederName={this.state.sederName}
            goToLobby={this.goToLobby}
            updateCreatedSeder={this.updateCreatedSeder}
          />
        )}
        {this.state.currentPage === Pages.JOIN && (
          <JoinPage
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
