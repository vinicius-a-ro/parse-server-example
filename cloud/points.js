exports.getPointsById = function(userId, returnBlock) 
{
	var User = Parse.Object.extend("User"); 
    var query = new Parse.Query(User);
    query.equalTo("objectId", userId);
    query.first(returnBlock);
}

exports.handleInvalidStore = function(request, response, pointsObject) 
{
    if (!pointsObject.has("store") ||
        pointsObject.get("store") == null ||
        pointsObject.get("store") == "undefined") {

        var Store = Parse.Object.extend("Store");
        var storeQuery = new Parse.Query(Store);
        storeQuery.equalTo("objectId", "sBIVgwgduF");
        storeQuery.first({
            success: function(store) {
                pointsObject.set("store", store);
                response.success();
            },
            error: function(error) {
                response.error(error.message);
            }
        });
    }
    else {
        response.success();
    }
}

exports.checkPointsFunction = function(request, response) 
{
    var limit = 100;
    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.limit(limit);
    query.skip(request.params.skip);
    var responseMsg = "";

    query.find(
    {
        success: function(users) 
        {
            var queries = [];

            for (var i = 0; i < users.length; i++) 
            {
                var user = users[i];
                var pointsRelation = user.relation("points");
                var pointsQuery = pointsRelation.query();
                queries.push(pointsQuery);
            };

            function makeQueries(qs)
            {
                qs.shift().find(
                {
                    success: function(userPoints) 
                    {
                        var aUser = users.shift();

                        if (userPoints.length > 1) 
                        {
                            responseMsg += "double points user: "+aUser.id + " / ";
                        };

                        if(qs.length) {
                            makeQueries(qs);
                        } else 
                        {
                            response.success("ok: "+responseMsg);
                        }
                    },
                    error: function() {
                        response.error('Error in inner queries nº' + totalLength - qs.length)
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