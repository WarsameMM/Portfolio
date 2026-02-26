/**
 * Name: Bernie Liu
 * Date: 11/2/2025
 * Section: AC Makiniemi, Rasmus
 * Implements JWTs with "secret" token from the video https://www.youtube.com/watch?v=b9WlsQMGWMQ
 * Stores the username and id
 */

const {sign, verify} = require("jsonwebtoken");

/**
 * Creates a token that stores the username and id
 * @param {JSON} user - user object after a db query
 * @returns {JSON} - token with the username and id along with the cookie
 */
const createToken = (user) => {
  const accessToken = sign({
    username: user.username,
    id: user.id}, "CSE154"); //secret token; will push to final submission

  return accessToken;
};

/**
 * Checks if the token cookie is valid
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - called if the token is valid
 */
const validateToken = (req, res, next) => {
  const accessToken = req.cookies["access-token"];
  if (!accessToken) {
    res.status(400).type("text").send("User not authenticated");
  } else {
    try {
      const validToken = verify(accessToken, "CSE154");
      if (validToken) {
        req.user = validToken;
        next();
      }
    } catch (error) {
      console.log("in validateToken")
      res.status(400).json(error);
    }
  }
}

module.exports = {createToken, validateToken};

