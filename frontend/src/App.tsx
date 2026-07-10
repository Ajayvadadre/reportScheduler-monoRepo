import Login from './components/Login';
import { Routes, Route } from 'react-router';
import Dashboard from './components/Dashboard';

function App() {

  return (
    <Routes>
      <Route path='/' element={<Login />}></Route>
      <Route path='/dashboard' element={<Dashboard />}></Route>
    </Routes>

  );
}

export default App;
