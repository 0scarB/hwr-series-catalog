const fs = require("fs");

const { NotFoundError, ConflictError, NotAcceptableError } = require("./errors");

const _data = JSON.parse(fs.readFileSync("./data.json"));
const _seriesIdsFromDataArr = Object.keys(_data.shows);
const _seriesIdsFromData = new Set(_seriesIdsFromDataArr);

const PublicStore = {
    comments: [
        // {commentId: 0, seriesId: "arcane", userId: "", content: ""}
    ]
}

class _UserStore {

    constructor() {
        this.store = new Map();
    }

    initializeNewUser() {
        const userId = `Nutzer${this.store.size + 1}`;

        this.store.set(userId, {favorites: new Set(), visits: new Map()});

        return userId;
    }

    addFavorite(userId, seriesId) {
        const favorites = this._getUserData(userId).favorites;

        if (favorites.has(seriesId)) {
            throw new ConflictError(`User with id "${userId}" already has favorite "${seriesId}"`);
        }

        this._getUserData(userId).favorites.add(seriesId);
    }

    removeFavorite(userId, seriesId) {
        checkSeries(seriesId);

        const favorites = this._getUserData(userId).favorites;

        if (!favorites.has(seriesId)) {
            throw new ConflictError(
                `User with id "${userId}" cannot remove favorite "${seriesId}" that is not listed in their favorites`
            );
        }

        favorites.delete(seriesId);
    }

    isFavorite(userId, seriesId) {
        checkSeries(seriesId);

        return this._getUserData(userId).favorites.has(seriesId);
    }

    getFavorites(userId) {
        return Array.from(this._getUserData(userId).favorites);
    }

    visitSeries(userId, seriesId) {
        checkSeries(seriesId);

        const visits = this._getUserData(userId).visits;

        visits.set(seriesId, (visits.get(seriesId) || 0) + 1);
    }

    getSeries(userId, limit=1000) {
        checkUser(userId);

        const max = Math.min(limit, _seriesIdsFromDataArr.length);
        return _seriesIdsFromDataArr.slice(0, max);   
    }

    *getMostVisitedSeries(userId, limit=1000) {
        checkUser(userId);

        const sortedVisits = this._getUserData(userId).visits.entries().sort(
            ([_, seriesVisits1], [__, seriesVisits2]) => seriesVisits1 - seriesVisits2 
        );
        
        const count = 0;
        const max = Math.min(limit, visits.size());
        for (const [seriesId, seriesVisits] of sortedVisits) {
            if (count >= max) {
                return;
            }

            yield seriesId;
        }
    }

    _getUserData(userId) {
        checkUser(userId);

        return this.store.get(userId);
    }
}

const UserStore = new _UserStore();

function checkUser(userId) {
    if (!UserStore.store.has(userId)) {
        throw new NotFoundError(`No user with id "${userId}"`);
    }
}


function checkSeries(seriesId) {
    if (!_seriesIdsFromData.has(seriesId)) {
        throw new NotAcceptableError(`Series with id "${seriesId}" not in catalog`);
    }
}

module.exports = {
    PublicStore,
    UserStore,
}