/**
 * Shortcut function to add an event listener.
 * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param {String} event -The event type.
 * @param {Node} elem - The element to attach the event to (optional, defaults to window).
 * @param {Function} callback - The callback to run on the event.
 * @param {Boolean} capture - If true, forces bubbling on non-bubbling events.
 */
export function on(event, elem = window, callback, capture = false) {

  /**
   * If only a string is passed into the element parameter.
   */
  if (typeof elem === 'string') {
    document.querySelector(elem).addEventListener(event, callback, capture);
    return;
  }

  /**
   * If an element is not defined in parameters, then shift callback across.
   */
  if (typeof elem === 'function') {
    window.addEventListener(event, elem);
    return;
  }

  /**
   * Default listener.
   */
  elem.addEventListener(event, callback, capture);
}

/**
 * Concatenate two objects together.
 * @param {Object} obj the first object.
 * @param {Object} src the second object.
 * @returns a single combined object.
 */
export function concat(obj, src) {
  for (const key in src) {
    if (src.hasOwnProperty(key)) {
      obj[key] = src[key];
    }
  }
  return obj;
}

/**
 * Format money into correct format.
 * @param {String} amount the amount to format.
 * @returns the formatted value.
 */
export function formatMoney(amount) {
  const value = Number(amount).toFixed(2);

  return `£${value}`;
}
