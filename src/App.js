import React, { Component } from "react";
import firebase from "./Firebase.js";
import LogInPage from "./Components/LogInPage.js"
import SearchForm from "./Components/SearchForm.js"
import SearchResult from "./Components/SearchResult.js"

// Set up Google Authentication
const provider = new firebase.auth.GoogleAuthProvider();
// Always prompt user to select account when logging in
provider.setCustomParameters({
  prompt: "select_account"
});
const auth = firebase.auth();
const database = firebase.database();


class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      currentTimeZone: "",
    };
  }

  // AUTHENTICATION & USER CREATION

  logIn = () => {
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
    });
  };

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      if (user) {
        this.setState({ user });
      }
    });
  }

  // PASSING INFO TO STATE

  getCurrentTimeZone(timeZone) {
    this.setState({
      currentTimeZone: timeZone,
    })
  }

  render() {
    return (
      <div className="App">
        {!this.state.user && <LogInPage
          logIn={this.logIn}
        />}
        <SearchForm 
          getCurrentTimeZone={this.getCurrentTimeZone}
        />
        <SearchResult 
          timeZone={this.currentTimeZone}
        />
    
      </div>
    );
  }
}

export default App;
