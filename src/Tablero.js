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
            this.setState({juego:juego, number:aleatorio })
        }, err => {
            console.log("Encountered error:", err);
        });
        // recuperar valores del estado del juego 
        let documentoRef = firebase.firestore().collection('juego').doc('datos');
        let observer = documentoRef.onSnapshot(docSnapshot => {
            console.log("numero randomico",docSnapshot.data());
            let datos = docSnapshot.data();
            let juego = this.state.juego;
            // set
            juego.turno = datos.turno;
            juego.ganador = datos.ganador;
            let aleatorio = datos.numero_aleatorio;
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
        let jugadoresConectados = juego.jugadores.filter(jugador => jugador.estado == true);
        for(let i = 0; i < jugadoresConectados.length; i++){
            if(jugadoresConectados[i].email == juego.turno) {
                if(i + 1 >= jugadoresConectados.length) {
                    res = jugadoresConectados[0];
                } else {
                    res = jugadoresConectados[i+1];
                }
            }
        }
        return res;
    }
    updateState(){ 
        if(this.props.usuario == null){
            alert("Para jugar tiene que iniciar sesion");
            return
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
                firebase.firestore().collection("juego").doc("datos").update({
                    'numero_aleatorio':0,
                    'ganador': null
                });
                
            }).catch(error => {
                console.log(error)
            });
            return;
        }
        if(this.props.usuario.email != this.state.juego.turno) {
            alert('No es tu turno'); // @TODO Toast
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
                const referenceGanador = firebase.firestore().collection("juego").doc("datos");
                referenceGanador.update({
                    'ganador' : juego.turno
                });
            }
            juego.turno= this.siguienteTurno(juego).email;
            const referenceTurnoSiguiente = firebase.firestore().collection("juego").doc("datos");
            referenceTurnoSiguiente.update({
                'turno' : juego.turno
            });
            const referenceAleatorio = firebase.firestore().collection("juego").doc("datos");
            referenceAleatorio.update({
                'numero_aleatorio' : lanzarNumero
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
                        <td>{jugador.nombre} <span className={jugador.estado ? 'badge badge-success' : 'badge badge-danger'}>{jugador.estado ? 'conectado' : 'desconectado'}</span></td>
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
                <div className="text-center my-3">turno de jugador: <strong>{this.state.juego.turno}</strong></div>
                <button className="btn-jugar btn btn-info" onClick={this.updateState}>{this.state.juego.ganador ? 'REINICIAR' : 'JUGAR'  }</button>
                <h3 className="felicidades">{this.state.juego.ganador ?  ('Felicidades ganaste el juego ' + this.state.juego.ganador) : '' }</h3>
                <h1 className="numero">{this.state.number}</h1>
                 {this.mostrarTablero()} 
            </div>
        );
    }
}
