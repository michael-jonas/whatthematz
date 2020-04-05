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
import WaldoPage from "./Pages/WaldoPage";

import { Pages } from "./Globals/Enums";

import socketIOClient from "socket.io-client";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.goToLobby = this.goToLobby.bind(this);
    this.state = {
      currentPage: Pages.LANDING,
      name: "",
      roomCode: "",
      sederId: "",
      huntId: "",
      sederName: "",
      playerList: [],
      hintList: ["help me", "im so cold"],
      backModal: false,
      isOwner: false,
    };
  }
  endpoint = ":5000";

  componentDidMount() {
    // const socket = socketIOClient(this.endpoint);
    // socket.on("test", (data) => console.log(data));
    // socket.emit("join");
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

  async goToLobby() {
    // load the players in the lobby
    // TODO SPINNER HERE

    const pResponseAwaiter = fetch(
      `/get_player_list?huntId=${this.state.huntId}`,
      { method: "GET" }
    );
    const hResponseAwaiter = fetch(`/get_hints?huntId=${this.state.huntId}`, {
      method: "GET",
    });

    let pResponse = (await pResponseAwaiter).json();
    let hResponse = (await hResponseAwaiter).json();

    let plist = (await pResponse).result;
    let hlist = (await hResponse).result;

    this.setState({
      currentPage: Pages.LOBBY,
      playerList: plist,
      hintList: hlist,
    });
  }
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
  goToWaldo = () => {
    this.setState({ currentPage: Pages.WALDO });
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

  updateSederInfo = (name, sederId, roomCode, sederName, huntId, isOwner) => {
    this.setState({
      name: name,
      sederId: sederId,
      roomCode: roomCode,
      sederName: sederName,
      huntId: huntId,
      isOwner: isOwner,
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
            goToLobby={this.goToLobby}
            updateSederInfo={this.updateSederInfo}
          />
        )}
        {this.state.currentPage === Pages.JOIN && (
          <JoinPage
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
            isOwner={this.state.isOwner}
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
            goToWaldo={this.goToWaldo}
            hintList={this.state.hintList}
          />
        )}
        {this.state.currentPage === Pages.WALDO && (
          <WaldoPage
            name={this.state.name}
            players={this.state.playerList}
            roomCode={this.state.roomCode}
            sederName={this.state.sederName}
            huntId={this.state.huntId}
            goToLobby={this.goToLobby}
          />
        )}
        <div
          style={{
            textAlign: "center",
          }}
        >
          <span>
            Learn more about this <a href="/">project</a>
          </span>
        </div>
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