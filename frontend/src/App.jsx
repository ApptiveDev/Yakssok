import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
<<<<<<< HEAD
import Invited from "./pages/Invited";
=======
import Create from "./pages/Create";
>>>>>>> 3607ab9af1013edc8e1331b7f3ba16e30de7767f
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
<<<<<<< HEAD
        <Route path="/invited" element={<Invited />} />
=======
        <Route path="/create" element={<Create />} />
>>>>>>> 3607ab9af1013edc8e1331b7f3ba16e30de7767f
      </Routes>
    </Router>
  );
}

export default App;
