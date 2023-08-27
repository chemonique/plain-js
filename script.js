
 const showListContainer = document.getElementById('show-list');
 const showDetailsContainer = document.getElementById('show-details');
 const seasonSelectorContainer = document.getElementById('season-selector');
 
 const favoritesContainer = document.getElementById('favorites');
 const favoritesSortSelect = document.getElementById('favorites-sort-select');
 const favoriteEpisodesContainer = document.getElementById('favorite-episodes');
 
 const searchInput = document.getElementById('search-input');
 const sortSelect = document.getElementById('sort-select');
 
 const audio = document.getElementById('audio');
 const audioProgress = document.getElementById('audio-progress');
 
 let currentShowId = null; // To track the current show being viewed
 let favoriteEpisodes = [];
 let showsData = [];
 let playbackInfo = {};

 // Function to display loading state
 function showLoading(container) {
   container.innerHTML = 'Loading...';
 }

 // Fetch and display all shows
 function fetchAllShows() {
   showLoading(showListContainer);

   fetch('https://podcast-api.netlify.app/shows')
     .then(response => response.json())
     .then(data => {
       showsData = data;
       updateShowList();
     })
     .catch(error => {
       showListContainer.innerHTML = 'Error loading shows.';
       console.error('Error fetching shows:', error);
     });
 }


 // Fetch and display individual show details
 function fetchShowDetails(showId) {
   showLoading(showDetailsContainer);
   currentShowId = showId;

   fetch(`https://podcast-api.netlify.app/id/${showId}`)
     .then(response => response.json())
     .then(show => {
       const details = `
         <h2>${show.title}</h2>
         <p>${show.description}</p>
       
         <button onclick="fetchShowSeasons(${showId})">View Seasons</button>
                `;

       showDetailsContainer.innerHTML = details;
      
       
     })
     .catch(error => {
       showDetailsContainer.innerHTML = 'Error loading show details.';
       console.error('Error fetching show details:', error);
     });
 }

 // Fetch and display show seasons
 function fetchShowSeasons(showId) {
   showLoading(seasonSelectorContainer);

   fetch(`https://podcast-api.netlify.app/id/${showId}`)
     .then(response => response.json())
     .then(seasons=> {
       
       const seasonItems = seasons.seasons.map(season => `
         <div>
           <img src="${season.image}" alt="Season ${season.season}">
           <h3>Season ${season.season}</h3>
           <h4> ${season.title}
           <p>Episodes: ${season.episodes.length}</p>
           <button onclick="fetchSeasonEpisodes(${showId}, ${season.season})">View Episodes</button>
         </div>
       `).join('');

       seasonSelectorContainer.innerHTML = seasonItems;
     })
     .catch(error => {
       seasonSelectorContainer.innerHTML = 'Error loading seasons.';
       console.error('Error fetching seasons:', error);
     });
 }

 // Fetch and display episodes for a specific season
 function fetchSeasonEpisodes(showId, seasonNumber) {
   showLoading(showDetailsContainer);

   fetch(`https://podcast-api.netlify.app/id/${showId}`)
     .then(response => response.json())
     .then(episode => {
     const {episodes} = episode.seasons[seasonNumber-1]
       const episodeList = episodes.map(episode => `
         <div>
           <p>Episode ${episode.episode}: ${episode.title}</p>
           <audio controls>
             <source src="${episode.file}" type="audio/mpeg">
             Your browser does not support the audio element.
           </audio>
           <button onclick="toggleFavorite(${episode.episode})">Back to Show</button>
         </div>
       `).join('');
       console.log(episode)

      
       const seasonDetails = `
         <button onclick="fetchShowDetails(${currentShowId})">Back to Show</button>
         <h3>Season ${seasonNumber}</h3>
         ${episodeList}
         
       `;

       showDetailsContainer.innerHTML = seasonDetails;
     })
     .catch(error => {
       showDetailsContainer.innerHTML = 'Error loading episodes.';
       console.error('Error fetching episodes:', error);
     });
 }

 // Toggle episode as favorite
 function toggleFavorite(episode) {
   const episodeIndex = favoriteEpisodes.findIndex(favEpisode => 
     favEpisode.id === episode && favEpisode.season === episode.season
   );
   
   if (episodeIndex === -1) {
     favoriteEpisodes.push(episode);
    } 
  //else {
  //     favoriteEpisodes.push(episode);
  //   }
   console.log(favoriteEpisodes)
   updateFavoritesView();
 }

 // Update favorites view
 function updateFavoritesView() {
 const favoritesHTML = favoriteEpisodes.map(episode => `
   <div>
     <p>Show: ${episode.show}, Season: ${episode.season}</p>
     <p>Episode: ${episode.title}</p>
     <p>Date Added: ${new Date(episode.dateAdded).toLocaleString()}</p>
     <button onclick="removeFromFavorites(${episode.id}, ${episode.season})">Remove from Favorites</button>
   </div>
 `).join('');

 favoriteEpisodesContainer.innerHTML = favoritesHTML;
}

 // Add event listener for favorites sorting
 favoritesSortSelect.addEventListener('change', updateFavoritesView);

 // Remove episode from favorites
 function removeFromFavorites(episodeId, seasonNumber) {
   favoriteEpisodes = favoriteEpisodes.filter(episode => 
     episode.id !== episodeId || episode.season !== seasonNumber
   );

   updateFavoritesView();
 }

   // Update show list based on current sorting and filtering
 function updateShowList() {
   let filteredShows = showsData;

   const searchTerm = searchInput.value.trim();
   if (searchTerm !== '') {
     const fuse = new Fuse(filteredShows, {
       keys: ['title'],
     });
     filteredShows = fuse.search(searchTerm).map(result => result.item);
   }

   const sortBy = sortSelect.value;
   if (sortBy === 'title-asc') {
     filteredShows.sort((a, b) => a.title.localeCompare(b.title));
   } else if (sortBy === 'title-desc') {
     filteredShows.sort((a, b) => b.title.localeCompare(a.title));
   } else if (sortBy === 'date-asc') {
     filteredShows.sort((a, b) => new Date(a.updated) - new Date(b.updated));
   } else if (sortBy === 'date-desc') {
     filteredShows.sort((a, b) => new Date(b.updated) - new Date(a.updated));
   }

   const showItems = filteredShows.map(show => `
     <div class = 'sigleshow'>
       <img src="${show.image}" alt="${show.title}">
       <h2>${show.title}</h2>
       <p>Genres: ${show.genres.join(', ')}</p>
       <p>Seasons: ${show.seasons}</p>
       <p>Last Updated: ${new Date(show.updated).toLocaleDateString()}</p>
       <button onclick="fetchShowDetails(${show.id})">View Details</button>
     </div>
   `).join('');

   showListContainer.innerHTML = showItems;
 }

 
 // Load audio player
 function loadAudioPlayer(episode) {
   audio.src = episode.audio;
   audio.load();

   if (playbackInfo[episode.id] && playbackInfo[episode.id].currentTime) {
     audio.currentTime = playbackInfo[episode.id].currentTime;
   }

   audio.addEventListener('timeupdate', updateAudioProgress);
   audio.addEventListener('play', handleAudioPlay);
   audio.addEventListener('pause', handleAudioPause);
   audio.addEventListener('ended', handleAudioEnded);

   updateAudioProgress();
 }

 // Update audio progress
 function updateAudioProgress() {
   const currentTime = audio.currentTime;
   const duration = audio.duration;
   const formattedCurrentTime = formatTime(currentTime);
   const formattedDuration = formatTime(duration);
   audioProgress.textContent = `Progress: ${formattedCurrentTime} / ${formattedDuration}`;

   if (playbackInfo[audio.dataset.episodeId]) {
     playbackInfo[audio.dataset.episodeId].currentTime = currentTime;
   }
 }

 // Format time in MM:SS format
 function formatTime(timeInSeconds) {
   const minutes = Math.floor(timeInSeconds / 60);
   const seconds = Math.floor(timeInSeconds % 60);
   return `${minutes}:${seconds.toString().padStart(2, '0')}`;
 }

 // Handle audio play
 function handleAudioPlay() {
   window.addEventListener('beforeunload', confirmUnload);
 }

 // Handle audio pause
 function handleAudioPause() {
   window.removeEventListener('beforeunload', confirmUnload);
 }

 // Handle audio ended
 function handleAudioEnded() {
   window.removeEventListener('beforeunload', confirmUnload);
   if (playbackInfo[audio.dataset.episodeId]) {
     playbackInfo[audio.dataset.episodeId].completed = true;
   }
 }

 // Handle confirm unload
 function confirmUnload(event) {
   event.preventDefault();
   event.returnValue = '';
 }

 // Add event listeners for filtering and sorting
 searchInput.addEventListener('input', updateShowList);
 sortSelect.addEventListener('change', updateShowList);

     // Initial setup
 fetchAllShows();
