const API_HOST = 'nba-api-free-data.p.rapidapi.com';
const API_KEY = 'd8b10f21e2msh49233c8e4ea297ep189065jsnbceab13f6248';

const defaultOptions = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': API_HOST
  }
};

function renderPlayers(players, limit = 12) {
  return players
    .slice(0, limit)
    .map(p => `
      <div class="player-card">
        <img src="${p.image ?? ''}" alt="${p.fullName ?? ''}">
        <div class="meta">
          <strong>${p.fullName ?? `${p.firstName ?? 'N/D'} ${p.lastName ?? ''}`}</strong>
          <small>Edad: ${p.age ?? 'N/D'}</small>
          <small>Altura: ${p.displayHeight ?? 'N/D'} · Peso: ${p.displayWeight ?? 'N/D'}</small>
          <small>Salario: ${p.salary ? '$' + Number(p.salary).toLocaleString() : 'N/D'}</small>
        </div>
      </div>
    `).join('');
}

async function fetchTeamPlayers(teamId) {
  const url = `https://${API_HOST}/nba-player-list?teamid=${encodeURIComponent(teamId)}`;
  const res = await fetch(url, defaultOptions);
  if (!res.ok) throw new Error(`HTTP ${res.status} (team ${teamId})`);
  const data = await res.json();
  return data.response?.PlayerList ?? [];
}

async function cargarStatsJugador() {
  const contenedor = document.getElementById('resultados');
  if (!contenedor) return;
  contenedor.innerHTML = '<p>Cargando jugadores...</p>';

  try {
    let raw = '';
    const inputIds = document.getElementById('teamIdsInput') || document.getElementById('teamId') || document.getElementById('teamIds');
    if (inputIds && inputIds.value) raw = String(inputIds.value).trim();
    if (!raw) {
      raw = prompt('Introduce team IDs separados por comas o escribe "all" para todos', '13') || '';
      raw = raw.trim();
    }
    if (!raw) {
      contenedor.innerHTML = '<p>No se proporcionaron team IDs.</p>';
      return;
    }

    let limit = 50;
    const inputLimit = document.getElementById('limitInput') || document.getElementById('limit');
    if (inputLimit && Number(inputLimit.value)) limit = Math.max(1, Number(inputLimit.value));
    else {
      const limPrompt = prompt('Límite total de jugadores a mostrar', String(limit));
      if (limPrompt) limit = Math.max(1, Number(limPrompt));
    }

    let teamIds = [];
    if (raw.toLowerCase() === 'all') {
      teamIds = Array.from({ length: 30 }, (_, i) => String(i + 1));
    } else {
      teamIds = raw.split(',').map(s => s.trim()).filter(Boolean);
    }

    const promises = teamIds.map(id => fetchTeamPlayers(id).catch(() => []));
    const results = await Promise.all(promises);

    const map = new Map();
    for (const list of results) {
      for (const p of list) {
        if (!p || !p.id) continue;
        if (!map.has(p.id)) map.set(p.id, p);
      }
    }
    const players = Array.from(map.values());

    if (players.length === 0) {
      contenedor.innerHTML = '<p>No se encontraron jugadores para los equipos indicados.</p>';
      return;
    }

    contenedor.innerHTML = `<div class="players-grid">${renderPlayers(players, limit)}</div>`;
  } catch (err) {
    console.error(err);
    const contenedorErr = document.getElementById('resultados');
    if (contenedorErr) contenedorErr.innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnCargar');
  if (btn) btn.addEventListener('click', cargarStatsJugador);
});