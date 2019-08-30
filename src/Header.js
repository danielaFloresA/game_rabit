import React from 'react'
import './Header.css';

function Header ({ appName, user, onAuth, onLogout }) {
  function renderUserData () {
    return (
      <ul className='navbar-nav'>
        <li className='nav-item'>
          <img
            width='32'
            className='avatar circle responsive-img'
            src={user.photoURL}
          />
        </li>
        <li className='nav-item'><p className='btn btn-default'>{user.displayName} (<strong>{user.email}</strong>)</p></li>
        <li className='nav-item'>
          <button
            className='btn btn-primary'
            onClick={onLogout}
          >
            Cerrar sesión
          </button>
        </li>
      </ul>
    )
  }

  function renderLoginButton () {
    return (
      <ul className='navbar-nav'>
        <li className='nav-item'>
          <button
            className='btn btn-primary'
            onClick={onAuth}
          >
            Iniciar sesión
          </button>
        </li>
      </ul>
    )
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light stilo-menu" >
      <a className="navbar-brand" href="#"><h3 className="titulo-juego font-italic font-weight-bold">Juego de la Liebre</h3></a>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarText">
        {user ? renderUserData() : renderLoginButton()}     
      </div>
    </nav>
  )
}

export default Header
