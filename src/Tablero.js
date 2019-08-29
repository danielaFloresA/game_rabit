import React from 'react';
import './Tablero.css';
import firebase from 'firebase';

export default class Tablero extends React.Component{
    MAXNUMBER = 6;
    constructor(props){
        super(props);
        this.state = {
            number : 0,
            juego : {
                jugadores : [],
                turno :null,
                ganador : null
            }
        }
        this.updateState = this.updateState.bind(this);
    }
    componentWillMount () {

        let This = this;
        // cambios en los datos de los jugadores
        let docJugadores = firebase.firestore().collection('jugadores')
        let observerJugadores = docJugadores.onSnapshot(docSnapshot => {
            console.log("jugadores",docSnapshot.docs);
            let juego = this.state.juego;
            let aleatorio = this.state.number;
            juego.jugadores = [];
            docSnapshot.docs.forEach(function(doc){
                juego.jugadores.push(doc.data())
            });
            /*let turno = docSnapshot.data();
            let juego = this.state.juego;
            juego.turno = turno.email;
            let aleatorio = this.state.number; */
            this.setState({juego:juego, number:aleatorio })
        }, err => {
            console.log("Encountered error:", err);
        });
        // recuperar valor aleatorio
        let docAleatorio = firebase.firestore().collection('juego').doc('numero_aleatorio');
        let observerAleatorio = docAleatorio.onSnapshot(docSnapshot => {
            console.log("numero randomico",docSnapshot.data());
            let valor_aleatorio = docSnapshot.data();
            let juego = this.state.juego;
            let aleatorio = valor_aleatorio.valor;
            this.setState({juego:juego, number:aleatorio })

        }, err => {
            console.log("Encountered error:", err);
        });
        // recuperar turno 
        let docTurno = firebase.firestore().collection('juego').doc('turno');
        let observerTurno = docTurno.onSnapshot(docSnapshot => {
            console.log("turno",docSnapshot.data());
            let turno = docSnapshot.data();
            let juego = this.state.juego;
            juego.turno = turno.email;
            let aleatorio = this.state.number;
            this.setState({juego:juego, number:aleatorio })
        }, err => {
            console.log("Encountered error:", err);
        });
        let docGanador = firebase.firestore().collection('juego').doc('ganador');
        let observerGanador = docGanador.onSnapshot(docSnapshot => {
            console.log("ganador >>>",docSnapshot.data());
            let ganador = docSnapshot.data();
            let juego = this.state.juego;
            juego.ganador = ganador.email;
            let aleatorio = this.state.number;
            this.setState({juego:juego, number:aleatorio })
        }, err => {
            console.log("Encountered error:", err);
        });
        
    }
    getRandom(){
       let number = 1+(Math.floor(Math.random()*this.MAXNUMBER));
       return number;
    }

    siguienteTurno(juego){
        // email obtener el id 
        let res= null;
        juego.jugadores.forEach(jugador => {
            if(jugador.email == juego.turno) {
                let idJugador = (jugador.id + 1 ) % juego.jugadores.length;
                console.log(idJugador)
                juego.jugadores.forEach(jug => {
                    if(jug.id == idJugador) {
                        res = jug ;
                    }
                });
            }
        });
        
        return res;
/*        let jugador = jugadores.pop(); 
        let idJugador = (jugador.id + 1 ) % juego.jugadores.length;
        console.log("idJugador >>>", idJugador);
        let jugadorFiltrado = juego.jugadores.filter((jugador) => {
            if(jugador.id==idJugador){
                return true;
            }else return false;
        })
        console.log("")
        return jugadorFiltrado[0]; */
    }
    updateState(){
        if(this.props.usuario.email != this.state.juego.turno) {
            alert('No es tu turno'); // @TODO Toast
            return;
        }

        if(this.state.juego.ganador){ // reiniciar juego
            let juego = this.state.juego;
            // reiniciar valor actual a 1 
            const reference = firebase.firestore().collection("jugadores").get().then(datos => {
                datos.forEach(dato => {
                    let jugador = dato.data();
                    firebase.firestore().collection("jugadores").doc(jugador.email).update({
                        'valorActual' : 1
                    });                    
                })
                firebase.firestore().collection("juego").doc("ganador").update({
                    'email' : ""
                });
                firebase.firestore().collection("juego").doc("numero_aleatorio").update({
                    'valor' : 0
                });
            }).catch(error => {
                console.log(error)
            });
            return;
        }
        let lanzarNumero = this.getRandom();
        let juego = this.state.juego;
        
        // actualizar valor actual
        const reference = firebase.firestore().collection("jugadores").doc(this.state.juego.turno);
        reference.firestore.runTransaction(async transaction => {
            const doc = await transaction.get(reference);
            if (!doc.exists) { console.error("Documento no existe"); }
            const valorActual = doc.data().valorActual +lanzarNumero;
            transaction.update(reference, { valorActual: valorActual });

            // establecer ganador del juego
            if(valorActual >= 30) {
                juego.ganador = juego.turno;
                const referenceGanador = firebase.firestore().collection("juego").doc("ganador");
                referenceGanador.update({
                    'email' : juego.turno
                });
            }
            juego.turno= this.siguienteTurno(juego).email;
            const referenceTurnoSiguiente = firebase.firestore().collection("juego").doc("turno");
            referenceTurnoSiguiente.update({
                'email' : juego.turno
            });
            const referenceAleatorio = firebase.firestore().collection("juego").doc("numero_aleatorio");
            referenceAleatorio.update({
                'valor' : lanzarNumero
            });
            this.setState({number: lanzarNumero,juego:juego});
        }).catch(error => console.error(error));
        return;
    }
    generarNumeros(val) {
       let i = 0;
        let res = [];
        while(i < val) {
            res.push(i+1);
            i++;
        }
        return res;
    }
    mostrarTablero(){
        const elementos = this.generarNumeros(30);
        return(
            <div className="contenedor-tabla">
                <table className="table" >
                <thead>
                <tr>
                    <th >Jugador</th>
                    {elementos.map((value) => {
                        return <th  >{value}</th>
                    })}
                </tr>
                </thead>
                <tbody>
                {this.state.juego.jugadores.map((jugador) => {
                    return (<tr>
                        <td>{jugador.nombre}</td>
                        {elementos.map((value) => {
                            return <td className={value == jugador.valorActual ? "cuadro-activo" : ""} ></td>
                        })}
                    </tr>
                    )                    
                })}
                </tbody>
            </table>
            </div>
        );
    }

    render(){
        return(
            <div className='contenedor-juego'>
                <div className="text-center">turno de jugador: <strong>{this.state.juego.turno}</strong></div>
                <button className="btn-jugar btn btn-info" onClick={this.updateState}>{this.state.juego.ganador ? 'REINICIAR' : 'JUGAR'  }</button>
                <h3 className="felicidades">{this.state.juego.ganador ?  ('Felicidades ganaste el juego ' + this.state.juego.ganador) : '' }</h3>
                <h1 className="numero">{this.state.number}</h1>
                 {this.mostrarTablero()} 
            </div>
        );
    }
}
