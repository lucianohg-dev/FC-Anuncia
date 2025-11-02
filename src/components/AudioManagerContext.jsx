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
        const lock = requestAnnouncement();
        if (!lock.success) return;

        // 🆕 1. FUNÇÃO RECURSIVA PARA TOCAR CADA ÁUDIO NA ORDEM
        const playNextAudio = (index) => {
            if (index >= sources.length) {
                // Fim da sequência
                lock.unlock(); 
                return;
            }

            const src = sources[index];
            const a = new Audio(getAssetUrl(src));

            // Função que avança para o próximo ou desbloqueia
            const handleComplete = () => {
                a.onended = null;
                a.onerror = null;
                playNextAudio(index + 1); // Chama a próxima iteração
            };

            a.onended = handleComplete;

            a.onerror = (e) => {
                console.error(`Erro ao carregar ou reproduzir áudio (${src}):`, e);
                handleComplete(); // Avança mesmo em erro
            };

            // 2. INÍCIO DA REPRODUÇÃO (Sincronizada)
            // Usamos .play() e .catch() aqui, mas sem um 'await' bloqueando o fluxo principal
            a.play().catch(e => {
                console.error(`Falha no play() (restrição browser) para ${src}:`, e);
                // Se o play falhar (autoplay), avançamos para o próximo áudio após 3 segundos
                setTimeout(handleComplete, 3000); 
            });
        };

        try {
            // 3. INICIA A SEQUÊNCIA
            playNextAudio(0);
            
            // ⚠️ NOTA: NÃO PODEMOS USAR AWAIT AQUI SE USARMOS playNextAudio().
            // A função playAudioSequence não retorna Promise e nem espera a conclusão.
            // Ela apenas inicia o processo assíncrono.

        } catch (error) {
            console.error("Erro ao iniciar sequência:", error);
            lock.unlock(); // Garante o desbloqueio em caso de erro inicial
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