const url = 'https://api-nba-v1.p.rapidapi.com/players/statistics?game=8133';
const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': 'd8b10f21e2msh49233c8e4ea297ep189065jsnbceab13f6248',
    'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com'
  }
};

async function cargarStatsJugador() {
  const contenedor = document.getElementById('resultados');
  contenedor.innerHTML = '<p>Cargando estadísticas...</p>';

  try {
    const res = await fetch(url, options);
    const data = await res.json();

    if (!data.response || data.response.length === 0) {
      contenedor.innerHTML = '<p>No hay datos disponibles.</p>';
      return;
    }

    const stats = data.response[0];
    contenedor.innerHTML = `
      <h3>${stats.player.firstname} ${stats.player.lastname}</h3>
      <p>Puntos: ${stats.points}</p>
      <p>Rebotes: ${stats.totReb}</p>
      <p>Asistencias: ${stats.assists}</p>
    `;
  } catch (err) {
    contenedor.innerHTML = '<p>No se pudieron cargar los datos. Intenta más tarde.</p>';
    console.error(err);
  }
}