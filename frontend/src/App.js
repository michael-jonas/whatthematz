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
import io from 'socket.io-client'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.goToLobby = this.goToLobby.bind(this);

    const _socket = io('http://localhost:3000');
    this.state = {
      currentPage: Pages.LANDING,
      name: "",
      userId: "",
      roomCode: "",
      sederId: "",
      huntId: "",
      sederName: "",
      playerList: [],
      hintList: ["help me", "im so cold"],
      backModal: false,
      isOwner: false,
      socket: _socket
    };
  }
  endpoint = ":5000";

  componentDidMount() {
    // verify our websocket connection is established
    this.state.socket.on('message', (data) => {
      console.log('Got message:');
      console.log(data);
    })
    this.state.socket.on('player_list', (data) => {
      console.log('Got player list:');
      console.log(data['player_list']);
      this.setState({
        playerList: data['player_list'],
      })
    })
    this.state.socket.on('start_time_update', (data) => {
      console.log('Got start time update:');
      console.log(data['startTime']);
    })
    this.state.socket.on('hint_update', (data) => {
      console.log('Got hint update:');
      console.log(data['hint']);
    })
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

  async goToLobby(skipLobby) {
    this.state.socket.emit('new_user', { 'username': this.state.name, 'room': this.state.roomCode, 'seder_id': this.state.sederId, 'hunt_id': this.state.huntId });
    // load the players in the lobby
    // TODO SPINNER HERE

    // fire off non-blocking calls
    // playerlist is necessary for lobby
    // hintlist is necessary if joining mid game - cant show empty block

    this.preloadWaldoImage();

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
      playerList: plist,
      hintList: hlist,
    });

    if (skipLobby) {
      this.setState({
        currentPage: Pages.HUNT,
      });
    } else {
      this.setState({
        currentPage: Pages.LOBBY,
      });
    }
  }

  async preloadWaldoImage() {
    // create an image element so it loads pic now and caches the image
    // this element isnt even used - it just loads the cache
    const img = new Image();
    img.src = `http://localhost:3000/get_image?huntId=${this.state.huntId}`;
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

  updateInfo = (
    name,
    userId,
    sederId,
    roomCode,
    sederName,
    huntId,
    isOwner
  ) => {
    this.setState({
      name: name,
      userId: userId,
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
              style={{ width: "40px", height: "40px" }}
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
        <div id="content" style={{ maxWidth: "450px", margin: "auto" }}>
          {this.state.currentPage === Pages.LANDING && (
            <LandingPage
              goToCreate={this.goToCreate}
              goToJoin={this.goToJoin}
            />
          )}
          {this.state.currentPage === Pages.CREATE && (
            <CreatePage
              goToLobby={this.goToLobby}
              updateInfo={this.updateInfo}
            />
          )}
          {this.state.currentPage === Pages.JOIN && (
            <JoinPage goToLobby={this.goToLobby} updateInfo={this.updateInfo} />
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
              socket={this.state.socket}
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
              xMin={40}
              xMax={60}
              yMin={100}
              yMax={120}
            />
          )}
        </div>
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
