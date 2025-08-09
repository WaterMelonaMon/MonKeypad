import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home(){
  const nav = useNavigate();
  return (
    <div className="page home">
      <header className="nav">
        <img src="/monad-logo.svg" alt="Monad" className="logo"/>
        <h1>MonKeypad <small>Beta</small></h1>
      </header>

      <section className="hero">
        <h2>Type like a degenerate — ship like a pro.</h2>
        <p className="lead">MonKeypad trains Web3 people to type faster, reduce mistakes, and gain a measurable skill for on-chain work. This is the Beta version — features are experimental.</p>
        <div className="cta">
          <button className="btn" onClick={()=>nav('/game')}>Start Training</button>
        </div>
        <div className="features">
          <div className="card">
            <h3>Practice Mode</h3>
            <p>Unlimited practice sentences. No wallet required.</p>
          </div>
          <div className="card">
            <h3>Test Mode</h3>
            <p>Timed tests (15/30/60s) that produce WPM and accuracy reports.</p>
          </div>
          <div className="card">
            <h3>Certificates</h3>
            <p>Pass criteria will generate a downloadable certificate you can attach to your CV.</p>
          </div>
        </div>
        <div className="notes">
          <strong>Note:</strong> Wallet connect is optional in Beta. No real transactions are required.
        </div>
      </section>

      <footer className="footer">MonKeypad — Monad Testnet (Beta)</footer>
    </div>
  )
}
