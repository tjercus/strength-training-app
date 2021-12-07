import { chain, concat, curry, includes, pipe, prop, split } from "ramda";
import { dom, getAttr, getProp, setProp } from "saladbar";
import Either from "data.either";
import guaranteeEither from "saladbar/lib/es/utils/guaranteeEither";

const isNullOrUndefined = (value) =>
  typeof value === "undefined" || value === null;

/**
 * Utils for working with the DOM (not in Saladbar)
 */

/**
 * curriedAppendChild :: DOM Element -> DOM Element -> DOM Node
 */
const curriedAppendChild = curry((parentEl, childEl) =>
  parentEl.appendChild(childEl)
);

/**
 * removeElement :: DOM Element -> Either Error DOM Element
 */
export const removeElement = (el) =>
  isNullOrUndefined(el)
    ? Either.Left(Error("Element was null"))
    : Either.Right(el.remove());

/**
 * lifts the (curried! version of) DOM function 'appendChild' into the monadic world so it's arguments can
 *   be applied even though they are wrapped in an Either
 * appendChild :: (DOM Element | Either Error DOM Element, DOM Element | Either Error DOM Element)
 *   -> Either Error DOM Element
 */
export const appendChild = (target, child) =>
  Either.of(curriedAppendChild)
    .ap(guaranteeEither(target))
    .ap(guaranteeEither(child));

/**
 * Apparently one needs to use a construction like this to be able to use a fragment
 * convertFragmentToElement :: DOM Fragment -> Either Error DOM Element
 */
export const convertFragmentToElement = (frag) =>
  isNullOrUndefined(frag)
    ? Either.Left(Error("Fragment is not usable"))
    : new DOMParser().parseFromString(frag.innerHTML, "text/html").body
        .firstElementChild;

/**
 * eventTargetHasClass :: string -> Either Error a -> boolean
 */
export const eventTargetHasClass = curry((className, evtEither) =>
  // You can also work with map instead of pipe:
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
