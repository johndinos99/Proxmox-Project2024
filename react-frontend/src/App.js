import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoutes from './utils/PrivateRoute'
import { AuthProvider } from "./context/AuthContext";

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import NavBarLayout from "./components/NavBarLayout";
import CreateVmPage from "./pages/CreateVmPage";
import { IconContext } from "react-icons/lib";

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <IconContext.Provider value={{ style: { verticalAlign: 'middle' } }}>
            <Routes>
              <Route element={<NavBarLayout/>}>
                <Route element={<PrivateRoutes/>}>
                  <Route Component={HomePage} path="/" exact />
                </Route>
              </Route>
              <Route>
                <Route element={<PrivateRoutes/>}>
                  <Route Component={CreateVmPage} path="/create-vm"/>
                </Route>
              </Route>
              <Route Component={LoginPage} path="/login"/>
              <Route Component={SignUpPage} path="/signup"/>
            </Routes>
          </IconContext.Provider>  
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
