import React from "react";
import Container from "react-bootstrap/Container";
import Carousel from "react-bootstrap/Carousel";
import { Map, TileLayer, ZoomControl } from "react-leaflet";
import "./HuntPage.css";
import mag from "../Images/mag.png";

export default class HuntPage extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.carouselRef = React.createRef();

    this.state = {
      showMarkers: false,
      curZoom: 1,
      isBusy: false,
    };
  }
  minZoom = 10;
  lat = 0;
  lng = 0;
  zoom = 1;

  updateZoomState = () => {
    const map = this.mapRef.current;
    if (map != null) {
      this.setState({
        curZoom: map.leafletElement.getZoom(),
      });
    }
  };

  changeCarouselButtonsActive() {}

  render() {
    const position = [this.lat, this.lng];
    const carouselHints = this.props.hintList.slice(
      0,
      this.props.numberOfHints
    );
    const carouselItems = carouselHints.map((hint, index) => (
      <Carousel.Item
        style={{
          height: 42,
          width: "80%",
          left: "10%",
          lineHeight: 1.2,
          textAlign: "center",
        }}
        key={hint}
      >
        <div
          style={{
            display: "flex",
            height: "100%",
            alignItems: "center",
            flexDirection: "row",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "12px", display: "flex", alignItems: "center" }}
          >
            <img
              src={mag}
              alt={"magnifying glass"}
              style={{
                height: "33px",
                width: "33px",
                marginTop: "-2px",
                marginRight: "2px",
              }}
            />
            <div style={{ textAlign: "left" }}>
              <span style={{ color: "#0066FF" }}>Hint {index + 1}:</span>{" "}
              <span style={{ fontWeight: "normal" }}>{hint}</span>
            </div>
          </div>
        </div>
      </Carousel.Item>
    ));

    return (
      <Container>
        <div
          style={{
            marginTop: 10,
            marginBottom: 20,
            fontWeight: "600",
            fontFamily: "Source Sans Pro",
            fontSize: "16px",
          }}
        >
          Find the location of the Afikoman!
        </div>
        <h6>Click on a marker to check if the Afikoman is there!</h6>
        {/* <h6>zoom level {this.state.curZoom}</h6> */}
        <div style={{ position: "relative", textAlign: "center" }}>
          {this.props.hintList.length > 0 && (
            <>
              <div
                style={{
                  position: "absolute",
                  backgroundColor: "white",
                  opacity: 0.5,
                  height: 90,
                  width: "100%",
                  zIndex: 500,
                }}
              />
              <div style={{ margin: "auto" }}>
                <Carousel
                  defaultActiveIndex={this.props.numberOfHints - 1}
                  interval={null}
                  ref={this.carouselRef}
                  onSelect={() => this.changeCarouselButtonsActive()}
                  wrap={TextTrackCueList}
                  style={{
                    padding: 10,
                    position: "absolute",
                    backgroundColor: "white",
                    borderRadius: "1rem",
                    margin: "auto",
                    top: "10px",
                    left: 0,
                    right: 0,
                    minHeight: "auto",
                    width: "90%",
                    opacity: 1,
                    zIndex: 501,
                  }}
                >
                  {carouselItems}
                </Carousel>
              </div>
            </>
          )}
          <Map
            style={{ height: 550 }}
            ref={this.mapRef}
            center={position}
            zoom={this.zoom}
            onzoomend={() => this.updateZoomState()}
            zoomControl={false}
          >
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            />
            {this.state.curZoom >= this.minZoom && this.props.markerLayer}
            <ZoomControl position="topleft" />
          </Map>
          <div
            style={{
              padding: 10,
              position: "absolute",
              backgroundColor: "white",
              borderRadius: "1rem",
              margin: "auto",
              top: "430px",
              left: 0,
              right: 0,
              height: "auto",
              width: "60%",
              opacity: 1,
              zIndex: 501,
              fontWeight: "normal",
              fontSize: "12px",
              boxShadow: "0px 1px 7px rgba(0, 0, 0, 0.13)",
              minWidth: "190px",
            }}
          >
            <div
              style={{
                fontFamily: "Muli",
                fontWeight: "normal",
                fontSize: "12px",
                lineHeight: "15px",
              }}
            >
              {this.state.curZoom >= this.minZoom
                ? "That's better, we should be able to see the markers from here!"
                : "It's hard to see anything from up here, let's look closer!"}
            </div>
          </div>
        </div>
      </Container>
    );
  }
}
