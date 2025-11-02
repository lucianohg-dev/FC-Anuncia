import React, { useState } from "react";
// 💡 Importa as funções necessárias do contexto
import { useAudioManager, getAssetUrl } from "./AudioManagerContext"; 
import "./AvisoPessoaPerdida.css";

export default function AvisoPessoaPerdida() {
    const [pessoaPerdida, setPessoaPerdida] = useState("");
    const [pessoaEsperando, setPessoaEsperando] = useState("");
    // Estado local para o spinner do botão deste componente
    const [isPlayingLocal, setIsPlayingLocal] = useState(false); 

    // 🔑 Importa o estado global (isAnnouncing) e a função de controle
    const { isAnnouncing, requestAnnouncement } = useAudioManager();

    const anunciar = async () => {
        if (!pessoaPerdida.trim() || !pessoaEsperando.trim()) {
            alert("Preencha os dois campos para anunciar!");
            return;
        }

        // 🚨 PASSO CRÍTICO 1: Tenta iniciar o anúncio e bloquear outros setores
        const announcementControl = requestAnnouncement();
        
        // Se a requisição foi bloqueada (success: false), sai e avisa
        if (!announcementControl.success) {
            alert(announcementControl.message);
            return;
        }

        const { unlock } = announcementControl; // Função para liberar o sistema
        setIsPlayingLocal(true); 

        try {
            // O volume de fundo já foi abaixado por requestAnnouncement()
            
            // 🎼 1. Carrega o áudio base (Reencontro)
            const audioBase = new Audio(getAssetUrl("audiosPlaca/reencontro.mp3")); 
            await audioBase.play();

            audioBase.onended = () => {
                const texto = `Atenção! ${pessoaPerdida}, favor se dirigir à lista de casamentos na entrada da loja. ${pessoaEsperando} está aguardando você aqui.`;
                const utterance = new SpeechSynthesisUtterance(texto);
                utterance.lang = "pt-BR";
                utterance.rate = 1;
                // ... (Configurações de pitch, volume e lógica de seleção de voz aqui) ...

                const allVoices = window.speechSynthesis.getVoices();
                const vozMasculina =
                    allVoices.find(
                        (v) =>
                            v.lang === "pt-BR" &&
                            (v.name.toLowerCase().includes("male") ||
                             v.name.toLowerCase().includes("brasil") ||
                             v.name.toLowerCase().includes("ricardo") ||
                             v.name.toLowerCase().includes("google brasileiro"))
                    ) || allVoices.find((v) => v.lang === "pt-BR");

                if (vozMasculina) utterance.voice = vozMasculina;

                if (speechSynthesis.getVoices().length === 0) {
                    speechSynthesis.onvoiceschanged = () => speechSynthesis.speak(utterance);
                } else {
                    speechSynthesis.speak(utterance);
                }

                // 🚨 PASSO CRÍTICO 2: RESTAURA O VOLUME E DESBLOQUEIA O SISTEMA
                utterance.onend = () => {
                    unlock(); // Desbloqueia o sistema globalmente (isAnnouncing = false) e restaura volume
                    setIsPlayingLocal(false);
                    setPessoaPerdida("");
                    setPessoaEsperando("");
                };
            };
        } catch (error) {
            console.error("Erro ao anunciar:", error);
            // 💡 GARANTIA: Se ocorrer um erro, desbloqueia o sistema imediatamente
            unlock(); 
            setIsPlayingLocal(false);
        }
    };

    // 🔑 DESABILITAÇÃO: O botão é desabilitado se este componente está tocando (isPlayingLocal)
    // OU se qualquer outro setor estiver anunciando (isAnnouncing)
    const isDisabled = isAnnouncing || isPlayingLocal; 
    
    return (
        <div className="aviso-card">
            <h2 className="aviso-titulo">Aviso de Pessoa Perdida</h2>

            <div className="aviso-inputs">
                <input
                    type="text"
                    placeholder="Nome da pessoa perdida"
                    value={pessoaPerdida}
                    onChange={(e) => setPessoaPerdida(e.target.value)}
                    className="aviso-input"
                    disabled={isDisabled} // Desabilita input durante o anúncio
                />
                <input
                    type="text"
                    placeholder="Quem está esperando"
                    value={pessoaEsperando}
                    onChange={(e) => setPessoaEsperando(e.target.value)}
                    className="aviso-input"
                    disabled={isDisabled} // Desabilita input durante o anúncio
                />
            </div>

            <button
                onClick={anunciar}
                disabled={isDisabled}
                className={`aviso-button ${isDisabled ? "disabled" : ""}`}
            >
                {isDisabled ? "Aguarde..." : "Anunciar"}
            </button>
        </div>
    );
}