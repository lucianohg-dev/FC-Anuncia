<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AnunciaFC from "./pages/AnunciaFC"; // O componente principal da loja
import InputPlaca from "./remote/InputPlaca"; // O componente de acesso remoto
import PrivateRoute from "./pages/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Home />} />

        {/* Rotas protegidas */}
        <Route path="/anunciafc" element={<PrivateRoute />}>
          <Route index element={<AnunciaFC />} />
        </Route>
        
        <Route path="/remote" element={<PrivateRoute />}>
          <Route index element={<InputPlaca />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
=======
import { useState, useEffect, useRef } from "react";
import "./App.css";

const mensagensFechamento = [
  { hora: "09:29", audio: "abertura" },
  { hora: "20:40", audio: "faltando20" },
  { hora: "20:50", audio: "faltando10" },
  { hora: "20:55", audio: "faltando5" },
  { hora: "21:00", audio: "21hora" },
  { hora: "21:01", audio: "21hora" },
  { hora: "21:03", audio: "21hora" },
  { hora: "21:05", audio: "21hora" },
];
function tocarAudio(nome, velocidade = 1) {
  return new Promise((resolve, reject) => {
    const caminho =
      import.meta.env.BASE_URL + `audios/${nome.toLowerCase()}.mp3`;
    const audio = new Audio(caminho);
    audio.playbackRate = velocidade;
    audio
      .play()
      .then(() => {
        audio.onended = resolve;
      })
      .catch(reject);
  });
}

export default function App() {
  const [placa, setPlaca] = useState("");
  const [isTocando, setIsTocando] = useState(false);
  const [avisosEnviados, setAvisosEnviados] = useState({});
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [historicoPlacas, setHistoricoPlacas] = useState([]);
  const [horariosAgendados, setHorariosAgendados] = useState([]);
  const [novoHorario, setNovoHorario] = useState("");
  const [novoAudio, setNovoAudio] = useState("");
  const [mensagemFalada, setMensagemFalada] = useState("");
  const processandoAviso = useRef(false);

  // Voz sintetizada
  const falarMensagemComVoz = () => {
    if (!mensagemFalada.trim() || isTocando) return;

    const fala = new SpeechSynthesisUtterance(mensagemFalada);
    fala.lang = "pt-BR";

    const vozes = speechSynthesis.getVoices();
    const vozNatural =
      vozes.find((v) => v.name === "Google português do Brasil") ||
      vozes.find((v) => v.lang === "pt-BR");

    if (vozNatural) fala.voice = vozNatural;

    setIsTocando(true);
    fala.onend = () => setIsTocando(false);
    fala.onerror = () => setIsTocando(false);

    speechSynthesis.speak(fala);
  };

  useEffect(() => {
    const carregarVozes = () => {
      speechSynthesis.getVoices();
    };
    speechSynthesis.onvoiceschanged = carregarVozes;
    carregarVozes();
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const dados = localStorage.getItem("historicoPlacas");
    if (dados) setHistoricoPlacas(JSON.parse(dados));

    const agendados = localStorage.getItem("horariosAgendados");
    if (agendados) setHorariosAgendados(JSON.parse(agendados));
  }, []);

  useEffect(() => {
    localStorage.setItem("historicoPlacas", JSON.stringify(historicoPlacas));
  }, [historicoPlacas]);

  useEffect(() => {
    localStorage.setItem(
      "horariosAgendados",
      JSON.stringify(horariosAgendados)
    );
  }, [horariosAgendados]);

  // Verificação fechamento e agendamentos
  useEffect(() => {
    const verificarFechamento = async () => {
      const hora = horaAtual.getHours().toString().padStart(2, "0");
      const minuto = horaAtual.getMinutes().toString().padStart(2, "0");
      const chave = `${hora}:${minuto}`;

      if (processandoAviso.current || isTocando || avisosEnviados[chave])
        return;

      const aviso = mensagensFechamento.find((m) => m.hora === chave);
      if (aviso) {
        processandoAviso.current = true;
        setAvisosEnviados((prev) => ({ ...prev, [chave]: true }));
        setIsTocando(true);
        try {
          await tocarAudio(aviso.audio);
        } finally {
          setIsTocando(false);
          processandoAviso.current = false;
        }
      }
    };

    const verificarHorario = async () => {
      const hora = horaAtual.getHours().toString().padStart(2, "0");
      const minuto = horaAtual.getMinutes().toString().padStart(2, "0");
      const chave = `${hora}:${minuto}`;

      if (processandoAviso.current || isTocando || avisosEnviados[chave])
        return;

      const agendamento = horariosAgendados.find((h) => h.hora === chave);
      if (agendamento) {
        processandoAviso.current = true;
        setAvisosEnviados((prev) => ({ ...prev, [chave]: true }));
        setIsTocando(true);
        try {
          await tocarAudio(agendamento.audio);
        } finally {
          setIsTocando(false);
          processandoAviso.current = false;
        }
      }
    };

    const intervalo = setInterval(() => {
      verificarFechamento();
      verificarHorario();
    }, 1000);

    return () => clearInterval(intervalo);
  }, [horaAtual, avisosEnviados, isTocando, horariosAgendados]);

  useEffect(() => {
    const desbloquearAudio = () => {
      const audio = new Audio();
      audio.play().catch(() => {});
      window.removeEventListener("click", desbloquearAudio);
    };
    window.addEventListener("click", desbloquearAudio);
    return () => window.removeEventListener("click", desbloquearAudio);
  }, []);

  const tocarPlacaCompleta = async (texto = placa) => {
    if (!texto || isTocando) return;
    setIsTocando(true);
    try {
      await tocarAudio("INICIO");
      for (let i = 0; i < texto.length; i++) {
        const c = texto[i];
        if (/[A-Z0-9]/.test(c)) {
          const velocidade = i >= texto.length - 4 ? 1.4 : 1;
          await tocarAudio(c, velocidade);
        }
      }
      await tocarAudio("FIM");

      if (texto === placa) {
        const registro = {
          placa: texto,
          hora: new Date().toLocaleTimeString(),
        };
        setHistoricoPlacas((prev) => [registro, ...prev]);
        setPlaca("");
      }
    } finally {
      setIsTocando(false);
    }
  };

  const chamarBrigadista = async () => {
    if (isTocando) return;
    setIsTocando(true);
    try {
      await tocarAudio("BRAVO");
    } finally {
      setIsTocando(false);
    }
  };

  const anunciarPessoaPerdida = async () => {
    if (isTocando) return;
    setIsTocando(true);
    try {
      await tocarAudio("REENCONTRO");
    } finally {
      setIsTocando(false);
    }
  };

  const limparHistorico = () => {
    if (window.confirm("Tem certeza que deseja apagar todo o histórico?")) {
      setHistoricoPlacas([]);
      localStorage.removeItem("historicoPlacas");
    }
  };

  const adicionarHorario = () => {
    if (!novoHorario || !novoAudio) return alert("Preencha todos os campos");
    setHorariosAgendados((prev) => [
      ...prev,
      { hora: novoHorario, audio: novoAudio.toUpperCase() },
    ]);
    setNovoHorario("");
    setNovoAudio("");
  };

  const removerHorario = (index) => {
    const novos = [...horariosAgendados];
    novos.splice(index, 1);
    setHorariosAgendados(novos);
  };

  return (
    <>
      <div className="layout-tri">
        {/* Coluna Esquerda: input, botões e fala */}
        <div className="coluna-esquerda">
          <h1 className="cabecalho-fixo">Anuncia-FC</h1>
          <p className="hora-atual" aria-live="polite">
            🕒 Hora atual: {horaAtual.toLocaleTimeString()}
          </p>

          <section className="placa-container" aria-label="Anunciar placa">
            <input
              type="text"
              aria-label="Digite a placa"
              value={placa}
              maxLength={7}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              placeholder="Digite a placa (ex: ABC1234)"
              disabled={isTocando}
            />
            <button
              id="btnanuncia"
              className="placa"
              onClick={() => tocarPlacaCompleta()}
              disabled={isTocando || placa.length < 7}
              title="Anunciar placa"
            >
              🔊 Anunciar
            </button>
          </section>

          <section className="acoes-rapidas" aria-label="Ações rápidas">
            <button
              className="brigadista"
              onClick={chamarBrigadista}
              disabled={isTocando}
            >
              ➕ Brigadista
            </button>
            <button
              id="Pessoa"
              onClick={anunciarPessoaPerdida}
              disabled={isTocando}
            >
              🧒 Pessoa Perdida
            </button>
          </section>

          <section
            className="fala-personalizada"
            aria-label="Falar texto personalizado"
          >
            <h2>💬 Falar Texto Personalizado</h2>
            <textarea
              rows={4}
              placeholder="Digite uma mensagem para ser falada..."
              value={mensagemFalada}
              onChange={(e) => setMensagemFalada(e.target.value)}
              disabled={isTocando}
              aria-label="Mensagem para falar"
            />
            <button
              onClick={falarMensagemComVoz}
              disabled={isTocando || !mensagemFalada.trim()}
            >
              🗣️ Falar Mensagem
            </button>
          </section>
        </div>

        {/* Coluna Centro: histórico de placas */}
        <div className="coluna-centro">
          <section
            className="historico"
            aria-label="Histórico de placas anunciadas"
          >
            <h2>📋 Placas Anunciadas</h2>
            {historicoPlacas.length > 0 && (
              <button
                id="limpaHistor"
                onClick={limparHistorico}
                disabled={isTocando}
                aria-label="Limpar todo o histórico"
              >
                🗑️ Limpar histórico
              </button>
            )}
            {historicoPlacas.length === 0 && (
              <p>Nenhuma placa anunciada ainda.</p>
            )}
            <ul>
              {historicoPlacas.map((item, index) => (
                <li key={index}>
                  <strong>{item.placa}</strong> às {item.hora}
                  <button
                    id="placaplay"
                    onClick={() => tocarPlacaCompleta(item.placa)}
                    disabled={isTocando}
                    aria-label={`Reproduzir anúncio da placa ${item.placa}`}
                  >
                    🔁 Play
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Coluna Direita: agendamentos */}
        <div className="coluna-direita">
          <section
            className="agendar-audio"
            aria-label="Agendar áudio por horário"
          >
            <h2 id="AgendarÁudio">📅 Agendar Áudio por Horário</h2>
            <div className="agendar-inputs">
              <input
                id="time"
                type="time"
                value={novoHorario}
                onChange={(e) => setNovoHorario(e.target.value)}
                disabled={isTocando}
              />

         <div className="caixa-lista">
  <h1 id="listaudio">Lista de áudios</h1>
  <u>abertura</u>
  <br />
  <u>fechamento</u>
  <br />
  <div className="agendar-linha">
    <input
      id="text"
      type="text"
      placeholder=" Nome do áudio"
      value={novoAudio}
      onChange={(e) => setNovoAudio(e.target.value)}
      disabled={isTocando}
    />
    <button
      id="agendarbt"
      onClick={adicionarHorario}
      disabled={isTocando}
    >
      ➕ Agendar
    </button>
  </div>
</div>

            </div>

            {horariosAgendados.length > 0 && (
              <ul>
                {horariosAgendados.map((item, index) => (
                  <li key={index}>
                    <span>
                      {item.hora} → {item.audio}
                    </span>
                    <button
                      onClick={() => removerHorario(index)}
                      aria-label={`Remover agendamento de ${item.hora} para áudio ${item.audio}`}
                      disabled={isTocando}
                    >
                      ❌
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Rodapé fixo */}
      <footer className="rodape">
        &copy; {new Date().getFullYear()} Anuncia-FC. Sistema desenvolvido
        internamente pela equipe de Prevenção de Perdas.
      </footer>
    </>
  );
}
>>>>>>> 62a59e325edfe376931a8777da984985a91909aa
