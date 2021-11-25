import { chain, concat, curry, includes, pipe, prop, split } from "ramda";
import { dom, getAttr, getProp, setProp } from "saladbar";
import Either from "data.either";

const isNullOrUndefined = (value) =>
  typeof value === "undefined" || value === null;

/**
 * Utils for working with the DOM (not in Saladbar)
 */

// TODO this is not safe
export const removeElement = (el) => el.remove();

// TODO this is not safe
/**
 * appendChild :: (DOM Element, DOM Element) -> Either Error DOM Element
 */
export const appendChild = (targetEl, childEl) => targetEl.appendChild(childEl);
// Either.fromNullable(
//   isNullOrUndefined(targetEl)
//     ? Error("target Element was null")
//     : targetEl.appendChild(childEl)
// );

/**
 * Apparently one needs to use a construction like this to be able to use a fragment
 */
export const convertFragmentToElement = (frag) =>
  document.createRange().createContextualFragment(frag.innerHTML);
// Either.fromNullable(
//   document
//     .createRange()
//     .createContextualFragment(
//       isNullOrUndefined(frag) ? Error("Fragment is null") : frag.innerHTML
//     )
// );

/**
 * eventTargetHasClass :: string -> Either Error a -> boolean
 */
export const eventTargetHasClass = curry((className, evtEither) =>
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
        getAttr("class"),
        chain(split(" ")),
        includes(className)
      )
    )
    .getOrElse(false)
);

/* -------------------------- unused utils below -------------------------------- */

/**
 * Given two Eithers, make a new one with both it's contents concatenated (string or list)
 * Note that if one of the Eithers is a Left (null etc.) then the result will be Left
 * concatEithers :: (Either Error a, Either Error a) -> Either Error a
 */
export const concatEithers = (anEither, anotherEither) =>
  Either.of(concat).ap(anEither).ap(anotherEither);

/**
 * Takes a default and an Either and returns original or new Either(defaultValue)
 * withDefault :: a -> Either Error a -> Either Error a
 */
export const withDefault = curry((defaultValue, ei) =>
  ei.isRight ? ei : Either.of(defaultValue)
);

/**
 * Given a selector or Either<Error, DOM Element>, return it's innerHTML
 * getInnerHtmlEither :: String | Selector -> Either Error String
 */
export const getInnerHtmlEither = (selOrEl) =>
  typeof selOrEl === "string"
    ? dom(selOrEl).chain(getProp("innerHTML"))
    : selOrEl.chain(getProp("innerHTML"));

/**
 * setInnerHtml :: DOM Element -> Either Error DOM Element
 */
export const setInnerHtml = setProp("innerHTML");
