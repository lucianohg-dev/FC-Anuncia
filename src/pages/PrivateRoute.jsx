import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { auth, db } from "../config/firebase.js";
import { doc, getDoc } from "firebase/firestore";

const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation(); // 🔹 sabe qual rota está sendo acessada

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);

        // 🔹 busca o tipo do usuário no Firestore
        try {
          const userDoc = await getDoc(doc(db, "usuarios", user.uid));
          if (userDoc.exists()) {
            setUserType(userDoc.data().tipo);
          } else {
            setUserType(null);
          }
        } catch (error) {
          console.error("Erro ao obter tipo de usuário:", error);
          setUserType(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserType(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // 🔒 Se não estiver autenticado, vai para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🔐 Controle de acesso por tipo
  if (userType === "remoto" && location.pathname.startsWith("/anunciafc")) {
    // Usuário remoto tentando acessar o sistema principal
    return <Navigate to="/remote" replace />;
  }

  if (userType === "principal" && location.pathname.startsWith("/remote")) {
    // Usuário principal tentando acessar a tela remota
    return <Navigate to="/anunciafc" replace />;
  }

  // ✅ Se tudo certo, libera o conteúdo protegido
  return <Outlet />;
};

export default PrivateRoute;
