var userBlacklist = ["YcQA29SueZ", "B7B5A4XjqZ", "6Uv12Kr1i7", "UOArUMwOeH", "4Qe6tfDzbG"];

/* 
UOArUMwOeH = deivisson 
4Qe6tfDzbG = facebook test user

*/

/*
Usuários interessantes
oKl4xdAozO = Gui Gastro, 21 pontos em 5 dias
dMZ3CXACJ4 = eu
WwxZ51imRF = Selassi Neto, juntando pontos desde 05 de Dezembro, atualmente com 18 pontos
w3SrB2t4ah = Guilherme Fernandes, juntando pontos desde 16 de Novembro, atualmente com 11 pontos
FHqcpcrM83 = Alexandre Medeiros, juntando pontos desde 13 de Novembro, atualmente com 24 pontos
ykOwDauoSP = Sarah Bertina, juntando pontos desde 01 de Novembro, atualmente com 14 pontos
d0S7DVXq7Z = Luciano Calado, juntando pontos desde 31 de Outubro, atualmente com 18 pontos

*/

exports.getCampaignFromUserStore = function(user, store, returnBlock) 
{
    var Campaign = Parse.Object.extend("Campaign");
    var campaignQuery = new Parse.Query(Campaign);
    campaignQuery.equalTo("user", user);
    campaignQuery.equalTo("store", store);
    campaignQuery.containedIn("used", [null, undefined, false]);
    campaignQuery.include("reward");
    campaignQuery.first(returnBlock);
}

exports.getCampaignFromUserStoreReward = function(user, store, reward, returnBlock) 
{
    var Campaign = Parse.Object.extend("Campaign");
    var campaignQuery = new Parse.Query(Campaign);
    campaignQuery.equalTo("user", user);
    campaignQuery.equalTo("store", store);
    campaignQuery.equalTo("reward", reward);
    campaignQuery.containedIn("used", [null, undefined, false]);
    campaignQuery.first(returnBlock);
}

exports.sendMissingYouCampaignFunction = function(request, campaignId, returnBlock) 
{
    /*
    curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-REST-API-Key: UdjUyQDLBLqZrrO3gNcCSa8XZbI9dwRR0oEdfiHW" \
      -H "Content-Type: application/json" \
      -d '{"skip":0}' \
      https://api.parse.com/1/functions/SendMissingYouCampaign
    */

    // find the right campaign
    var Campaign = Parse.Object.extend("Campaign");
    var campaignQuery = new Parse.Query(Campaign);
    campaignQuery.equalTo("objectId", campaignId);
    campaignQuery.first(
    {
        success: function(campaign) 
        {
            // list the users to add points and set the campaign
            var User = Parse.Object.extend("User"); 
            var query = new Parse.Query(User);
            query.limit(100);
            query.skip(request.params.skip);
            query.ascending("createdAt");
            var responseMsg = "";
            var affectedUserArray = [];

            var maximumLastCheckinAt = new Date("Fri Jan 16 2015 00:00:00 GMT+0000 (UTC)");
            var minimumCreatedAt = new Date("Fri Jan 16 2015 00:00:00 GMT+0000 (UTC)");

            responseMsg += "(skiping "+request.params.skip+") ";

            query.find(
            {
                success: function(users) 
                {
                    // create a list of user queries to get the points 
                    // for each user
                    var queries = [];
                    var usersList = users.slice(0);

                    for (var i = 0; i < users.length; i++) 
                    {
                        var user = users[i];
                        var pointsRelation = user.relation("points");
                        var pointsQuery = pointsRelation.query();
                        pointsQuery.ascending("createdAt");
                        queries.push(pointsQuery);
                    };

                    // call each query
                    makeQueries(queries);

                    // function that runs each query, one after the other
                    // is done (using the shift operator)
                    function makeQueries(qs)
                    {
                        qs.shift().first(
                        {
                            success: function(userPoints) 
                            {
                                var aUser = usersList.shift();

                                if (userPoints != null)
                                {
                                    if (userPoints.get('points') == 3 && 
                                        userPoints.get('lastCheckinAt') <= maximumLastCheckinAt &&
                                        userPoints.createdAt <= minimumCreatedAt)
                                    {
                                        // add to the campaign list
                                        var campaignsRelation = aUser.relation("campaigns");
                                        campaignsRelation.add(campaign);

                                        // add user to the affectedUserArray
                                        affectedUserArray.push(aUser);
                                        responseMsg += aUser.get("username") + " ";
                                    };
                                };

                                if(qs.length) {
                                    makeQueries(qs);
                                } else 
                                {
                                    responseMsg += "("+affectedUserArray.length + " users affected) ";

                                    //save all users (this saves the campaigns added to the users relations)
                                    Parse.Cloud.useMasterKey();
                                    Parse.Object.saveAll(affectedUserArray,
                                    {
                                        success: function(userList) 
                                        {
                                            returnBlock.success("ok "+ new Date() + " " + responseMsg);
                                        },
                                        error: function(error) {
                                            returnBlock.error("failure saving user list " + error.message);
                                        }
                                    });
                                }
                            },
                            error: function() {
                                returnBlock.error('Error in inner queries nº' + totalLength - qs.length);
                            }
                        });
                    }
                },
                error: function(error) 
                {
                    returnBlock.error("Error loading users: " + error.code + " : " + error.message);
                }
            });
        },
        error: function(error) 
        {
            returnBlock.error('Error loading campaing: ' + error.message);
        }
    });
}

