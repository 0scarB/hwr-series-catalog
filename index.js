const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

const { HttpConvertibleError } = require("./errors");
const { PublicStore, UserStore } = require("./store");

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());

app.use(express.static("./static"));

// Middleware
// ===========================================================================

// `userId` cookie
app.use((req, res, next) => {
    if (typeof req.cookies.userId === "undefined") {
        const userId = UserStore.initializeNewUser();

        req.cookies.userId = userId;
        res.cookie("userId", UserStore.initializeNewUser());
    }

    next();
});

// API
// ===========================================================================

app.get("/favorites", handleErrors((req, res) => {
    res.send(UserStore.getFavorites(req.cookies.userId));
}));

app.get("/favorites/:seriesId", handleErrors((req, res) => {
    res.send(UserStore.isFavorite(req.cookies.userId, req.params.seriesId));
}));

app.post("/favorites/:seriesId", (req, res) => {
    UserStore.addFavorite(req.cookies.userId, req.params.seriesId);
    res.send();
});

app.delete("/favorites/:seriesId", (req, res) => {
    UserStore.removeFavorite(req.cookies.userId, req.params.seriesId);
    res.send();
});

app.put("/visit/:seriesId", handleErrors((req, _) => {
    UserStore.visitSeries(req.cookies.userId, req.params.seriesId);
    res.send();
}));

app.get("/series", handleErrors((req, res) => {
    let getter;

    if (req.query.sort === "visits") {
        getter = UserStore.getMostVisitedSeries;
    } else {
        getter = UserStore.getSeries;
    }

    res.send(getter(req.query.limit));
}));

// ===========================================================================

function handleErrors(decoratedFunc) {
    const wrapper = (req, res) => {
        try {
            return decoratedFunc(req, res);
        } catch (err) {
            if (err instanceof HttpConvertibleError) {
                console.error(err);

                res.status(err.statusCode).json(err.message);
            }

            throw err;
        }
    }

    return wrapper;
}

app.listen('8080');