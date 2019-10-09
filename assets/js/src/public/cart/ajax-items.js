/**
 * @module Cart Items Ajax
 * @description Ajax handling for cart items.
 */

import delegate from 'delegate';
import _ from 'lodash';
import Cookies from 'js-cookie';
import { wpAPICartUpdate, wpAPICartDelete } from 'utils/ajax';
import * as tools from 'utils/tools';
import { on, trigger } from 'utils/events';
import cartState from 'publicConfig/cart-state';
import { CART_API_BASE } from 'publicConfig/wp-settings';
import { CART_ID_COOKIE_NAME, CART_ITEM_COUNT_COOKIE } from 'bcConstants/cookies';
import { NLS } from 'publicConfig/i18n';
import { cartEmpty } from './cart-templates';
import { updateMenuQtyTotal, updateCartMenuItem } from './cart-menu-item';

const timeoutOptions = {
	delay: 500,
};

let timeout = null;

/**
 * @function getCartAPIURL
 * @description build the cart API endpoint url.
 * @param e
 * @returns {string}
 */
const getCartAPIURL = (e) => {
	const cartID = Cookies.get(CART_ID_COOKIE_NAME);
	const cartItem = e.delegateTarget.dataset.cart_item_id;

	return _.isEmpty(cartID && cartItem) ? '' : `${CART_API_BASE}/${cartID}${NLS.cart.items_url_param}${cartItem}`;
};

/**
 * @function getItemUpdateQueryString
 * @description build the query string for the current item being updated.
 * @param input
 * @returns {string}
 */
const getItemUpdateQueryString = (input = '') => {
	const quantity = input.delegateTarget.value;
	const k = encodeURIComponent(NLS.cart.quantity_param);
	const v = encodeURIComponent(quantity);

	return _.isEmpty(quantity) ? '' : `${k}=${v}`;
};

/**
 * @function handleCartState
 * @description check the cart(s) state and disable/enable actions on current status.
 */
const handleCartState = (e) => {
	const carts = tools.getNodes('bc-cart', true);
	const eventMiniCart = e.detail ? e.detail.miniCartID : '';

	if (!carts) {
		return;
	}

	carts.forEach((cart) => {
		const itemInputs = tools.getNodes('bc-cart-item__quantity', true, cart);
		const itemRemoveButtons = tools.getNodes('.bc-cart-item__remove-button', true, cart, true);
		const checkoutButton = tools.getNodes('proceed-to-checkout', false, cart)[0];
		const isMiniCart = tools.closest(cart, '[data-js="bc-mini-cart"]');

		if (isMiniCart && isMiniCart.dataset.miniCartId === eventMiniCart) {
			return;
		}

		if (cartState.isFetching) {
			itemInputs.forEach((item) => {
				item.setAttribute('disabled', 'disabled');
			});
			itemRemoveButtons.forEach((item) => {
				item.setAttribute('disabled', 'disabled');
			});
			if (checkoutButton) {
				checkoutButton.setAttribute('disabled', 'disabled');
			}
			cart.classList.add('bc-updating-cart');

			return;
		}

		itemInputs.forEach((item) => {
			item.removeAttribute('disabled');
		});
		itemRemoveButtons.forEach((item) => {
			item.removeAttribute('disabled');
		});
		if (checkoutButton) {
			checkoutButton.removeAttribute('disabled', 'disabled');
		}

		cart.classList.remove('bc-updating-cart');
	});
};

/**
 * @function updateCartItems
 * @description update the cart item total value.
 * @param data {object}
 */
const updateCartItems = (data = {}) => {
	tools.getNodes('bc-cart', true).forEach((cart) => {
		Object.entries(data.items).forEach(([key, value]) => {
			const id = key;
			const totalSalePrice = value.total_sale_price.formatted;
			const itemRow = tools.getNodes(id, false, cart, false)[0];
			const totalPrice = tools.getNodes('.bc-cart-item-total-price', false, itemRow, true)[0];

			totalPrice.innerHTML = totalSalePrice;
		});
	});
};

/**
 * @function updatedCartTotals
 * @description update the cart subtotal amount.
 * @param data
 */
const updatedCartTotals = (data = {}) => {
	tools.getNodes('bc-cart', true).forEach((cart) => {
		const baseAmount = data.subtotal.formatted;
		const subTotal = tools.getNodes('.bc-cart-subtotal__amount', false, cart, true)[0];
		const taxAmount = data.tax_amount.formatted;
		const taxTotal = tools.getNodes('.bc-cart-tax__amount', false, cart, true)[0];

		subTotal.textContent = baseAmount;

		if (taxTotal) {
			taxTotal.textContent = taxAmount;
		}
	});
};

