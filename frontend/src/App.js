import React from "react";
import { withToastManager } from "react-toast-notifications";

import backButton from "./Images/return-button-2.png";
import "./App.css";
import Navbar from "react-bootstrap/Navbar";
import { Marker } from "react-leaflet";
import Countdown from "./Components/Countdown";

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
      currentHuntOver: false,
      currentTimeRemaining: 0,
    };
  }
  firstJoin = true;
  isActive = false;
  haveWon = false;

  setPage(page) {
    this.setState({ currentPage: page });
  }

  async joinOldSederFromRefresh(roomCode, uuid) {
    const response = await fetch(
      `/api/join_seder?roomCode=${roomCode.toUpperCase()}&userId=${uuid}&nickname=garbage`,
      {
        method: "POST",
      }
    );

    if (response.ok) {
      const json = await response.json();
      this.updateInfo(
        this.state.name,
        json.userId,
        json.sederId,
        roomCode,
        json.sederName,
        json.huntId,
        false,
        json.isActive
      );
      this.goToLobby(json?.queued ?? false);
    } else if (response.status === 400) {
    } else {
      this.props.toastManager.add(
        "Hmm, something went wrong. Try again in a little bit!",
        {
          appearance: "error",
        }
      );
      this.setState({
        isBusy: false,
      });
    }
  }

  componentDidMount() {
    if (sessionStorage.getItem("uuid")) {
      this.joinOldSederFromRefresh(
        sessionStorage.getItem("roomCode"),
        sessionStorage.getItem("uuid")
      );
    }

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
        if (this.toastId) {
          this.props.toastManager.remove(this.toastId);
          this.toastId = null;
        }
        this.goToPostGame();
      }
    );
  };

  timeouts = [];

  setHintTimeouts(diff_seconds = 0) {
    let callbackGen = (nHints) => {
      return () => {
        this.setState({ numberOfHints: nHints });
      };
    };

    const timeDeltas = [10, 20, 30, 40, 50, 60, 70, 80, 90, 10];
    let sumSeconds = 0;
    // const INTERVAL = 30; // 30 seconds between each
    for (let i = 2; i <= this.state.hintList.length; i++) {
      let myCallback = callbackGen(i);
      sumSeconds += timeDeltas[i - 2];
      // let seconds = (i - 1) * INTERVAL;
      //console.log(sumSeconds);
      this.timeouts.push(
        setTimeout(myCallback, (diff_seconds + sumSeconds) * 1000)
      );
    }
  }

  async goToLobby() {
    //console.log("emit user");
    // verify our websocket connection is established
    this.props.socket.on("message", (data) => {
      // console.log("Got message:");
      // console.log(data);
    });

    this.props.socket.on("player_list", (data) => {
      // console.log("Got player list:");

      //console.log(data["player_list"]);
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

          this.setHintTimeouts();
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
      // // console.log('Got start time update:');
      // let dt_str = data["startTime"];
      // // console.log('dt string: ' + dt_str);
      // let datetime_start = new Date(dt_str);
      // let datetime_now = Date.now();

      // // todo time doesnt work
      // let diff = datetime_start - datetime_now;
      // // console.log('diff: ')
      // // console.log(datetime_start)
      // // console.log(datetime_now)
      // // console.log(diff)

      this.setHintTimeouts(3);

      setTimeout(() => {
        this.setPage(Pages.HUNT);
      }, 3 * 1000);

      this.setState({ showCountdown: true });
    });
    this.props.socket.on("winners_list_update", (data) => {
      // console.log("got winner list:");
      // Updates:
      // winners list
      // next hunt id
      // old player list conditionally
      //console.log(data);
      this.isActive = false;

      if (!this.state.currentHuntOver) {
        // todo kick off timers
        this.startGameEnd();
        if (
          !this.haveWon &&
          (this.state.currentPage === Pages.HUNT ||
            this.state.currentPage === Pages.WALDO)
        ) {
          this.props.toastManager.add(
            `Uh oh, ${data.winnerList?.[0]?.nickname} found the afikoman! Finish quick before time runs out!`,
            {
              appearance: "warning",
              autoDismissTimeout: 10000,
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

  cityList = [
    ["Amsterdam", 52.3727598, 4.8936041],
    ["Berlin", 52.5170365, 13.3888599],
    ["Buenos Aires", -34.6075682, -58.4370894],
    ["Chicago", 41.8755616, -87.6244212],
    ["Florence", 43.7698712, 11.2555757],
    ["Jerusalem", 31.778345, 35.2250786],
    ["Kiev", 50.4500336, 30.5241361],
    ["London", 51.5073219, -0.1276474],
    ["Los Angeles", 34.0536909, -118.2427666],
    ["Melbourne", -37.8142176, 144.9631608],
    ["Montreal", 45.4972159, -73.6103642],
    ["New York City", 40.7127281, -74.0060152],
    ["Paris", 48.8566969, 2.3514616],
    ["Philadelphia", 39.9527237, -75.1635262],
    ["Prague", 50.0874654, 14.4212535],
    ["Tel Aviv", 32.0804808, 34.7805274],
    ["Toronto", 43.6534817, -79.3839347],
    ["Vancouver", 49.2608724, -123.1139529],
    ["Warsaw", 52.2337172, 21.07141112883227],
  ];

  markerLayer = this.cityList.map((marker) => {
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

  // loadMarkers(retries) {
  //   // fetch list of cities
  //   const response = await fetch(`/api/get_cities`);
  //   if (response.ok) {
  //     const json = await response.json();

  //     this.setState({
  //       markerLayer: markerLayer,
  //     });
  //   } else {
  //     //retry loop, max timeouts? nahhh
  //     if (retries < 3) {
  //       setTimeout(() => {
  //         this.loadMarkers(++retries);
  //       }, 1000);
  //     }
  //   }
  // }
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
    img.src = `${this.props.apiUrl}/api/get_image?huntId=${this.state.huntId}`;
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
    sessionStorage.setItem("uuid", userId);
    sessionStorage.setItem("roomCode", roomCode);
  };

  joinNextLobby = () => {
    let onSuccess = async () => {
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
      await this.getHintList();
      if (!this.isActive) {
        this.setState({
          currentPage: Pages.LOBBY,
        });
      } else {
        this.setState({
          currentPage: Pages.HUNT,
        });

        this.setHintTimeouts();
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

  toastId = null;
  gameEndInterval = null;
  gameEndTimeout = null;
  oldPlayerList = null;

  startGameEnd() {
    // Toast info if you're on the Hunt/Waldo page
    // Don't toast if you're on Postgame
    // save toast id to close on arriving to postgame page
    this.oldPlayerList = this.state.playerList;

    this.setState({
      currentTimeRemaining: 60,
      playerList: [],
    });

    // Every second - check if game has ended, and update timer for all components
    this.gameEndInterval = setInterval(() => {
      this.checkGameEnd();
      this.setState((state) => ({
        currentTimeRemaining: state.currentTimeRemaining - 1,
      }));
    }, 1000);

    // After 60 seconds, if no game end, then force game end
    this.gameEndTimeout = setTimeout(() => {
      this.props.toastManager.add(
        "Sorry, you ran out of time. Better luck next time!",
        {
          appearance: "warning",
        }
      );
      this.endGameEnd();
    }, 60000);

    if (
      this.state.currentPage === Pages.HUNT ||
      this.state.currentPage === Pages.WALDO
    ) {
      this.toastId = this.props.toastManager.add(
        <>
          <Countdown
            color={"#0066FF"}
            startingCount={this.state.currentTimeRemaining}
          />{" "}
          seconds until hunt ends.
        </>,
        {
          appearance: "info",
          autoDismiss: false,
        }
      );
    }

    // kick off timer that updates state every second
    // Take a copy of current players in case future players join next lobby and pollute your local list
    // checks for game end every second
  }
  checkGameEnd() {
    // Check local copy of current players against winners list length to see if everyone's out and you can end early
    if (this.oldPlayerList?.length === this.state.winnersList?.length) {
      this.endGameEnd();
    }
  }

  // Called when timer hits 0 or when currentlist = winners list
  endGameEnd() {
    // Close toast via id
    // Clear everything
    // Set time to 0
    if (this.state.currentPage !== Pages.POSTGAME) {
      this.goToPostGame();
    }
    if (this.toastId) {
      this.props.toastManager.remove(this.toastId);
      this.toastId = null;
    }

    clearInterval(this.gameEndInterval);
    clearTimeout(this.gameEndTimeout);

    this.oldPlayerList = null;
    this.gameEndInterval = null;
    this.gameEndTimeout = null;
    this.setState({
      currentTimeRemaining: 0,
    });
  }

  render() {
    return (
      <>
        <div>
          <Navbar
            //bg="dark"
            expand="xs"
            variant="light"
            style={{ height: "50px" }}
          >
            <Navbar.Toggle as="div" style={{ color: "blue", opacity: "0" }} />
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
                  color: "#212121",
                }}
              >
                FLATTEN THE BREAD
              </div>
              <div
                style={{
                  fontFamily: "Muli",
                  fontSize: "12px",
                  fontWeight: "normal",
                  fontStyle: "normal",
                  lineHeight: "15px",
                  color: "#424242",
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
                markerLayer={this.markerLayer}
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
                currentTimeRemaining={this.state.currentTimeRemaining}
              />
            )}
          </div>
        </div>
        {(this.state.currentPage === Pages.LOBBY ||
          this.state.currentPage === Pages.POSTGAME) && (
          <div
            style={{
              position: "fixed",
              bottom: "10px",
              width: "100%",
              textAlign: "center",
              fontWeight: "600",
              fontFamily: "Muli",
              letterSpacing: "0.1em",
            }}
          >
            <span>
              Learn more about this{" "}
              <a href="/" style={{ color: "#0066FF" }}>
                project
              </a>
            </span>
          </div>
        )}
      </>
    );
  }
}

export default withToastManager(App);
