import firebase from 'firebase';

// Initialize Firebase
var config = {
    apiKey: "AIzaSyB5A1OgPSZ_TWgzpz3MxGM4UXafO8LwaQE",
    authDomain: "challenge-50e4d.firebaseapp.com",
    databaseURL: "https://challenge-50e4d.firebaseio.com",
    projectId: "challenge-50e4d",
    storageBucket: "challenge-50e4d.appspot.com",
    messagingSenderId: "782313754016"
};
firebase.initializeApp(config);

export default firebase
