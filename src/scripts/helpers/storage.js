/**
 * Storage
 * ------------------------------------------------------------------------------
 * Stores data in localStorage.
 *
 * @namespace storage
 *
 */
import _merge from 'lodash.merge';

export default() => {

  /**
   * Init the storage variables.
   */
  function init() {
    setEventListeners();
    Heedless.products = JSON.parse(localStorage.getItem('products')) || {};
    Heedless.collections = JSON.parse(localStorage.getItem('collections')) || [];
  }

  function setEventListeners() {
    Heedless.eventBus.listen('Storage:updated', (response) => storeData(response));
    Heedless.eventBus.listen('Storage:newCollection', (response) => storeCollection(response));
  }

  /**
   * Store the data to localStorage.
   * @param {Object} response the GraphQL response.
   */
  function storeData(response) {
    const currentStorage = JSON.parse(localStorage.getItem('products'));

    if (currentStorage) {
      Heedless.products = _merge(currentStorage, response);
    } else {
      Heedless.products = response;
    }

    localStorage.setItem('products', JSON.stringify(Heedless.products));
  }

  function storeCollection(handle) {
    const currentStorage = localStorage.getItem('collections');
    let array = [];

    if (currentStorage) {
      array = currentStorage;
    }

    if (array.includes(handle)) {
      return;
    }

    array.push(handle);
    Heedless.collections = array;

    localStorage.setItem('collections', JSON.stringify(Heedless.collections));
  }

  return Object.freeze({
    init,
  });
};