exports.sendChristmasCampaignFunction = function(request, response, campaignId, rewardId, pushMessage) 
{
    /*
    curl -k -X POST \
      -H "X-Parse-Application-Id: iPL6rzx97VolBmLjHCqG3TfsYzd0p2Oaepg3kWtl" \
      -H "X-Parse-REST-API-Key: bXXQpK7XR4fXEeW12WdWBHyXT3u0enGn4zKWuh4b" \
      -H "Content-Type: application/json" \
      -d '{"skip":0}' \
      https://api.parse.com/1/functions/SendCampaign
    */

    // find the right campaign
    var Campaign = Parse.Object.extend("Campaign");
    var campaignQuery = new Parse.Query(Campaign);
    campaignQuery.equalTo("objectId", campaignId);
    campaignQuery.first(
    {
        success: function(campaign) 
        {
            // find the reward
            var Reward = Parse.Object.extend("Reward");
            var rewardQuery = new Parse.Query(Reward);
            rewardQuery.equalTo("objectId", rewardId);
            rewardQuery.first(
            {
                success: function(specialReward) 
                {
                    // list the users to add points and set the campaign
                    var User = Parse.Object.extend("User"); 
                    var query = new Parse.Query(User);
                    query.limit(100);
                    query.skip(request.params.skip);
                    query.ascending("createdAt");
                    var responseMsg = "";
                    var userPointsRelationsArray = [];
                    var campaignsRelationArray = [];
                    var affectedUserArray = [];

                    responseMsg += "(skiping "+request.params.skip+") ";

                    query.find(
                    {
                        success: function(users) 
                        {
                            // create a list of user queries to get the points 
                            // for each user
                            var queries = [];
                            var usersList = users.slice(0);

                            for (var i = 0; i < users.length; i++) 
                            {
                                var user = users[i];
                                var pointsRelation = user.relation("points");
                                var pointsQuery = pointsRelation.query();
                                pointsQuery.ascending("createdAt");
                                queries.push(pointsQuery);
                            };

                            // function that runs each query, one after the other
                            // is done (using the shift operator)
                            function makeQueries(qs)
                            {
                                qs.shift().first(
                                {
                                    success: function(userPoints) 
                                    {
                                        var aUser = usersList.shift();

                                        if (userPoints != null)
                                        {
                                            if (userPoints.get('points') == 0)
                                            {
                                                // add to the campaign list
                                                var campaignsRelation = aUser.relation("campaigns");
                                                campaignsRelation.add(campaign);
                                                aUser.set("specialReward", specialReward);
                                                aUser.set("usedWelcomeReward", true);

                                                // add user to the affectedUserArray
                                                affectedUserArray.push(aUser);
                                            };
                                        };

                                        if(qs.length) {
                                            makeQueries(qs);
                                        } else 
                                        {
                                            responseMsg += "("+affectedUserArray.length + " users affected) ";

                                            //save all users (this saves the campaigns added to the users relations)
                                            Parse.Cloud.useMasterKey();
                                            Parse.Object.saveAll(affectedUserArray,
                                            {
                                                success: function(userList) 
                                                {
                                                    // push
                                                    var pushQuery = new Parse.Query(Parse.Installation);
                                                    pushQuery.containedIn("user", affectedUserArray);

                                                    Parse.Push.send({
                                                        where: 
                                                            pushQuery, // Set our Installation query
                                                        data: {
                                                            alert: pushMessage,
                                                            sound: ""
                                                        }
                                                    }, 
                                                    {
                                                        success: function() 
                                                        {
                                                            response.success("ok "+ new Date() + " " + responseMsg);
                                                        },
                                                        error: function(error) {
                                                            response.error("failure sending push " + error.message);
                                                        }
                                                    });

                                                },
                                                error: function(error) {
                                                    response.error("failure on saving log list " + error.message);
                                                }
                                            });
                                        }
                                    },
                                    error: function() {
                                        response.error('Error in inner queries nº' + totalLength - qs.length);
                                    }
                                });
                            }

                            // call each query
                            makeQueries(queries);
                        },
                        error: function(error) 
                        {
                            response.error("Error loading users: " + error.code + " : " + error.message);
                        }
                    });
                },
                error: function(error) {
                    response.error("Error retrieving special reward: " + error.message);
                }
            });
        },
        error: function(error) 
        {
            response.error('Error loading campaing: ' + error.message);
        }
    });
}

