/*
success: function() {

},
error: function() {
  response.error("Error: " + error.message);
}

curl -k -X POST \
  -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
  -H "X-Parse-REST-API-Key: UdjUyQDLBLqZrrO3gNcCSa8XZbI9dwRR0oEdfiHW" \
  -H "Content-Type: application/json" \
  -d '{"skip":1600}' \
  https://api.parse.com/1/functions/UpdateUserBirthdays


curl -k -X POST \
  -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
  -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
  -H "Content-Type: application/json" \
  -d '{"skip":0}' \
  https://api.parse.com/1/jobs/ManageNoSocialCheckinPointsAmount

*/

var mUser       = require('./user.js');
var mEmail      = require('./email.js');
var mStore      = require('./store.js');
var mCampaign   = require('./campaign.js');
var mReward     = require('./reward.js');
var mPoints     = require('./points.js');
var mPasswords  = require('./passwords.js');
var mUtil       = require('./util.js');
var mSpecial    = require('./special.js');

// ----------------------------------
Parse.Cloud.job("RaiseCheckinPointsAmountForLunch", function(request, response)
{
    mSpecial.manageNoSocialPointsCheckinAmount(response);
});

// ----------------------------------
Parse.Cloud.job("LowCheckinPointsAmountForLunch", function(request, response)
{
    mSpecial.manageNoSocialPointsCheckinAmount(response);
});

// ----------------------------------
Parse.Cloud.job("SendEmail", function(request, response)
{
    m.manageNoSocialPointsCheckinAmount(response);
});

// ----------------------------------
Parse.Cloud.define("UpdateUserBirthdays", function(request, response)
{
    // list the users to add points and set the campaign
    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.skip(request.params.skip);
    query.ascending("createdAt");
    query.exists('birthday');
    var responseMsg = "";

    responseMsg += "(skiping "+request.params.skip+") ";

    query.find(
    {
        success: function(users)
        {
            var queries = [];

            for (var i = 0; i < users.length; i++)
            {
                var user = users[i];
                var minutes = 1000 * 60;
                var hours = minutes * 60;
                var days = hours * 24;
                var years = days * 365;

                var birthdayTimeSince1970 = Math.round(Date.parse(user.get('birthday')) / years);
                var currentTimeSince1970 = Math.round(new Date() / years);
                var age = currentTimeSince1970 - birthdayTimeSince1970;

                user.set('age', age);
            };

            Parse.Cloud.useMasterKey();
            Parse.Object.saveAll(users,
            {
                success: function(list) {
                    responseMsg += " (total: "+list.length+")";
                    response.success(responseMsg);
                },
                error: function(error) {
                    response.error("error saving users: "+error.message);
                }
            });
        },
        error: function (error) {
            response.error("Error retreiving users: "+error.message);
        }
    });
});

// -----------------------------------
Parse.Cloud.define("GetUserFromPointId", function(request, response)
{
    /*
    curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-REST-API-Key: UdjUyQDLBLqZrrO3gNcCSa8XZbI9dwRR0oEdfiHW" \
      -H "Content-Type: application/json" \
      -d '{"skip":200, "id":"QOuYpT0E8g"}' \
      https://api.parse.com/1/functions/GetUserFromPointId
    */

    var pointObjectId = request.params.id;

    // list the users to add points and set the campaign
    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.limit(100);
    query.skip(request.params.skip);
    query.ascending("createdAt");
    var responseMsg = "";
    var userPointsRelationsArray = [];

    responseMsg += "(skiping "+request.params.skip+") looking for id: "+ pointObjectId + " ";

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

            makeQueries(queries);

            function makeQueries(qs)
            {
                qs.shift().find(
                {
                    success: function(userPoints)
                    {
                        var aUser = users.shift();

                        for (var i = 0; i < userPoints.length; i++)
                        {
                            if (userPoints[i].id == pointObjectId) {
                                response.success("User: " + aUser.id);
                                return;
                            };
                        };

                        if(qs.length) {
                            makeQueries(qs);
                        } else
                        {
                            response.success("no user found "+responseMsg);
                        }
                    },
                    error: function() {
                        response.error('Error in inner queries nº' + totalLength - qs.length)
                    }
                });
            }
        },
        error: function (error) {
            response.error("Error retreiving users: "+error.message);
        }
    });
});

// -----------------------------------
Parse.Cloud.beforeSave("Points", function(request, response)
{
    var pointsObject = request.object;
    mPoints.handleInvalidStore(request, response, pointsObject);
});

// -----------------------------------
Parse.Cloud.beforeSave(Parse.User, function(request, response)
{
    var user = request.object;
    user.set('usedWelcomeReward', true);
    mUser.setNewUserUnsubscribed(request, response, user);
});

