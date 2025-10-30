import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2, Menu, X } from "lucide-react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

import "../components/Header.css";

export default function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [showPlayer, setShowPlayer] = useState(false); // 👈 controla se o player aparece
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name =
          user.displayName || (user.email ? user.email.split("@")[0] : "");
        setUserName(name);
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

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const togglePlayer = () => {
    setShowPlayer(!showPlayer);
    setMenuOpen(false); // fecha o menu quando o player for aberto
  };

  return (
    <header id="bodyheader">
      {/* 👇 Renderiza o player só quando showPlayer for true */}
      {showPlayer && (
        <MidiaPlayer onClose={() => setShowPlayer(false)} />
      )}

    
      <h1 className="headerh1">Anuncia-FC</h1>

      {userName && (
        <span className="user-info">
          <img src={photoURL} alt="Foto de perfil" className="user-photo" />
          <span className="user-name">{userName}</span>
        </span>
      )}

      <div className="menu-icon" onClick={toggleMenu}>
        {menuOpen ? <X size={35} /> : <Menu size={35} />}
      </div>

      <nav className={`menu-dropdown ${menuOpen ? "open" : ""}`}>
      

        <a
          href="http://192.168.1.104:5173/remote"
          target="_blank"
          rel="noopener noreferrer"
          className="menu-link"
        >
          Página Remota
        </a>

        <button onClick={handleLogout} className="menu-link">
          Sair
        </button>
      </nav>
    </header>
  );
}
