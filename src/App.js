import React from 'react';
import './App.css';
import Tablero from './Tablero';
import Header from './Header';
import firebase from 'firebase';



export class App extends React.Component{
    email = '';
    constructor () {
        super()
        this.handleAuth = this.handleAuth.bind(this)
        this.handleLogout = this.handleLogout.bind(this)
    }
    state = {
        user: null,
        userAux: null
    }
    
    componentWillMount () {
        firebase.auth().onAuthStateChanged(user => {
            this.setState({ user : user})
        })
    }

    // login
    handleAuth () {
    const provider = new firebase.auth.FacebookAuthProvider()
    
    firebase.auth().signInWithPopup(provider)
        .then(result => {
            const dbRef = firebase.firestore();
            const collectionRef = dbRef.collection('jugadores')
            const docRef = collectionRef.doc(result.user.email);
            docRef.update({
                estado : true
            });
            
            console.log(`${result.user.email} ha iniciado sesión`)
        }).catch(error => console.log(`Error ${error.code}: ${error.message}`))
    }
    
    handleLogout () {
        let This = this;
        firebase.auth().signOut()
        .then(result => {
            const dbRef = firebase.firestore();
            const collectionRef = dbRef.collection('jugadores')
            const docRef = collectionRef.doc(This.state.user.email);
            docRef.update({
                estado : false
            });
            console.log('Te has desconectado correctamente')
        }).catch(error => console.log(`Error ${error.code}: ${error.message}`))
    }    

    render(){
        return(
            <div className="app">
                <Header
                    appName= 'El juego de la liebre'
                    user={this.state.user}
                    onAuth={this.handleAuth}
                    onLogout={this.handleLogout}
                    />
                <Tablero
                    usuario={this.state.user} 
                     />
            </div>
        );
    }
}  
export default App;
