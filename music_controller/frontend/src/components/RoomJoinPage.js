import React, { Component } from "react";
import { TextField, Button, Grid, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";

// Creating the component for the Join Room page using React
export default class RoomJoinPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomCode: "",
            error: ""
        };
        this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
        this.roomButtonPressed = this.roomButtonPressed.bind(this);
    }

    // Handle any changes to the input-code text field
    handleTextFieldChange(e) {
        this.setState({
            roomCode: e.target.value
        });
    }

    // Handles when the join room button is pressed
    roomButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: this.state.roomCode,
            }),
        };
        // Send the request above (containing the users room code) to the backend
        // If response states input room code is valid, then users successfully joined the room, 
        // and can be redirected to the room page.
        // Else, state the room could not be found
        fetch("/api/join-room", requestOptions)
            .then((response) => {
                if (response.ok) {
                    this.props.history.push(`/room/${this.state.roomCode}`);
                } else {
                    this.setState({ error: "Room not found." });}
            }).catch((error) => {console.log(error);});
    }

    render() {
        return (
          <Grid container spacing={1}>
            <Grid item xs={12} align="center">
              <Typography component="h4" variant="h4">
                Join a Room
              </Typography>
            </Grid>
            <Grid item xs={12} align="center">
              <TextField
                error={this.state.error}
                label="Code"
                placeholder="Enter a Room Code"
                value={this.state.roomCode}
                helperText={this.state.error}
                variant="outlined"
                onChange={this.handleTextFieldChange}
              />
            </Grid>
            <Grid item xs={12} align="center">
              <Button
                variant="contained"
                color="primary"
                onClick={this.roomButtonPressed}
              >
                Enter Room
              </Button>
            </Grid>
            <Grid item xs={12} align="center">
              <Button
                variant="contained"
                color="secondary"
                to="/"
                component={Link}
              >
                Back
              </Button>
            </Grid>
          </Grid>
        );
    }

}