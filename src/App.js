import React, { Component } from "react";
import firebase from "./Firebase.js";

// Set up Google Authentication
const provider = new firebase.auth.GoogleAuthProvider();
// Always prompt user to select account when logging in
provider.setCustomParameters({
  prompt: "select_account"
});
const auth = firebase.auth();
const database = firebase.database();
const timeZoneApiKey = process.env.TIME_ZONE_API_KEY;
const geocodingApiKey = process.env.GEOCODING_API_KEY;

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      city: "",
      country: ""
    };
  }

  login = () => {
    auth
      .signInWithPopup(provider)
      .then(result => {
        const user = result.user;
        this.setState({
          user
        });
      })
      .then(this.createNewUser);
    // If it is the user's first time logging in create user profile in database
  };

  logout = () => {
    auth.signOut().then(() => {
      this.setState({
        user: null
      });
    });
  };

  createNewUser = () => {
    database.ref("users/" + this.state.user.uid).set({
      name: this.state.user.displayName,
      email: this.state.user.email,
      savedLocations: []
    });
  };

  handleCityChange = event => {
    this.setState({
      city: event.target.value
    });
  };

  handleCountryChange = event => {
    this.setState({
      country: event.target.value
    });
  };

  getCoordinatesByCity = async () => {
    const url = new URL("https://api.opencagedata.com/geocode/v1/json"),
      params = {
        key: geocodingApiKey,
        q: `${this.state.city}+${this.state.country}`
      };

    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    const res = await fetch(url);
    return await res.json();
  };

  getTimeZoneByCoordinates = async coordinates => {
    const url = new URL("http://api.timezonedb.com/v2.1/get-time-zone"),
      params = {
        key: timeZoneApiKey,
        format: "json",
        by: "position",
        lat: coordinates.lat,
        lng: coordinates.lng
      };

    Object.keys(params).forEach(key =>
      url.searchParams.append(key, params[key])
    );
    const res = await fetch(url).then(response => response.json());
    return res;
  };

  convertTimeZoneToLocalTime = async foreignTimeZone => {
    const url = new URL("http://api.timezonedb.com/v2.1/convert-time-zone"),
      params = {
        key: timeZoneApiKey,
        format: "json",
        from: "",
        to: foreignTimeZone
      };

    Object.keys(params).forEach(key =>
      url.searchParams.append(key, params[key])
    );
    const res = await fetch(url).then(response => response.json());
    return res;
  };

  handleSearchSubmit = e => {
    e.preventDefault();
    this.getCoordinatesByCity()
      .then(res => {
        res = res.results;
        return res[0].geometry;
      })
      .then(res => {
        return this.getTimeZoneByCoordinates(res);
      })
      .then(res => {
        console.log(res.abbreviation);
        return res.abbreviation;
      });
  };

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      if (user) {
        this.setState({ user });
      }
    });
  }

  render() {
    return (
      <div className="App">
        {this.state.user ? (
          <button onClick={this.logout}>Log Out</button>
        ) : (
          <button onClick={this.login}>Log In</button>
        )}
        <form onSubmit={this.handleSearchSubmit}>
          <input
            type="text"
            id="cityInput"
            placeholder="City"
            name="cityInput"
            value={this.state.city}
            onChange={this.handleCityChange}
          />
          <select
            name="countryInput"
            id="countryInput"
            onChange={this.handleCountryChange}
          >
            <option value="Canada">Canada</option>
            <option value="USA">USA</option>
          </select>
          <input type="submit" />
        </form>
      </div>
    );
  }
}

export default App;
