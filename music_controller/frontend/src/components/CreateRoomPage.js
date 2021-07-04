import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { Link } from "react-router-dom";
import { Collapse } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

// Creating the component for the Create Room page using React
export default class CreateRoomPage extends Component {

    static defaultProps = {
        votesToSkip: 2,
        guestCanPause: true,
        update: false,
        roomCode: null,
        updateCallback: () => {},
    }

    constructor(props) {
        super(props);
        this.state = {
            guestCanPause: this.props.guestCanPause,
            votesToSkip: this.props.votesToSkip,
            errorMsg: "",
            successMsg: "",
        };
        // Need to bind our event handlers so they can referenced when rendering our component.
        this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
        this.handleVotesChange = this.handleVotesChange.bind(this);
        this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this);
        this.handleUpdateButtonPress = this.handleUpdateButtonPress.bind(this);
    }

    // Handles any changes to votes_to_skip text field
    handleVotesChange(e) {
        this.setState({
            votesToSkip: e.target.value,
        });
    }

    // Handles any changes to guests_can_pause radios
    handleGuestCanPauseChange(e) {
        this.setState({
            guestCanPause: e.target.value === 'true' ? true : false,
        });
    }

    // Handles when the create room button is pressed
    handleRoomButtonPressed() {
        const requestOptions = { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({
                votes_to_skip: this.state.votesToSkip, 
                guest_can_pause: this.state.guestCanPause,
            }),
        };
        // Send the request above (containing the information for the new/updated room) to the backend
        // Once a response is recieved from the backend, take the response data and send to room/CODE page.
        fetch("/api/create-room", requestOptions)
          .then((response) => response.json())
          .then((data) => this.props.history.push("/room/" + data.code));
    }

    handleUpdateButtonPress() {
        const requestOptions = { 
            method: "PATCH", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({
                votes_to_skip: this.state.votesToSkip, 
                guest_can_pause: this.state.guestCanPause,
                code: this.props.roomCode
            }),
        };
        fetch("/api/update-room", requestOptions)
          .then((response) => {
              if (response.ok) {
                    this.setState({
                      successMsg: "Room updated successfully!"
                    });
              } else {
                    this.setState({
                        errorMsg: "Error updating room..."
                    });
              }
              this.props.updateCallback();
          });
    }

    // Renders button components for the 'Create Room' page
    renderCreateButtons() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Button color="primary" variant="contained" onClick={this.handleRoomButtonPressed}>Create a Room</Button>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button color="secondary" variant="contained" to="/" component={Link}>Back</Button>
                </Grid>
            </Grid>     
        );
    }

    // Render button components for the 'Update Room' page instead
    // Note: Close button on 'Update Room' page was implemented room.js component instead
    renderUpdateButtons() {
        return (
            <Grid item xs={12} align="center">
                <Button color="primary" variant="contained" onClick={this.handleUpdateButtonPress}>Update Room</Button>
            </Grid>    
        );
    }


    // The build code to Create Room page, assisted with material-UI
    // If update prop is true, then component becomes Update Room instead and imported into settings component of Room.js
    render() {
        const title = this.props.update ? "Update Room" : "Create a Room";
        return(
            <Grid container spacing={1}>
                 <Grid item xs={12} align="center">
                 <Collapse in={this.state.errorMsg != "" || this.state.successMsg != ""}>
                    {this.state.successMsg != "" ? (
                    <Alert severity="success" onClose={() => {this.setState({ successMsg: "" });}}>{this.state.successMsg}</Alert>) : (
                    <Alert severity="error" onClose={() => {this.setState({ errorMsg: "" });}}>{this.state.errorMsg}</Alert>)}
                </Collapse>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography component='h4' variant='h4'>
                    {title}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <FormControl component="fieldset">
                    <FormHelperText>
                        <div align='center'>Guest Control of Playback State</div>
                    </FormHelperText>
                    <RadioGroup row defaultValue={this.props.guestCanPause.toString()} onChange={this.handleGuestCanPauseChange}>
                        <FormControlLabel value="true" control={<Radio color="primary"/>} label="Play/Pause" labelPlacement="bottom"/>
                        <FormControlLabel value="false" control={<Radio color="secondary"/>} label="No Control" labelPlacement="bottom"/>
                    </RadioGroup>
                </FormControl>
            </Grid>
            <Grid item xs={12} align="center">
                <FormControl>
                    <TextField required={true} type="number" onChange={this.handleVotesChange} defaultValue={this.state.votesToSkip} inputProps={{min: 1, style: { textAlign: "center"}}}/>
                    <FormHelperText>
                        <div align="center">Votes Required to Skip Song</div>
                    </FormHelperText>
                </FormControl>
            </Grid>
            {this.props.update ? this.renderUpdateButtons() : this.renderCreateButtons()}
        </Grid>
        ); 
    }
}