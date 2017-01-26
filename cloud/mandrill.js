// -----------------------------------
// load modules
//
var mUtil 		= require('./util.js');

// -----------------------------------
// main functions
//

exports.sendHTML = function(subject, from_email, from_name, to, html, returnBlock)
{
	Parse.Cloud.httpRequest(
	{
    	method: 'POST',
    	headers: {
			'Content-Type': 'application/json'
	    },
	    url: 'https://mandrillapp.com/api/1.0/messages/send.json',
	    body:{
            key: "RJyRU39SJL8pZ0J79415sQ",
        	message: {
        		html: mUtil.removeAccents(html),
        		subject: mUtil.removeAccents(subject),
                from_email: from_email,
                from_name: mUtil.removeAccents(from_name),
	            to: to
			}
		},
	    success: function(httpResponse)
	    {
			returnBlock.success(true);
		},
		error: function(error) {
			console.log("Erro ao enviar email: " + error.message);
	        returnBlock.error("Erro ao enviar email");
	    }
	});
}
