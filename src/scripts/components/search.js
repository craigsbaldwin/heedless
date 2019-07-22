/**
 * Component: Search
 * ------------------------------------------------------------------------------
 * Handles search input in header
 *
 * @namespace search
 */
import throttle from 'lodash-es/throttle';

import {on, imageParameters, formatMoney} from '../helpers/utils';
import graphql from '../helpers/graphql';

/**
 * DOM selectors.
 */
const selectors = {
  searchInput: '[js-search="input"]',
  searchResults: '[js-search="results"]',
};

const loading = `
  <div class="search__result result result--loading">
    <div class="result__image-container">
      <div class="loading">
      </div>
    </div>

    <div class="result__meta">
      <div class="result__title-container">
        <div class="loading">
        </div>
      </div>

      <div class="result__price-container">
        <div class="loading">
        </div>
      </div>
    </div>
  </div>
`;

/**
 * Create a new product form object.
 */
export default () => {

  /**
   * DOM node selectors.
   */
  const nodeSelectors = {
    searchInput: document.querySelector(selectors.searchInput),
    searchResults: document.querySelector(selectors.searchResults),
  };

  /**
   * Initialise component.
   */
  function init() {
    setEventListeners();
  }

  /**
   * Set event listeners which only work on render.
   */
  function setEventListeners() {
    on('input', nodeSelectors.searchInput, throttle((event) => {
      // handleSearch(event.target);
      renderLoading();
    }, 1000));
  }

  /**
   * Handles search entry.
   * @param {HTMLElement} target the search input.
   */
  function handleSearch(target) {
    const searchString = target.value;

    graphql().getProductBySearchString(searchString)
      .then((response) => {
        if (response) {
          renderSearchResults(response);
          return;
        }

        throw new Error('Response not found');
      })
      .catch((error) => error);
  }

  function renderLoading() {
    console.log('hello');
    nodeSelectors.searchResults.classList.add('is-active');

    nodeSelectors.searchResults.innerHTML = loading + loading + loading;
  }

  function renderSearchResults(response) {
    nodeSelectors.searchResults.classList.add('is-active');

    if (response.length === 0) {
      nodeSelectors.searchResults.innerHTML = `<p>No results</p>`;
      return;
    }

    const html = response.map((product) => {
      return `
        <div
          class="search__result result"
          data-handle="${product.handle}"
          js-page="viewProduct"
        >
          <div class="result__image-container">
            <img
              class="result__image"
              alt="${product.images[0].altText}"
              src="${imageParameters(product.images[0].originalSrc, {size: '100x'})}"
            >
          </div>

          <div class="result__meta">
            <span class="result__title">${product.title}</span>
            <span class="result__price">${formatMoney(product.price)}</span>
          </div>
        </div>
      `;
    });

    nodeSelectors.searchResults.innerHTML = html;
  }

  /**
   * Expose public interface.
   */
  return Object.freeze({
    init,
  });
};
