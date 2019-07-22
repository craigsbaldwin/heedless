/**
 * Component: Product form
 * ------------------------------------------------------------------------------
 * Handles add to cart, quantity and variants and inventory.
 *
 * @namespace productForm
 */
import axios from 'axios';

import {on, formatMoney} from '../helpers/utils';

/**
 * DOM selectors.
 */
const selectors = {
  homepage: '[js-page="homepage"]',
  productPage: '[js-page="productPage"]',
  price: '[js-product="price"]',
  variantSelector: '[js-product="variantSelector"]',
  quantity: '[js-product="quantity"]',
  quantityError: '[js-product="quantityError"]',
  addToCartButton: '[js-page="addToCart"]',
};

/**
 * Create a new product form object.
 */
export default () => {

  /**
   * DOM node selectors.
   */
  const nodeSelectors = {
    homepage: document.querySelector(selectors.homepage),
    productPage: document.querySelector(selectors.productPage),
  };

  /**
   * Initialise component.
   */
  function init() {
    setRenderedEventListeners();
  }

  /**
   * Set event listeners which only work on render.
   */
  function setRenderedEventListeners() {
    Heedless.eventBus.listen('Storage:inventory', () => updateVariantInventory());
    Heedless.eventBus.listen('Cart:updated', () => resetAddToCartButton());

    on('change', nodeSelectors.productPage.querySelector(selectors.variantSelector), (event) => {
      handleVariantChange(event.target);
    });

    on('change', nodeSelectors.productPage.querySelector(selectors.quantity), (event) => {
      handleQuantityChange(event.target);
    });
  }

  /**
   * Load product's variant inventory.
   * @param {Object} product the product to load inventory data on.
   */
  function loadProductInventory(product) {
    axios.get(`https://stacklet.azurewebsites.net/api/inventory-levels/location-inventory?product_id=${product.id}`)
      .then((response) => {
        const convertedResponse = convertInventoryResponse(response, product);
        Heedless.eventBus.emit('Storage:update', convertedResponse);
      })
      .catch((error) => {
        window.console.log('loadProductInventory error', error);
      });
  }

  /**
   * Convert inventory response to match storage format.
   * @param {Object} response the response from the request.
   * @param {Object} product the product to load inventory data on.
   */
  function convertInventoryResponse(response, product) {
    const inventoryLevels = response.data.variants.edges.map((variant) => {
      return {
        id: window.btoa(variant.node.id),
        inventory: variant.node.inventoryQuantity,
      };
    });

    const convertedResponse = {
      event: 'inventory',
    };

    convertedResponse[product.handle] = {};
    convertedResponse[product.handle].variants = inventoryLevels;

    return convertedResponse;
  }

  /**
   * Updates the variant selectors
   */
  function updateVariantInventory() {
    const options = [...nodeSelectors.productPage.querySelectorAll(`${selectors.variantSelector} option`)];

    options.forEach((option) => {
      Heedless.products[window.handle].variants.forEach((variant) => {
        if (variant.id === option.value) {
          option.setAttribute('data-inventory', variant.inventory);
        }
      });
    });

    updateQuantity();
  }

  /**
   * Handle variant select change.
   * @param {HTMLObject} target the changed select.
   */
  function handleVariantChange(target) {
    const selectedOption = target.querySelector(`[value="${target.value}"]`);
    const price = formatMoney(selectedOption.getAttribute('data-price'));

    nodeSelectors.productPage.querySelector(selectors.addToCartButton).setAttribute('data-variant-id', selectedOption.value);
    nodeSelectors.productPage.querySelector(selectors.price).innerHTML = `<strong class="product-page__price">${price}</strong>`;

    updateQuantity();
  }

  /**
   * Handle variant select change.
   * @param {HTMLObject} target the changed input.
   */
  function handleQuantityChange(target) {
    nodeSelectors.productPage.querySelector(selectors.addToCartButton).setAttribute('data-quantity', target.value);

    if (target.value === target.getAttribute('max')) {
      nodeSelectors.productPage.querySelector(selectors.quantityError).classList.add('is-active');
      return;
    }

    nodeSelectors.productPage.querySelector(selectors.quantityError).classList.remove('is-active');
  }

  /**
   * Update quantity input with new inventory limits.
   */
  function updateQuantity() {
    const select = nodeSelectors.productPage.querySelector(selectors.variantSelector);
    const selectedOption = select[select.selectedIndex];
    const inventory = Number(selectedOption.getAttribute('data-inventory'));
    const quantityElement = nodeSelectors.productPage.querySelector(selectors.quantity);
    const quantity = Number(quantityElement.value);

    quantityElement.setAttribute('max', inventory);

    if (quantity > inventory) {
      quantityElement.value = inventory;
      nodeSelectors.productPage.querySelector(selectors.quantityError).classList.add('is-active');
    } else {
      nodeSelectors.productPage.querySelector(selectors.quantityError).classList.remove('is-active');
    }
  }

  /**
   * Resets the add to cart button.
   */
  function resetAddToCartButton() {
    const addToCartButton = nodeSelectors.productPage.querySelector(selectors.addToCartButton);

    addToCartButton.classList.remove('is-disabled');
    addToCartButton.innerText = 'Added to Cart';
    Heedless.eventBus.emit('Cart:openDrawer');

    window.setTimeout(() => {
      addToCartButton.innerText = 'Add to Cart';
    }, 2500);
  }

  /**
   * Expose public interface.
   */
  return Object.freeze({
    init,
    loadProductInventory,
  });
};
