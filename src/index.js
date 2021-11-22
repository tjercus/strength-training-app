import { on, setProp, dom, getProp, setAttr } from "saladbar";
import { concat, curry, pipe } from "ramda";
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
  dom(`.cell-sets .fieldset-set[data-set-id='${setId}']`).map((el) =>
    el.remove()
  );

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
    addSetToCell(newId);
  });
};

/* ---------------------- side effects for runtime below ------------------------ */

// inject first Exercise (with one Set) in the DOM (from a template)
addExercise();

on(
  "click",
  (evt) => addSetToCell(evt.target.value), // TODO filter to handle ONLY .btn-add-set
  ".grid" // click on a parent of all buttons to use event-bubbling
);

on(
  "click",
  (evt) => deleteSetFromCell(evt.target.value), // TODO filter to handle ONLY .btn-add-set
  ".grid" // click on a parent of all buttons to use event-bubbling
);

on("click", () => addExercise(), "#btn-add-exercise");
