import React, { Component } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";
import Room from "./room";
import { Grid, Button, ButtonGroup, Typography } from "@material-ui/core";


export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: null,
    };
    this.clearRoomCode = this.clearRoomCode.bind(this)
  }

  // componentDidMount (lifecycle method) is automatically run when page is fully rendered
  // Inside the method ask UserInRoom view in api for users current room code for the session 
  // If room code is found in UserInRoom, then send it back in response and store as roomCode.
  async componentDidMount() {
    fetch("/api/user-in-room")
      .then((response) => response.json())
      .then((data) => {this.setState({ roomCode: data.code });});
  }


  // The build code to Home page, assisted with material-UI
  renderHomePage() {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} align="center">
          <Typography variant="h3" component="h3">
            House Party
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <ButtonGroup disableElevation variant="contained" color="primary">
            <Button color="primary" to="/join" component={Link}>
              Join a Room
            </Button>
            <Button color="secondary" to="/create" component={Link}>
              Create a Room
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );
  }

  clearRoomCode() {
    this.setState({
      roomCode: null,
    });
  }

  // This switch allows us to control the components to be rendered depending on the path given
  // And so if the path is empty, check if user has a room code stored in session (roomCode)
  // If roomCode exists then redirect to Room page, otherwise continue to render home page.
  // If user leaves a room, then clear the room code stored in the session.
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" render={() => {
              return this.state.roomCode ? (<Redirect to={`/room/${this.state.roomCode}`}/>) : (this.renderHomePage())
          }}/>
          <Route path="/join" component={RoomJoinPage} />
          <Route path="/create" component={CreateRoomPage} />
          <Route path="/room/:roomCode" render={(props) => {
              return <Room {...props} leaveRoomCallback={this.clearRoomCode} />;
          }}/>
        </Switch>
      </Router>
    );
  }
}