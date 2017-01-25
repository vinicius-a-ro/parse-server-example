exports.getUserById = function(userId, returnBlock) 
{
	var User = Parse.Object.extend("User"); 
    var query = new Parse.Query(User);
    query.equalTo("objectId", userId);
    query.first(returnBlock);
}

exports.incrementUserPointsByAmount = function(user, pointsAmount, returnBlock) 
{
	var pointsRelation = user.relation("points");
	var pointsQuery = pointsRelation.query();
	pointsQuery.ascending("createdAt");
	pointsQuery.first(
	{
		success: function(userPoints) 
		{
			var currentPointsAmount = userPoints.get("points");
			userPoints.set("points", currentPointsAmount + pointsAmount);
			userPoints.save(null, returnBlock);
		},
		error: function() {
			response.error("Error: " + error.message);
		}
	});
}



/*

Evolução semanal por número de usuários:
31/10 - 07/11: +174 usuarios (174, undf)
08/11 -  14/11: +89 usuarios (263, +51%)
15/11 - 21/11: +70 (333, +26%)
22/11 - 28/11: +80 (413, +24%)
29/11 - 05/12: +88 (501, +21%)
06/12 - 12/12: +42 (543 +8%)

*/

exports.setNewUserUnsubscribed = function(request, response, user)
{
    if (user.isNew())
    {
        // when the user is first saved it doesnt contain email, birthday and 
        // other information. Set this flag so the application can
        // save subscribe the user when it saves the remaining information
        user.set("subscribed", false);
    }

    response.success();
}

exports.subscribeAndSendWelcomeEmailToNewUser = function(request, response, user)
{
    function string_to_slug(str) 
    {
      // remove accents, swap ñ for n, etc
      var from = "ãàáäâèéëêìíïîòóöôõùúüûñç·/_,:;";
      var to   = "aaaaaeeeeiiiiooooouuuunc------";
      for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
      }

      return str;
    }

    Parse.Cloud.useMasterKey();

    // when the application saves the user again, it should have other
    // information, such as the email. That's when we subscribe him.
    if (user.get("subscribed") == false && user.has("email"))
    {
        var apikey = "6e6e743aa03eca83206092397dd3c1a4-us3";
        var id = "6caf6d4dd6";
        var params = new Object();
        var email = new Object();
        var emailInfo = new Object();
        var mergeVars = new Object();
        var batch = [];
        
        emailInfo.email = user.get("email");
        emailInfo.euid = user.id;
        emailInfo.leid = user.id;

        var firstName = string_to_slug(user.get("firstName"));
        var lastName = string_to_slug(user.get("lastName"));
        var username = user.get("username");
        username = string_to_slug(username);
        var splitedUsername = username.split(" ");

        if (firstName == "" || firstName == null) {
            mergeVars.FNAME = splitedUsername[0];
            mergeVars.LNAME = splitedUsername[splitedUsername.length-1];
        }        
        else {
            mergeVars.FNAME = firstName;
            mergeVars.LNAME = lastName;
        }

        email.email = emailInfo;
        email.email_type = "html";
        email.merge_vars = mergeVars;

        batch.push(email);

        //mailchimp keys
        params.apikey = "6e6e743aa03eca83206092397dd3c1a4-us3";
        params.id = "6caf6d4dd6";

        params.batch = batch;
        params.double_optin = false;
        params.update_existing = true;
        params.replace_interests = true;

        var jsonParams = JSON.stringify(params);

        Parse.Cloud.httpRequest(
        {
            method: "POST",
            url: "https://us3.api.mailchimp.com/2.0/lists/batch-subscribe.json",
            body: jsonParams,
            success: function(httpResponse) 
            {
                // set the user as subscribed.
                user.set("subscribed", true);
                user.save();

                // send welcome email
                var Mandrill = require('mandrill');
                Mandrill.initialize('BGIrikVEBAsJ0wNpIYgxAw');

                Mandrill.sendTemplate({
                    template_name: "johnnie-boas-vindas",
                    template_content: [],
                    message: {
                        subject: "Bem-vindo ao Clube Johnnie!",
                        from_email: "bydoo@blackape.com",
                        from_name: "Clube Johnnie",
                        to: [
                            {
                                email: emailInfo.email,
                                name: mergeVars.FNAME
                            }
                        ]
                    },
                    async: true
                    },
                {
                    success: function(httpResponse) {
                        console.log("Email sent!" + httpResponse.text);
                    },
                    error: function(httpResponse) {
                        console.error("Error sending welcome email: "+httpResponse.text);
                    }
                });
            },
            error: function(httpResponse) {
                console.error('Error contacting Mailchimp services: ' + httpResponse.code + ' :' + httpResponse.text);
            }
        });
    }
    else {
        if (!user.has("email")) {
            console.log("User email not defined");
        }
    };
}

