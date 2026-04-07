import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TVDisplay from './TVDisplay';
import Admin from './Admin';
import PlayerPortal from './PlayerPortal';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Admin />} />
        <Route path="/tv" element={<TVDisplay />} />
        <Route path="/jogador" element={<PlayerPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
