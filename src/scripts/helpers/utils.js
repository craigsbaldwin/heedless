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

/**
 * Image URL parameters.
 * @param {String} url - The full image URL.
 * @param {Object} parameters - Object containing size, crop (optional), format (optional) and scale (optional)
 */
export function imageParameters(url, parameters) {
  if (url === null) {
    return '';
  }

  let filePath = url.split('?');

  /**
   * Find out old URLs format and version
   */
  const original = {
    version: filePath[1],
    filetype: (url.indexOf('.jpg') > 0) ? 'jpg' : 'png',
  };

  /**
   * Use regex to test to see if the URL already has a size (matching 123x, x123, 123x123, master, original, large, medium, small)
   * If it does remove it
   */
  const formattedUrl = filePath[0].replace(`.${original.filetype}`, '').split('_');
  const urlParameters = formattedUrl[formattedUrl.length - 1];
  const regex = /^(master|original|large|medium|small)|([0-9]+[xX][0-9]+)|([0-9]+[xX])|([xX][0-9]+)$/;

  if (regex.test(urlParameters)) {
    filePath = filePath[0].replace(`_${urlParameters}.${original.filetype}`, '');
  } else {
    filePath = filePath[0].replace(`.${original.filetype}`, '');
  }

  /**
   * Set new URL parameters
   */
  const output = {};
  if (parameters.size === 'master') {
    output.size = '';
  } else {
    output.size = `_${parameters.size}`;
  }

  output.crop = (parameters.crop) ? `_crop_${parameters.crop}` : '';
  output.scale = (parameters.scale === 2 || parameters.scale === 3) ? `@${parameters.scale}x` : '';
  output.version = (original.version) ? `?${original.version}` : '';

  if (parameters.format === 'pjpg') {
    if (original.filetype === 'png') {
      output.filetype = '.progressive.png.jpg';
    } else {
      output.filetype = '.progressive.jpg';
    }

  } else if (parameters.format === 'jpg') {
    if (original.filetype === 'png') {
      output.filetype = '.png.jpg';
    } else {
      output.filetype = '.jpg';
    }

  } else {
    output.filetype = `.${original.filetype}`;
  }

  const completeUrl = `${filePath}${output.size}${output.crop}${output.scale}${output.filetype}${output.version}`;

  return completeUrl;
}
