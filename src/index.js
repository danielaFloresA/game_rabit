import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const firebaseConfig = {
    apiKey: "AIzaSyCbHNsQri5XOppXiVI5ExeK5lZq-wL5fBE",
   authDomain: "fir-daniela.firebaseapp.com",
   databaseURL: "https://fir-daniela.firebaseio.com",
   projectId: "fir-daniela",
   storageBucket: "fir-daniela.appspot.com",
   messagingSenderId: "145589979960",
   appId: "1:145589979960:web:f1287e8031396db2"
 };
 firebase.initializeApp(firebaseConfig)
 

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
