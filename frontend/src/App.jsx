import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TVDisplay from './TVDisplay';
<<<<<<< HEAD
import Admin from './admin/AdminRoot';
import PlayerPortal from './PlayerPortal';
=======
import Admin from './Admin';
>>>>>>> 978f13a (feat: atualiza logo do sistema para logo-go.png)
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Admin />} />
        <Route path="/tv" element={<TVDisplay />} />
<<<<<<< HEAD
        <Route path="/jogador" element={<PlayerPortal />} />
=======
>>>>>>> 978f13a (feat: atualiza logo do sistema para logo-go.png)
      </Routes>
    </BrowserRouter>
  );
}

export default App;
