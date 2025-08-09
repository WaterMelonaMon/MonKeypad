import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ethers } from 'ethers'

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
  "We are building futures with tiny blocks of proof.",
  "Ship fast, fix faster, and log your changes.",
  "When in doubt, instrument more and guess less.",
  "Latency is a mood killer — shave it where you can.",
  "Every pixel deserves intentionality and a purpose.",
  "A perfect run gets confetti and a small digital trophy.",
  "Type like you mean it and the numbers will follow.",
  "The hardest bugs are the ones you don't know exist.",
  "Practice beats perfection."
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
  const [sentence, setSentence] = useState('')
  const [typed, setTyped] = useState('')
  const [errors, setErrors] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [acc, setAcc] = useState(100)
  const [running, setRunning] = useState(false)
  const [mode, setMode] = useState('practice') // practice or test
  const [duration, setDuration] = useState(30)
  const [difficulty, setDifficulty] = useState('normal')
  const [timeLeft, setTimeLeft] = useState(0)
  const [result, setResult] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const inputRef = useRef(null)
  const timerRef = useRef(null)
  const startTsRef = useRef(0)

  useEffect(()=>{ loadNew(); loadLB(); }, [difficulty])

  function loadLB(){
    const lb = JSON.parse(localStorage.getItem('monkeypad_lb')||'[]')
    setLeaderboard(lb.slice(0,20))
  }

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
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const a = await signer.getAddress()
      setAddr(a); setConnected(true)
      // save profile locally
      const p = JSON.parse(localStorage.getItem('monkeypad_profile')||'{}')
      p.addr = a; localStorage.setItem('monkeypad_profile', JSON.stringify(p))
    }catch(e){ console.error(e); alert('Connection failed or rejected') }
  }

  function startPractice(){
    setMode('practice')
    setRunning(true)
    startTsRef.current = performance.now()
    inputRef.current.focus()
  }

  function startTest(){
    setMode('test')
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
    // update live stats
    const elapsed = Math.max(1, (performance.now() - startTsRef.current)/1000)
    setWpm(computeWPM(v.length, elapsed))
    setAcc(Math.max(0, Math.round(100*(1 - errs/Math.max(1, sentence.length)))))
  }

  function finishGame(){
    setRunning(false)
    clearInterval(timerRef.current)
    const elapsed = Math.max(1, Math.round((performance.now() - startTsRef.current)/1000))
    const finalWpm = computeWPM(typed.length, elapsed)
    const finalAcc = Math.max(0, Math.round(100*(1 - errors/Math.max(1, sentence.length))))
    const res = { wpm: finalWpm, acc: finalAcc, errors, time: elapsed, text: sentence, date: Date.now() }
    setResult(res)
    // persist to leaderboard locally
    const lb = JSON.parse(localStorage.getItem('monkeypad_lb')||'[]')
    lb.push(res)
    lb.sort((a,b)=> b.wpm - a.wpm)
    localStorage.setItem('monkeypad_lb', JSON.stringify(lb.slice(0,100)))
    loadLB()
    // update XP and streak
    const profile = JSON.parse(localStorage.getItem('monkeypad_profile')||'{}')
    profile.xp = (profile.xp||0) + Math.max(1, finalWpm)
    const last = profile.lastPlayed || 0
    const oneDay = 24*60*60*1000
    const now = Date.now()
    if(last && (now - last) < (2*oneDay)) profile.streak = (profile.streak||0) + 1
    else profile.streak = 1
    profile.lastPlayed = now
    localStorage.setItem('monkeypad_profile', JSON.stringify(profile))
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

  function downloadCertificate(){
    if(!result) return alert('You need to finish a test first.')
    const html = `
      <html><head><title>MonKeypad Certificate</title></head><body style="font-family:Arial;text-align:center;padding:40px;">
      <h1>MonKeypad Certificate (Beta)</h1>
      <p>Presented to <strong>${addr || 'Anonymous'}</strong></p>
      <p>WPM: <strong>${result.wpm}</strong> | Accuracy: <strong>${result.acc}%</strong></p>
      <p>Time: <strong>${result.time}s</strong></p>
      <p style="margin-top:40px">This certifies that the holder completed MonKeypad Beta.</p>
      <p style="margin-top:30px;font-size:12px;color:#666">MonKeypad — Monad Testnet (Beta)</p>
      </body></html>`
    const w = window.open('','_blank')
    w.document.write(html)
    w.document.close()
  }

  return (
    <div className="page game">
      <nav className="nav">
        <Link to="/"><img src="/monad-logo.svg" className="logo" alt="Monad"/></Link>
        <div className="title">MonKeypad <small>Beta</small></div>
        <div style={{marginLeft:'auto'}}>
          <Link to="/profile" className="btnGhost">Profile</Link>
          {connected ? <span className="addr">{addr.slice(0,6)}...{addr.slice(-4)}</span> : <button className="btn" onClick={connectWallet}>Connect Wallet</button>}
        </div>
      </nav>

      <section className="game-area">
        <div className="controls">
          <label>Mode:
            <select value={mode} onChange={e=>setMode(e.target.value)}>
              <option value="practice">Practice</option>
              <option value="test">Test</option>
            </select>
          </label>
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
          {mode === 'practice' ? <button className="btn" onClick={startPractice}>Start Practice</button> : <button className="btn" onClick={startTest}>Start Test</button>}
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

        <div className="leaderboard">
          <h4>Local Leaderboard</h4>
          {leaderboard.length === 0 && <div className="small">No scores yet.</div>}
          <ol>
            {leaderboard.map((it, idx)=>(<li key={idx}>{it.wpm} WPM — {new Date(it.date).toLocaleString()}</li>))}
          </ol>
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
              <button className="btnGhost" onClick={downloadCertificate}>Download Certificate</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
