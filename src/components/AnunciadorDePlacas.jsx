import React, { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, addDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAudioManager } from "./AudioManagerContext"; // 👈 Importa o contexto de áudio
import "../components/AnunciadorDePlacas.css";

const clientId = Math.random().toString(36).substring(2, 10);

// 🔥 CORREÇÃO NA LINHA 14: Use 'const' ou 'function' para declarar. 
// A exportação 'default' será feita no final do arquivo.
const AnunciadorPrincipal = () => { 
  const [placa, setPlaca] = useState("");
  const [placasAnunciadas, setPlacasAnunciadas] = useState([]);
  const [isAnunciando, setIsAnunciando] = useState(false); // 🚨 Bloqueio de múltiplos cliques
  const placasCollectionRef = collection(db, "placas");

  const ultimoAnunciadoRef = useRef(null);
  const paginaAbertaEm = useRef(new Date());
  const { playAudioSequence } = useAudioManager();

  // 🔥 Escuta Firebase em tempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(placasCollectionRef, (snapshot) => {
      const placasDoFirebase = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // 🔹 Ordena do mais recente para o mais antigo
      placasDoFirebase.sort((a, b) => {
        const dataA = new Date(a.timestamp.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1"));
        const dataB = new Date(b.timestamp.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1"));
        return dataB - dataA;
      });

      if (placasDoFirebase?.length > 0) {
        const placaMaisRecente = placasDoFirebase[0];
        const dataPlaca = new Date(
          placaMaisRecente.timestamp.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1")
        );

        if (
          placaMaisRecente.id !== ultimoAnunciadoRef.current &&
          dataPlaca > paginaAbertaEm.current &&
          placaMaisRecente.origin !== clientId
        ) {
          ultimoAnunciadoRef.current = placaMaisRecente.id;
          tocarPlaca(placaMaisRecente.placa);
        }
      }

      setPlacasAnunciadas(placasDoFirebase);
    });

    return () => unsubscribe();
  }, []);

  // 🎵 Função para tocar a placa
  const tocarPlaca = async (placaParaReproduzir) => {
    if (isAnunciando) return; // 🚫 Bloqueia novos clicks enquanto anuncia

    setIsAnunciando(true);

    const prefixo = "/audiosPlaca/inicio.mp3";
    const sufixo = "/audiosPlaca/fim.mp3";
    const caracteres = placaParaReproduzir.toLowerCase().replace(/\s+/g, "");
    const audios = caracteres.split("").map((c) => `/audiosPlaca/${c}.mp3`);

    const filaAudios = [prefixo, ...audios, sufixo, prefixo, ...audios, sufixo];

    try {
      await playAudioSequence(filaAudios);
    } catch (error) {
      console.error("Erro ao tocar a placa:", error);
    }

    setIsAnunciando(false); // ⬅ Libera o click depois que termina
  };

  // 🧠 Função para anunciar manualmente
  const handleAnunciar = async () => {
    if (placa.trim() === "") return;

    const placaFormatada = placa.trim().toUpperCase();
    const dataHoraAnuncio = new Date().toLocaleString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    try {
      const docRef = await addDoc(placasCollectionRef, {
        placa: placaFormatada,
        timestamp: dataHoraAnuncio,
        origin: clientId,
      });

      // 🚫 Evita eco (fala duplicada)
      ultimoAnunciadoRef.current = docRef.id; 
      setPlaca("");

      // Pequeno atraso garante que o snapshot ignore este anúncio local
      setTimeout(() => {
        tocarPlaca(placaFormatada);
      }, 500);
    } catch (error) {
      console.error("Erro ao salvar no Firebase:", error);
    }
  };

  const handleRemoverPlaca = async (id) => {
    try {
      await deleteDoc(doc(db, "placas", id));
    } catch (error) {
      console.error("Erro ao remover:", error);
    }
  };

  return (
    <div className="anunciador-wrapper">
      <div className="anunciador-container">
        <h1 className="placatileh1">Anunciar Placa</h1>

        <div className="input-group1">
          <input
            type="text"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            placeholder="Digite a placa (ex: ABC1234)"
            maxLength="7"
          />
          <button
            className="btnanunciar"
            onClick={handleAnunciar}
            disabled={isAnunciando}
          >
            Anunciar
          </button>
        </div>

        <u className="titles">Placas Anunciadas</u>
        <ul className="placas-list">
          {placasAnunciadas.map((item) => (
            <li key={item.id} className="placa-item">
              <div className="placa-info">
                <span className="placa-text">
                  Placa:<p className="placa-style">{item.placa}</p>
                </span>

                <span className="placa-timestamp">
                  <br />
                  Data-Hora:<p className="data-style">{item.timestamp}</p>
                </span>
              </div>

              <div className="placa-buttons-container">
                <button
                  className="btnplay"
                  onClick={() => tocarPlaca(item.placa)}
                  disabled={isAnunciando} // Bloqueia múltiplos clicks
                >
                  ▶
                </button>
                <button
                  className="btnremove"
                  onClick={() => handleRemoverPlaca(item.id)}
                >
                  ✖
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}; // Fim do componente

// 🔥 CORREÇÃO FINAL: Exporta o componente
export default AnunciadorPrincipal;