/*
 * Plugin Name: Vanilla-JS Infinite Scroll
 * Version: 0.3.6
 * Plugin URL: https://github.com/Darklg/JavaScriptUtilities
 * JavaScriptUtilities Vanilla-JS may be freely distributed under the MIT license.
 */

function vanilla_infinite_scroll(el, opts) {
    'use strict';

    /*jshint validthis: true */
    var self = this;

    /* Filter arguments */
    opts = opts || {};
    if (!el) {
        return;
    }
    self.el = el;

    /* Options
    -------------------------- */

    var overflowItem = (opts.overflowItem || (el.style.overflow == 'auto'));
    var callbackUrl = self.el.getAttribute('data-callbackurl') || opts.callbackUrl || false;
    var moreDatas = self.el.getAttribute('data-moredatas') || opts.moreDatas || {};
    var returnType = self.el.getAttribute('data-returntype') || opts.returnType || 'html';
    var offsetScroll = parseInt(self.el.getAttribute('data-offsetscroll') || opts.offsetScroll || 500, 10);
    var stopInfiniteScroll = false;

    /* Callbacks */
    var callbackBeforeResponse = opts.callbackBeforeResponse || function(self, responseText) {};
    var callbackAfterResponse = opts.callbackAfterResponse || function(self, responseText) {};
    var callbackResponse = opts.callbackResponse || function(self, responseText) {
        self.el.setAttribute('data-currentpage', self.nextPage);
        self.el.insertAdjacentHTML('beforeend', responseText);
        self.nextPage = self.incrementationMethod(self.nextPage);
    };

    /* Pagination */
    self.incrementationMethod = opts.incrementationMethod || function(pageNb) {
        return pageNb + 1;
    };
    self.currentPage = parseInt(self.el.getAttribute('data-currentpage') || opts.currentPage || 1, 10);
    self.nextPage = parseInt(self.el.getAttribute('data-currentpage') || opts.currentPage || self.incrementationMethod(self.currentPage), 10);

    /* Internal settings */
    var canInfiniteScroll = true,
        isElementVisible = true,
        elHeight = 0,
        scrollLevel = 0,
        scrollMax = 0,
        scrollListener = window;

    if (overflowItem) {
        /* Overflow auto, check events  */
        scrollListener = el;
    }

    /* Methods
    -------------------------- */

    function init() {
        self.set_events();
    }

    self.set_events = function() {
        resize_event();
        scroll_event();
        window.addEventListener('resize', resize_event, false);
        window.addEventListener('scroll', resize_event, false);
        scrollListener.addEventListener('scroll', scroll_event, false);
    };

    self.unset_events = function() {
        window.removeEventListener('resize', resize_event, false);
        window.removeEventListener('scroll', resize_event, false);
        scrollListener.removeEventListener('scroll', scroll_event, false);
    };

    function resize_event() {

        if (overflowItem) {
            /* Check visibility */
            isElementVisible = isVisible(self.el);
            /* Check height */
            elHeight = self.el.offsetHeight;
            /* Set Scroll Max */
            scrollMax = self.el.scrollHeight - offsetScroll;
            return false;
        }

        /* Count scroll max */
        var elBounds = self.el.getBoundingClientRect();
        scrollMax = getBodyScrollTop() + elBounds.top + elBounds.height - offsetScroll;

    }

    function scroll_event() {

        if (stopInfiniteScroll) {
            self.unset_events();
            return false;
        }

        if (!canInfiniteScroll || !isElementVisible) {
            return false;
        }
        // Get scroll level
        scrollLevel = overflowItem ? getElementScrollBottom() : getBodyScrollBottom();

        // If scroll level not over scrollmax
        if (scrollLevel < scrollMax) {
            return false;
        }

        // Disable infinite scroll
        disable_infinite_scroll();

        // Load callbackurl
        var data = {
            page: self.nextPage
        };

        (function() {
            if (!moreDatas) {
                return;
            }
            if (typeof moreDatas != 'object') {
                moreDatas = JSON.parse(moreDatas);
            }
            for (var attrname in moreDatas) {
                data[attrname] = moreDatas[attrname];
            }
        }());

        if (callbackUrl) {
            ajaxRequest(callbackUrl, success_callback, data);
        }
    }

    function success_callback(responseText) {
        if (!responseText) {
            self.unset_events();
        }
        if (returnType == 'json') {
            responseText = JSON.parse(responseText);
        }

        // Multiple callbacks
        callbackBeforeResponse(self, responseText);
        callbackResponse(self, responseText);
        callbackAfterResponse(self, responseText);

        // Trigger resize to update values
        setTimeout(function() {
            triggerResize();
        }, 50);

        setTimeout(function() {
            // Enable infinite event
            enable_infinite_scroll();

            // Try a new scroll event
            scroll_event();
        }, 100);
    }

    /* Enable / Disable infinite scroll */
    function enable_infinite_scroll() {
        canInfiniteScroll = true;
        self.el.setAttribute('aria-busy', 'false');
        self.el.setAttribute('data-loading', 'false');
    }

    function disable_infinite_scroll() {
        canInfiniteScroll = false;
        self.el.setAttribute('aria-busy', 'true');
        self.el.setAttribute('data-loading', 'true');
    }

    /* Generic Utilities
    -------------------------- */

    function isVisible(elem) {
        return elem.offsetParent !== null;
    }

    function triggerResize() {
        var e = window.document.createEvent('UIEvents');
        e.initUIEvent('resize', true, false, window, 0);
        window.dispatchEvent(e);
    }

    function ajaxRequest(url, callbackFun, data) {
        if (window.jQuery) {
            jQuery.ajax({
                url: url,
                success: callbackFun,
                data: data
            });
            return;
        }
        new jsuAJAX({
            url: url,
            callback: callbackFun,
            data: data
        });
    }

    function getElementScrollBottom() {
        return self.el.scrollTop + elHeight;
    }

    function getBodyScrollTop() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    function getBodyScrollBottom() {
        return getBodyScrollTop() + Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    }
    init();
}
