import { useState, useEffect } from 'react';
import { collection, addDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import '../remote/RemotePlaca.css';
import RemoteHeader from '../components/Headermote';

const PlacaManager = () => {
  const navigate = useNavigate();
  const [placa, setPlaca] = useState('');
  const [placasAnunciadas, setPlacasAnunciadas] = useState([]);
  const [isPrincipalOnline, setIsPrincipalOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [topAlert, setTopAlert] = useState('');

  const placasCollectionRef = collection(db, 'placas');
  const principalStatusDocRef = doc(db, 'status', 'principal_online');

  // 🔹 Monitora status do principal
  useEffect(() => {
    const unsubscribe = onSnapshot(principalStatusDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setIsPrincipalOnline(docSnap.data().online);
      } else {
        setIsPrincipalOnline(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Monitora placas existentes
  useEffect(() => {
    const unsubscribe = onSnapshot(placasCollectionRef, (snapshot) => {
      const placas = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setPlacasAnunciadas(placas);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Mostra alerta no topo
  const showTopAlert = (msg, duration = 3000) => {
    setTopAlert(msg);
    setTimeout(() => setTopAlert(''), duration);
  };

  // 🔹 Envio de placa
  const enviarPlaca = async (placaParaEnviar) => {
    if (isSending) return;

    if (!isPrincipalOnline) {
      showTopAlert('⚠ O computador principal não está logado. Não é possível enviar a placa.');
      return;
    }

    setIsSending(true);
    const dataHora = new Date().toLocaleString('pt-BR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    try {
      const placaExistente = placasAnunciadas.find(
        item => item.placa.toUpperCase() === placaParaEnviar.toUpperCase()
      );

      if (placaExistente) {
        await deleteDoc(doc(db, "placas", placaExistente.id));
      }

      await addDoc(placasCollectionRef, {
        placa: placaParaEnviar,
        timestamp: dataHora
      });

    } catch (error) {
      console.error('Erro ao enviar a placa:', error);
      showTopAlert('❌ Erro ao enviar a placa. Tente novamente.');
    } finally {
      setIsSending(false);
    }
  };

  const deletarPlaca = async (id) => {
    try {
      await deleteDoc(doc(db, 'placas', id));
    } catch (error) {
      console.error('Erro ao deletar a placa:', error);
      showTopAlert('❌ Erro ao deletar a placa.');
    }
  };

  const handleAnunciar = () => {
    if (placa.trim() === '') return;
    enviarPlaca(placa.trim().toUpperCase());
    setPlaca('');
  };

  // 🔹 Função de voltar para a página principal
  const voltarParaPrincipal = () => {
    navigate('/');
  };

  if (loading) return <div className="placa-loading">Carregando...</div>;

  return (
    <div className="remote-placa-page-wrapper">
      {topAlert && <div className="top-alert">{topAlert}</div>}

      <RemoteHeader/>

      <div className="placa-wrapper">
        <header id="placa-header" className="placa-header">
          <h1 className="placa-title">📢 Anúncio de Placas</h1>
        
        </header>

        <main id="placa-area" className="placa-container">
          {!isPrincipalOnline && (
            <p className="placa-warning">
              ⚠ O computador principal não está logado.
            </p>
          )}

          {isPrincipalOnline && (
            <section className="placa-form">
              <label className="placa-label">Digite a placa:</label>
              <div className="placa-input-box">
                <input
                  className="placa-input"
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  placeholder="Ex: ABC1234"
                  maxLength="7"
                />
                <button
                  className="placa-btn-send"
                  onClick={handleAnunciar}
                  disabled={isSending}
                >
                  Anunciar
                </button>
              </div>
            </section>
          )}

          <section className="placa-cx">
            <h2 className="placa-subtitle">Histórico</h2>
            <ul className="placa-list">
              {placasAnunciadas.map(item => (
                <li key={item.id} className="placa-item">
                  <span className="placa-text">{item.placa}</span>
                  <span className="placa-time">{item.timestamp}</span>
                  <div className="placa-actions">
                    <button
                      onClick={() => enviarPlaca(item.placa)}
                      disabled={!isPrincipalOnline || isSending}
                      className="placa-btn-play"
                    >
                      ▶
                    </button>
                    <button
                      onClick={() => deletarPlaca(item.id)}
                      disabled={isSending}
                      className="placa-btn-delete"
                    >
                      🗑
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PlacaManager;
