import React, { useState } from "react";
import { auth, db } from "../config/firebase.js";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import "./Login.mode.css";

const Login = () => {
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  setMessage("");
  setMessageType("");
  setIsSubmitting(true);

  try {
    const email = `${matricula}@example.com`;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 🔹 Obtém o tipo do usuário no Firestore
    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
    let tipo = "principal"; // valor padrão (caso não exista doc)
    if (userDoc.exists() && userDoc.data().tipo) {
      tipo = userDoc.data().tipo;
    }

    // 🔸 Atualiza status online no Firestore (apenas se for o principal)
    if (tipo === "principal") {
      const statusRef = doc(db, "status", "principal_online");
      await setDoc(statusRef, {
        online: true,
        lastActive: new Date(),
        userId: user.uid,
      });
    }

    setMessage("Login realizado com sucesso!");
    setMessageType("success");

    // 🔁 Redireciona baseado na primeira letra da matrícula
    const firstChar = matricula.charAt(0).toUpperCase();
    if (firstChar === "S") {
      navigate("/anunciafc");
    } else if (firstChar === "F") {
      navigate("/remote");
    } else {
      // Caso não seja S ou F, pode manter padrão
      navigate("/anunciafc");
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    setMessage(`Erro no login: ${error.message}`);
    setMessageType("error");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="page-container">
      <h1 className="h1-page-container">Anuncia-FC</h1>
      <div className="auth-card">
        <h1 className="card-title">Login</h1>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label htmlFor="matricula" className="input-label">
              Matrícula
            </label>
            <input
              type="text"
              id="matricula"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value.toUpperCase())}
              className="input-field"
              placeholder="Digite sua matrícula"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
              }
              className="input-field"
              placeholder="Digite sua senha"
              required
            />
          </div>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Entrando..." : "Login"}
          </button>
        </form>

        <div className="cadastro-link">
          Não possui conta?{" "}
          <Link to="/register" className="link-text">
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
