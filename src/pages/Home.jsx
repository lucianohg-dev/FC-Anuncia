import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../config/firebase.js";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import "./CadastroStyle.mode.css"; 

const Home = () => {
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' ou 'error'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      setMessage("As senhas não coincidem!");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setMessage("A senha deve ter pelo menos 6 caracteres.");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    try {
      const email = `${matricula}@example.com`;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        matricula: matricula,
      });

      setMessage(
        "Registro bem-sucedido! O usuário foi criado e os dados foram salvos."
      );
      setMessageType("success");
      setMatricula("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Erro de registro:", error);
      setMessage(`Erro no registro: ${error.message}`);
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-home-container">
        <h1 className="h1-page-container ">Anuncia-FC</h1>
      <div className="auth-home-card">
        <h1 className="card-title">Criar Conta</h1>
        <form onSubmit={handleRegister} className="auth-form">
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
                setPassword(
                  e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                )
              }
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword" className="input-label">
              Confirmar Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                const valor = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "");
                setConfirmPassword(valor);
              }}
              className="input-field"
              required
            />
          </div>

          {message && (
            <div className={`message ${messageType}`}>{message}</div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registrando..." : "Registrar"}
          </button>

          <p className="login-link">
            Já possui uma conta?{" "}
            <Link to="/login" className="link-text">
              Faça login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Home;