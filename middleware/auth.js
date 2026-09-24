const { validateToken } = require("../services/auth");

function checkForAuthentication(cookieName) {

    return (req, res, next) => {

        const tokenCookieValue = req.cookies[cookieName];

        if (!tokenCookieValue) {
            return next();
        }

        try {
            const userPayload = validateToken(tokenCookieValue);

            req.user = userPayload;
            res.locals.user = userPayload;
        } catch (error) {
            res.locals.user = null;
        }

        next();
    };
}

module.exports = {
    checkForAuthentication,
};