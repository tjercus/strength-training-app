import { on, setProp, dom, getProp } from "saladbar";
import { concat, pipe } from "ramda";
import Either from "data.either";

const logAndPass =
  (msg = "") =>
  (value) => {
    console.log(msg, value);
    return value;
  };

const makeTemplateEither = (selector) =>
  dom(selector).chain(getProp("innerHTML"));

const templateFieldsetSetEither = makeTemplateEither("#template-fieldset-set");

/* ------------- side effects for runtime below ---------------- */

// inject first Set in the DOM from a template
setProp("innerHTML", templateFieldsetSetEither, dom(".cell-fieldset-set"));

on(
  "click",
  (evt) => {
    console.log("evt", evt.target.value);

    const parentEither = dom(
      `div[data-row-id='${evt.target.value}'] .cell-fieldset-set`
    );

    const currentSetsEither = parentEither.chain(getProp("innerHTML"));

    // works
    pipe(
      setProp(
        "innerHTML",
        Either.of(concat).ap(currentSetsEither).ap(templateFieldsetSetEither)
      )
    )(parentEither);
  },
  ".btn-add-set" // DOM element to 'click' on
);
