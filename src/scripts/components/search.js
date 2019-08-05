/**
 * Component: Search
 * ------------------------------------------------------------------------------
 * Handles search input in header
 *
 * @namespace search
 */
import debounce from 'lodash-es/debounce';

import cssClasses from '../helpers/cssClasses';
import graphql from '../helpers/graphql';
import {on, imageParameters, formatMoney} from '../helpers/utils';

/**
 * DOM selectors.
 */
const selectors = {
  searchInput: '[js-search="input"]',
  searchResults: '[js-search="results"]',
};

/**
 * Base loading template.
 */
const loading = `
  <div class="search__result result result--loading">
    <div class="result__image-container loading-container">
      <div class="loading">
      </div>
    </div>

    <div class="result__meta">
      <div class="result__title-container loading-container">
        <div class="loading">
        </div>
      </div>

      <div class="result__price-container loading-container">
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
    on('input', nodeSelectors.searchInput, debounce((event) => handleSearchInput(event), 500));
    on('focus', nodeSelectors.searchInput, (event) => handleSearchInput(event));

    /**
     * Delay closing in case clicking should open product.
     */
    on('blur', nodeSelectors.searchInput, () => {
      window.setTimeout(() => {
        closeSearch();
      }, 250);
    });
  }

  /**
   * Handle search input when typing and clicking search box.
   * @param {Event} event the input event.
   */
  function handleSearchInput(event) {
    const searchString = event.target.value;

    if (searchString.length === 0) {
      closeSearch();
      return;
    }

    openSearch();

    if (event.type === 'input') {
      handleSearch(searchString);
      renderLoading();
    }
  }

  /**
   * Open the search.
   */
  function openSearch() {
    nodeSelectors.searchResults.classList.add(cssClasses.active);
  }

  /**
   * Close the search.
   */
  function closeSearch() {
    nodeSelectors.searchResults.classList.remove(cssClasses.active);
  }

  /**
   * Handles search entry.
   * @param {String} searchString the search string.
   */
  function handleSearch(searchString) {
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

  /**
   * Render the loading state.
   */
  function renderLoading() {
    nodeSelectors.searchResults.innerHTML = (loading + loading + loading);
  }

  /**
   * Render the actual search results.
   * @param {Object} response the search response.
   */
  function renderSearchResults(response) {
    if (response.length === 0) {
      nodeSelectors.searchResults.innerHTML = `<p class="u-small-text">No results</p>`;
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
            <span class="result__title h2 text-left">
              ${product.title}
            </span>

            <span class="result__price u-small-text text-left">
              ${formatMoney(product.price)}
            </span>
          </div>
        </div>
      `;
    }).join('');

    nodeSelectors.searchResults.innerHTML = html;
  }

  /**
   * Expose public interface.
   */
  return Object.freeze({
    init,
  });
};
