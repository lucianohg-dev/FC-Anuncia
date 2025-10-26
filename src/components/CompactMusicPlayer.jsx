import React, { useState, useEffect, useRef } from "react";
import { useAudioManager } from "./AudioManagerContext";
import "./CompactMusicPlayer.css";

const musicas = [
  { nome: "MPB-1", src: "/musics/MPB-1.mp3" },
  { nome: "MPB-2", src: "/musics/MPB-2.mp3" },
  { nome: "INTER-1", src: "/musics/INTER-1.mp3" },
];

export default function CompactPlayer({ onClose }) {
  const { playAudio, pauseAudio, stopAudio, setVolume, isPlaying, audioRef } = useAudioManager();
  const [volume, setVolumeState] = useState(0.5); // 🔹 Volume inicial 50%
  const [selectedMusica, setSelectedMusica] = useState(null);
  const inactivityTimer = useRef(null);

  /* =========================
     Reinicia temporizador de inatividade
     ========================= */
  const resetInactivityTimer = () => {
    if (!onClose) return;
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      if (!isPlaying) {
        onClose(); // fecha só se não estiver tocando
      }
    }, 60 * 1000); // 1 minuto
  };

  /* =========================
     Detecta atividade do usuário
     ========================= */
  useEffect(() => {
    resetInactivityTimer();

    const events = ["mousemove", "click", "keydown", "touchstart", "change"];
    const handleUserActivity = () => resetInactivityTimer();
    events.forEach(event => window.addEventListener(event, handleUserActivity));

    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
      clearTimeout(inactivityTimer.current);
    };
  }, [isPlaying]);

  /* =========================
     Seleciona música
     ========================= */
  const handleMusicSelect = (e) => {
    const musica = musicas.find((m) => m.nome === e.target.value);
    setSelectedMusica(musica);
    resetInactivityTimer();
  };

  /* =========================
     Play com volume inicial 50% e começa do meio
     ========================= */
  const handlePlay = () => {
    if (!selectedMusica) return;

    const initialVolume = 0.5;
    setVolumeState(initialVolume);
    setVolume(initialVolume);

    const playPromise = playAudio(selectedMusica.src);
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = audioRef.current.duration / 2; // começa do meio
          }
        })
        .catch(console.warn);
    }

    resetInactivityTimer();
  };

  /* =========================
     Controle de volume
     ========================= */
  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolumeState(v);
    setVolume(v);
    resetInactivityTimer();
  };

  return (
    <div className="compact-player-wrapper">
      {/* 🔹 Botão de fechar sem parar a música */}
      {onClose && (
        <button className="btn-close-player" onClick={onClose}>
          ✖
        </button>
      )}

      <div className="controls">
        <button id="btnPlayer" onClick={handlePlay}>▶</button>
        <button id="btnPlayer" onClick={() => { pauseAudio(); resetInactivityTimer(); }}>⏸</button>
        <button id="btnPlayer" onClick={() => { stopAudio(); resetInactivityTimer(); }}>⏹</button>

        <label htmlFor="volume" className="volumePlayer">Volume</label>
        <span className="nivel">{Math.round(volume * 100)}%</span>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <input
            id="volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>
      </div>

      <div className="estilo-select">
        <select
          value={selectedMusica ? selectedMusica.nome : ""}
          onChange={handleMusicSelect}
        >
          <option value="">Selecione o estilo</option>
          {musicas.map((m) => (
            <option key={m.nome} value={m.nome}>
              {m.nome}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
