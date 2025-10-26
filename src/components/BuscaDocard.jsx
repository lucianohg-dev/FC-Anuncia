import React, { useState } from "react";
import { collection, query, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import "../components/BuscadoCard.mode.css";

export default function Procurar() {
  const [nome, setNome] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [resultados, setResultados] = useState([]);

  const handleProcurar = async () => {
    const colecoes = [];
    if (tipoSelecionado === "cartao") colecoes.push("cartoes");
    if (tipoSelecionado === "documento") colecoes.push("documentos");

    if (!colecoes.length) {
      alert("Selecione pelo menos um tipo.");
      return;
    }

    let encontrados = [];
    const nomeMinusculo = nome.toLowerCase();

    if (!nomeMinusculo.trim()) {
      alert("Por favor, digite um nome para buscar.");
      return;
    }

    for (let col of colecoes) {
      const q = query(collection(db, col));
      const snapshot = await getDocs(q);

      snapshot.forEach((docSnap) => {
        const dados = { id: docSnap.id, tipo: col, ...docSnap.data() };
        let nomeDoDocumento =
          col === "cartoes" ? dados.nomeCompleto : dados.personName;

        if (
          nomeDoDocumento &&
          nomeDoDocumento.toLowerCase().includes(nomeMinusculo)
        ) {
          encontrados.push(dados);
        }
      });
    }

    if (!encontrados.length) alert("Nenhum registro encontrado!");
    setResultados(encontrados);
    setNome(""); // limpa input
  };

  const handleConfirmarEntrega = async (item) => {
    if (
      !window.confirm(
        `Confirmar entrega e apagar dados de ${
          item.tipo === "cartoes" ? item.nomeCompleto : item.personName
        }?`
      )
    )
      return;

    try {
      await deleteDoc(doc(db, item.tipo, item.id));
      setResultados((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error(err);
      alert("Erro ao apagar dados.");
    }
  };

  return (
    <div className="caixaPrincipal">
      <div className="containerSimples">
        <h2 className="titleh2">🔎 Procurar Documento ou Cartão</h2>

        <div className="formBusca">
          <input
            type="text"
            placeholder="Digite o nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="inputNome"
          />

          <div className="checkboxGroup">
            <label>
              <input
                type="checkbox"
                checked={tipoSelecionado === "cartao"}
                onChange={() => setTipoSelecionado("cartao")}
              />
              Cartão
            </label>
            <label>
              <input
                type="checkbox"
                checked={tipoSelecionado === "documento"}
                onChange={() => setTipoSelecionado("documento")}
              />
              Documento
            </label>
          </div>

          <button onClick={handleProcurar} className="btnProcurar">
            Procurar
          </button>
        </div>

        <div className="resultadoSimples">
          {resultados.length === 0 ? (
            <p className="nenhum">Nenhum resultado ainda</p>
          ) : (
            resultados.map((item) => (
              <div key={item.id} className="linhaResultado">
                <span>
                  <b>Nome:</b>{" "}
                  {item.tipo === "cartoes"
                    ? item.nomeCompleto
                    : item.personName}
                </span>
                {item.tipo === "cartoes" ? (
                  <span>
                    <b>Cartão:</b> {item.nomeCartao}
                  </span>
                ) : (
                  <span>
                    <b>Documento:</b> {item.documentType}
                  </span>
                )}
                <span>
                  <b>Data:</b>{" "}
                  {item.tipo === "cartoes" ? item.data : item.lostDate}
                </span>
                <button
                  className="btnConfirmar"
                  onClick={() => handleConfirmarEntrega(item)}
                >
                  Confirmar Entrega
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
