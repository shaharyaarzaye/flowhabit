import './App.css'
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Home } from './components/Home';
const App = () => {
  return (
    <div>
        <Router>
          <Routes>
            <Route path="/signup" element={<Signup/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/" element={<Home/>} />
          </Routes>
        </Router>

    </div>  
  );
};

export default App; 	