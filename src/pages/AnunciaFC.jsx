// src/AnunciaFC.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase.js";
import "./AnunciaFC.CSS";

// Importações dos seus outros componentes
import ChamarBrigadista from "../components/ChamarBrigadista.jsx";
import AnunciadorDePlacas from "../components/AnunciadorDePlacas.jsx";
import AgendarAudio from "../components/AgendadorHorario.jsx";

import AvisoPessoaPerdida from "../components/AvisoPessoaPerdida";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";

export default function AnunciaFC() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Usuário deslogado com sucesso!");
      navigate("/login");
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  return (
    <div className="bodypage">
      <Header />

      <div className="main-content">
        <AgendarAudio />
        <AnunciadorDePlacas />
        <ChamarBrigadista />

        <AvisoPessoaPerdida />
      </div>

      <Footer />
    </div>
  );
}
