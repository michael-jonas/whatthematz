import React from "react";
import Container from "react-bootstrap/Container";
import { Map, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";

export default class HuntPage extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.state = {
      name: props.name,
      sederName: props.sederName,
      markersLoaded: false,
      showMarkers: false,
      lat: 0,
      lng: 0,
      zoom: 1,
    };
  }
  markerLayer = [];
  minZoom = 12;

  async loadMarkers(retries) {
    // fetch list of cities
    const response = await fetch(`get_list_of_cities`);
    if (true) {
      //response.ok) {
      //const json = await response.json();

      let json = [["Toronto", 43.6532, -79.3832]];
      this.markerLayer = json.map((marker) => {
        let latlng = { lat: marker[1], lng: marker[2] };
        return (
          <Marker key={marker[0]} position={latlng}>
            <Tooltip>{marker[0]}</Tooltip>
          </Marker>
        );
      });

      this.setState({
        markersLoaded: true,
      });
    } else {
      //retry loop, max timeouts? nahhh
      if (retries < 3) {
        setTimeout(this.loadMarkers(retries++), 1000);
      }
    }
  }

  checkShowMarkers = () => {
    const map = this.mapRef.current;
    if (map != null) {
      const zoom = map.leafletElement.getZoom();

      if (this.state.showMarkers === false && zoom > this.minZoom) {
        this.setState({
          showMarkers: true,
        });
      } else if (this.state.showMarkers === true && zoom <= this.minZoom) {
        this.setState({
          showMarkers: false,
        });
      }
    }
  };

  componentDidMount() {
    this.loadMarkers(0);
  }

  render() {
    const position = [this.state.lat, this.state.lng];
    return (
      <Container>
        <h5 style={{ marginTop: 10, marginBottom: 20 }}>
          Find the location of the Afikoman!
        </h5>
        <Map
          ref={this.mapRef}
          center={position}
          zoom={this.state.zoom}
          onzoomend={() => this.checkShowMarkers()}
        >
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          />
          {this.state.markersLoaded &&
            this.state.showMarkers &&
            this.markerLayer}
        </Map>
      </Container>
    );
  }
}
