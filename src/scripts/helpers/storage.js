/**
 * Storage
 * ------------------------------------------------------------------------------
 * Stores data in localStorage.
 *
 * @namespace storage
 *
 */
import _merge from 'lodash-es/merge';

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
    Heedless.eventBus.listen('Storage:update', (response) => storeData(response));
    Heedless.eventBus.listen('Storage:newCollection', (response) => storeCollection(response));
    Heedless.eventBus.listen('Storage:shipping', (response) => storeShipping(response));
  }

  /**
   * Store the data to localStorage.
   * @param {Object} response the GraphQL response.
   */
  function storeData(response) {
    const currentStorage = JSON.parse(localStorage.getItem('products'));
    const event = response.event;

    delete response.event;

    if (currentStorage) {
      Heedless.products = _merge(currentStorage, response);
    } else {
      Heedless.products = response;
    }

    localStorage.setItem('products', JSON.stringify(Heedless.products));

    Heedless.eventBus.emit('Storage:updated');

    if (event) {
      Heedless.eventBus.emit(`Storage:${event}`);
    }
  }

  /**
   * Store that the collection has been loaded to localStorage.
   * @param {String} handle the collection handle.
   */
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
    Heedless.eventBus.emit('Storage:updated');
  }

  /**
   * Store that the collection has been loaded to localStorage.
   * @param {String} handle the collection handle.
   */
  function storeShipping(countries) {
    Heedless.shipping = countries;
    localStorage.setItem('shipping', JSON.stringify(Heedless.shipping));
  }

  /**
   * Expose public interface.
   */
  return Object.freeze({
    init,
  });
};
