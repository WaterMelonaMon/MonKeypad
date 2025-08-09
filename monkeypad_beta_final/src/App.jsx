import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Game from './pages/Game'
import Profile from './pages/Profile'

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/game" element={<Game/>} />
      <Route path="/profile" element={<Profile/>} />
    </Routes>
  )
}
