/*
 * Plugin Name: Vanilla-JS Infinite Scroll
 * Version: 0.3.0
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

    /* Options */
    self.currentPage = parseInt(self.el.getAttribute('data-currentpage') || opts.currentPage || 1, 10);
    var overflowItem = (opts.overflowItem || (el.style.overflow == 'auto'));
    var callbackUrl = self.el.getAttribute('data-callbackurl') || opts.callbackUrl || false;
    var returnType = self.el.getAttribute('data-returntype') || opts.returnType || 'html';
    var offsetScroll = parseInt(self.el.getAttribute('data-offsetscroll') || opts.offsetScroll || 200, 10);
    var stopInfiniteScroll = false;
    var callbackResponse = opts.callbackResponse || function(self, responseText) {
        self.el.setAttribute('data-currentpage', self.currentPage);
        self.el.insertAdjacentHTML('beforeend', responseText);
        self.currentPage++;
    };
    var callbackBeforeResponse = opts.callbackBeforeResponse || function(self, responseText) {};
    var callbackAfterResponse = opts.callbackAfterResponse || function(self, responseText) {};

    /* Internal settings */
    var canInfiniteScroll = true,
        scrollLevel = 0,
        scrollMax = 0,
        scrollListener = window;

    if (overflowItem) {
        /* Overflow auto, check events  */
        scrollListener = el;
    }

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
        /* Set Scroll Max */
        if (overflowItem) {
            scrollMax = self.el.scrollHeight - offsetScroll;
            return false;
        }
        var elBounds = self.el.getBoundingClientRect();
        scrollMax = getBodyScrollTop() + elBounds.top + elBounds.height - offsetScroll;
    }

    function scroll_event() {

        if (stopInfiniteScroll) {
            self.unset_events();
            return false;
        }

        if (!canInfiniteScroll) {
            return false;
        }

        // Get scroll level
        scrollLevel = overflowItem ? getElementScrollBottom(self.el) : getBodyScrollBottom();

        // If scroll level not over scrollmax
        if (scrollLevel < scrollMax) {
            return false;
        }

        // Disable infinite scroll
        disable_infinite_scroll();

        // Load callbackurl
        var data = {
            page: self.currentPage
        };
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

    /* Utilities */

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

    function getElementScrollBottom(elem) {
        return elem.scrollTop + elem.offsetHeight;
    }

    function getBodyScrollTop() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    function getBodyScrollBottom() {
        return getBodyScrollTop() + Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    }
    init();
}
