import React, { useState } from "react";
// 💡 Importa getAssetUrl para resolver o caminho do áudio base corretamente
import { useAudioManager, getAssetUrl } from "./AudioManagerContext"; 
import "./AvisoPessoaPerdida.css";

export default function AvisoPessoaPerdida() {
    const [pessoaPerdida, setPessoaPerdida] = useState("");
    const [pessoaEsperando, setPessoaEsperando] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);

    const { lowerVolumeTemporarily, restoreVolume } = useAudioManager();

    const anunciar = async () => {
        if (!pessoaPerdida.trim() || !pessoaEsperando.trim()) {
            alert("Preencha os dois campos para anunciar!");
            return;
        }

        setIsPlaying(true);

        try {
            // 🔉 1. ABAIXA O VOLUME DA MÚSICA DE FUNDO
            lowerVolumeTemporarily(); 
            
            // 🎼 2. Carrega o áudio base usando o caminho corrigido
            // 💡 Substituído: import.meta.env.BASE_URL por getAssetUrl
            const audioBase = new Audio(getAssetUrl("audiosPlaca/reencontro.mp3")); 
            await audioBase.play();

            audioBase.onended = async () => {
                const texto = `Atenção! ${pessoaPerdida}, favor se dirigir à lista de casamentos na entrada da loja. ${pessoaEsperando} está aguardando você aqui.`;
                const utterance = new SpeechSynthesisUtterance(texto);
                utterance.lang = "pt-BR";
                utterance.rate = 1;
                utterance.pitch = 1;
                utterance.volume = 1;

                const allVoices = window.speechSynthesis.getVoices();
                // Lógica de seleção de voz
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

                // Lógica para garantir que a voz seja carregada antes de falar
                if (speechSynthesis.getVoices().length === 0) {
                    speechSynthesis.onvoiceschanged = () => speechSynthesis.speak(utterance);
                } else {
                    speechSynthesis.speak(utterance);
                }

                // 🔊 3. RESTAURA O VOLUME DEPOIS QUE O TEXT-TO-SPEECH TERMINAR
                utterance.onend = () => {
                    restoreVolume();
                    setIsPlaying(false);
                    setPessoaPerdida("");
                    setPessoaEsperando("");
                };
            };
        } catch (error) {
            console.error("Erro ao anunciar:", error);
            // 💡 GARANTIA: Restaura o volume mesmo em caso de erro
            restoreVolume(); 
            setIsPlaying(false);
        }
    };

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
                />
                <input
                    type="text"
                    placeholder="Quem está esperando"
                    value={pessoaEsperando}
                    onChange={(e) => setPessoaEsperando(e.target.value)}
                    className="aviso-input"
                />
            </div>

            <button
                onClick={anunciar}
                disabled={isPlaying}
                className={`aviso-button ${isPlaying ? "disabled" : ""}`}
            >
                {isPlaying ? "Anunciando..." : "Anunciar"}
            </button>
        </div>
    );
}