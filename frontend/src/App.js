import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Navbar from "react-bootstrap/Navbar";
import LandingPage from "./Pages/LandingPage";
import LobbyPage from "./Pages/LobbyPage";
import HuntPage from "./Pages/HuntPage";
import { Pages } from "./Globals/Enums";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: Pages.LANDING,
      nickname: "",
      seder: "",
    };
  }

  goToLobby = () => {
    this.setState({ currentPage: Pages.LOBBY });
  };
  goToLanding = () => {
    this.setState({ currentPage: Pages.LANDING });
  };
  goToHunt = () => {
    this.setState({ currentPage: Pages.HUNT });
  };

  render() {
    return (
      <>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand>
            <img
              alt=""
              src={logo}
              width="30"
              height="30"
              className="d-inline-block align-top"
            />
            UnleavenTheBread
          </Navbar.Brand>
        </Navbar>
        {this.state.currentPage === Pages.LANDING && (
          <LandingPage
            nickname={this.state.nickname}
            seder={this.state.seder}
            goToLobby={this.goToLobby}
          />
        )}
        {this.state.currentPage === Pages.LOBBY && (
          <LobbyPage
            nickname={this.state.nickname}
            seder={this.state.seder}
            goToLanding={this.goToLanding}
            goToHunt={this.goToHunt}
          />
        )}
        {this.state.currentPage === Pages.HUNT && (
          <HuntPage
            nickname={this.state.nickname}
            seder={this.state.seder}
            goToLanding={this.goToLanding}
            goToLobby={this.goToLobby}
          />
        )}
      </>
    );
  }
}

export default App;
