import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home(){
  const nav = useNavigate();
  return (
    <div className="page home">
      <header className="nav">
        <img src="/monad-logo.svg" alt="Monad" className="logo"/>
        <h1>monKeypad <small>Beta</small></h1>
      </header>

      <section className="hero">
        <h2>Welcome to monKeypad — Beta</h2>
        <p className="lead">A Web3 typing-speed mini-game on Monad Testnet. This app is in beta — still under progress.</p>
        <div className="cta">
          <button className="btn" onClick={()=>nav('/game')}>Start Game</button>
        </div>
        <div className="features">
          <div className="card">
            <h3>Play</h3>
            <p>Choose difficulty and duration, pay 0.1 MON on Monad testnet, then type to score.</p>
          </div>
          <div className="card">
            <h3>Share</h3>
            <p>Share your result on X with one click. #Monad #MonKeypad</p>
          </div>
          <div className="card">
            <h3>Beta</h3>
            <p>This is an experiment. Expect improvements — report bugs to the team.</p>
          </div>
        </div>
      </section>

      <footer className="footer">monKeypad — Monad Testnet (Beta)</footer>
    </div>
  )
}