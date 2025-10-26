import "../components/Footer.css"
// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer id="rodape">
     <p className="title-footer"> &copy; {new Date().getFullYear()} Anuncia-FC. Sistema desenvolvido internamente pela equipe de Prevenção de Perdas.</p> 
    </footer>
  );
}
