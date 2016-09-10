# vanillaInfiniteScroll

Infinite Scroll

## How to install

First, load js/vanilla-infinite.js in your webpage.

Then, when DOM is ready, start the plugin :

```
<ul data-callbackurl="callbacks/li.php" id="infinite-scroll-me">
    <li>az</li>
    <li>bz</li>
</ul>
<script>
// Launch in default mode
new vanilla_infinite_scroll(document.getElementById('infinite-scroll-me'));
</script>
```

## Advanced mode
```
<ul data-callbackurl="callbacks/li.php" id="infinite-scroll-me-adv">
    <li>az</li>
    <li>bz</li>
</ul>
<script>
// Launch in default mode
new vanilla_infinite_scroll(document.getElementById('infinite-scroll-me-adv'), {
    /* Before AJAX Response treatment */
    callbackBeforeResponse: function(self, responseText) {},
    /* After AJAX Response treatment */
    callbackAfterResponse: function(self, responseText) {},
    /* Start at page 201605 */
    currentPage: 201605,
    /* Pagination method */
    incrementationMethod: function(pageNb) {
        return pageNb + 1;
    }
});
</script>
```