exports.checkUsedChristmasCampaignFunction = function(request, response, skip, campaignId, currentRewardId, targetRewardId, pushMessage) 
{
    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.limit(100);
    query.skip(skip);
    var responseMsg = "";
    var userRewardsRelationsArray = [];
    var userPointsRelationsArray = [];
    var userCampaignRelationsArray = [];

    // find the reward
    var Reward = Parse.Object.extend("Reward");
    var rewardQuery = new Parse.Query(Reward);
    rewardQuery.equalTo("objectId", targetRewardId);
    rewardQuery.first(
    {
        success: function(specialReward) {
            // lists all the users to check the points
            query.find(
            {
                success: function(users) 
                {
                    // Creates an array of queries that will check the used rewards of
                    // each user. The points must be substracted if and only if the user
                    // is participating in the campaign (has received the extra points)
                    // AND hasn't used any reward.
                    var rewardsQueries = [];
                    var campaignsQueries = [];

                    var hasUsedRewardDuringCampaignUserArray = [];
                    var isCampaignParticipantUserArray = [];

                    var usersCopy1 = users.slice(0);

                    for (var i = 0; i < users.length; i++) 
                    {
                        var user = users[i];

                        // populate the user campaigns queries array
                        var campaignsRelation = user.relation("campaigns");
                        var campaignsQuery = campaignsRelation.query();
                        campaignsQueries.push(campaignsQuery);
                    };

                    // run the campaign queries
                    makeCampaignQueries(campaignsQueries);

                    function makeCampaignQueries(qs)
                    {
                        qs.shift().find(
                        {
                            success: function(userCampaigns) 
                            {
                                var aUser = usersCopy1.shift();

                                // only valid for users not in the blacklist
                                if (userBlacklist.indexOf(aUser.id) == -1) 
                                {
                                    if (userCampaigns)
                                    {
                                        for (var i = 0; i < userCampaigns.length; i++) 
                                        {
                                            var campaign = userCampaigns[i];
                                            if (campaign.id == campaignId) 
                                            {
                                                isCampaignParticipantUserArray.push(aUser);
                                            };
                                        };
                                    }
                                };

                                if(qs.length) 
                                {
                                    makeCampaignQueries(qs);
                                } else 
                                {
                                    for (var i = 0; i < isCampaignParticipantUserArray.length; i++) 
                                    {
                                        // populate the user rewards queries array
                                        var user = isCampaignParticipantUserArray[i];
                                        var usedRewardsRelation = user.relation("used_rewards");
                                        var usedRewardsQuery = usedRewardsRelation.query();
                                        usedRewardsQuery.descending("createdAt");
                                        rewardsQueries.push(usedRewardsQuery);
                                    };

                                    makeRewardsQueries(rewardsQueries);
                                }
                            },
                            error: function() {
                                response.error('Error in inner queries nº' + totalLength - qs.length);
                            }
                        });
                    }

                    function makeRewardsQueries(qs)
                    {
                        qs.shift().find(
                        {
                            success: function(userUsedRewards) 
                            {
                                var aUser = isCampaignParticipantUserArray.shift();

                                var foundValidReward = false;
                                var rewardIdArray = [];

                                for (var i = 0; i < userUsedRewards.length; i++) 
                                {
                                    var userUsedReward = userUsedRewards[i];
                                    var rewardId = userUsedReward.get("reward").id;
                                    rewardIdArray.push(rewardId);
                                    if (rewardId == currentRewardId && !aUser.has("specialReward"))
                                    {
                                        foundValidReward = true;
                                    }
                                };

                                if (foundValidReward == true) 
                                {
                                    // Checks if the user have already used the target reward.
                                    // If yes, ignore this user.
                                    if (rewardIdArray.indexOf(targetRewardId) == -1) 
                                    {
                                        hasUsedRewardDuringCampaignUserArray.push(aUser);
                                        responseMsg += "id = "+aUser.id+" ";
                                    };
                                }

                                if(qs.length) {
                                    makeRewardsQueries(qs);
                                } else 
                                {
                                    for (var i = 0; i < hasUsedRewardDuringCampaignUserArray.length; i++) 
                                    {
                                        var user = hasUsedRewardDuringCampaignUserArray[i];
                                        user.set("specialReward", specialReward);
                                    };

                                    // save all users (this saves the campaigns added to the users relations)
                                    Parse.Cloud.useMasterKey();
                                    Parse.Object.saveAll(hasUsedRewardDuringCampaignUserArray,
                                    {
                                        success: function(userList) 
                                        {
                                            responseMsg += "("+hasUsedRewardDuringCampaignUserArray.length + " users affected) ";

                                            // push
                                            var pushQuery = new Parse.Query(Parse.Installation);
                                            pushQuery.containedIn("user", hasUsedRewardDuringCampaignUserArray);

                                            Parse.Push.send({
                                                where: 
                                                    pushQuery, // Set our Installation query
                                                data: {
                                                    alert: pushMessage,
                                                    sound: ""
                                                }
                                            }, 
                                            {
                                                success: function() 
                                                {
                                                    response.success("ok "+ new Date() + " " + responseMsg);
                                                },
                                                error: function(error) {
                                                    response.error("failure on sending push " + error.message);
                                                }
                                            });

                                        },
                                        error: function(error) {
                                            response.error("failure on saving log list " + error.message);
                                        }
                                    });
                                }
                            },
                            error: function() {
                                response.error('Error in inner queries nº' + totalLength - qs.length)
                            }
                        });
                    }
                },
                error: function(error) 
                {
                    response.error("Got an error " + error.code + " : " + error.message);
                }
            });
        },
        error: function(error) {
            response.error("Error retrieving special reward: " + error.message);
        }
    });
}

