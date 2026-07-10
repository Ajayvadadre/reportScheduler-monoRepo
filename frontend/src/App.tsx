import Login from './components/Login';
import { Routes, Route, Navigate } from 'react-router';
import Dashboard from './components/Dashboard';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


function App() {

  return (
    <AuthProvider>
      <Routes>
        <Route path='/' element={<Login />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>

  );
}

export default App;
