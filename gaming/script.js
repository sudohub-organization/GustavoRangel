// Reference to the collection container
const collectionDiv = document.getElementById('collection');

// Fetch games from local JSON file `games.json`
fetch('games.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch games.json');
    }
    return response.json();
  })
  .then(games => {
    generateGameCollection(games);
  })
  .catch(error => {
    collectionDiv.innerHTML = `<p class="error">An error occurred: ${error.message}</p>`;
  });

/**
 * Generate the game collection as a grid of items.
 * @param {Array} games - List of games from the JSON.
 */
function generateGameCollection(games) {
  if (!Array.isArray(games)) {
    collectionDiv.innerHTML = `<p class="error">Invalid games data</p>`;
    return;
  }

  const gameItemsHTML = games.map(game => `
    <div class="game-item">
      <img src="${game.image}" alt="${game.name}">
      <div class="details">
        <h2>${game.name}</h2>
        <p>Genre: ${game.genre}</p>
        <p>Personal Rate: ${game["Personal Rate"]}</p> 
      </div>
    </div>
  `).join('');

  collectionDiv.innerHTML = gameItemsHTML;
}

