import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ethers } from 'ethers'

const RPC = "https://testnet-rpc.monad.xyz"
const CHAIN_ID = 10143
const TREASURY = "0x35AdF28b23e63C316896CC8F5E3FFCD3B2A4000D"
const AMOUNT = "0.1"

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog.",
  "Monad moves fast — faster than yesterday's promises.",
  "Typing well is the first step to shipping code.",
  "Always test your assumptions before you launch.",
  "We traded hours for algorithms and called it progress.",
  "The sky looked purple the night we minted the token.",
  "Small ships carry big ambitions across empty seas.",
  "Speed without precision is just chaos wearing sneakers.",
  "Write code like your future self will read it.",
  "A good commit message saves relationships and time.",
  "The network hummed like a city, tuned and ready.",
  "If it's decentralized, you can't blame a single human.",
  "Buy the dip; learn the tech; don't confuse luck with skill.",
  "Type like you mean it and the numbers will follow."
]

function pickSentence(diff){
  if(diff === 'easy') {
    const pool = SENTENCES.filter(s=>s.length<60)
    return pool[Math.floor(Math.random()*pool.length)]
  }
  if(diff === 'hard') {
    const pool = SENTENCES.filter(s=>s.length>60)
    return pool[Math.floor(Math.random()*pool.length)]
  }
  return SENTENCES[Math.floor(Math.random()*SENTENCES.length)]
}

export default function Game(){
  const [connected, setConnected] = useState(false)
  const [addr, setAddr] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [sentence, setSentence] = useState('')
  const [typed, setTyped] = useState('')
  const [errors, setErrors] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [acc, setAcc] = useState(100)
  const [running, setRunning] = useState(false)
  const [duration, setDuration] = useState(30)
  const [difficulty, setDifficulty] = useState('normal')
  const [timeLeft, setTimeLeft] = useState(0)
  const [result, setResult] = useState(null)
  const inputRef = useRef(null)
  const timerRef = useRef(null)
  const startTsRef = useRef(0)

  useEffect(()=>{ loadNew(); }, [difficulty])

  function loadNew(){
    setSentence(pickSentence(difficulty))
    setTyped('')
    setErrors(0)
    setWpm(0)
    setAcc(100)
    setResult(null)
    setRunning(false)
    setTimeLeft(duration)
    clearInterval(timerRef.current)
  }

  async function connectWallet(){
    if(!window.ethereum) return alert('Install MetaMask/Rabby/OKX/Coinbase');
    try{
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const p = new ethers.BrowserProvider(window.ethereum)
      const s = await p.getSigner()
      const a = await s.getAddress()
      setProvider(p); setSigner(s); setAddr(a); setConnected(true)
      // try switch to Monad
      const hex = '0x' + CHAIN_ID.toString(16)
      try{ await window.ethereum.request({ method:'wallet_switchEthereumChain', params:[{ chainId: hex }] }) }
      catch(e){
        try{
          await window.ethereum.request({ method:'wallet_addEthereumChain', params:[{ chainId: hex, chainName:'Monad Testnet', rpcUrls:[RPC], nativeCurrency:{ name:'MON', symbol:'MON', decimals:18 }, blockExplorerUrls:['https://testnet.monadexplorer.com'] }] })
          await window.ethereum.request({ method:'wallet_switchEthereumChain', params:[{ chainId: hex }] })
        }catch(err){ console.error('add chain failed', err); }
      }
    }catch(e){ console.error(e); alert('Connection failed or rejected') }
  }

  async function payAndStart(){
    if(!signer){ alert('Connect wallet first'); return }
    try{
      const tx = await signer.sendTransaction({ to: TREASURY, value: ethers.parseEther(AMOUNT) })
      await tx.wait(1)
      // start game
      startGame()
    }catch(e){ console.error(e); alert('Payment failed or rejected') }
  }

  function startGame(){
    setRunning(true)
    setTimeLeft(duration)
    startTsRef.current = performance.now()
    inputRef.current.focus()
    timerRef.current = setInterval(()=>{
      setTimeLeft(t=>{
        if(t <= 1){ clearInterval(timerRef.current); finishGame(); return 0 }
        return t-1
      })
      const elapsed = (performance.now() - startTsRef.current)/1000
      setWpm(computeWPM(typed.length, elapsed))
      setAcc(Math.max(0, Math.round(100*(1 - errors/Math.max(1, sentence.length)))))
    }, 1000)
  }

  function computeWPM(chars, seconds){
    if(seconds <= 0) return 0
    return Math.round((chars/5) / (seconds/60))
  }

  function handleInput(e){
    const v = e.target.value
    setTyped(v)
    let errs = 0
    for(let i=0;i<sentence.length;i++){
      const expected = sentence[i] || ''
      const got = v[i] || ''
      if(got && got !== expected) errs++
    }
    if(v.length > sentence.length) errs += v.length - sentence.length
    setErrors(errs)
  }

  function finishGame(){
    setRunning(false)
    clearInterval(timerRef.current)
    const elapsed = Math.round((performance.now() - startTsRef.current)/1000)
    const finalWpm = computeWPM(typed.length, elapsed)
    const finalAcc = Math.max(0, Math.round(100*(1 - errors/Math.max(1, sentence.length))))
    setResult({ wpm: finalWpm, acc: finalAcc, errors, time: elapsed, text: sentence, typed })
  }

  function playAgain(){
    loadNew()
  }

  function shareResult(){
    if(!result) return
    const txt = `I scored ${result.wpm} WPM in MonKeypad in ${result.time}s! #Monad #MonKeypad`
    const url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(txt)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="page game">
      <nav className="nav">
        <Link to="/"><img src="/monad-logo.svg" className="logo" alt="Monad"/></Link>
        <div className="title">monKeypad <small>Beta</small></div>
        <div style={{marginLeft:'auto'}}>
          {connected ? <span className="addr">{addr.slice(0,6)}...{addr.slice(-4)}</span> : <button className="btn" onClick={connectWallet}>Connect Wallet</button>}
        </div>
      </nav>

      <section className="game-area">
        <div className="controls">
          <label>Duration:
            <select value={duration} onChange={e=>setDuration(Number(e.target.value))}>
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
            </select>
          </label>
          <label>Difficulty:
            <select value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <button className="btn" onClick={payAndStart}>Start Test (0.1 MON)</button>
        </div>

        <div className="sentence-box">
          <div className="sentence">{sentence}</div>
          <textarea ref={inputRef} value={typed} onChange={handleInput} disabled={!running} placeholder="Type the sentence here..."></textarea>
        </div>

        <div className="stats">
          <div>WPM: <strong>{wpm}</strong></div>
          <div>Accuracy: <strong>{acc}%</strong></div>
          <div>Errors: <strong>{errors}</strong></div>
          <div>Time left: <strong>{timeLeft}s</strong></div>
        </div>

        {result && (
          <div className="result-card">
            <h3>Results</h3>
            <div>WPM: <strong>{result.wpm}</strong></div>
            <div>Accuracy: <strong>{result.acc}%</strong></div>
            <div>Time: <strong>{result.time}s</strong></div>
            <div style={{marginTop:10}}>
              <button className="btn" onClick={shareResult}>Share on X</button>
              <button className="btnGhost" onClick={playAgain}>Play Again</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}