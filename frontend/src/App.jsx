import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Signup } from './components/Signup'
import {Home} from './components/Home'
const App = () => {
  return (
    <div>
        <Router>
          <Routes>
            <Route path="/Signup" element={<Signup/>} />
            <Route path="/" element={<Home/>} />
          </Routes>
        </Router>

    </div>  
  );
};

export default App;