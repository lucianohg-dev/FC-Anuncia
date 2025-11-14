import React, { useState, useEffect, useRef, useCallback } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase.js";
import { useAudioManager } from "./AudioManagerContext";
import "../components/AgendadorHorario.css";

// Função Helper para determinar os horários automáticos do dia
const getHorariosAutomaticos = () => {
  // Obtém o dia da semana atual (0 para Domingo, 1 para Segunda, ..., 6 para Sábado)
  const diaDaSemana = new Date().getDay();

  // 1. Horários Automáticos Padrão (Segunda a Sábado: 1, 2, 3, 4, 5, 6)
  let horarios = [
    { hora: "08:00", tipo: "abertura" },
    { hora: "20:40", tipo: "fechamento" },
    { hora: "20:50", tipo: "fechamento" },
    { hora: "20:55", tipo: "fechamento" },
    { hora: "21:00", tipo: "fechamento" },
    { hora: "21:02", tipo: "fechamento" },
    { hora: "21:04", tipo: "fechamento" },
    { hora: "21:06", tipo: "fechamento" },
    { hora: "21:08", tipo: "fechamento" },
    { hora: "21:10", tipo: "fechamento" },
  ];

  // 2. Horários Específicos para Domingo (0)
  if (diaDaSemana === 0) {
    horarios = [
      { hora: "09:00", tipo: "abertura" },
      { hora: "18:40", tipo: "fechamento" },
      { hora: "18:50", tipo: "fechamento" },
      { hora: "18:55", tipo: "fechamento" },
      { hora: "19:00", tipo: "fechamento" },
      { hora: "19:02", tipo: "fechamento" },
      { hora: "19:04", tipo: "fechamento" },
      { hora: "19:06", tipo: "fechamento" },
      { hora: "19:08", tipo: "fechamento" },
      { hora: "19:10", tipo: "fechamento" },
    ];
  }
  
  // Adiciona um ID único para cada agendamento automático
  return horarios.map((a, index) => ({ ...a, id: `auto-${index}` }));
};


