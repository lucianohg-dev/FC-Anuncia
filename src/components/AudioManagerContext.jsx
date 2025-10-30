import React, { createContext, useContext, useRef, useState } from "react";

const AudioManagerContext = createContext();

// 🛠️ FUNÇÃO AUXILIAR CORRIGIDA: Trata caminhos com ou sem a barra inicial E evita a duplicação do BASE_URL
const getAssetUrl = (src) => {
  const baseUrl = import.meta.env.BASE_URL; // Exemplo: '/FC-Anuncia/'
  
  // 1. Remove a barra inicial do 'src' se existir.
  let cleanSrc = src.startsWith('/') ? src.substring(1) : src;
  
  // 2. CORREÇÃO CRÍTICA: Trata a duplicação de 'FC-Anuncia/FC-Anuncia/'
  // Verifica se o src começa com a URL base sem a barra inicial ('FC-Anuncia/').
  if (cleanSrc.startsWith(baseUrl.substring(1))) {
    // Se sim, remove a primeira ocorrência do prefixo.
    // O length do baseUrl é 10. O substring(1) começa no 1.
    cleanSrc = cleanSrc.substring(baseUrl.substring(1).length);
  }
  
  // 3. Garante que o cleanSrc não comece com barra.
  cleanSrc = cleanSrc.startsWith('/') ? cleanSrc.substring(1) : cleanSrc;
  
  // 4. Retorna a URL correta e limpa: /FC-Anuncia/audiosLoja/estac1.mp3
  return `${baseUrl}${cleanSrc}`;
};


export const AudioManagerProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const musicRef = useRef(null);
  const volumeRef = useRef(1);
  const pausedTimeRef = useRef(0);
  const isAnnouncingRef = useRef(false);

  // ▶️ Tocar música de fundo 
  const playAudio = (src) => {
    // Para música antiga
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }

    // Cria e toca novo áudio com o caminho corrigido
    musicRef.current = new Audio(getAssetUrl(src));
    musicRef.current.volume = volumeRef.current;
    musicRef.current.loop = true;
    musicRef.current.play();
    setIsPlaying(true);
  };

  // ⏸️ Pausar música
  const pauseAudio = () => {
    if (musicRef.current) {
      pausedTimeRef.current = musicRef.current.currentTime;
      musicRef.current.pause();
      setIsPlaying(false);
    }
  };

  // ⏹️ Parar completamente música
  const stopAudio = () => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      pausedTimeRef.current = 0;
      setIsPlaying(false);
    }
  };

  // 🎚️ Ajustar volume
  const setVolume = (v) => {
    volumeRef.current = v;
    if (musicRef.current) musicRef.current.volume = v;
  };

  // 🔉 Abaixa volume temporariamente (para anúncios)
  const lowerVolumeTemporarily = () => {
    if (musicRef.current) {
      const newVol = Math.max(volumeRef.current * 0.15, 0.05); // mínimo 0.05
      musicRef.current.volume = newVol;
    }
  };

  // 🔊 Restaura volume original
  const restoreVolume = () => {
    if (musicRef.current) musicRef.current.volume = volumeRef.current;
  };

  // 📢 Reproduzir sequência de áudios (manual ou agendado)
  const playAudioSequence = async (sources) => {
    if (isAnnouncingRef.current) return; // evita eco
    isAnnouncingRef.current = true;

    lowerVolumeTemporarily();

    try {
      for (const src of sources) {
        await new Promise((resolve) => {
          // Cria novo áudio com o caminho corrigido
          const a = new Audio(getAssetUrl(src));
          a.onended = resolve;
          a.onerror = resolve; // ignora erro
          a.play();
        });
      }
    } catch (error) {
      console.error("Erro ao reproduzir sequência:", error);
    } finally {
      restoreVolume();
      isAnnouncingRef.current = false;
    }
  };

  // 🔔 Função de anúncio agendado (para timers)
  const playScheduledAnnouncement = async (sources) => {
    await playAudioSequence(sources);
  };

  return (
    <AudioManagerContext.Provider
      value={{
        playAudio,
        pauseAudio,
        stopAudio,
        setVolume,
        lowerVolumeTemporarily,
        restoreVolume,
        isPlaying,
        playAudioSequence,
        playScheduledAnnouncement,
      }}
    >
      {children}
    </AudioManagerContext.Provider>
  );
};

export const useAudioManager = () => useContext(AudioManagerContext);