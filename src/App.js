
import Main from './Main';
import UserForm from './UserForm';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chatbox from './Chatbox';

function App() {
  return (
   
   <>
   <Router>
    <Routes>
      <Route path="/" element={<Main/>} />
      <Route path="/UserForm" element={<UserForm />}/>
      <Route path="/Chatbox" element={<Chatbox/>}/>
    </Routes>
    
   </Router>
   
   </>
  );
}

export default App;
