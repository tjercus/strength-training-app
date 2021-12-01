import { on, dom, setAttr, getProp } from "saladbar";
import { compose, cond, pipe } from "ramda";
import { v4 as uuid } from "uuid";
import Either from "data.either";
//
import {
  appendChild,
  convertFragmentToElement,
  eventTargetHasClass,
  removeElement,
} from "./domUtils";

// debug function to put in a composition
const logAndPass =
  (msg = "") =>
  (value) => {
    console.log(msg, value);
    return value;
  };

/* --------------------------- application specific utils ------------------------- */

/**
 * Add a new blank workout Set to the cell of Sets
 * addSetToCell :: string -> Either Error DOM Element
 */
const addSetToCell = (rowId) =>
  dom("#template-cell-sets").map((templateFragment) => {
    dom(`div[data-row-id='${rowId}'] .cell-sets`).map((sets) => {
      appendChild(sets, convertFragmentToElement(templateFragment));
      // TODO these next operations depend timewise on appendChild
      const newId = uuid();
      setAttr("data-set-id", newId, dom(".fieldset-set:last-child", sets));
      setAttr(
        "value",
        newId,
        dom(".fieldset-set:last-child .btn-delete-set", sets)
      );
    });
  });

const deleteSetFromCell = (setId) =>
  dom(`.cell-sets .fieldset-set[data-set-id='${setId}']`).map(removeElement);

const addExercise = () => {
  dom("#template-grid-row").map((templateFragment) => {
    dom(".grid-body").map((gridBody) => {
      appendChild(gridBody, convertFragmentToElement(templateFragment));
      const newId = uuid();
      setAttr("data-row-id", newId, dom("div.grid-row:last-child", gridBody));
      setAttr(
        "value",
        newId,
        dom("div.grid-row:last-child .btn-add-set", gridBody)
      );
      setAttr(
        "value",
        newId,
        dom("div.grid-row:last-child .btn-delete-exercise", gridBody)
      );
      addSetToCell(newId);
    });
  });
};

const deleteExercise = (rowId) =>
  dom(`div[data-row-id='${rowId}']`).map(removeElement);

/* ---------------------- side effects for runtime below ------------------------ */

// inject first Exercise (with one Set) in the DOM (from a template)
addExercise();

/**
 * this click handler handles all clicks on the .grid,
 * using event-bubbling to handle clicks on buttons added at runtime
 */
on(
  "click",
  compose(
    cond([
      [
        eventTargetHasClass("btn-add-set"),
        (evtEither) => evtEither.map((evt) => addSetToCell(evt.target.value)),
      ],
      [
        eventTargetHasClass("btn-delete-set"),
        (evtEither) =>
          evtEither.map((evt) => deleteSetFromCell(evt.target.value)),
      ],
      [
        eventTargetHasClass("btn-delete-exercise"),
        (evtEither) => evtEither.map((evt) => deleteExercise(evt.target.value)),
      ],
      [() => true, logAndPass("unhandled click evt on .grid")],
    ]),
    Either.fromNullable
  ),
  ".grid"
);

on("click", () => addExercise(), "#btn-add-exercise");
