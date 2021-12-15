/* This Javascript file will process the unsubscribe request by posting the email to the DMP OptExclusionQueue via the DMP API. 
This file will be updated per client and saved on their Azure Storage Account and then referenced in the header of the landing page.

You will need to request or compile the following 4 itmes to update on this script below:
  1) API Primary Key
  2) API Client Id
  3) Source website name - beginning part of staging site URL that identifies the client
  4) Client Teams Error Channel webhook URL

UPDATE! Replace the placeholder values below with your client specific values. You will replace in the 4 var items below.

When the unsubscribe button is clicked, a thank you message will display on the page. This text is set in this script. If you would like to update the simple script, 
UPDATE the text here in the triggerThankYou function below in the updateBodyMessage text section
*/

var primarySubscriptionKey = '';
var clientID = '';
var sourceWebsiteName = 'WIX';
var teamsWebhookURL = '';
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
$(function(){
    $(".email-text").text(getUrlParameter("email"));
});

function sendTeamsMessage(title, description, pageURL) {

    // set the request headers  

    let headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
    }
	
    let jsonData = getMessageCard(title, description, pageURL);

    return fetch(teamsWebhookURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: headers,
        body: JSON.stringify(jsonData)
    }).then((httpResponse) => {
        if (httpResponse.ok) {
            return httpResponse.text();
        } else {
            console.log(httpResponse.text());
            return Promise.reject(" message teams did not succeed, " + httpResponse.text());
        } 
    });
} // end postUnsubscribe



function getMessageCard(title, description, pageURL) {
    return {
        '@context': 'https://schema.org/extensions',
        '@type': 'MessageCard',
        'potentialAction': [
            {
                '@type': 'OpenUri',
                'name': 'Email Exclusion Page',
                'targets': [
                    {
                        'os': 'default',
                        'uri': pageURL
                    }
                ]
            }
        ],
        'sections': [
            {
                'text': description
            }
        ],
        'summary': title,
        'themeColor': '007200',
        'title': title
    };
}

// UPDATE OPTIONAL: Upon form unsubscribe button submission, defauilt to this thank you message replaced on the page. You can edit the text in the updateBodyMessage. 
// You can also setup a thank you webpage and update the script on the page level to redirect to that page instead

function triggerThankYou(redirectURL = null) {
    if (redirectURL) {
        window.location.replace(redirectURL);
    } else {
        updateBodyMessage("Thank You!", "We have removed your email address, you will no longer recieve emails from us.")
    }
}

function triggerError(jqXHR, textStatus, errorThrow) {
    updateBodyMessage("Something went wrong.", "We encountered a problem, team has been notified. Please try again later.");
    sendTeamsMessage(jqXHR.status + " " + textStatus, errorThrow,window.location.href);
}


function updateBodyMessage(headerText, bodyText) {
    $(".exclusion-header h2").text(headerText);
    $(".exclusion-body p").text(bodyText);
    $(".exclusion-buttons").css("display", "none");
    $(".email-text").css("display", "none");
    $(".unsubscribe-confirmation-text").css("display", "none");
}

//Send an email exclusion to the queue, if a url is provided, on success, it'll re-direct to that page otherwise it will replace the body content
function unsubscribeFromEmails(programcode = null, redirectURL = null) {
    var textEmailAddress = $('.email-text').text();
    var currentDate = new Date();
    var formatted = currentDate.toISOString().split('T')[0]; //yyyy-mm-dd


    if (textEmailAddress && textEmailAddress.toLowerCase() != "false") {

        $.ajax({
            type: "POST",
            url: "",

            // Request headers
            beforeSend: function (xhrObj) {
                xhrObj.setRequestHeader("Content-Type", "application/json");
                xhrObj.setRequestHeader("Cache-Control", "no-cache");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", primarySubscriptionKey);
            },
            // Request body
            data: JSON.stringify({
                'clientId': clientID,
                'source': sourceWebsiteName,
                'startDateTime': formatted,
                'emailExclude': [
                    {
                        'programCode': (programcode == null ? null : programcode),
                        'emailAddress': textEmailAddress
                    }
                ]
            })
        })
            .done(function (data) {
                if (!redirectURL) {
                    triggerThankYou();
                } else {
                    triggerThankYou(redirectURL);
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                triggerError(jqXHR, textStatus, errorThrown);
            });
    } else {
        console.error("Invalid Email Address");
    }
}

function cancelUnsubscribeFromEmails(redirectURL) {
    if (redirectURL) {
        window.location.replace(redirectURL);
    } else {
        console.error("Invalid redirect url");
    }
}