$('.monthly-promo-section .monthly-promo-container').each(function(k,promoContainer){
    var promoChildren = $(promoContainer).children();
    var isPromoContainerEmpty = !($(promoChildren).hasClass("promofix"));
    if(isPromoContainerEmpty){
        var firstParent = $(promoContainer)[0].parentNode;
        var secondParent = $(firstParent)[0].parentNode;
        var thirdParent = $(secondParent)[0].parentNode;
        $(thirdParent).hide();
    }
});


/*

	Usage:
		Create a parent div with monthly-promo-section as the class.
		Create inner div with monthly-promo-container as the class. This will be duplicated for multiple sections.
		Create another inner div with promofix and the promotion code. This will be duplicated for multiple promotions.
		
	This will hide all monthly-promo-section div's that do not contain the promofix class within the monthly-promo-container. 

*/