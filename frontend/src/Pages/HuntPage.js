import React from "react";
import Container from "react-bootstrap/Container";
import Carousel from "react-bootstrap/Carousel";
import { Map, TileLayer, Marker, ZoomControl } from "react-leaflet";
import { HuntStage } from "../Globals/Enums";

export default class HuntPage extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();

    this.state = {
      markersLoaded: false,
      showMarkers: false,
      lat: 0,
      lng: 0,
      zoom: 1,
      curZoom: 1,
      numberOfHints: 1,
      curStage: HuntStage.MAP,
    };
  }
  markerLayer = [];
  minZoom = 10;

  async loadMarkers(retries) {
    // fetch list of cities
    const response = await fetch(`/get_cities`);
    if (response.ok) {
      const json = await response.json();

      this.markerLayer = json.result.map((marker) => {
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
        markersLoaded: true,
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
      `/check_location?huntId=${this.props.huntId}&locationName=${name}`
    );
    if (response.ok) {
      const json = await response.json();
      if (json.found === true) {
        // complete hunt, navigate away TODO
      } else {
        // toast hunt not complete
      }
    } else if (response.status === 400) {
      // be sad, maybe check if hunt still active?
    } else if (retries < 3) {
      setTimeout(() => {
        this.checkRightCity(name, ++retries);
      }, 1000);
    }
  }
  updateZoomState = () => {
    const map = this.mapRef.current;
    if (map != null) {
      this.setState({
        curZoom: map.leafletElement.getZoom(),
      });
    }
  };

  async getHints(retries) {
    const response = await fetch(`/get_hints?huntId=${this.props.huntId}`);
    if (response.ok) {
      const json = await response.json();
      // load carousel
    } else {
      //retry loop, max timeouts? nahhh
      if (retries < 3) {
        setTimeout(() => {
          this.getHints(++retries);
        }, 1000);
      }
    }
  }

  componentDidMount() {
    this.loadMarkers(0);
    // todo - get hint timer here / websocket connect for hint updates
    this.getHints(0);
  }

  render() {
    const position = [this.state.lat, this.state.lng];
    const carouselHints = this.props.hintList.slice(
      0,
      this.state.numberOfHints
    );
    const carouselItems = carouselHints.map((hint, index) => (
      <Carousel.Item key={hint}>
        <span style={{ color: "blue" }}>Hint {index}:</span> {hint}
      </Carousel.Item>
    ));

    return (
      <Container>
        <h5 style={{ marginTop: 10, marginBottom: 20 }}>
          Find the location of the Afikoman!
        </h5>
        <h6>zoom level {this.state.curZoom}</h6>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              backgroundColor: "white",
              opacity: 0.5,
              height: 90,
              width: "100%",
              zIndex: 500,
            }}
          ></div>
          <Carousel
            style={{
              textAlign: "center",
              position: "absolute",
              backgroundColor: "white",
              borderRadius: "1rem",
              margin: "auto",
              top: "10px",
              left: "10px",
              height: "50px",
              width: "100%",
              opacity: 1,
              zIndex: 501,
            }}
          >
            {carouselItems}
          </Carousel>
          <Map
            style={{ height: 450 }}
            ref={this.mapRef}
            center={position}
            zoom={this.state.zoom}
            onzoomend={() => this.updateZoomState()}
            zoomControl={false}
          >
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            />
            {this.state.markersLoaded &&
              this.state.curZoom >= this.minZoom &&
              this.markerLayer}
            <ZoomControl position="topleft" />
          </Map>
        </div>
      </Container>
    );
  }
}
