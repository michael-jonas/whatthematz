import React from "react";
import logo from "./logo.svg";
import backButton from "./Images/return-button-2.png";
import "./App.css";
import Navbar from "react-bootstrap/Navbar";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

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
      currentPage: Pages.LANDING,
      name: "",
      roomCode: "",
      sederId: "",
      huntId: "",
      sederName: "",
      playerList: [],
      backModal: false,
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

  openBackModal = () => {
    this.setState({
      backModal: true,
    });
  };

  closeBackModal = () => {
    this.setState({
      backModal: false,
    });
  };

  handleBackButton = () => {
    switch (this.state.currentPage) {
      case Pages.LOBBY:
        // Warn leaving lobby
        this.openBackModal();
        break;
      case Pages.CREATE:
      case Pages.JOIN:
        this.goToLanding();
        break;
      case Pages.HUNT:
        this.openBackModal();
        break;
      default:
        break;
    }
  };

  confirmBack = () => {
    switch (this.state.currentPage) {
      case Pages.LOBBY:
        // Clear values?
        this.goToLanding();
        this.closeBackModal();
        break;
      case Pages.HUNT:
        // Requeue somehow
        this.goToLobby();
        this.closeBackModal();
        break;
      default:
        break;
    }
  };

  updateSederInfo = (name, sederId, roomCode, sederName, huntId) => {
    this.setState({
      name: name,
      sederId: sederId,
      roomCode: roomCode,
      sederName: sederName,
      huntId: huntId,
    });
  };

  render() {
    return (
      <div>
        <Navbar
          expand="xs"
          //bg="dark"
          variant="light"
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
          {(this.state.currentPage === Pages.CREATE ||
            this.state.currentPage === Pages.JOIN) && (
            <input
              style={{ width: 40, height: 40 }}
              type="image"
              alt="Back"
              src={backButton}
              onClick={() => this.handleBackButton()}
            />
          )}
        </Navbar>
        <div
          style={{ height: 0, border: "1px solid #EDEDED", marginBottom: 10 }}
        />
        {this.state.currentPage === Pages.LANDING && (
          <LandingPage goToCreate={this.goToCreate} goToJoin={this.goToJoin} />
        )}
        {this.state.currentPage === Pages.CREATE && (
          <CreatePage
            name={this.state.name}
            sederName={this.state.sederName}
            goToLobby={this.goToLobby}
            updateSederInfo={this.updateSederInfo}
          />
        )}
        {this.state.currentPage === Pages.JOIN && (
          <JoinPage
            name={this.state.name}
            roomCode={this.state.roomCode}
            goToLobby={this.goToLobby}
            updateSederInfo={this.updateSederInfo}
          />
        )}
        {this.state.currentPage === Pages.LOBBY && (
          <LobbyPage
            name={this.state.name}
            players={this.state.playerList}
            roomCode={this.state.roomCode}
            sederName={this.state.sederName}
            huntId={this.state.huntId}
            goToHunt={this.goToHunt}
          />
        )}
        {this.state.currentPage === Pages.HUNT && (
          <HuntPage
            name={this.state.name}
            players={this.state.playerList}
            roomCode={this.state.roomCode}
            sederName={this.state.sederName}
            huntId={this.state.huntId}
            goToLobby={this.goToLobby}
          />
        )}
        <Modal show={this.state.backModal} onHide={this.closeBackModal}>
          <Modal.Header closeButton>
            <Modal.Title>Are you sure you want to go back?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.currentPage === Pages.LOBBY
              ? "If you leave now, you'll lose your score and have to rejoin the Seder."
              : "If you leave now, you'll have to wait until the next hunt."}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={this.confirmBack}>
              {this.state.currentPage === Pages.LOBBY
                ? "Leave Seder"
                : "Leave Hunt"}
            </Button>
            <Button variant="primary" onClick={this.closeBackModal}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default App;
