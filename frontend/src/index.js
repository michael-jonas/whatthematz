import "bootstrap/dist/css/bootstrap.min.css";
import "react-app-polyfill/ie9";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import io from "socket.io-client";
import "./fonts/Montserrat-Regular.ttf";
import "./fonts/Muli-VariableFont_wght.ttf";
import "./fonts/SourceSansPro-Regular.ttf";
import "./fonts/Lato-Regular.ttf";
import { ToastProvider } from "react-toast-notifications";

//const apiUrl = "http://localhost:5000";
const apiUrl = "flattenthebread.com";
const socket = io(apiUrl);

ReactDOM.render(
  <React.StrictMode>
    <ToastProvider autoDismiss placement={"top-center"}>
      <App socket={socket} apiUrl={apiUrl} />
    </ToastProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
