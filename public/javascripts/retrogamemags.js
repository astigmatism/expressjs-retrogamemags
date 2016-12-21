var retroGameMags = (function() {

    var _tooltips = function($) {
        //apply tooltips
        $('.tooltip').tooltipster({
            theme: 'tooltipster-shadow',
            contentAsHTML: true,
            animation: 'grow'
        });
    };

    return {
        main: function($) {

            $(document).ready(function() {
                
                $('#slider').dateRangeSlider({
                    bounds: {
                        min: new Date(1988, 0, 1),
                        max: new Date(2000, 11, 31)
                    },
                    range:{
                        min: { months: 1},
                        max: { months: 12}
                    },
                    step:{
                        months: 1
                    },
                    defaultValues:{
                        min: new Date(1989, 0, 1),
                        max: new Date(1989, 1, 1)
                    },
                    valueLabels:"change",
                    delayOut: 4000
                    symmetricPositionning: true,
                    formatter:function(val) {
                        return $.format.date(val, "MMM yyyy")
                    }
                }).bind("valuesChanged", function(e, data){

                    $.get('/bydate?min=' + data.values.min + '&max=' + data.values.max, function(results) {

                        console.log(results);
                    });
                });


                _tooltips($);
            });
        }
    };

}());

retroGameMags.main(jQuery);