exports.sendExtraPointsFunction = function(request, response, campaignId) 
{
	// find the right campaign
    var Campaign = Parse.Object.extend("Campaign");
    var campaignQuery = new Parse.Query(Campaign);
    campaignQuery.equalTo("objectId", campaignId);
    campaignQuery.first(
    {
        success: function(campaign) 
        {
            // list the users to add points and set the campaign
            var User = Parse.Object.extend("User"); 
            var query = new Parse.Query(User);
            query.limit(100);
            query.skip(request.params.skip);
            query.ascending("createdAt");
            var responseMsg = "";
            var userPointsRelationsArray = [];
            var campaignsRelationArray = [];
            var affectedUserArray = [];
            var maximumLastCheckinAt = new Date("Wed Nov 5 2014 00:00:00 GMT+0000 (UTC)");
            var minimumCreatedAt = new Date("Wed Nov 5 2014 00:00:00 GMT+0000 (UTC)");

            responseMsg += "(skiping "+request.params.skip+") ";

            query.find(
            {
                success: function(users) 
                {
                    // create a list of user queries to get the points 
                    // for each user
                    var queries = [];
                    var usersList = users.slice(0);

                    for (var i = 0; i < users.length; i++) 
                    {
                        var user = users[i];
                        var pointsRelation = user.relation("points");
                        var pointsQuery = pointsRelation.query();
                        pointsQuery.ascending("createdAt");
                        queries.push(pointsQuery);
                    };

                    // function that runs each query, one after the other
                    // is done (using the shift operator)
                    function makeQueries(qs)
                    {
                        qs.shift().first(
                        {
                            success: function(userPoints) 
                            {
                                var aUser = usersList.shift();

                                if (userPoints != null && 
                                    userPoints.get('points') != null && 
                                    userPoints.get('points') != "undefined")
                                {
                                    if (userPoints.get('lastCheckinAt') <= maximumLastCheckinAt &&
                                        userPoints.createdAt <= minimumCreatedAt) 
                                    {
                                        // add to the campaign list
                                        var campaignsRelation = aUser.relation("campaigns");
                                        campaignsRelation.add(campaign);

                                        // increment points
                                        var currentPointsAmount = userPoints.get('points');
                                        var targetPointsAmount = currentPointsAmount + 6;
                                        responseMsg += aUser.get('username')+ ": "+targetPointsAmount+ " ";
                                        userPoints.set("points", targetPointsAmount);
                                        userPointsRelationsArray.push(userPoints);

                                        // add user to the affectedUserArray
                                        affectedUserArray.push(aUser);
                                    };
                                };

                                if(qs.length) {
                                    makeQueries(qs);
                                } else 
                                {
                                    responseMsg += "("+affectedUserArray.length + " users affected) ";

                                    //save all users (this saves the campaigns added to the users relations)
                                    Parse.Cloud.useMasterKey();
                                    Parse.Object.saveAll(affectedUserArray,
                                    {
                                        success: function(userList) 
                                        {
                                            responseMsg += userPointsRelationsArray.length + " (points relations affected) ";

                                            // save all user points (this saves all the user points records 
                                            // that received the increment).
                                            Parse.Cloud.useMasterKey();
                                            Parse.Object.saveAll(userPointsRelationsArray, 
                                            {
                                                success: function(list) 
                                                {
                                                    // push
                                                    var pushQuery = new Parse.Query(Parse.Installation);
                                                    pushQuery.equalTo('deviceType', 'ios');
                                                    pushQuery.containedIn("user", affectedUserArray);

                                                    Parse.Push.send({
                                                        where: 
                                                            pushQuery, // Set our Installation query
                                                        data: {
                                                            alert: "Olá! Você tem +6 pontos extras para gastar até a próxima Quarta-feira 03/12! Corre já pro Johnnie e peça sua recompensa :)",
                                                            sound: ""
                                                        }
                                                    }, 
                                                    {
                                                        success: function() 
                                                        {
                                                            response.success("ok "+ new Date() + " " + responseMsg);
                                                        },
                                                        error: function(error) {
                                                            response.error("failure on sending push " + error.message);
                                                        }
                                                    });
                                                },
                                                error: function(error) 
                                                {
                                                    response.error("failure on saving user list " + error.message);
                                                },
                                            });
                                        },
                                        error: function(error) {
                                            response.error("failure on saving log list " + error.message);
                                        }
                                    });
                                }
                            },
                            error: function() {
                                response.error('Error in inner queries nº' + totalLength - qs.length);
                            }
                        });
                    }

                    // call each query
                    makeQueries(queries);
                },
                error: function(error) 
                {
                    response.error("Got an error " + error.code + " : " + error.message);
                }
            });
        },
        error: function(error) 
        {
            response.error('Error loading campaing' + error.message);
        }
    });
}

