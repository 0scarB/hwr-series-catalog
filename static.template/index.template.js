function onLoadHomePage() {
    Promise.all([
        handleRequestErrors(axios.get("/series"), {
            stderr: (err) => `Series could not be retrieved: ${err}`,
            userAlert: "Daten zu ihre Favoriten konnten nicht geladen werden.",
        }).then(res => res.data),
        handleRequestErrors(axios.get("/favorites"), {
            stderr: (err) => `Favorites could not be found: ${err}`,
            userAlert: "Ihre Favoriten konnten nicht geladen werden.",
            statusCode: 404,
        }).then(res => new Set(res.data)),
    ]).then(([series, favorites]) => {
        console.log(series, favorites);
        series.map((seriesId) => {
            initializeFavoriteBtn(favorites, seriesId);
            console.log(seriesId);
        });
    });
}

function onLoadSeriesPage(seriesId) {
    handleRequestErrors(axios.put(`/visit/${seriesId}`), {
        stderr: (err) => `Failed to increment visits for series id "${seriesId}": ${err}`,
    });

    handleRequestErrors(axios.get("/favorites").then((res) => {
        const favorites = new Set(res.data);

        initializeFavoriteBtn(favorites, seriesId);
    }), {
        stderr: (err) => `Favorites could not be found: ${err}`,
        userAlert: "Es konnte nicht ermittelt werden, ob die Serie als Favorit markiert wurde.",
        statusCode: 404,
    });
}

function initializeFavoriteBtn(favorites, seriesId) {
    const isFavorite = () => favorites.has(seriesId);

    const btnEl = document.getElementById(
        `toggle-favorite-btn-${seriesId}`
    ) || document.getElementById(
        `toggle-favorite-btn-${seriesId}2`
    );

    const updateBtnText = () => {
        btnEl.innerHTML = `Favorit ${isFavorite() ? "entfernen" : "hinzufügen"}`;
    };

    updateBtnText();

    const toggle = () => {
        const removeEventListenerOnPageHide = () => {
            btnEl.removeEventListener("click", toggle);
            window.removeEventListener("pageshow", removeEventListenerOnPageHide);
        }

        window.addEventListener("pageshow", removeEventListenerOnPageHide);

        const requestHandler = isFavorite() ? axios.delete : axios.post;

        handleRequestErrors(requestHandler(`/favorites/${seriesId}`).then(() => {
            if (isFavorite()) {
                favorites.delete(seriesId);
            } else {
                favorites.add(seriesId);
            }

            updateBtnText();
        }), {
            stderr: (err) => `Favorite could not be toggled for series id "${seriesId}": ${err}`,
            userAlert: `Die Serie konnte nicht als Favorit ${isFavorite() ? "entfernt" : "hinzugefügt"} werden.`,
        });
    };

    btnEl.addEventListener("click", toggle);
}

function handleRequestErrors(promise, options) {
    const {
        stderr,
        userAlert,
        userAlertSuffix,
        statusCode,
    } = {
        stderr: null,
        userAlert: null,
        userAlertSuffix: "\n\nBitte kontaktieren Sie unsere Entwicklerteam.",
        statusCode: null,
        ...options,
    };

    return promise.catch((err) => {
        const alertUser = (msg) => alert(`${msg}${userAlertSuffix}`);

        if (statusCode === null || err.response.status === statusCode) {
            if (stderr !== null) {
                console.error(typeof stderr === "string" ? stderr : stderr(err));
            }

            if (userAlert !== null) {
                alertUser(userAlert);
            }

            return;
        }

        console.error(`Unexpected error: ${err}`);

        alertUser("Es ist ein unerwarteter Fehler aufgetreten.");
    });
}