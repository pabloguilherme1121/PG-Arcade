import "./projectNetwork.css";

export default function ProjectNetwork() {
  return (
    <footer>
      <a href="#/">PG Arcade</a>
      <span>Feito para jogar. Sem cadastro.</span>
      <a href={import.meta.env.BASE_URL + "estrategia/"} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, fontWeight: 800, color: '#c9f65a' }}>PG Estratégia · 150 desafios táticos ↗</a>
      <a href={import.meta.env.BASE_URL + "estrategia/?ajuda=1"} aria-label="PG Bot · Suporte" style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, color: "#e0f6ba", fontWeight: 750 }} data-pg-bot="support"><img src={import.meta.env.BASE_URL + "brand/pg-bot/mascot.webp"} alt="" width="40" height="46" loading="lazy" decoding="async" style={{ objectFit: "contain", flex: "none" }} /><span>PG Bot · Suporte</span></a>
      <nav className="project-network-links" aria-label="Outros projetos de Pablo Guilherme">
          <a href="https://pabloguilherme1121.github.io/PG-portfolio/#rede-projetos">Todos os projetos</a>
          <a href="https://pabloguilherme1121.github.io/eleicoes-goias-2026/">Eleições Goiás</a>
          <a href="https://pabloguilherme01.github.io/observatorio/#dashboard">Observatório</a>
          <a href="https://pabloguilherme01.github.io/mapa-planaltina-go/">Mapa Planaltina</a>
          <a href="https://github.com/Pabloguilherme01/trajeto-web">Trajeto · código</a>
          <a href="https://github.com/pabloguilherme1121/elianefashion-netlify-template">Eliane Fashion · template</a>
      </nav>
    </footer>
  );
}