exports.removeExtraPointsFunction = function(request, response, campaignId, sentRewardDate) 
{
	var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.limit(100);
    query.skip(request.params.skip);
    var responseMsg = "";
    var userRewardsRelationsArray = [];
    var userPointsRelationsArray = [];
    var userCampaignRelationsArray = [];

    // configure campaign variables
    var notValidRewards = ["RVGhCKcoQn"];

    // lists all the users to check the points
    query.find(
    {
        success: function(users) 
        {
            // Creates an array of queries that will check the used rewards of
            // each user. The points must be substracted if and only if the user
            // is participating in the campaign (has received the extra points)
            // AND hasn't used any reward.
            var rewardsQueries = [];
            var campaignsQueries = [];
            var pointsQueries = [];

            var hasNotUsedRewardDuringCampaignUserArray = [];
            var isCampaignParticipantUserArray = [];

            var usersCopy1 = users.slice(0);

            for (var i = 0; i < users.length; i++) 
            {
                var user = users[i];

                // populate the user campaigns queries array
                var campaignsRelation = user.relation("campaigns");
                var campaignsQuery = campaignsRelation.query();
                campaignsQueries.push(campaignsQuery);
            };

            // run the campaign queries
            makeCampaignQueries(campaignsQueries);

            function makeCampaignQueries(qs)
            {
                qs.shift().find(
                {
                    success: function(userCampaigns) 
                    {
                        var aUser = usersCopy1.shift();

                        if (userCampaigns)
                        {
                            for (var i = 0; i < userCampaigns.length; i++) 
                            {
                                var campaign = userCampaigns[i];
                                if (campaign.id == campaignId) 
                                {
                                    isCampaignParticipantUserArray.push(aUser);
                                };
                            };
                        }
                        // else {
                        //     responseMsg += "no campaign for user: "+aUser.get("username") + " ";
                        // }

                        if(qs.length) 
                        {
                            makeCampaignQueries(qs);
                        } else 
                        {
                            for (var i = 0; i < isCampaignParticipantUserArray.length; i++) 
                            {
                                // populate the user rewards queries array
                                var user = isCampaignParticipantUserArray[i];
                                var usedRewardsRelation = user.relation("used_rewards");
                                var usedRewardsQuery = usedRewardsRelation.query();
                                usedRewardsQuery.descending("createdAt");
                                rewardsQueries.push(usedRewardsQuery);
                            };

                            makeRewardsQueries(rewardsQueries);
                        }
                    },
                    error: function() {
                        response.error('Error in inner queries nº' + totalLength - qs.length)
                    }
                });
            }

            function makeRewardsQueries(qs)
            {
                qs.shift().find(
                {
                    success: function(userUsedRewards) 
                    {
                        var aUser = isCampaignParticipantUserArray.shift();

                        var foundValidReward = false;

                        for (var i = 0; i < userUsedRewards.length; i++) 
                        {
                            var userUsedReward = userUsedRewards[i];
                            
                            // has used any rewards during the campaign
                            // AND it wasnt an invalid reward (ex: welcome reward)
                            if (userUsedReward.createdAt >= sentRewardDate &&
                                notValidRewards.indexOf(userUsedReward.get("reward").id) == -1) 
                            {
                                foundValidReward = true;
                            }
                        };

                        if (foundValidReward == false) {
                            hasNotUsedRewardDuringCampaignUserArray.push(aUser);
                        } else {
                            responseMsg += "used reward user: "+aUser.get("username")+" ";
                        };

                        if(qs.length) {
                            makeRewardsQueries(qs);
                        } else 
                        {
                            for (var i = 0; i < hasNotUsedRewardDuringCampaignUserArray.length; i++) 
                            {
                                // populate the user points queries array
                                var user = hasNotUsedRewardDuringCampaignUserArray[i];
                                var pointsRelation = user.relation("points");
                                var pointsQuery = pointsRelation.query();
                                pointsQueries.push(pointsQuery);
                            };

                            makePointsQueries(pointsQueries);
                        }
                    },
                    error: function() {
                        response.error('Error in inner queries nº' + totalLength - qs.length)
                    }
                });
            }

            function makePointsQueries(qs)
            {
                qs.shift().first(
                {
                    success: function(userPoints) 
                    {
                        var aUser = hasNotUsedRewardDuringCampaignUserArray.shift();

                        var currentPointsAmount = userPoints.get('points');
                        var newPointsAmount = currentPointsAmount - 6;

                        if (newPointsAmount < 0) {
                            newPointsAmount = 0;
                        };

                        responseMsg += aUser.get('username')+ ": "+newPointsAmount+ " ";
                        userPoints.set("points", newPointsAmount);
                        userPointsRelationsArray.push(userPoints);

                        if(qs.length) {
                            makePointsQueries(qs);
                        } else 
                        {
                            responseMsg += "("+userPointsRelationsArray.length+" users affected)";

                            Parse.Cloud.useMasterKey();
                            Parse.Object.saveAll(userPointsRelationsArray, 
                            {
                             success: function(list) 
                             {
                                 response.success("okey: "+responseMsg);
                                },
                                error: function(error)
                                {
                                     response.error("failure on saving list " + error.message);
                                },
                            });

                            // response.success("okey: "+responseMsg);
                        }
                    },
                    error: function() {
                        response.error('Error in inner queries nº' + totalLength - qs.length)
                    }
                });
            }
        },
        error: function(error) 
        {
            response.error("Got an error " + error.code + " : " + error.message);
        }
    });
}

