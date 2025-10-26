import React, { useState, useEffect, useRef } from "react";
import { useAudioManager } from "./AudioManagerContext"; // Contexto global de áudio
import "./ChamarBrigadista.css";

const botoes = [
  "Estac.1", "Estac.2", "P4", "Mvl.1", "Mvl.2", "Mvl.3", "P6", "P7", "P8",
  "Rua.3", "Rua.4", "Rua.5", "Rua.6", "Rua.7", "Rua.8", "Rua.9", "Rua.10",
  "Rua.11", "Rua.12", "Rua.13", "Rua.14", "Rua.15", "Rua.16", "Rua.17",
  "Rua.18", "Rua.44", "Rua.45", "Rua.46", "Rua.47", "Rua.49", "Rua.50",
  "Rua.51", "Rua.52", "Rua.53", "Rua.54", "Rua.55", "Rua.56", "Rua.57",
  "Rua.58", "Rua.60", "Rua.61", "Rua.62", "Rua.63", "Rua.64", "Rua.65",
  "Rua.66", "Rua.67", "Rua.68", "Rua.69", "Rua.70", "Rua.71", "Rua.72",
  "Rua.73", "Rua.74", "Rua.75", "Rua.76", "Rua.77", "Rua.78", "Rua.79",
  "Rua.80", "Rua.81", "Rua.82", "Rua.87", "Rua.88", "V.Tenda", "V.Outlet"
 
];

const formatarNome = (nome) => nome.replace(/\./g, "").replace(/\s+/g, "").toLowerCase();

export default function ChamarBrigadista() {
  const [isAppPlaying, setIsAppPlaying] = useState(false);
  const audioRefs = useRef({});
  const { playAudioSequence } = useAudioManager(); // ✅ Usa o contexto correto

  useEffect(() => {
    botoes.forEach((nome) => {
      const nomeArquivo = formatarNome(nome);
      const caminho = `${import.meta.env.BASE_URL}audiosLoja/${nomeArquivo}.mp3`;
      audioRefs.current[nome] = caminho; // armazenamos só o caminho, contexto vai tocar
    });
  }, []);

  const tocarAudio = async (nome) => {
    if (isAppPlaying || !playAudioSequence) return;
    setIsAppPlaying(true);

    try {
      const audioCaminho = audioRefs.current[nome];
      if (audioCaminho) {
        // Toca duas vezes
        await playAudioSequence([audioCaminho, audioCaminho]);
      }
    } catch (error) {
      console.error("Erro ao tocar áudio:", error);
    } finally {
      setIsAppPlaying(false);
    }
  };

  return (
    <div className="brig-wrapper">
      <nav className="brig-container">
        <h1 className="brig-title">Chamar brigadista</h1>
        <div className="brig-grid">
          {botoes.map((nome, index) => (
            <button
              key={index}
              className="brig-btn"
              onClick={() => tocarAudio(nome)}
              disabled={isAppPlaying}
            >
              {nome}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