// -----------------------------------
Parse.Cloud.afterSave(Parse.User, function(request, response)
{
    var user = request.object;
    mUser.subscribeAndSendWelcomeEmailToNewUser(request, response, user);
});

// -----------------------------------
Parse.Cloud.define("SubscribeAllUsers", function(request, response)
{
    var skip = request.params.skip;
    mEmail.subscribeAllUsersFunction(request, response, skip);
});

// ----------------------------------
Parse.Cloud.define("GetCheckinPoints", function(request, response)
{
    var user = request.params.userId;
    var store = request.params.storeId;

    var hours = mUtil.getCurrentHour();
    var points = new Object();

    if (hours >= 12 && hours < 16) {
        points.checkinPointsAmount = 4;
    } else {
        points.checkinPointsAmount = 2;
    };

    points.facebookCheckinPointsAmount = 1;
    response.success(points);
});

// ----------------------------------
Parse.Cloud.define("RemoveAllSpecialRewards", function(request, response)
{
    mReward.removeAllSpecialRewards(request, response,
    {
        success: function(httpResponse)
        {
            response.success("Success: "+ httpResponse.text);
        },
        error: function(error) {
            response.error("Error: "+ error.text);
        }
    });
});

// ----------------------------------
Parse.Cloud.job("SendMissingYouCampaign", function(request, response)
{
    /*
    curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
      -H "Content-Type: application/json" \
      -d '{"skip":0}' \
      https://api.parse.com/1/jobs/SendMissingYouCampaign
    */

    mCampaign.sendMissingYouCampaignFunction(request, "5s2uJMbvXv",
    {
        success: function(httpResponse)
        {
            response.success("Success: "+ httpResponse);
        },
        error: function(error) {
            response.error("Error: "+ error);
        }
    });
});

// ----------------------------------
Parse.Cloud.job("SendEmailToCampaignUsers", function(request, response)
{
    /*
    curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
      -H "Content-Type: application/json" \
      -d '{"skip":1000}' \
      https://api.parse.com/1/jobs/SendEmailToCampaignUsers
    */

    mCampaign.sendEmailToCampaignParticipantsFunction(request, response, "CHSbXSmBEj", "johnnie-fevereiro-2", "Você conhece nossas outras promoções? :)",
    {
        success: function(httpResponse)
        {
            response.success("Success: "+ httpResponse);
        },
        error: function(error) {
            response.error("Error: "+ error);
        }
    });
});


// ----------------------------------
Parse.Cloud.define("UseReward", function(request, response)
{
    var userId = request.params.userId;
    var rewardId = request.params.rewardId;

    mUser.getUserById(userId,
    {
      success: function(user)
      {
        mReward.getRewardById(rewardId,
        {
          success: function(reward)
          {
            mStore.getStoreById(reward.get("store").id,
            {
              success: function(store)
              {
                mUser.incrementUserPointsByAmount(user, reward.get("minimum_points")*(-1),
                {
                  success: function(userPoints)
                  {
                    mReward.saveUsedReward(user, store, reward,
                    {
                      success: function()
                      {
                        // analytics ----------------------
                        var dimensions = {
                          Title: reward.get("title"),
                          Store: store.get("name")
                        };
                        Parse.Analytics.track('UsedCoupon', dimensions);
                        // ---------------

                        response.success(true);
                    },
                    error: function(error) {
                      response.error("Error: " + error.message);
                    }
                    });
                },
                error: function(error) {
                  response.error("Error: " + error.message);
                }
                });
            },
            error: function(error) {
              response.error("Error: " + error.message);
            }
            });
        },
        error: function(error) {
          response.error("Error: " + error.message);
        }
        });
      },
      error: function(error) {
        response.error("Error: " + error.message);
      }
    });
});

// ----------------------------------
Parse.Cloud.define("GetSpecialReward", function(request, response)
{
    var userId = request.params.userId;
    var storeId = request.params.storeId;

    mUser.getUserById(userId,
    {
      success: function(user)
      {
        mStore.getStoreById(storeId,
        {
          success: function(store)
          {
            mCampaign.getCampaignFromUserStore(user, store,
            {
              success: function(campaign)
              {
                response.success(campaign);
              },
              error: function(error) {
                response.error("Error loading user campaigns: " + error.message);
              }
            });
          },
          error: function(error) {
            response.error("Error loading store: " + error.message);
          }
        });
      },
      error: function(error) {
        response.error("Erorr loading user: " + error.message);
      }
    });
});

// -----------------------------------
Parse.Cloud.define("DeleteOldPasswords", function(request, response)
{
    mPasswords.deleteOldPasswords(
    {
        success: function(success)
        {
            response.success(success.message);
        },
        error: function(error)
        {
            response.error(error.message);
        }
    });
});
