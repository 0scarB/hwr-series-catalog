// Arbeit von Sven
// ---------------
const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

const { HttpConvertibleError } = require("./errors");
const store = require("./store");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());

app.use(express.static("./static"));


// Arbeit von Oscar
// ----------------

// Middleware
// ===========================================================================

// `userId` cookie
app.use((req, res, next) => {
    if (typeof req.cookies.userId === "undefined") {
        const userId = store.addUser();

        req.cookies.userId = userId;
        res.cookie("userId", userId);
    } else if (typeof store.favorites[req.cookies.userId] === "undefined") {
        store.addUser(req.cookies.userId);
    }

    next();
});

// Arbeit von Sven
// ---------------

// API
// ===========================================================================

// Yes this is inefficient, but it's simple
// "Premature optimization is the root of all evil" - Donald Knuth
app.get("/state", (req, res) => {
    res.json({...store, userId: req.cookies.userId});
})

app.put("/state", handleErrors((req, res) => {
    store.update(req.body);

    res.send();
}))

// ===========================================================================

// Arbeit von Oscar
// ----------------

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