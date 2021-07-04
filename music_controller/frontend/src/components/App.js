import React, { Component } from "react";
import { render } from "react-dom";
import HomePage from "./HomePage";

// Our react entry component called App will be rendered
// into the <div id='app> tags of index.html

// Render the HomePage component onto index.html
// This HomePage component will have a switch to allow different pages (components) to be overlayed.
export default class App extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="center">
                <HomePage />
            </div>
        );
    }
}

// Then render the App component into the app div of index.html
const appDiv = document.getElementById("app");
render(<App />, appDiv);   