exports.sendPushToCampaignParticipantsFunction = function(request, response, campaignId, pushMessage) 
{
	var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.limit(100);
    query.skip(request.params.skip);
    var responseMsg = "";
    var userRewardsRelationsArray = [];
    var userPointsRelationsArray = [];
    var userCampaignRelationsArray = [];

    // lists all the users to check the points
    query.find(
    {
        success: function(users) 
        {
            var campaignsQueries = [];
            var isCampaignParticipantUserArray = [];

            for (var i = 0; i < users.length; i++) 
            {
                var user = users[i];

                // populate the user campaigns queries array
                var campaignsRelation = user.relation("campaigns");
                var campaignsQuery = campaignsRelation.query();
                campaignsQueries.push(campaignsQuery);
            };

            // run the campaign queries
            makeCampaignQueries(campaignsQueries);

            function makeCampaignQueries(qs)
            {
                qs.shift().find(
                {
                    success: function(userCampaigns) 
                    {
                        var aUser = users.shift();

                        if (userCampaigns)
                        {
                            for (var i = 0; i < userCampaigns.length; i++) 
                            {
                                var campaign = userCampaigns[i];
                                if (campaign.id == campaignId) 
                                {
                                    if (userBlacklist.indexOf(aUser.id) == -1) 
                                    {
                                        isCampaignParticipantUserArray.push(aUser);
                                        responseMsg += " user: "+aUser.get("username") + " ";
                                    }
                                };
                            };
                        }

                        if(qs.length) 
                        {
                            makeCampaignQueries(qs);
                        } else 
                        {
                            responseMsg += " ("+isCampaignParticipantUserArray.length + " affected users)";

                            // push
                            var pushQuery = new Parse.Query(Parse.Installation);
                            pushQuery.containedIn("user", isCampaignParticipantUserArray);

                            Parse.Push.send({
                                where: 
                                    pushQuery,
                                data: {
                                    alert: pushMessage,
                                    sound: ""
                                }
                            }, 
                            {
                                success: function() 
                                {
                                    response.success("ok "+ new Date() + " " + responseMsg);
                                },
                                error: function(error) {
                                    response.error("failure on sending push " + error.message);
                                }
                            });
                        }
                    },
                    error: function() {
                        response.error('Error in inner queries nº' + totalLength - qs.length)
                    }
                });
            }
        },
        error: function(error) 
        {
            response.error("Got an error loading users " + error.code + " : " + error.message);
        }
    });
}