/**
 * @function cartItemQtyUpdated
 * @description handle the API response when a cart item is updated.
 * @param data
 */
const cartItemQtyUpdated = (data = {}) => {
	if (!data) {
		return;
	}

	updateCartItems(data);
	updatedCartTotals(data);
	updateMenuQtyTotal(data);
};

/**
 * @function bcAPICodeResponseHandler
 * @description Handle error message output for API errors.
 * @param eventTrigger
 * @param data
 */
const bcAPICodeResponseHandler = (eventTrigger = '', data = {}) => {
	const APIErrorNotification = tools.getNodes('bc-cart-error-message');

	if (!APIErrorNotification) {
		return;
	}

	APIErrorNotification.forEach((container) => {
		if (data.statusCode === 502) {
			container.innerHTML = NLS.cart.cart_error_502;
			tools.closest(container, '.bc-cart-error').classList.add('message-active');

			return;
		}

		container.innerHTML = '';
		tools.closest(container, '.bc-cart-error').classList.remove('message-active');
	});
};

/**
 * @function handleQtyUpdate
 * @description after an item qty has been updated, run ajax to update the cart.
 * @param inputEvent
 */
const handleQtyUpdate = (inputEvent) => {
	if (inputEvent.delegateTarget.value.length <= 0) {
		return;
	}

	const cartURL = getCartAPIURL(inputEvent);
	const queryString = getItemUpdateQueryString(inputEvent);
	const isMiniCart = tools.closest(inputEvent.delegateTarget, '[data-js="bc-mini-cart"]');
	const miniCartID = isMiniCart ? isMiniCart.dataset.miniCartId : '';
	window.clearTimeout(timeout);

	timeout = _.delay(() => {
		cartState.isFetching = true;
		handleCartState(inputEvent.delegateTarget);

		wpAPICartUpdate(cartURL, queryString)
			.end((err, res) => {
				cartState.isFetching = false;
				handleCartState(inputEvent.delegateTarget);
				bcAPICodeResponseHandler(res);

				if (err) {
					console.error(err);
					return;
				}

				cartItemQtyUpdated(res.body);
				trigger({ event: 'bigcommerce/update_mini_cart', data: { miniCartID }, native: false });
			});
	}, timeoutOptions.delay);
};

/**
 * @function removeCartItem
 * @description remove a cart item row from the cart view DOM.
 * @param itemRow string
 * @param data {object}
 */
const removeCartItem = (itemRow = '', data = {}) => {
	if (!itemRow.parentNode) {
		return;
	}

	itemRow.parentNode.removeChild(itemRow);

	if (data.statusCode === 204) {
		const cart = tools.getNodes('bc-cart', false, itemRow)[0];
		const cartFooter = tools.getNodes('.bc-cart-footer', false, cart, true)[0];
		const cartBody = tools.getNodes('.bc-cart-body', false, cart, true)[0];

		cartBody.insertAdjacentHTML('afterbegin', cartEmpty);
		cartFooter.parentNode.removeChild(cartFooter);
		Cookies.remove(CART_ID_COOKIE_NAME);
		Cookies.remove(CART_ITEM_COUNT_COOKIE);
		updateCartMenuItem();
		return;
	}

	updatedCartTotals(data.body);
	updateMenuQtyTotal(data.body);
};

/**
 * @function handleCartItemRemoval
 * @description send and handle the API response for removal of a cart item.
 * @param e
 */
const handleCartItemRemoval = (e) => {
	const cartURL = getCartAPIURL(e);
	const removeButton = e.delegateTarget;
	const isMiniCart = tools.closest(removeButton, '[data-js="bc-mini-cart"]');
	const miniCartID = isMiniCart ? isMiniCart.dataset.miniCartId : '';

	if (cartState.isFetching) {
		return;
	}

	cartState.isFetching = true;
	handleCartState(removeButton);

	if (_.isEmpty(cartURL)) {
		return;
	}

	wpAPICartDelete(cartURL)
		.end((err, res) => {
			const itemRow = tools.closest(removeButton, `[data-js="${removeButton.dataset.cart_item_id}"]`);
			cartState.isFetching = false;
			handleCartState(removeButton);
			bcAPICodeResponseHandler(removeButton, res);

			if (err) {
				console.error(err);
				return;
			}

			removeCartItem(itemRow, res);
			trigger({ event: 'bigcommerce/update_mini_cart', data: { miniCartID }, native: false });
		});
};

const bindEvents = () => {
	delegate(document, '[data-js="bc-cart-item__quantity"]', 'input', handleQtyUpdate);
	delegate(document, '[data-js="remove-cart-item"]', 'click', handleCartItemRemoval);
	on(document, 'bigcommerce/handle_cart_state', handleCartState);
};

const init = () => {
	bindEvents();
};

export default init;
