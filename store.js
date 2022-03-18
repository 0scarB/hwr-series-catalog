
// Arbeit von Sven
// ---------------
const fs = require("fs");

const { NotFoundError, ConflictError, NotAcceptableError } = require("./errors");

const data = JSON.parse(fs.readFileSync("./data.json"));
const showIds = Object.keys(data.shows);
let userCount = 0;

class Store {
    comments = {};   // { [showId: string]: { userId: string, content: string }[] }
    favorites = {};  // { [userId: string]: string[] } where Set<string> is a set of showIds
    visits = {};     // { [userId: string]: { [showId: string]: int } }

    constructor() {
        for (const showId of showIds) {
            this.comments[showId] = [];
        }
    }

    update(newStore) {
        validateNewStore(this, newStore)

        this.comments = newStore.comments;
        this.favorites = newStore.favorites;
        this.visits = newStore.visits;
    }

    addUser(id = undefined) {
        const userId = id || `Nutzer${userCount + 1}`;

        this.favorites[userId] = [];

        const visits = {}
        for (const showId of showIds) {
            visits[showId] = 0;
        }
        this.visits[userId] = visits;

        userCount++;

        return userId;
    }
}

function validateNewStore(oldStore, newStore) {
    validateNewComments(oldStore.comments, newStore.comments);
    validateNewFavorites(oldStore.favorites, newStore.favorites);
    validateNewVisits(oldStore.visits, newStore.visits);
}

function validateNewComments(oldComments, newComments) {
    // TBD
}

function validateNewFavorites(oldFavorites, newFavorites) {
    // TBD
}

function validateNewVisits(oldVisits, newVisits) {
    // TBD
}

module.exports = new Store();