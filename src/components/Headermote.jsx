// RemoteHeader.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import "./Headermote.css";

export default function RemoteHeader() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || (user.email ? user.email.split("@")[0] : ""));
        setPhotoURL(
          user.photoURL ||
            "https://cdn-icons-png.flaticon.com/512/847/847969.png"
        );
      } else {
        setUserName("");
        setPhotoURL("");
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header id="remote-header">
      <h1 className="remote-header-title">
        Anuncia-FC
        {userName && (
          <span className="remote-user-info">
            <img src={photoURL} alt="Foto de perfil" className="remote-user-photo" />
            <span className="remote-user-name">{userName}</span>
          </span>
        )}
      </h1>

      <div className="remote-menu-icon" onClick={toggleMenu}>
        {menuOpen ? <X size={35} /> : <Menu size={35} />}
      </div>

      <nav className={`remote-menu-dropdown ${menuOpen ? "open" : ""}`}>
        <button onClick={handleLogout} className="remote-menu-link">
          Sair
        </button>
      </nav>
    </header>
  );
}
