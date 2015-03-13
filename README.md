# Handrail v0.24
Interactive mobile and tablet style selection handles for desktop browsers.
Handrail enhances the user experience by providing greater control over text selection.

Give your users something to hold on to.

## Usage
Simply include `handrail.js` and `handrail.css` on any page to add functionality.

Handrail uses the following 4 classes to style the handles. Override these classes to style your own handles.

    /* Vertical in-text position marker, a span */
    .handrail-marker
    
    /* Handle attached to the marker, a div */
    .handrail-handle
    
    /* Specific styles for the handle at the start of the selection */
    .handrail-handle-start
    
    /* Specific styles for the handle at the end of the selection */
    .handrail-handle-end

## Options
Handrail exposes a global `$handrail` object with the following method.

### Selection cancellation
Optionally, Handrail can cancel the selection when the user presses the escape key.
To turn this on, call `$handrail.respondToEscape(true)`.

## License
Copyright 2015 [Benjamin Pryke](www.benpryke.com)

Released under the [MIT license](http://en.wikipedia.org/wiki/MIT_License)

You are free to use Handrail in any other project (even commercial projects) as long as the copyright header is left intact.

Requires [jQuery](http://jquery.com/)
