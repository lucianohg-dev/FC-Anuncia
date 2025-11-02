import React, { createContext, useContext, useRef, useState } from "react";

const AudioManagerContext = createContext();

// 🛠️ FUNÇÃO AUXILIAR: Resolve o caminho dos assets para o GitHub Pages
export const getAssetUrl = (src) => {
    const REPO_PREFIX = "FC-Anuncia/"; 

    let cleanSrc = src.startsWith('/') ? src.substring(1) : src;

    if (cleanSrc.startsWith(REPO_PREFIX)) {
        cleanSrc = cleanSrc.substring(REPO_PREFIX.length);
    }

    return `/${REPO_PREFIX}${cleanSrc}`;
};


export const AudioManagerProvider = ({ children }) => {
    const musicRef = useRef(null);
    const volumeRef = useRef(1);
    const pausedTimeRef = useRef(0);
    const isAnnouncingRef = useRef(false);

    const [isPlaying, setIsPlaying] = useState(false); // Estado da música de fundo
    const [isAnnouncing, setIsAnnouncing] = useState(false); // 🆕 Estado Global de Anúncio Ativo

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

    // 🆕 FUNÇÃO CRÍTICA: Solicita o bloqueio do sistema de anúncios
    const requestAnnouncement = () => {
        if (isAnnouncingRef.current) {
            // Bloqueado: Retorna objeto de falha
            return { success: false, message: "Um anúncio já está em andamento." };
        }
        
        // Desbloqueado: Inicia o bloqueio e abaixa o volume
        isAnnouncingRef.current = true;
        setIsAnnouncing(true); // Bloqueia botões em todos os componentes
        lowerVolumeTemporarily();
        
        // Função de desbloqueio
        const unlock = () => {
            restoreVolume();
            isAnnouncingRef.current = false;
            setIsAnnouncing(false);
        };
        
        // Retorna objeto de sucesso com a função de desbloqueio
        return { success: true, unlock };
    };
    
    // 📢 Reproduzir sequência de áudios (manual ou agendado)
    const playAudioSequence = async (sources) => {
        // Adiciona uma checagem de bloqueio robusta
        const lock = requestAnnouncement();
        if (!lock.success) return;

        try {
            for (const src of sources) {
                await new Promise((resolve) => {
                    const a = new Audio(getAssetUrl(src));
                    
                    // Garante que as funções onended/onerror existem
                    const handleEnd = () => {
                      a.onended = null;
                      a.onerror = null;
                      resolve();
                    };
                    
                    a.onended = handleEnd;
                    a.onerror = (e) => {
                      console.error(`Erro ao carregar ou reproduzir áudio (${src}):`, e);
                      handleEnd(); // Resolve mesmo em caso de erro para ir ao próximo áudio
                    };
                    
                    // 🚨 Tenta reproduzir. O 'catch' aqui previne o erro original
                    a.play().catch(e => {
                      console.error(`Falha ao iniciar play() para ${src}:`, e);
                      handleEnd();
                    });
                });
            }
        } catch (error) {
            console.error("Erro ao reproduzir sequência:", error);
        } finally {
            lock.unlock(); // Desbloqueia o sistema
        }
    };

    // 🆕 IMPLEMENTAÇÃO: Reproduzir anúncio agendado (usa a lógica de bloqueio)
    const playScheduledAnnouncement = async (sources) => {
      // Aqui apenas chama o playAudioSequence que já tem o sistema de bloqueio
      await playAudioSequence(sources);
    };
    
    // ... (playAudio, pauseAudio, stopAudio, etc.) Omitidos por brevidade

    return (
        <AudioManagerContext.Provider
            value={{
                // ... (playAudio, pauseAudio, stopAudio, etc.) ...
                setVolume,
                isPlaying, 
                
                // 🔑 Controle de Anúncio Exclusivo
                isAnnouncing,
                requestAnnouncement, 
                
                playAudioSequence,
                playScheduledAnnouncement,
            }}
        >
            {children}
        </AudioManagerContext.Provider>
    );
};

export const useAudioManager = () => useContext(AudioManagerContext);