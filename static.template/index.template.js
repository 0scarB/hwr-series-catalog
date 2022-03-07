const USER_DATA_ALERT_MSG = "Ihre Daten könnten leider nicht von das Server aufgerufen werden. Bitten wenden Sie uns an unsere Entwicklerteam."


function markFavorite(seriesId) {
    const btnEl = document.getElementById(`mark-favorite-btn-${seriesId}`);

    axios.get(`/favorites/${seriesId}`)
        .then((res) => {
            console.log(seriesId, res);
            const isFavorite = res.data;

            const requestHandler = isFavorite ? axios.default : axios.post;

            const germanActionName = `Favorite ${isFavorite ? "entfernen" : "hinzufügen"}`;

            requestHandler(`/favorites/${seriesId}`)
                .then(() => {
                    btnEl.innerText = germanActionName;
                })
                .catch(() => {
                    alert(`"${germanActionName}" ist fehlgeschlagen!`);
                });
        })
        .catch(() => {
            alert(USER_DATA_ALERT_MSG);
        });
}