// Importe BrowserRouter e Routes
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AnunciaFC from "./pages/AnunciaFC"; // O componente principal da loja
import InputPlaca from "./remote/InputPlaca"; // O componente de acesso remoto
import PrivateRoute from "./pages/PrivateRoute";

function App() {
  return (
    // Adicionamos o 'basename' para que o roteador saiba que a URL base é /FC-Anuncia/
    <BrowserRouter basename={import.meta.env.BASE_URL}>
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
    </BrowserRouter>
  );
}

export default App;

