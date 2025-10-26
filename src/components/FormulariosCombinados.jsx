import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import "./FormulariosCombinados.css";

const bandeiras = [
  "Alelo", "American Express", "Cabal", "Diners Club", "Discover", "Elo",
  "FortBrasil", "Hipercard", "JCB", "Mastercard", "Nenhum",
  "Sorocred", "Ticket", "Verocheque", "Visa", "VR Benefícios", "Outro"
];

const tiposDocumento = [
  "RG", "CPF", "CNH", "Passaporte", "Título de Eleitor",
  "Carteira de Trabalho", "Certificado de Reservista",
  "Certidão de Nascimento", "Outro"
];

export default function FormularioUnificado() {
  // Estados separados para cada formulário
  const [formCartao, setFormCartao] = useState({
    nomeCompleto: "",
    nomeCartao: "",
    bandeira: "",
    data: "",
  });

  const [formDocumento, setFormDocumento] = useState({
    nomeCompleto: "",
    tipoDocumento: "",
    data: "",
  });

  // Handlers genéricos
  const handleCartaoChange = (e) => {
    const { name, value } = e.target;
    setFormCartao({ ...formCartao, [name]: value });
  };

  const handleDocumentoChange = (e) => {
    const { name, value } = e.target;
    setFormDocumento({ ...formDocumento, [name]: value });
  };

  // Submissão para cartão
  const handleCartaoSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "cartoes"), formCartao);
      alert("Cartão cadastrado com sucesso!");
      setFormCartao({ nomeCompleto: "", nomeCartao: "", bandeira: "", data: "" });
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
      alert("Erro ao salvar cartão.");
    }
  };

  // Submissão para documento
  const handleDocumentoSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "documentos"), formDocumento);
      alert("Documento cadastrado com sucesso!");
      setFormDocumento({ nomeCompleto: "", tipoDocumento: "", data: "" });
    } catch (error) {
      console.error("Erro ao salvar documento:", error);
      alert("Erro ao salvar documento.");
    }
  };

  return (
    <div className="containerUnificado">
      {/* Formulário de Cartão */}
      <div className="boxForm">
        <form onSubmit={handleCartaoSubmit} className="formUnificado">
          <h2 className="tituloForm">Cartão Perdido</h2>
          <label>
            Nome Completo:
            <input
              type="text"
              name="nomeCompleto"
              value={formCartao.nomeCompleto}
              onChange={handleCartaoChange}
              required
            />
          </label>

          <label>
            Nome do Cartão:
            <input
              type="text"
              name="nomeCartao"
              value={formCartao.nomeCartao}
              onChange={handleCartaoChange}
              required
            />
          </label>

          <label>
            Bandeira do Cartão:
            <select
              name="bandeira"
              value={formCartao.bandeira}
              onChange={handleCartaoChange}
              required
            >
              <option value="">Selecione</option>
              {bandeiras.map((b, i) => (
                <option key={i} value={b}>{b}</option>
              ))}
            </select>
          </label>

          <label>
            Data:
            <input
              type="date"
              name="data"
              value={formCartao.data}
              onChange={handleCartaoChange}
              required
            />
          </label>

          <button type="submit">Cadastrar Cartão</button>
        </form>
      </div>

      {/* Formulário de Documento */}
      <div className="boxForm">
        <form onSubmit={handleDocumentoSubmit} className="formUnificado">
          <h2 className="tituloForm">Documento Perdido</h2>
          <label>
            Nome Completo:
            <input
              type="text"
              name="nomeCompleto"
              value={formDocumento.nomeCompleto}
              onChange={handleDocumentoChange}
              required
            />
          </label>

          <label>
            Tipo de Documento:
            <select
              name="tipoDocumento"
              value={formDocumento.tipoDocumento}
              onChange={handleDocumentoChange}
              required
            >
              <option value="">Selecione</option>
              {tiposDocumento.map((t, i) => (
                <option key={i} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label>
            Data:
            <input
              type="date"
              name="data"
              value={formDocumento.data}
              onChange={handleDocumentoChange}
              required
            />
          </label>

          <button type="submit">Cadastrar Documento</button>
        </form>
      </div>
    </div>
  );
}
