import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function Home() { return <h1>BePoli React è online ✅</h1> }
function Login() { return <p>Login placeholder</p> }

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App/>)
