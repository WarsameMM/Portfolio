/**
 * Name: Warsame Mahdi
 * Date: October 22, 2025
 * Section: CSE 154 AL
 *TA: Tia-Jane Zhang Fowler
 * This is the JS for the course page.
 * It lists the courses and allows the user to search and check filters
 */
"use strict";
(function() {
  const COURSE_API = "/search";
  window.addEventListener("load", init);

  /**
   * initializes the filters, search bar, and the course lists
   */
  async function init() {
    console.log(document.cookie);
    console.log(localStorage);
    loggedIn();
    await addCourses();
    if (window.localStorage.getItem("display-mode") === "dark") {
      qs("body").classList.add("darkmode");
      qs("#toggle-darkmode input").checked = true;
    }
    let classCart = localStorage.getItem("classes");

    if (classCart !== null && classCart !== "[]" && classCart !== "{}") {

      classCart = JSON.parse(classCart);
      console.log(classCart)
      classCart.forEach((courseId) => {
        let course = id(courseId);
        let button = course.querySelector(".addBtn");
        button.textContent = "Remove Course";
        button.removeEventListener("click", addToCart);
        button.addEventListener("click", removeFromCart);
      });
    } else {
      localStorage.setItem("classes", "[]");
    }
    qs("#home img").addEventListener("click", () => {
      window.location.href = "account.html";
    });
    qs("#view img").addEventListener("click", toggleView);
    qsa("input[name='filter']").forEach((checkbox) => {
      checkbox.addEventListener("change", filterClasses);
    });
    qs(".bar").addEventListener("submit", search);
  }

  /**
   * Grab all courses from the server
   */
  async function addCourses() {
    try {
      handleError("");
      let courses = await fetch(COURSE_API);
      await statusCheck(courses);
      courses = await courses.json();
      console.log(courses);
      courses.forEach(course => {
        id("course-view").appendChild(createCourse(course));
      })
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Creates a course card that can be added to the cart and have more details shown
   * @param {JSON} course - the course object to make the card from
   * @returns {DOM element} - a course container with information and buttons
   */
  function createCourse(course) {
    let courseContainer = gen("article");
    courseContainer.id = course.id
    let types = []
    course.types.forEach(creditType => {
      courseContainer.classList.add(creditType);
      let creditFilter = qs(`input[name="filter"][value="${creditType}"]`);
      types.push(creditFilter.nextElementSibling.textContent.trim());
    });
    types = types.join(", ");
    console.log(types);
    courseContainer.classList.add(course.department);
    let addBtn = gen("button");
    if (id("login-btn").classList.contains("hidden")) {
      addBtn.addEventListener("click", addToCart);
    } else {
      addBtn.classList.add("hidden");
    }
    addBtn.classList.add("addBtn");
    if (course.seats_taken >= course.max_seats) {
      addBtn.disabled = true;
    }
    addBtn.textContent = 'Add Course';
    let courseName = gen("h3");
    courseName.textContent = course.department + " " + course.code
    courseContainer.append(addBtn);
    courseContainer.append(courseName);
    courseContainer.append(courseDetails(" Course title: ", course.name));
    courseContainer.append(courseDetails("Course ID: ", course.id));
     courseContainer.append(courseDetails(" Credits: ", course.credits));
     let time = '';
     course.days.forEach(day =>{
      time += day
     });
    time += ' ' + convertTime(course.time_start) + " - " + convertTime(course.time_end);
    courseContainer.append(courseDetails(" Time: ", time));
    let detailBtn = gen("button");
    detailBtn.classList.add("detailbtn");
    detailBtn.textContent = "View Details"
    detailBtn.addEventListener("click", toggleDetails);
    courseContainer.append(detailBtn);
    let courseDesc = gen("div");
    courseDesc.classList.add("details", "hidden");
    let details = gen('p');
    let professorName = course.professor_first + " " + course.professor_last
    courseDesc.append(courseDetails(" Professor: ", professorName));
    let seats = course.seats_taken + " out of " + course.max_seats;
    courseDesc.append(courseDetails( " Seats: ", seats));
    courseDesc.append(courseDetails(" Gen Edu Req: ", types));
    details.textContent =  "Description: " + course.description;
    courseDesc.append(details);
    courseContainer.append(courseDesc);
    return courseContainer;
  }

  /**
   * Takes an integer between 0 and 2400 and converts it to HH:MM AM/PM
   * @param {int} time - integer in military time
   * @returns {String} - formatted time
   */
  function convertTime(time) {
    let meridian;
    if (time >= 1300) {
     time -= 1200;
     meridian = "PM"
    } else {
      meridian = "AM"
    }
    let hours = Math.floor(time / 100);
    let minutes = time % 100
    return `${hours}:${minutes.toString().padStart(2, "0")}${meridian}`
  }

  /**
   * helper to add details to a course
   * @param {String} name - Left hand side; describes the detail
   * @param {String} detail - description on RHS
   * @returns {element} - element to add to the course card
   */
  function courseDetails(name, detail) {
    let title = gen("span");
    title.textContent = name;
    let info = gen("p");
    info.append(title);
    info.textContent += detail;
    return info
  }

  /**
   * checks if the user is logged in
   */
  function loggedIn() {
    let cookies = document.cookie;
    if (cookies === null || !cookies.includes("logged_in=true")) {
      id("login-btn").addEventListener("click", () => {
        window.location.href = "login.html";
      });
      qs("#toggle-darkmode input").addEventListener("change", toggleDarkMode);
      qs("#home article").classList.remove("hidden");
      qs("#home img").classList.add("hidden");
      id("login-btn").classList.remove("hidden");
    }
  }

  /**
   * switches between light mode and dark mode
   */
  function toggleDarkMode() {
    if (!qs("body").classList.contains("darkmode")) {
    window.localStorage.setItem("display-mode", "dark");
    } else {
    window.localStorage.setItem("display-mode", "light");
    }
    qs("body").classList.toggle("darkmode");
  }

  /**
   * Adds a course to the user's cart. Changes to removeFromCart when clicked
   */
  function addToCart() {
    let classCart = localStorage.getItem("classes");
    if (classCart === null) {
      classCart = [];
    } else {
      classCart = JSON.parse(classCart);
    }
    classCart.push(this.parentNode.id);
    localStorage.setItem("classes", JSON.stringify(classCart));
    this.textContent = "Remove Course";
    this.removeEventListener("click", addToCart);
    this.addEventListener("click", removeFromCart);
  }

  /**
   * Removes a course from the user's cart. Changes to addToCart when clicked
   */
  function removeFromCart() {
    let classCart = localStorage.getItem("classes");
    classCart = new Set(JSON.parse(classCart));
    classCart.delete(this.parentNode.id);
    classCart = Array.from(classCart);
    localStorage.setItem("classes", JSON.stringify(classCart));
    this.textContent = "Add Course";
    this.removeEventListener("click", removeFromCart);
    this.addEventListener("click", addToCart);
  }

  /**
   * filters classes by attributes such as department or credit type
   */
  function filterClasses() {
    let classes = qsa("#classes section article");
    if (this.checked) {
      classes.forEach((course) => {
        if (!course.classList.contains(this.value)) {
          course.classList.add("hidden");
        }
      });
    } else {
      let checked = [];
      qsa("input[name='filter']").forEach((checkbox) => {
        if (checkbox.checked) {
          checked.push(checkbox.value);
        }
      });
      if (checked.length > 0) {
        classes.forEach((course) => {
          if (includesAll(checked, course.classList)) {
            course.classList.remove("hidden");
          }
        });
      } else {
        classes.forEach((course) => {
          course.classList.remove("hidden");
        });
      }
    }
    if (Array.from(classes).every((course) => course.classList.contains("hidden"))) {
      if (!qs("#course-view h2")) {
        let h2 = gen("h2")
        h2.textContent = "We couldn't find anything matching your search.";
        id("course-view").appendChild(h2);
      }
    } else {
      if (qs("#course-view h2")) {
        qs("#course-view h2").remove();
      }
    }
  }

  /**
   * checks if a class has the checked filters or not
   * @param {Array} filtered - list of active filters
   * @param {List} attributes - list of attributes a class has
   * @returns {boolean} - whether a class has all of the filters or not
   */
  function includesAll(filtered, attributes) {
    attributes = new Set(attributes);
    for (let filter of filtered) {
      if (!attributes.has(filter)) return false;
    }
    return true;
  }

  /**
   * shows or hides additional details like the full class description
   */
  function toggleDetails() {
    let details = this.nextElementSibling;
    if (this.textContent === "View Details") {
      this.textContent = "Hide Details";
    } else {
      this.textContent = "View Details";
    }
    details.classList.toggle("hidden");
  }

  /**
   * changes the view for the classes between list (top to bottom) and grid
   */
  function toggleView() {
    let classView = qs("#classes section");
    if (classView.classList.contains("list")) {
      let img = qs("#view img");
      img.src = "img/list-view.png";
      img.alt = "list view icon";
      qs("#view p").textContent = " Toggle List View";
    } else {
      let img = qs("#view img");
      img.src = "img/grid-view.png";
      img.alt = "grid view icon";
      qs("#view p").textContent = " Toggle Grid View";
    }
    classView.classList.toggle("list");
    classView.classList.toggle("grid");
  }

  /**
   * Takes the search query and additional paramters and gets the classes that fit the criteria
   * @param {Eveent} event - click event to prevent reloading the page
   */
  async function search(event) {
    event.preventDefault();
    let input = {};
    let searchQuery = [];

    let array = id("search-input").value.split(" ");
    for (let e of array) {
      console.log(e);
      if (e.includes("=")) {
        let param = e.split("=");
        console.log(param)
        input[param[0]] = param[1];
      } else {
        searchQuery.push(e);
      }
    }
    console.log(searchQuery)
    input["search"] = searchQuery.join(" ");
    console.log(input["search"]);
    console.log("/search" + "?" + new URLSearchParams(input).toString())
    try {
      handleError("");
      let courses = await fetch("/search" + "?" + new URLSearchParams(input).toString());
      await statusCheck(courses);
      courses = await courses.json();
      id("course-view").innerHTML = "";
      for (let c of courses) {
        id("course-view").appendChild(createCourse(c));
      }
      if (courses.length === 0) {
        let h2 = gen("h2")
        h2.textContent = "We couldn't find anything matching your search.";
        id("course-view").appendChild(h2);
      }
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Displays the error at the top
   * @param {String} error - message to display
   */
  function handleError(error) {
    id("error").textContent = error;
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
   * This function creates and returns an HTML element matching the provided type.
   * @param {string} query the type of element being created
   * @returns {Element} the element created
   */
  function gen(query) {
    return document.createElement(query);
  }

  /**
   * shortcut for getElementbyId.
   * @param {string} id the id of the element to get
   * @return {Element} the element with the given id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * shortcut for querySelector.
   * @param {string} selector the selector to query the first instance of.
   * @return {Element} the first element that matches the selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * shortcut for querySelectorAll.
   * @param {string} selector the selector to query all instances of.
   * @return {NodeList} all elements that match the selector.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }
})();