const AgendadorHorario = () => {
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState("");
  const [agendamentos, setAgendamentos] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [ultimoAnuncioTocado, setUltimoAnuncioTocado] = useState(null);
  const [audioLiberado, setAudioLiberado] = useState(false);

  // --- REFS Aprimorados para estabilidade do timer ---
  const agendamentosRef = useRef([]);
  const ultimoAnuncioRef = useRef(ultimoAnuncioTocado);
  const audioLiberadoRef = useRef(audioLiberado);
  
  // 🆕 Ref para agendamentos automáticos (Performance)
  const automaticosRef = useRef(getHorariosAutomaticos()); 

  // Atualiza os Refs em cada re-renderização
  agendamentosRef.current = agendamentos;
  ultimoAnuncioRef.current = ultimoAnuncioTocado;
  audioLiberadoRef.current = audioLiberado;
  // ---------------------------------------------------

  const agendamentosCollectionRef = collection(db, "agendamentos");
  const { playScheduledAnnouncement } = useAudioManager(); 

  // Efeito para habilitar o áudio (Permissão do Browser)
  useEffect(() => {
    const habilitarAudio = () => {
      // Tenta tocar um áudio mudo para contornar a restrição de autoplay
      const a = new Audio();
      a.play().catch(() => {});
      setAudioLiberado(true);
      console.log("🔓 Permissão de áudio liberada!");
      window.removeEventListener("click", habilitarAudio);
    };
    window.addEventListener("click", habilitarAudio);
    
    return () => {
      window.removeEventListener("click", habilitarAudio);
    }
  }, []);

  // Efeito para carregar agendamentos do Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(agendamentosCollectionRef, (snapshot) => {
      const agendamentosDoFirebase = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setAgendamentos(agendamentosDoFirebase);
    });
    return () => unsubscribe();
  }, []);

  // Efeito para limpar mensagem
  useEffect(() => {
    if (mensagem) {
      const timer = setTimeout(() => setMensagem(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  // Função para tocar anúncio AGORA STÁVEL (useCallback)
  // 🚨 AJUSTE CRÍTICO: Removendo 'await' para evitar o TypeError no build
  const tocarAnuncioAgendado = useCallback((tipo) => {
    // Usa o Ref para a checagem de permissão
    if (!audioLiberadoRef.current) return;

    try {
      let audioPortugues, audioIngles;

      if (tipo === "abertura") {
        audioPortugues = "/audiosPlaca/abertura.mp3";
        audioIngles = "/audiosPlaca/abertura_en.mp3";
      } else if (tipo === "fechamento") {
        audioPortugues = "/audiosPlaca/fechamento.mp3";
        audioIngles = "/audiosPlaca/fechamento_en.mp3";
      } else {
        console.warn("Tipo de áudio desconhecido:", tipo);
        return;
      }

      console.log("📢 Tocando sequência:", audioPortugues, "→", audioIngles);
      // ❌ Removido o 'await', apenas iniciamos a função assíncrona
      playScheduledAnnouncement([audioPortugues, audioIngles]); 
    } catch (error) {
      // Este catch agora só pega erros de execução antes da chamada (improvável)
      console.error("⚠ Erro ao iniciar a chamada de áudio:", error); 
    }
  }, [playScheduledAnnouncement]); // Dependência: Apenas o hook do gerenciador de áudio

  // Efeito Principal de Agendamento (Timer)
  useEffect(() => {
    
    // Função para remover agendamento (dentro do useEffect para não precisar de useCallback)
    const internalHandleRemover = async (id) => {
      try {
        const agendamentoDoc = doc(db, "agendamentos", id);
        await deleteDoc(agendamentoDoc);
        // Não é necessário setar mensagem aqui; onSnapshot do Firebase cuida do state.
      } catch (error) {
        console.error("Erro ao remover agendamento interno:", error);
        setMensagem("Erro ao remover agendamento.");
      }
    };
    
    const checarHorario = () => {
      // 1. Checagem de Áudio
      if (!audioLiberadoRef.current) {
        // console.log("Aguardando liberação de áudio..."); 
        return;
      }

      const agora = new Date();
      const horaAtual = `${agora.getHours().toString().padStart(2, "0")}:${agora
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
        
      // console.log("⏱️ Verificando:", horaAtual); // Debug opcional

      // Resetar o último anúncio tocado à meia-noite (para que os anúncios possam rodar novamente no dia seguinte)
      if (agora.getHours() === 0 && agora.getMinutes() === 0) {
        setUltimoAnuncioTocado(null);
        ultimoAnuncioRef.current = null;
        // 🆕 RECALCULA AGENDAMENTOS AUTOMÁTICOS APENAS NA VIRADA DO DIA
        automaticosRef.current = getHorariosAutomaticos(); 
      }

      // Horários Automáticos do Dia
      // ❌ getHorariosAutomaticos() foi removido daqui para melhorar a performance.
      
      // Combina agendamentos do Firebase (via Ref) e os automáticos (via Ref)
      const todosAgendamentos = [
        ...agendamentosRef.current,
        ...automaticosRef.current // ✅ Usando o Ref que só é recalculado à meia-noite
      ];

      todosAgendamentos.forEach((item) => {
        // Checagem rigorosa: 1. Hora coincide 2. Ainda não foi tocado
        if (item.hora === horaAtual && item.id !== ultimoAnuncioRef.current) {
          
          // Toca o áudio
          tocarAnuncioAgendado(item.tipo);
          
          // 2. ATUALIZAÇÃO IMEDIATA DO REF (CRUCIAL)
          // Isso impede que, se um re-render ocorrer imediatamente após o set, o áudio toque duas vezes.
          ultimoAnuncioRef.current = item.id;
          setUltimoAnuncioTocado(item.id);

          // 3. Remover agendamentos manuais (IDs que não começam com 'auto-') 12s depois
          if (!item.id.startsWith("auto-")) {
            setTimeout(() => internalHandleRemover(item.id), 12000);
          }
        }
      });
    };

    // Roda imediatamente na montagem e depois a cada segundo
    checarHorario();
    const intervalId = setInterval(checarHorario, 1000);
    
    return () => clearInterval(intervalId);
    
    // DEPENDÊNCIA OTIMIZADA: Apenas a função estável de tocar anúncio.
  }, [tocarAnuncioAgendado]); 
  
  // Funções de CRUD (Mantidas no escopo principal para interação do usuário)

  const handleAgendar = async () => {
    if (!hora || !tipo) {
      setMensagem("Digite a hora e selecione um tipo.");
      return;
    }

    const jaExiste = agendamentos.some((a) => a.hora === hora);
    if (jaExiste) {
      setMensagem("⚠ Já existe um agendamento nesse horário.");
      return;
    }

    try {
      await addDoc(agendamentosCollectionRef, { hora, tipo });
      setMensagem("✅ Agendamento salvo!");
      setHora("");
      setTipo("");
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      setMensagem("Erro ao salvar agendamento.");
    }
  };

  const handleRemover = async (id) => {
    try {
      const agendamentoDoc = doc(db, "agendamentos", id);
      await deleteDoc(agendamentoDoc);
      setMensagem("❌ Agendamento removido!");
    } catch (error) {
      console.error("Erro ao remover agendamento:", error);
      setMensagem("Erro ao remover agendamento.");
    }
  };

  return (
    <div className="agendador-wrapper">
      <div className="agendador-container">
        <h1 className="agendador-titulo">Agendar Abertura ou Fechamento</h1>
        <div className="form-box">
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="input-time"
          />
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="tipo"
                checked={tipo === "abertura"}
                onChange={() => setTipo("abertura")}
              />
              Abertura
            </label>
            <label>
              <input
                type="radio"
                name="tipo"
                checked={tipo === "fechamento"}
                onChange={() => setTipo("fechamento")}
              />
              Fechamento
            </label>
          </div>
          <button className="btn-agendar" onClick={handleAgendar}>
            + Agendar
          </button>
        </div>

        {mensagem && <p className="mensagem">{mensagem}</p>}

        <h2 className="subtitulo">Agendamentos</h2>
        <ul className="lista-agendamentos">
          {agendamentos
            .sort((a, b) => a.hora.localeCompare(b.hora))
            .map((item) => (
              <li key={item.id} className="item-agendamento">
                <span className="texto-item">
                  <b>{item.tipo}</b> • {item.hora}
                </span>
                <button
                  className="btn-remover"
                  onClick={() => handleRemover(item.id)}
                >
                  Remover
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default AgendadorHorario;