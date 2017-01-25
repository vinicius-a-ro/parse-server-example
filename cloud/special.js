
var mUtil = require('cloud/util.js');

exports.loadStoreWithId = function(storeId) 
{
  	var Store = Parse.Object.extend("Store");
    var storeQuery = new Parse.Query(Store);
    storeQuery.equalTo("objectId", storeId);
    storeQuery.first(
    {
    	success: function(store) {
    		return store;
    	},
    	error: function(error) {
    		return error;
    	}
    });
}

exports.manageNoSocialPointsCheckinAmount = function(response) 
{
    var Settings = Parse.Object.extend("Settings"); 
    var query = new Parse.Query(Settings);

    query.first(
    {
        success: function(settings)
        {
            var hours = mUtil.getCurrentHour();

            if (hours >= 12 && hours < 16) {
                settings.set("noSocialMediaCheckinPointsAmount", 5);
                settings.set("checkinPointsAmount", 4);
            } else {
                settings.set("noSocialMediaCheckinPointsAmount", 3);
                settings.set("checkinPointsAmount", 2);
            };

            settings.save();
            response.success("Settings successfuly updated. noSocialMediaCheckinPointsAmount: "+settings.get("noSocialMediaCheckinPointsAmount"));
        },
        error: function(error) {
            response.error(error.message);
        }
    });
}