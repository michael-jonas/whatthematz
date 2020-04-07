import React from "react";
import { withToastManager } from "react-toast-notifications";

import backButton from "./Images/return-button-2.png";
import "./App.css";
import Navbar from "react-bootstrap/Navbar";
import { Marker } from "react-leaflet";

import LandingPage from "./Pages/LandingPage";
import CreatePage from "./Pages/CreatePage";
import JoinPage from "./Pages/JoinPage";
import LobbyPage from "./Pages/LobbyPage";
import HuntPage from "./Pages/HuntPage";
import WaldoPage from "./Pages/WaldoPage";
import PostGamePage from "./Pages/PostGamePage";
import PreLandingPage from "./Pages/PreLandingPage";

import { Pages } from "./Globals/Enums";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.goToLobby = this.goToLobby.bind(this);
    this.handleLeavePage = this.handleLeavePage.bind(this);

    this.state = {
      currentPage: Pages.PRELANDING,
      name: "",
      userId: "",
      roomCode: "",
      sederId: "",
      huntId: "",
      nextHuntId: "",
      sederName: "",
      playerList: [],
      winnersList: [],
      hintList: ["help me", "im so cold"],
      numberOfHints: 1,
      backModal: false,
      isOwner: false,
      boundingBox: null,
      showCountdown: false,
      gameEndTime: Date.now(),
      markerLayer: <></>,
      currentHuntOver: false,
    };
  }
  firstJoin = true;
  isActive = false;
  haveWon = false;

  setPage(page) {
    this.setState({ currentPage: page });
  }

  componentDidMount() {
    window.addEventListener("beforeunload", (e) => {
      this.props.socket.emit(
        "unloading",
        {
          sederId: this.state.sederId,
          userId: this.state.userId,
        },
        (data) => {
          this.setState({
            winnersList: data.winnerList,
            playerList: [],
          });
          this.goToPostGame();
        }
      );
      this.props.socket.disconnect();
    });
  }

  handleLeavePage(e) {
    if (this.state.roomCode !== "") {
      e.preventDefault();
      e.returnValue = "are you sure";
    }
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

  concludeHunt = () => {
    this.haveWon = true;
    this.props.socket.emit(
      "trigger_win",
      {
        huntId: this.state.huntId,
        userId: this.state.userId,
      },
      (data) => {
        //console.log(data);
        this.setState({
          winnersList: data.winnerList,
          playerList: [],
        });
        this.goToPostGame();
      }
    );
  };

  timeouts = [];

  async goToLobby() {
    //console.log("emit user");

    // verify our websocket connection is established
    this.props.socket.on("message", (data) => {
      // console.log("Got message:");
      // console.log(data);
    });

    this.props.socket.on("player_list", (data) => {
      // console.log("Got player list:");

      console.log(data["player_list"]);
      if (this.firstJoin) {
        this.firstJoin = false;
        if (!this.isActive) {
          // if this.hunt is in progress TODO
          this.setState({
            currentPage: Pages.LOBBY,
          });
        } else {
          this.setState({
            currentPage: Pages.HUNT,
          });
          let diff_seconds = 3;
          let callbackGen = (nHints) => {
            return () => {
              this.setState({ numberOfHints: nHints });
            };
          };

          const INTERVAL = 30; // 30 seconds between each
          for (let i = 2; i <= this.state.hintList.length; i++) {
            let myCallback = callbackGen(i);
            let seconds = (i - 1) * INTERVAL;
            this.timeouts.push(
              setTimeout(myCallback, (diff_seconds + seconds) * 1000)
            );
          }
        }
      }

      const isOwner = data.player_list?.[0]?.uuid === this.state.userId;

      this.setState({
        playerList: data["player_list"],
        isOwner: isOwner,
      });
    });

    this.props.socket.on("start_time_update", (data) => {
      this.isActive = true;
      if (this.state.currentPage !== Pages.LOBBY) return;
      // console.log('Got start time update:');
      let dt_str = data["startTime"];
      // console.log('dt string: ' + dt_str);
      let datetime_start = new Date(dt_str);
      let datetime_now = Date.now();

      // todo time doesnt work
      let diff = datetime_start - datetime_now;
      // console.log('diff: ')
      // console.log(datetime_start)
      // console.log(datetime_now)
      // console.log(diff)

      let diff_seconds = 3;

      let callbackGen = (nHints) => {
        return () => {
          this.setState({ numberOfHints: nHints });
        };
      };

      const INTERVAL = 30; // 30 seconds between each
      for (let i = 2; i <= this.state.hintList.length; i++) {
        let myCallback = callbackGen(i);
        let seconds = (i - 1) * INTERVAL;
        this.timeouts.push(
          setTimeout(myCallback, (diff_seconds + seconds) * 1000)
        );
      }

      setTimeout(() => {
        this.setPage(Pages.HUNT);
      }, diff_seconds * 1000);

      this.setState({ showCountdown: true });
    });
    this.props.socket.on("winners_list_update", (data) => {
      // console.log("got winner list:");
      // Updates:
      // winners list
      // next hunt id
      // old player list conditionally
      console.log(data);
      this.isActive = false;
      if (!this.state.currentHuntOver) {
        // todo kick off timers
        if (!this.haveWon) {
          this.props.toastManager.add(
            `Uh oh, ${data.winnerList?.[0]?.nickname} found the afikoman! Finish quick before time runs out!`,
            {
              appearance: "warning",
            }
          );
        }

        this.setState({
          currentHuntOver: true,
          gameEndTime: Date.now(),
        });
      }

      this.setState({
        winnersList: data["winnerList"],
        nextHuntId: data.newHuntId,
      });
    });

    this.props.socket.emit(
      "new_user",
      {
        username: this.state.name,
        room: this.state.roomCode,
        seder_id: this.state.sederId,
        hunt_id: this.state.huntId,
      },
      (data) => {
        //console.log("success new_user");
      }
    );
    // hintlist is necessary if joining mid game - cant show empty block

    await this.getHintList();

    this.preloadWaldoImage();
    this.loadBoundingBox(0);
    this.loadMarkers();
  }

  async getHintList() {
    const response = await fetch(`/api/get_hints?huntId=${this.state.huntId}`, {
      method: "GET",
    });
    if (response.ok) {
      const json = await response.json();
      this.setState({
        hintList: json.result,
      });
    }
  }

  async loadMarkers(retries) {
    // fetch list of cities
    const response = await fetch(`/api/get_cities`);
    if (response.ok) {
      const json = await response.json();

      const markerLayer = json.result.map((marker) => {
        let latlng = { lat: marker[1], lng: marker[2] };
        return (
          <Marker
            key={marker[0]}
            position={latlng}
            onclick={() => this.checkRightCity(marker[0])}
          >
            {/* <Tooltip>{marker[0]}</Tooltip> */}
          </Marker>
        );
      });

      this.setState({
        markerLayer: markerLayer,
      });
    } else {
      //retry loop, max timeouts? nahhh
      if (retries < 3) {
        setTimeout(() => {
          this.loadMarkers(++retries);
        }, 1000);
      }
    }
  }
  async checkRightCity(name, retries) {
    const response = await fetch(
      `/api/check_location?huntId=${this.state.huntId}&locationName=${name}`
    );
    if (response.ok) {
      const json = await response.json();
      if (json.found === true) {
        this.goToWaldo();
      } else {
        this.props.toastManager.add(
          "Hmm, I don't smell any matzah here. Let's try somewhere else!",
          {
            appearance: "info",
          }
        );
      }
    } else if (response.status === 400) {
      // be sad, maybe check if hunt still active?
    } else if (retries < 3) {
      setTimeout(() => {
        this.checkRightCity(name, ++retries);
      }, 1000);
    }
  }

  async preloadWaldoImage() {
    // create an image element so it loads pic now and caches the image
    // this element isnt even used - it just loads the cache
    const img = new Image();
    //img.src = `${this.props.apiUrl}/api/get_image?huntId=${this.state.huntId}`;
    img.src = `/api/get_image?huntId=${this.state.huntId}`;
  }
  async loadBoundingBox(retries) {
    const boundingBoxResponse = await fetch(
      `/api/get_bounding_box?huntId=${this.state.huntId}`,
      { method: "GET" }
    );

    if (boundingBoxResponse.ok) {
      const json = await boundingBoxResponse.json();
      this.setState({
        boundingBox: json.boundingBox,
      });
    } else if (boundingBoxResponse.status === 400) {
      // hunt not found? todo
    } else if (boundingBoxResponse.status === 500 && retries < 3) {
      setTimeout(() => {
        this.loadBoundingBox(++retries);
      }, 1000);
    } else {
      // Todo Toast a fail message?
    }
  }

  goToPreLanding = () => {
    this.setState({ currentPage: Pages.PRELANDING });
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
  goToWaldo = () => {
    this.setState({ currentPage: Pages.WALDO });
  };
  goToPostGame = () => {
    this.setState({ currentPage: Pages.POSTGAME });
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
      case Pages.LANDING:
        console.log("b)");
        this.goToPreLanding();
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
    isOwner,
    isActive
  ) => {
    this.isActive = isActive;
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

  joinNextLobby = () => {
    let onSuccess = () => {
      // fetch
      for (let i = 0; i < this.timeouts.length; i++) {
        clearTimeout(this.timeouts[i]);
      }
      this.timeouts = [];

      this.haveWon = false;
      this.setState({
        huntId: this.state.nextHuntId,
        nextHuntId: "",
        winnerList: [],
        hintList: [],
        numberOfHints: 1,
        boundingBox: [],
        showCountdown: false,
        gameEndTime: Date.now(),
        currentHuntOver: false,
      });
      this.preloadWaldoImage();
      this.loadBoundingBox(0);
      this.getHintList();
      if (!this.isActive) {
        this.setState({
          currentPage: Pages.LOBBY,
        });
      } else {
        this.setState({
          currentPage: Pages.HUNT,
        });
        let diff_seconds = 3;
        let callbackGen = (nHints) => {
          return () => {
            this.setState({ numberOfHints: nHints });
          };
        };

        const INTERVAL = 30; // 30 seconds between each
        for (let i = 2; i <= this.state.hintList.length; i++) {
          let myCallback = callbackGen(i);
          let seconds = (i - 1) * INTERVAL;
          this.timeouts.push(
            setTimeout(myCallback, (diff_seconds + seconds) * 1000)
          );
        }
      }
    };

    this.props.socket.emit(
      "join_hunt",
      {
        huntId: this.state.nextHuntId,
        userId: this.state.userId,
      },
      (data) => {
        if (data.ok) {
          onSuccess();
        }
      }
    );
  };

  render() {
    return (
      <>
        <div
          style={{
            maxHeight: "calc(100vh - 40px)",
            overflowY: "auto",
          }}
        >
          <Navbar
            expand="xs"
            //bg="dark"
            variant="light"
          >
            <Navbar.Toggle style={{ color: "blue" }} />
            <Navbar.Brand
              style={{
                position: "absolute",
                left: "50%",
                transform: "translatex(-50%)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "Montserrat",
                  letterSpacing: "0.1em",
                  fontSize: "14px",
                  fontWeight: "600",
                  lineHeight: "17px",
                }}
              >
                FLATTEN THE BREAD
              </div>
              <div
                style={{
                  fontFamily: "Muli",
                  fontSize: "12px",
                  fontWeight: "normal",
                  lineHeight: "15px",
                }}
              >
                Keeping a tradition alive during Covid-19
              </div>
            </Navbar.Brand>
            {(this.state.currentPage === Pages.CREATE ||
              this.state.currentPage === Pages.JOIN ||
              this.state.currentPage === Pages.LANDING) && (
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
            style={{
              height: 0,
              border: "1px solid #EDEDED",
              marginBottom: 10,
            }}
          />

          <div id="content" style={{ maxWidth: "450px", margin: "auto" }}>
            {this.state.currentPage === Pages.PRELANDING && (
              <PreLandingPage
                goToLanding={this.goToLanding}
                goToAbout={this.goToAbout}
              />
            )}
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
              <JoinPage
                goToLobby={this.goToLobby}
                updateInfo={this.updateInfo}
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
                socket={this.props.socket}
                showCountdown={this.state.showCountdown}
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
                numberOfHints={this.state.numberOfHints}
                markerLayer={this.state.markerLayer}
              />
            )}
            {this.state.currentPage === Pages.WALDO && (
              <WaldoPage
                name={this.state.name}
                userId={this.state.userId}
                players={this.state.playerList}
                roomCode={this.state.roomCode}
                sederName={this.state.sederName}
                huntId={this.state.huntId}
                goToPostGame={this.goToPostGame}
                boundingBox={this.state.boundingBox}
                concludeHuntHandler={this.concludeHunt}
                apiUrl={this.props.apiUrl}
              />
            )}
            {this.state.currentPage === Pages.POSTGAME && (
              <PostGamePage
                name={this.state.name}
                players={this.state.playerList}
                winnersList={this.state.winnersList}
                roomCode={this.state.roomCode}
                sederName={this.state.sederName}
                huntId={this.state.huntId}
                joinNextLobby={this.joinNextLobby}
              />
            )}
          </div>
        </div>
        {this.state.currentPage !== Pages.WALDO &&
          this.state.currentPage !== Pages.HUNT && (
            <div
              style={{
                position: "fixed",
                bottom: "10px",
                width: "100%",
                textAlign: "center",
              }}
            >
              <span>
                Learn more about this <a href="/">project</a>
              </span>
            </div>
          )}
      </>
    );
  }
}

export default withToastManager(App);
