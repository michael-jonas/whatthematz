import React from "react";

// dont fucking judge me okay
import a from "../Images/Avatars/0.svg";
import b from "../Images/Avatars/1.svg";
import c from "../Images/Avatars/2.svg";
import d from "../Images/Avatars/3.svg";
import e from "../Images/Avatars/4.svg";
import f from "../Images/Avatars/5.svg";
import g from "../Images/Avatars/6.svg";
import h from "../Images/Avatars/7.svg";
import i from "../Images/Avatars/8.svg";
import j from "../Images/Avatars/9.svg";

export default class Avatar extends React.Component {
  render() {
    let src;
    switch (this.props.avatarNum) {
      case 0:
        src = a;
        break;
      case 1:
        src = b;
        break;
      case 2:
        src = c;
        break;
      case 3:
        src = d;
        break;
      case 4:
        src = e;
        break;
      case 5:
        src = f;
        break;
      case 6:
        src = g;
        break;
      case 7:
        src = h;
        break;
      case 8:
        src = i;
        break;
      case 9:
        src = j;
        break;
      default:
        break;
    }

    return <img className="Avatar" src={src} alt="" />;
  }
}
