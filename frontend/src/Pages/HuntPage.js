import React from "react";
import Container from "react-bootstrap/Container";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";

export default class HuntPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      sederName: props.sederName,
      lat: 51.505,
      lng: -0.09,
      zoom: 0,
    };
  }

  render() {
    const position = [this.state.lat, this.state.lng];

    return (
      <Container>
        <Map center={position} zoom={this.state.zoom}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </Map>
      </Container>
    );
  }
}
