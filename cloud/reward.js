exports.getRewardById = function(rewardId, returnBlock) 
{
	var Reward = Parse.Object.extend("Reward");
    var rewardQuery = new Parse.Query(Reward);
    rewardQuery.equalTo("objectId", rewardId);
    rewardQuery.first(returnBlock);
}

exports.saveUsedReward = function(user, store, reward, returnBlock) 
{
	var UsedReward = Parse.Object.extend("UsedReward");
	var usedReward = new UsedReward();
	usedReward.set("reward", reward);
	usedReward.set("store", store);
	usedReward.set("user", user);
	usedReward.save(null, 
	{
		success: function(usedReward) 
		{
			var usedRewardsRelation = user.relation("used_rewards");
			usedRewardsRelation.add(usedReward);
			checkCampaignReward(user, store, reward, 
			{
				success: function(result) 
				{
					user.save(null, returnBlock);
				},
				error: function(error) {
					returnBlock.error("Error: " + error.message);
				}
			});
		},
		error: function(error) {
			returnBlock.error("Error: " + error.message);
		}
	});
}

var checkCampaignReward = function(user, store, reward, returnBlock) 
{
	var mCampaign = require('cloud/campaign.js');
	mCampaign.getCampaignFromUserStoreReward(user, store, reward,
    {
    	success: function(campaign) 
    	{
    		if (campaign != null && campaign != undefined && campaign != false) 
    		{
    			campaign.set("used", true);
    			campaign.save(null,
    			{
    				success: function(campaign) {
    					returnBlock.success(true);
    				},
    				error: function(error) {
    					returnBlock.error(error);
    				}
    			});
    		}
    		else {
    			returnBlock.success(false);
    		};
    	},
    	error: function(error) {
    		returnBlock.error("Error loading user campaigns: " + error.message);
    	}
    });
}

exports.removeAllSpecialRewards = function(request, response, returnBlock)
{
    Parse.Cloud.useMasterKey();
    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.limit(100);
    query.skip(request.params.skip);
    query.descending("createdAt");
    var responseMsg = "";

    query.find(
    {
        success: function(users) 
        {
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                user.unset("specialReward", null);
            }

            // save all users
            Parse.Object.saveAll(users, returnBlock);
        },
        error: function (error) {
            response.error("Error retreiving users: "+ error.text);
        }
    });
}