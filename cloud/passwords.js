exports.deleteOldPasswords = function(returnBlock) 
{
	// list the users to add points and set the campaign
    var Password = Parse.Object.extend("Password"); 
    var query = new Parse.Query(Password);
    query.limit(1000);
    query.ascending("createdAt");
    query.doesNotExist("batch");
    var responseMsg = "";

    query.find(
    {
        success: function(passwords) 
        {
            Parse.Object.destroyAll(passwords, 
            {
                success: function() 
                {
                    responseMsg += "total: "+passwords.length;
                    returnBlock.success({message: "success: "+responseMsg});
                },
                error: function(error) {
                	returnBlock.error({message: "error: "+error.message})
                }
            });
        },
        error: function(error) {
            returnBlock.error("error: "+error.message);
        }
    });
}