import { on, setProp, dom, getProp, setAttr, hasClass } from "saladbar";
import {
  chain,
  compose,
  concat,
  cond,
  curry,
  includes,
  pipe,
  prop,
  split,
} from "ramda";
import Either from "data.either";
import { v4 as uuid } from "uuid";

// debug function to put in a composition
const logAndPass =
  (msg = "") =>
  (value) => {
    console.log(msg, value);
    return value;
  };

/* -------------- utils for working with the DOM (not in Saladbar) ------------------ */

/**
 * Given a selector or Either<Error, DOM Element>, return it's innerHTML
 * getInnerHtmlEither :: String | Selector -> Either Error String
 */
const getInnerHtmlEither = (selOrEl) =>
  typeof selOrEl === "string"
    ? dom(selOrEl).chain(getProp("innerHTML"))
    : selOrEl.chain(getProp("innerHTML"));

/**
 * setInnerHtml :: DOM Element -> Either Error DOM Element
 */
const setInnerHtml = setProp("innerHTML");

// TODO this not safe
const removeElement = (el) => el.remove();

/**
 * Like 'getAttr' but taking in an el instead of an Either<el>|el
 * getAttribute :: string -> DOM Element -> string
 */
const getAttribute = curry((attributeName, el) =>
  Either.fromNullable(el.getAttribute(attributeName))
);

/**
 * Given two Eithers, make a new one with both it's contents concatenated (string or list)
 * Note that if one of the Eithers is a Left (null etc.) then the result will be Left
 * concatEithers :: (Either Error a, Either Error a) -> Either Error a
 */
const concatEithers = (anEither, anotherEither) =>
  Either.of(concat).ap(anEither).ap(anotherEither);

/**
 * Takes a default and an Either and returns original or new Either(defaultValue)
 * withDefault :: a -> Either Error a -> Either Error a
 */
const withDefault = curry((defaultValue, ei) =>
  ei.isRight ? ei : Either.of(defaultValue)
);

/**
 * eventTargetHasClass :: string -> Either Error a -> boolean
 */
const eventTargetHasClass = curry((className, evtEither) =>
  // evtEither
  //   .map(prop("target"))
  //   .map(getAttribute("class"))
  //   .map(chain(split(" ")))
  //   .map(includes(className))
  //   .getOrElse(false)
  evtEither
    .map(
      pipe(
        prop("target"),
        logAndPass("after getting prop target"),
        getAttribute("class"),
        chain(split(" ")),
        includes(className)
      )
    )
    .getOrElse(false)
);

/* --------------------------- application specific utils ------------------------- */

const templateGridRowHtmlEither = getInnerHtmlEither("#template-grid-row");
const templateCellSetsHtmlEither = getInnerHtmlEither("#template-cell-sets");

/**
 * Add a new blank workout Set to the cell of Sets
 * addSetToCell :: string -> Either Error DOM Element
 */
const addSetToCell = (rowId) => {
  const cellSetsEither = dom(`div[data-row-id='${rowId}'] .cell-sets`);
  const currentHtmlEither = pipe(
    getInnerHtmlEither,
    withDefault("")
  )(cellSetsEither);

  setInnerHtml(
    concatEithers(currentHtmlEither, templateCellSetsHtmlEither),
    cellSetsEither
  ).map((sets) => {
    const newId = uuid();
    setAttr("data-set-id", newId, dom(".fieldset-set:last-child", sets));
    setAttr(
      "value",
      newId,
      dom(".fieldset-set:last-child .btn-delete-set", sets)
    );
  });
};

const deleteSetFromCell = (setId) =>
  dom(`.cell-sets .fieldset-set[data-set-id='${setId}']`).map(removeElement);

const addExercise = () => {
  const gridBodyEither = dom(".grid-body");
  const currentHtmlEither = pipe(
    getInnerHtmlEither,
    withDefault("")
  )(gridBodyEither);

  setInnerHtml(
    concatEithers(currentHtmlEither, templateGridRowHtmlEither),
    gridBodyEither
  ).map((rows) => {
    const newId = uuid();
    setAttr("data-row-id", newId, dom("div.grid-row:last-child", rows));
    setAttr("value", newId, dom("div.grid-row:last-child .btn-add-set", rows));
    setAttr(
      "value",
      newId,
      dom("div.grid-row:last-child .btn-delete-exercise", rows)
    );
    addSetToCell(newId);
  });
};

const deleteExercise = (rowId) =>
  dom(`div[data-row-id='${rowId}']`).map(removeElement);

/* ---------------------- side effects for runtime below ------------------------ */

// inject first Exercise (with one Set) in the DOM (from a template)
addExercise();

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
  ".grid" // click on a parent of all grid buttons to use event-bubbling
);

on("click", () => addExercise(), "#btn-add-exercise");
