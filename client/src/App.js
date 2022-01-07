import './App.css';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
import  Register  from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';
import { loadUser } from './actions/auth'; 
import { Provider } from 'react-redux';
import store from './store';
import { useEffect } from 'react';
import setAuthToken from './utils/setAuthToken';
import Dashboard from './components/dashboard/Dashboard';
import PrivateRoute from './components/routing/PrivateRoute';
import CreateProfile from './components/profile-form/CreateProfile';
import EditProfile from './components/profile-form/EditProfile';

if(localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  },[])
  return (
    <Provider store={store}>
      <Router>
        <>
          <Navbar />
          <Alert />
          <Routes>
            <Route exact path='/' exact element={<Landing />}></Route>
            <Route exact path="/register" element={<Register />}/>
            <Route exact path="/login" element={<Login />}/>
            <Route  element={<PrivateRoute />}>
              <Route exact path="/dashboard" element={<Dashboard />}/>
              <Route path='/create-profile' element={<CreateProfile/>} />
              <Route path='/edit-profile' element={<EditProfile />} />
            </Route>
          </Routes>
        
        </>
      </Router>
    </Provider>
  );
}

export default App;
