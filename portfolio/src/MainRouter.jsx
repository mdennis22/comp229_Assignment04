import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import Projects from "./components/Projects";
import Education from "./components/Education";
import Services from "./components/Services";
import Login from "./components/login";
import Register from "./components/register";

const MainRouter = () => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const handleAuth = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div>
      <Layout token={token} onSignOut={handleSignOut} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/services" element={<Services />} />
        <Route path="/education" element={<Education />} />
        <Route path="/login" element={<Login onAuth={handleAuth} />} />
        <Route path="/register" element={<Register onAuth={handleAuth} />} />
      </Routes>
    </div>
  );
};

export default MainRouter;
