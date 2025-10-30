import React, { createContext, useContext, useRef, useState } from "react";

const AudioManagerContext = createContext();

// 🛠️ FUNÇÃO AUXILIAR CORRIGIDA: Implementação robusta anti-duplicação de prefixo
const getAssetUrl = (src) => {
  // A BASE_URL é a pasta do repositório, ex: '/FC-Anuncia/'
  const baseUrl = import.meta.env.BASE_URL; 
  
  // 1. Limpa o src, removendo barras iniciais e o prefixo do repositório (FC-Anuncia/) se já estiver lá.
  // Isso garante que o caminho a ser prefixado seja apenas 'audiosLoja/estac1.mp3', por exemplo.
  
  // Ex: remove '/' se o src for '/FC-Anuncia/audiosLoja/...'
  let cleanSrc = src.startsWith('/') ? src.substring(1) : src;

  // Ex: remove 'FC-Anuncia/' se o src for 'FC-Anuncia/audiosLoja/...'
  const repoPrefix = baseUrl.startsWith('/') ? baseUrl.substring(1) : baseUrl;
  if (cleanSrc.startsWith(repoPrefix)) {
    cleanSrc = cleanSrc.substring(repoPrefix.length);
  }
  
  // 2. Garante que o cleanSrc não comece com barra (pois o baseUrl termina com barra).
  cleanSrc = cleanSrc.startsWith('/') ? cleanSrc.substring(1) : cleanSrc;
  
  // 3. Concatena a BASE_URL (ex: /FC-Anuncia/) com o caminho limpo (ex: audiosLoja/estac1.mp3)
  // Resultado final: /FC-Anuncia/audiosLoja/estac1.mp3
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