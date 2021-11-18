import {findParent, on, setProp, dom, setAttr, hasClass} from "saladbar";
import {chain, curry, pipe} from "ramda";

// utility function to push out some ugly details
const stringify = (obj = {}) => JSON.stringify(obj, null, 2);

// TODO make safe like saladbar
// TODO accept an Eiter(el) too
const getAttribute = curry((attributeName, el) => el.getAttribute(attributeName));
// TODO take an Either
const cloneElement = (el) => el.cloneNode();

const writeToOutput = (data = {}) =>
  setProp("innerHTML", stringify(data), "#pre-output");

const logAndPass =
  (msg = "") =>
    (value) => {
      console.log(msg, value);
      return value;
    };

// note that 'serialize' needs a 'form' element
// const addSet = pipe(
//   dom("#fieldset-set"),
//   logAndPass("post-dom"),
//   // writeToOutput
// );

/* ------------- side effects for runtime below ---------------- */

on(
  "click",
  (evt) => {
    // ALGO:
    // 1. get a specific parent for the clicked button (.grid-row)
    // 2. get the second .cell in the row and append a child
    //addSet(); // DOM element to grab data from
    // const findGridRow = findParent(hasClass(".grid-row"));
    // findGridRow(dom(".fieldset-set")).map(console.log);

    // const parent = findParent(evt.target);
    // logAndPass("evt")(setAttr("data-joehoe", "66")(dom(".fieldset-set")))

    // works:
    // const newEl = pipe(dom, chain(cloneElement))(".fieldset-set");
    // console.log(newEl);
  },
  ".btn-add-set" // DOM element to 'click' on
);