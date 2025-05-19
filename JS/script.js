document.addEventListener('DOMContentLoaded', function() {
    // Térkép inicializálása
    const map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Adatok lekérése és megjelenítése
    Promise.all([
        fetch('https://jsonplaceholder.typicode.com/posts').then(res => res.json()),
        fetch('https://jsonplaceholder.typicode.com/users').then(res => res.json())
    ])
    .then(([posts, users]) => {
        // Felhasználók megjelenítése térképen
        displayUsersOnMap(users, map);
        
        // Bejegyzések csoportosítása és megjelenítése
        displayPostsByUser(posts, users);
    })
    .catch(error => {
        console.error('Hiba történt az adatok lekérésekor:', error);
    });
});

function displayUsersOnMap(users, map) {
    let bounds = [];
    
    users.forEach(user => {
        const { lat, lng } = user.address.geo;
        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindTooltip(user.name, { permanent: false, direction: 'top' });
        bounds.push([lat, lng]);
    });
    
    if (bounds.length > 0) {
        map.fitBounds(bounds);
    }
}

function displayPostsByUser(posts, users) {
    const container = document.getElementById('user-posts-container');
    
    // Csoportosítás felhasználó szerint
    const postsByUser = {};
    posts.forEach(post => {
        if (!postsByUser[post.userId]) {
            postsByUser[post.userId] = [];
        }
        postsByUser[post.userId].push(post);
    });
    
    // Felhasználók nevének összekapcsolása az ID-val
    const usersById = {};
    users.forEach(user => {
        usersById[user.id] = user.name;
    });
    
    // HTML generálása
    let html = '';
    
    for (const userId in postsByUser) {
        const userName = usersById[userId] || Felhasználó ${userId};
        const userPosts = postsByUser[userId];
        
        html += `
            <div class="user-posts">
                <h3 class="user-name">${userName}</h3>
                <div class="posts-container">
                    ${userPosts.map(post => `
                        <div class="post-card">
                            <div class="post-title">${post.title}</div>
                            <div class="post-body">${post.body}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}
