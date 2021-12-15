var currentStep = 1;
var maxSteps;
var currentIdentifierMethod; //0 for offer code 1 for serial number
var jsonData;

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};

$(function () {
    maxSteps = $('.step[data-step]').length;
    currentIdentifierMethod = 0;
    $('.step-number').text(currentStep);
    $('#serial-number').toggle();
    //getOfferData("OfferCode", "X4N2DVCL49");
    var offerCodeURLParam = getUrlParameter("offercode");

    if (offerCodeURLParam != false) {
        console.log(offerCodeURLParam);
        $('#offer-code').val(offerCodeURLParam);
    }
})


function nextStep() {
    if ($("#offer-code").val() != "" && currentIdentifierMethod == 0 || $("#serial-number").val() != "" && currentIdentifierMethod == 1) {
        if (currentStep == 1 && $(".plan").length == 0) {
            var searchType = currentIdentifierMethod === 0 ? "OfferCode" : "serialnumber";
            var searchValue = currentIdentifierMethod === 0 ? $('#offer-code').val() : $('#serial-number').val();
            getOfferData(searchType, searchValue);
        }
        incrementStep(1);
    } else {
        var searchType = currentIdentifierMethod === 0 ? "offer code" : "serial number";
        console.log(searchType);
        alert("Please enter your " + searchType + "!");
    }
}

function previousStep() {
    incrementStep(-1);
}

function switchWarrantyIdentifier(triggeredElement) {
    $('#offer-code').toggle();
    $('#serial-number').toggle();
    var inputTypeText = currentIdentifierMethod === 0 ? 'offer code' : 'serial number';
    if (triggeredElement) {
        triggeredElement.innerHTML = "switch to " + inputTypeText;
    }
    currentIdentifierMethod = $('#offer-code').css('display') == 'none' ? 1 : 0;
    console.log(currentIdentifierMethod);
}

function incrementStep(stepIncrement) {
    //Checking bounds to stay within steps 1 to n
    if (currentStep >= maxSteps && stepIncrement > 0 || currentStep <= 1 && stepIncrement < 0) return;

    currentStep += stepIncrement;
    $('.step[data-step!="' + currentStep + '"]').hide();
    $('.step[data-step="' + currentStep + '"]').show();
    $('.step-number').text(currentStep);
}

function findAttribute(collection, key) {
    for (const o of collection) {
        for (const [k, v] of Object.entries(o)) {
            if (k === key) {
                return o[key];
            }
            if (Array.isArray(v)) {
                const _o = findAttribute(v, key)
                if (_o) {
                    return _o;
                }
            }
        }
    }
}

function adjustViewContent(data) {
    var viewContentBlocks = $('[data-dynamicAttribute]');
    viewContentBlocks.each(function (key, htmlElement) {
        var elementWithAttribute = $(htmlElement);
        var attributeValue = findAttribute(data, elementWithAttribute.attr('data-dynamicAttribute'));
        if (!attributeValue) attributeValue = "[UNDEFINED]";
        console.log(key, elementWithAttribute, attributeValue);
        if (elementWithAttribute.attr('data-dynamicAttribute') != 'termMonths') {
            elementWithAttribute[0].innerHTML = attributeValue;
        } else {
            var parsedTermYears = (parseInt(attributeValue) / 12) + "";
            //console.log(attributeValue, parsedTermYears);
            elementWithAttribute[0].innerHTML = parsedTermYears;
        }
    });
}

function getOfferData(searchBy, searchValue) {
    $.ajax({
        type: "POST",
        url: "",
        dataType: 'json',

        // Request headers
        beforeSend: function (xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/json");
            xhrObj.setRequestHeader("Cache-Control", "no-cache");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "");
        },
        // Request body
        data: JSON.stringify({
            "clientId": clientId,
            "searchType": searchBy,
            "searchValue": searchValue
        }),
    })
        .done(function (data) {
            jsonData = data.properties;
            populatePlanContainer(data.properties);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            incrementStep(-1);
            console.error(jqXHR, textStatus, errorThrown);
        });
}

function populatePlanContainer(offerData) {
    var currentSKU, currentSerial;
    var template = ""

    if (offerData) {
        var solicitationOffers = offerData[0]["propertySolicitations"][0]["solicitationOffers"]
        var products = solicitationOffers[0]["products"];
        var skus = solicitationOffers[0]["SKUs"];
        console.log(products, skus, (products + skus));
        products.forEach(function (kproduct, vproduct) {
            skus.forEach(function (ksku, vsku) {
                var template = '<div class="plan" data-solicitationOfferId="' + ksku['solicitationOfferId'] + '" data-serial="' + kproduct['serialNumber'] + '">' +
                    '<div class="plan-content">' +
                    '<p class="plan-description">' +
                    '<b class="plan-title"><span>' + (parseInt(ksku['termMonths']) / 12) + '</span>-Year Extended' +
                    ' Service Plan <span style="' + ((parseInt(ksku['termMonths']) / 12) == 3 ? "display: inline;" : "display: none;") + '">(Best Value)</span></b><br>' +
                    '<span>' + kproduct['manufacturer'] + '</span> brand <span ' +
                    '>' + kproduct['category'] + '</span><br><br>' +
                    '<b>Discounted Price:</b> $<span>' + ksku['price'] + '</span>' +
                    '</p>' +
                    '<div>' +
                    '<div class="radio-container"><input id="' + ksku['solicitationOfferId'] + '" type="radio" name="solicitationOfferId"' +
                    'value="' + ksku['solicitationOfferId'] + '"></div><label for="' + ksku['solicitationOfferId'] + '">CHOOSE ' +
                    'THIS PLAN AND CHECKOUT</label>' +
                    '</div>' +
                    '</div>' +
                    '<div class="plan-image">' +
                    '<img alt="" src="' + kproduct['manufacturer'] + '_' + kproduct['subCategory'] + '.png">' +
                    '</div>' +
                    '</div>'

                $('.plan-container').prepend(template);
            })
        });

        adjustViewContent(offerData);

    }
}
