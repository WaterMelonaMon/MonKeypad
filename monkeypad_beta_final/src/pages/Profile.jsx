import React, {useEffect, useState} from 'react'

export default function Profile(){
  const [addr, setAddr] = useState(null)
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)

  useEffect(()=>{
    const s = JSON.parse(localStorage.getItem('monkeypad_profile')||'null')
    if(s){ setAddr(s.addr); setXp(s.xp||0); setStreak(s.streak||0) }
  },[])

  return (
    <div className="page profile">
      <header className="nav">
        <img src="/monad-logo.svg" alt="Monad" className="logo"/>
        <h1>MonKeypad <small>Beta</small></h1>
      </header>
      <section style={{padding:20}}>
        <h2>Your Profile</h2>
        <p>Connected wallet: <strong>{addr || 'Not connected'}</strong></p>
        <p>XP: <strong>{xp}</strong></p>
        <p>Streak: <strong>{streak} days</strong></p>
        <p>Local leaderboard and progress are stored in your browser during Beta.</p>
      </section>
    </div>
  )
}