exports.getPointsByUserFunction = function(request, response) 
{
/*
curl -k -X POST \
  -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
  -H "X-Parse-REST-API-Key: UdjUyQDLBLqZrrO3gNcCSa8XZbI9dwRR0oEdfiHW" \
  -H "Content-Type: application/json" \
  -d '{"skip":0, "minimumPoints":4, "maximumPoints":4}' \
  https://api.parse.com/1/functions/GetPointsByUser
*/
    
    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.limit(100);
    query.skip(request.params.skip);
    var responseMsg = "";
    var userPointsArray = [];
    var minimumPoints = request.params.minimumPoints;
    var maximumPoints = request.params.maximumPoints;

    if (minimumPoints == null) {
        minimumPoints = 3;        
    };
    if (maximumPoints == null) {
        maximumPoints = 100000;        
    };

    responseMsg += "(skiping: "+request.params.skip+") ";

    query.find(
    {
        success: function(users) 
        {
            var queries = [];

            responseMsg += "users count: "+users.length + " ";

            for (var i = 0; i < users.length; i++) 
            {
                var user = users[i];
                var pointsRelation = user.relation("points");
                var pointsQuery = pointsRelation.query();
                queries.push(pointsQuery);
            };

            // responseMsg += " queries count: "+queries.length + " ";

            function makeQueries(qs)
            {
                qs.shift().find(
                {
                    success: function(userPoints) 
                    {
                        var aUser = users.shift();

                        for (var i = 0; i < userPoints.length; i++) 
                        {
                            var points = userPoints[i].get('points');
                            
                            if (points >= minimumPoints && points <= maximumPoints) 
                            {
                                responseMsg += aUser.id + ": "
                                responseMsg += points + " "
                            };
                        };

                        if(qs.length) {
                            makeQueries(qs);
                        } else 
                        {
                            response.success("ok: "+responseMsg);
                        }
                    },
                    error: function(error) {
                        response.error('Error in inner queries nº' + qs.length + "error: "+error.message)
                    }
                });
            }

            makeQueries(queries);
        },
        error: function(error) 
        {
            response.error("Got an error " + error.code + " : " + error.message);
        }
    });
}

exports.setUsedWelcomeReward = function(request, response) 
{
    /*
    curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-REST-API-Key: UdjUyQDLBLqZrrO3gNcCSa8XZbI9dwRR0oEdfiHW" \
      -H "Content-Type: application/json" \
      -d '{"skip":1300}' \
      https://api.parse.com/1/functions/SetUsedWelcomeReward
    */
   
    var User = Parse.Object.extend("User");
    
    var query = new Parse.Query(User);

    query.limit(100);
    query.skip(request.params.skip);
    query.descending('createdAt');

    query.find(
    {
        success: function(users) 
        {
            for (var i = 0; i < users.length; i++) 
            {
                users[i].set('usedWelcomeReward', true);
            };

            Parse.Cloud.useMasterKey();
            Parse.Object.saveAll(users, 
            {
                success: function(list) 
                {
                    response.success("ok!");
                },
                error: function(error) {
                    response.success("error saving users: "+error.message);
                }
            });
        },
        error: function(error) {
            response.success("error retreiving users: "+error.message);
        }    
    });
}