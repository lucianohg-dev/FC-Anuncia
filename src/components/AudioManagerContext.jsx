import React, { createContext, useContext, useRef, useState } from "react";

const AudioManagerContext = createContext();

// 🛠️ FUNÇÃO AUXILIAR CORRIGIDA: Implementação FINAL, forçando o prefixo correto
export const getAssetUrl = (src) => { // ⬅️ EXPORTADA PARA USO EM OUTROS COMPONENTES
    // Nome do repositório/pasta base no GitHub Pages (deve ser 'FC-Anuncia/')
    const REPO_PREFIX = "FC-Anuncia/"; 

    // 1. Remove qualquer barra inicial. Ex: '/audiosLoja/...' -> 'audiosLoja/...'
    let cleanSrc = src.startsWith('/') ? src.substring(1) : src;

    // 2. Remove o prefixo do repositório se ele JÁ estiver no caminho.
    // Ex: 'FC-Anuncia/audiosLoja/...' -> 'audiosLoja/...'
    if (cleanSrc.startsWith(REPO_PREFIX)) {
        cleanSrc = cleanSrc.substring(REPO_PREFIX.length);
    }

    // 3. Monta a URL final corretamente: /FC-Anuncia/audiosLoja/estac1.mp3
    // O retorno final terá a URL começando com a barra do repositório, mas apenas uma vez.
    return `/${REPO_PREFIX}${cleanSrc}`;
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
        // 💡 Já usa getAssetUrl, o que garante o caminho correto
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