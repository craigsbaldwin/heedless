/**
 * Helper: Event bus
 * -----------------------------------------------------------------------------
 * A global event dispatcher used to communicate between components.
 *
 * @namespace eventBus
 */
export default () => {

  /**
   * Create a new EventBus instance.
   */
  const eventBus = {};

  /**
   * Listen for the given event.
   * @param {string|Array} events - Event string. eg: Namespace:state.
   * @param {Function} handler - Callback function to execute when event is fired.
   */
  function listen(events, handler) {
    [...[].concat(events)].forEach((event) => {
      eventBus[event] = (eventBus[event] || []).concat(handler);
    });

    return this;
  }

  /**
   * Trigger all handlers for the given event.
   * @param {string} event - Event string. eg: Namespace:state.
   * @param {*} data - Payload to send to listeners.
   */
  function emit(event, data) {
    if (!eventBus[event]) {
      return false;
    }

    return [...eventBus[event]].forEach((handler) => handler(data));
  }

  /**
   * Fetch all registered event listeners.
   */
  function all() {
    return eventBus;
  }

  /**
   * Expose public interface.
   */
  return Object.freeze({
    listen,
    emit,
    all,
  });
};
