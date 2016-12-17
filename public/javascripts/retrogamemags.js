var RetroGameMags = function() {

    var self = this;

    $(document).ready(function() {
		


    	self._toolTips();
	});
};

/**
 * generates tooltips for all objects which might have been added that require it
 * @return {undef}
 */
RetroGameMags.prototype._toolTips = function() {
    //apply tooltips
    $('.tooltip').tooltipster({
        theme: 'tooltipster-shadow',
        contentAsHTML: true,
        animation: 'grow'
    });
};

var retrogamemags = new RetroGameMags();