exports.sendEmailToCampaignParticipantsFunction = function(request, response, campaignId, templateName, subject, returnBlock) 
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

    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.limit(100);
    query.skip(request.params.skip);
    var responseMsg = "";
    var userRewardsRelationsArray = [];
    var userPointsRelationsArray = [];
    var userCampaignRelationsArray = [];

    // lists all the users to check the campaigns
    query.find(
    {
        success: function(users) 
        {
            var campaignsQueries = [];
            var isCampaignParticipantUserArray = [];

            for (var i = 0; i < users.length; i++) 
            {
                var user = users[i];

                // populate the user campaigns queries array
                var campaignsRelation = user.relation("campaigns");
                var campaignsQuery = campaignsRelation.query();
                campaignsQueries.push(campaignsQuery);
            };

            // run the campaign queries
            makeCampaignQueries(campaignsQueries);

            function makeCampaignQueries(qs)
            {
                qs.shift().find(
                {
                    success: function(userCampaigns) 
                    {
                        var aUser = users.shift();

                        if (userCampaigns)
                        {
                            for (var i = 0; i < userCampaigns.length; i++) 
                            {
                                var campaign = userCampaigns[i];
                                if (campaign.id == campaignId) 
                                {
                                    isCampaignParticipantUserArray.push(aUser);
                                    responseMsg += " user: "+aUser.get("username") + " ";        
                                };
                            };
                        }
                        else {
                            // responseMsg += "no campaign for user: "+aUser.get("username") + " ";
                        }

                        if(qs.length) 
                        {
                            makeCampaignQueries(qs);
                        } else 
                        {
                            var toArray = [];

                            responseMsg += "("+isCampaignParticipantUserArray.length+ " users affected)";

                            for (var i = 0; i < isCampaignParticipantUserArray.length; i++) 
                            {
                                var user = isCampaignParticipantUserArray[i];
                                if (user.has("email")) 
                                {
                                    var toInfo = new Object();
                                    var name = user.get("firstName");

                                    if (name == null || name == "") 
                                    {
                                        var username = user.get("username");
                                        var splitedUsername = username.split(" ");
                                        name = splitedUsername[0];
                                    };

                                    toInfo.email = user.get("email");
                                    toInfo.name = string_to_slug(name);
                                    toArray.push(toInfo);  
                                };
                            };

                            // send email
                            Parse.Cloud.httpRequest(
                            { 
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json; charset=utf-8'
                                }, 
                                url: 'https://mandrillapp.com/api/1.0/messages/sendTemplate.json',
                                body: {
                                    key: "BGIrikVEBAsJ0wNpIYgxAw",
                                    template_name: templateName,
                                    template_content: [],
                                    message: {
                                        subject: subject,
                                        from_email: "bydoo@blackape.com",
                                        from_name: "Clube Johnnie",
                                        to: toArray
                                    }
                                }, success: function(httpResponse) {
                                    console.log("Email sent!" + httpResponse.text + responseMsg);
                                    returnBlock.success();
                                }, error: function(httpResponse) {
                                    console.error("Error sending email: "+httpResponse.text);
                                    returnBlock.error();
                                } 
                            });
                        }
                    },
                    error: function() {
                        returnBlock.error("Error in inner queries nº" + totalLength - qs.length);
                    }
                });
            }
        },
        error: function(error) 
        {
            returnBlock.error("Campaign not found " + error.code + " : " + error.message);
        }
    });
}