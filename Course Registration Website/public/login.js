/**
 * Name: Warsame Mahdi
 * Date: October 22, 2025
 * Section: CSE 154 AL
 *TA: Tia-Jane Zhang Fowler
 * This is the frontend for the login page.
 * Users can submit their username and password.
 * Users can also choose to keep their password hidden or displayed
 */
"use strict";
(function() {
  const LOGIN_API = "/account/login"
  const USERERROR = 400;
  window.addEventListener("load", init);

  /**
   * Initializes the input fields and submit button along with password view
   */
  function init() {
    let username = localStorage.getItem("username");
    if (username) {
      id("username").value = username;
    }
    if (window.localStorage.getItem("display-mode") === "dark") {
      qs("body").classList.add("darkmode");
    }
    qs("#login form").addEventListener("submit",  function(evn) {
      console.log("submitted");
      evn.preventDefault();
      login();
      qs("#login form").reset();
    });
    qs("#login div img").addEventListener("click", togglePassword);
  }

  /**
   * toggles between the password being visible or not
   */
  function togglePassword() {
    let passwordInput = id("password");
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      this.src = "img/hide-password.png"
    } else {
      passwordInput.type = "password";
      this.src = "img/show-password.png"
    }
  }

  /**
   * Logs the user in and creates cookies
   */
  async function login() {
    try {
      let userInfo = new FormData(qs("#login form"));
      console.log(userInfo);
      let response = await fetch(LOGIN_API, {method: "POST", body: userInfo});
      if (response.status !== USERERROR) {
        statusCheck(response);
        response = await response.json();
        let username = response.username;
        let name = response.name;
        let studentID = response.studentID;
        localStorage.setItem("name", name);
        localStorage.setItem("username", username);
        document.cookie = `studentID=${studentID}; Path=/; Expires=Fri, 31 Dec 9999 23:59:59 GMT`;
        document.cookie = `logged_in=true; Path=/; Expires=Fri, 31 Dec 9999 23:59:59 GMT`;
        window.location.href = "index.html";
      } else {
        id("password").value = "";
        id("error").classList.remove("hidden");
      }
    } catch (err) {
      id("error").textContent = "Something went wrong with the server. Please try again later.";
      id("sign-in").disabled = true;
      id("error").classList.remove("hidden");
    }
  }

/**
   * This function checks the status of a fetch request.
   * @param {Response} res the fetch request to check
   * @return {Response} the response if ok
   * @throws {Error} if the response is not ok
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * creates and returns a new empty DOM node representing an element of that type
   * @param {string} tagName - tag for the new node
   * @returns {object} - empty DOM node representing tagName
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} name - element ID.
   * @returns {object} - DOM object associated with id.
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * Returns first element matching selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} - DOM object associated selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns an array of elements matching the given query.
   * @param {string} query - CSS query selector.
   * @returns {array} - Array of DOM objects matching the given query.
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }
})();