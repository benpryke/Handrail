/*
 * Handrail v0.22
 *
 * Interactive mobile and tablet style selection handles for desktop browsers.
 * Handrail enhances the user experience by providing greater control over text selection.
 * Give your users something to hold on to.
 *
 * Copyright 2015 Ben Pryke | www.benpryke.com
 * Released under the MIT license http://en.wikipedia.org/wiki/MIT_License
 * You are free to use Handrail in any other project (even commercial projects) as long as the copyright header is left intact.
 *
 * Requires jQuery http://jquery.com/
 */
(function (window, document, $) {
    // Variables =============================================================
    // We create 2 markers to reuse throughout.
    var marker1 = createMarker(true);
    var marker2 = createMarker(false);
    var respondToEscape = false;
    
    
    
    // External Handrail object ==============================================
    window.$handrail = {
        respondToEscape: function (shouldRespond) {
            respondToEscape = shouldRespond;
        }
    };
    
    
    
    // Methods ===============================================================
    // Inserts a marker into the document based on the current selection.
    // isBefore: true if this is the start marker, otherwise false.
    // Inspired by https://stackoverflow.com/a/8288313/604687
    // Inspired by https://stackoverflow.com/a/1589912/604687
    function insertMarker (isBefore) {
        var range;
        
        if (window.getSelection) {
            // IE9+ and non-IE
            var sel = window.getSelection();
            
            if (sel.getRangeAt) {
                range = window.getSelection().getRangeAt(0);
                range.collapse(isBefore);
            }
        } else if (document.selection && document.selection.createRange) {
            // IE < 9
            range = document.selection.createRange();
            range.collapse(isBefore);
        }
        
        // Create the marker element and insert it into the DOM.
        if (range) {
            range.insertNode(createMarker(isBefore));
        }
    }
    
    
    // Returns a new marker DOM object.
    // isBefore: true if this is the start marker, otherwise false.
    function createMarker (isBefore) {
        var marker = document.createElement('span');
        marker.className = 'handrail-marker';
        marker.id = (isBefore ? 'marker1' : 'marker2');
        
        var handle = document.createElement('div');
        handle.className = 'handrail-handle';
        marker.appendChild(handle);
        
        if (isBefore) {
            handle.className += ' handrail-handle-start';
            marker1 = marker;
        }
        else {
            handle.className += ' handrail-handle-end';
            marker2 = marker;
        }
        
        return (isBefore ? marker1 : marker2);
    }
    
    
    // Returns a specific marker DOM object.
    // isBefore: true if this is the start marker, otherwise false.
    function getMarker (isBefore) {
        return (isBefore ? marker1 : marker2);
    }
    
    
    // Returns the currently selected text.
    // From https://stackoverflow.com/a/5379408/604687
    function getSelectionText () {
        var text = '';
        
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != 'Control') {
            text = document.selection.createRange().text;
        }
        
        return text;
    }
    
    
    // Selects the text in a given element.
    // element: the DOM object to select.
    // Inspired by https://stackoverflow.com/a/987376/604687
    function selectTextInElement (element) {
        if (document.body.createTextRange) {
            var range = document.body.createTextRange();
            range.moveToElementText(element);
            range.select();
        } else if (window.getSelection) {
            var selection = window.getSelection();        
            var range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    
    
    // Clears the current selection.
    // From https://stackoverflow.com/a/3171348/604687
    function clearSelection () {
        var sel = window.getSelection ? window.getSelection() : document.selection;
        
        if (sel) {
            if (sel.removeAllRanges) {
                sel.removeAllRanges();
            } else if (sel.empty) {
                sel.empty();
            }
        }
    }
    
    
    // Returns true if the current selection is empty, otherwise false.
    function isSelectionEmpty () {
        return (getSelectionText().length === 0);
    }
    
    
    // Sets the current selection as the content between the markers.
    function selectSelection () {
        // Get jQuery references to the markers and their handles.
        var markers = $('.handrail-marker');
        var handles = $('.handrail-handle');
        
        // Make sure the handles are in the correct order.
        handles.removeClass('handrail-handle-start handrail-handle-end');
        handles.get(0).className += ' handrail-handle-start';
        handles.get(1).className += ' handrail-handle-end';
        
        if (window.getSelection) {
            // IE9+ and non-IE
            var sel = window.getSelection();
            var range = document.createRange();
            range.setStartAfter(markers.get(0));
            range.setEndBefore(markers.get(1));
            sel.removeAllRanges();
            sel.addRange(range);
        }
        else if (document.selection && document.selection.createRange) {
            // IE < 9
            var range = document.selection.createRange();
            range.setStartAfter(markers.get(0));
            range.setEndBefore(markers.get(1));
            range.select();
        }
    }
    
    
    // Alters the selection while a marker is being dragged.
    // event: the mousemove event.
    // marker: the DOM marker object being dragged.
    function changeSelection (event, marker) {
        event.preventDefault();
        
        // https://developer.mozilla.org/en-US/docs/Web/API/Document/caretPositionFromPoint
        var range;
        var x = event.clientX;
        var y = event.clientY;
        
        if (document.caretPositionFromPoint) {
            // standard
            range = document.caretPositionFromPoint(x, y);
        }
        else if (document.caretRangeFromPoint) {
            // WebKit
            range = document.caretRangeFromPoint(x, y);
        }
        
        // Move the marker from its old location to its new one.
        range.insertNode($("#" + marker.id).remove()[0]);
        
        // Select whatever is between the two markers.
        selectSelection();
    }
    
    
    // If there is one, adds markers arround the current selection.
    // Otherwise, removes markers and joins split text elements.
    function displayMarkers () {
        // There are 2 possible situations:
        // 1) the selection is empty, we should remove all markers.
        // 2) the selection is not empty, we should remove markers before we insert new ones.
        // This also solves case where one marker was dragged on top of the other.
        var markers = $('.handrail-marker');
        
        if (markers.length > 0) {
            // After we remove the markers, we normalize their parent nodes to merge any split text nodes.
            var parent0 = markers.get(0).parentNode;
            var parent1 = markers.get(1).parentNode;
            markers.remove();
            parent0.normalize();
            if (parent1 !== parent0) parent1.normalize();
        }
        
        if (!isSelectionEmpty()) {
            insertMarker(true);
            insertMarker(false);
            
            // Inserting elements into the current selection on mouseup can change the selection. This fixes that.
            selectSelection();
        }
    }
    
    
    
    // Events ================================================================
    $(document).mousedown(function (event) {
        // On mousedown there are 3 options:
        // 1) User clicked on current selection
        // 2) User clicked outside current selection or there is no selection
        // 3) User clicked outside current selection on marker
        // .marker mousedown preventDefault deals with option 3.
        // For option 1, we want to maintain markers.
        // For option 2, we want to remove markers.
        // isSelectionEmpty will return false until after mousedown has finished triggering as it appears to be processed last, so we wait for 1 millisecond before checking the selection via displayMarkers.
        setTimeout(displayMarkers, 1);
    });
    
    $(document).mouseup(function (event) {    
        // Handle triple click.
        if (event.originalEvent.detail === 3) {
            $('.handrail-marker').remove();
            event.target.normalize();
            selectTextInElement(event.target);
        }
        
        // There may well be a new selection after mouseup.
        displayMarkers();
    });
    
    // Handle text dragging.
    $(document).on('dragend', function (event) {
        // We have 2 options on dragend:
        // 1) Something was dragged and the previously selected text is no longer selected.
        // 2) The selected text was dragged but is still selected.
        // Each case is delt with by displayMarkers.
        displayMarkers();
    });
    
    // Clear selection on escape.
    $(document).keyup(function (event) {
        // If the escape key is down.
        if (respondToEscape && event.keyCode === 27) {
            clearSelection();
            displayMarkers();
        }
    });
    
    // Handle ctrl+a shortcut.
    $(document).keydown(function (event) {
        // If the control key is down.
        if (event.keyCode === 17) {
            $(document).on('keydown.ctrl', function (event) {
                // If the 'a' key is pressed.
                if (event.keyCode === 65) setTimeout(displayMarkers, 1);
            })
            .keyup(function (event) {
                if (event.keyCode === 17) $(document).off('keydown.ctrl');
            });
        }
    });
    
    // Drag markers.
    $(document).on('mousedown', '.handrail-marker', function (event) {
        event.preventDefault();
        
        var me = this;
        $(document).on('mousemove.dragmarker', function (event) {
            changeSelection(event, me);
        })
        .mouseup(function () {
            $(document).off('mousemove.dragmarker');
        });
    });
})(window, document, jQuery);
