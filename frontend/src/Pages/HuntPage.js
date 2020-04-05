import React from "react";
import Container from "react-bootstrap/Container";
import Carousel from "react-bootstrap/Carousel";
import { Map, TileLayer, ZoomControl } from "react-leaflet";

export default class HuntPage extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();

    this.state = {
      markersLoaded: false,
      showMarkers: false,
      curZoom: 1,
      isBusy: false,
    };
  }
  markerLayer = [];
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
          <div style={{ height: "auto", textAlign: "center" }}>
            <span style={{ color: "blue" }}>Hint {index + 1}:</span>{" "}
            <span style={{ fontWeight: "normal" }}>{hint}</span>
          </div>
        </div>
      </Carousel.Item>
    ));

    return (
      <Container>
        <h5 style={{ marginTop: 10, marginBottom: 20 }}>
          Find the location of the Afikoman!
        </h5>
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
                  wrap={false}
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
                    width: "80%",
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
            {this.state.curZoom >= this.minZoom
              ? "Wow, it's toasty here. Maybe there's something baking nearby..."
              : "It's hard to see anything from up here, let's look closer!"}
          </div>
        </div>
      </Container>
    );
  }
}
