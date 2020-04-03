import React from "react";

export default class LobbyPage extends React.Component {
  render() {
    return (
      <>
        <div> Lobby </div>
        {this.props.sederCode}
        {this.props.name}
      </>
    );
  }
}
