// Arbeit von Sven
// ---------------
const SHOW_TOP_N_MOST_VISITED = 3

let store;  // See store.js

function loadStore() {
    return axios.get("/state").then((res) => {
        store = res.data;
    });
}

function onLoadHomePage() {
    loadStore().then(() => {
        initializeMostVisited();
        initializeFavoritesBtns();
    });
}


// Arbeit von Oscar
// ----------------
function initializeFavoritesBtns() {
    for (const showId of Object.keys(store.comments)) {
        initializeShowFavoriteBtns(showId);
    }
}

function onLoadSeriesPage(showId) {
    loadStore().then(() => {
        handleRequestErrors(axios.put("/state", {
            ...store,
            visits: {
                ...store.visits,
                [store.userId]: {
                    ...store.visits[store.userId],
                    [showId]: store.visits[store.userId][showId] + 1,
                }
            }
        }).then(() => {
            store.visits[store.userId][showId]++;

            initializeShowFavoriteBtns(showId);
            initializeComments(showId);
        }), {
            stderr: (err) => `Failed to increment visits for series id "${showId}": ${err}`,
        });
    })
}

function initializeShowFavoriteBtns(showId) {
    const btnEls = document.getElementsByClassName(
        `toggle-favorite-btn-${showId}`
    );

    for (const btnEl of btnEls) {
        initializeFavoriteBtn(showId, btnEls, btnEl);
    }
}

function initializeFavoriteBtn(showId, btnEls, btnEl) {
    const isFavorite = () => store.favorites[store.userId].indexOf(showId) !== -1;

    const updateBtnText = () => {
        for (const el of btnEls) {
            el.innerHTML = `Favorit ${isFavorite() ? "entfernen" : "hinzufügen"}`;
        }
    };

    updateBtnText();

    const toggle = () => {
        const removeEventListenerOnPageHide = () => {
            btnEl.removeEventListener("click", toggle);
            window.removeEventListener("pageshow", removeEventListenerOnPageHide);
        }

        window.addEventListener("pageshow", removeEventListenerOnPageHide);

        let newFavorites;
        if (isFavorite()) {
            newFavorites = store.favorites[store.userId].filter(
                (favShowId) => favShowId !== showId,
            );
        } else {
            newFavorites = [...store.favorites[store.userId], showId];
        }

        handleRequestErrors(axios.put("/state", {
            ...store,
            favorites: {
                ...store.favorites,
                [store.userId]: newFavorites,
            }
        }), {
            stderr: (err) => `Favorite could not be toggled for series id "${showId}": ${err}`,
            userAlert: `Die Serie konnte nicht als Favorit ${isFavorite ? "entfernt" : "hinzugefügt"} werden.`,
        }).then(() => {
            store.favorites[store.userId] = newFavorites;

            updateBtnText();
        });
    };

    btnEl.addEventListener("click", toggle);
}

function initializeMostVisited() {
    const mostVisitedEl = document.getElementById("most-visited");

    mostVisitedEl.innerHTML = "";

    const mostVisitedShowIds = Object.entries(store.visits[store.userId])
        .filter(([_, visits]) => visits > 0)
        .sort(([_, visits1], [__, visits2]) => visits2 - visits1)
        .map(([showId, _]) => showId).slice(0, SHOW_TOP_N_MOST_VISITED);

    for (const showId of mostVisitedShowIds) {
        const showPreviewCardEl = document.getElementById(`preview-card-${showId}`);

        mostVisitedEl.innerHTML += showPreviewCardEl.outerHTML;
    }
}

// Arbeit von Sven
// ---------------
function initializeComments(showId) {
    const commentsEl = document.getElementById("comments");

    const addComment = (comment) => {
        const commentEl = document.createElement('div');
        commentEl.classList.add("Comments__Old__Comment");

        const userIdEl = document.createElement('div');
        userIdEl.innerText = comment.userId;
        userIdEl.classList.add("Comments__Old__Comment__Name");

        const commentContentEl = document.createElement('div');
        commentContentEl.innerText = comment.content
        commentContentEl.classList.add("Comments__Old__Comment__Content");

        commentEl.appendChild(userIdEl);
        commentEl.appendChild(commentContentEl);

        commentsEl.appendChild(commentEl);
    }

    const handleNewComment = (e) => {
        e.preventDefault();

        const newCommentEl = document.getElementById("new-comment");
        const comment = {userId: store.userId, content: newCommentEl.value};

        axios.put(
            "/state", 
            {
                ...store,
                comments: {
                    ...store.comments,
                    [showId]: [
                        ...store.comments[showId],
                        comment,
                    ]
                }
            }
        ).then(() => {
            store.comments[showId] = [...store.comments[showId], comment];

            addComment(comment);
        });
    }

    for (const comment of store.comments[showId]) {
        addComment(comment);
    }

    document.getElementById("new-comment-form").onsubmit = handleNewComment;
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