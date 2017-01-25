var mMandril      = require('cloud/mandril.js');

exports.sendEmail = function(request, response, subject, from_email, from_name, to_email, to_name, html) 
{
    var to = [
        {
            email: to_email,
            name: to_name
        }
    ];

    mMandrill.sendHTML(subject, from_email, from_name, to, html,
    {
        success: function(httpResponse) 
        {
            returnBlock.success(true);
        },
        error: function(error) {
            console.log("Erro ao enviar email");
            returnBlock.error("Erro ao enviar email");
        }
    });
}    
exports.subscribeAllUsersFunction = function(request, response, skip) 
{
    function string_to_slug(str) 
    {
      if (str == null || str == "") {
        return null;
      }

      // remove accents, swap ñ for n, etc
      var from = "ãàáäâèéëêìíïîòóöôõùúüûñç·/_,:;";
      var to   = "aaaaaeeeeiiiiooooouuuunc------";
      for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
      }

      return str;
    }

    Parse.Cloud.useMasterKey();
    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.limit(100);
    query.skip(skip);
    query.descending("createdAt");
    var responseMsg = "";

    query.find(
    {
        success: function(users) 
        {
            var params = new Object();
            var apikey = "6e6e743aa03eca83206092397dd3c1a4-us3";
            var mailchimpListId = "6caf6d4dd6";
            var batch = [];

            for (var i = 0; i < users.length; i++) 
            {
                var user = users[i];

                if (user.get("email") != null) 
                {
                    var email = new Object();
                    var emailInfo = new Object();
                    var mergeVars = new Object();
                    var hasMergeVars = false;

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
                    email.email_type = "text";
                    email.merge_vars = mergeVars;

                    batch.push(email);

                    // set the user as subscribed.
                    user.set("subscribed", true);
                    responseMsg += " user: "+mergeVars.FNAME + " " + mergeVars.LNAME;
                };
            }

            //mailchimp keys
            params.apikey = apikey;
            params.id = mailchimpListId;
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
                    // save all users
                    Parse.Object.saveAll(users, 
                    {
                        success: function() 
                        {
                            console.log("Sucess: user successfully saved!");
                            response.success("Success: "+ httpResponse.text);
                        },
                        error: function(error) {
                            response.success("Error: "+ httpResponse.text);
                        }
                    });
                },
                error: function(httpResponse) 
                {
                    console.log('Request failed with response code ' + httpResponse.code + ' :' + httpResponse.text);
                    response.error('Failed: '+ httpResponse.text + " msg: "+responseMsg);
                }
            });
        },
        error: function(error) {
            response.error("Error  " + error.message);
        }
    });   
}