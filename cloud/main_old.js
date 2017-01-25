/*
    curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
      -H "Content-Type: application/json" \
      -d '{"skip":0}' \
      https://api.parse.com/1/jobs/SendExtraPoints
    */

// -----------------------------------
Parse.Cloud.job("SendExtraPoints", function(request, response) 
{  
    // configure campaign variables
    var campaignId = "Ibp7rkOnlG";
    var module = require('cloud/campaign.js');
    module.getPointsByUserFunction(request, response, campaignId);
});

// -----------------------------------
Parse.Cloud.job("RemoveExtraPoints", function(request, response) 
{  
    /*
      used reward user: bruno.pereira23@outlook.com
    */

    var sentRewardDate = new Date("Wed Nov 27 2014 18:00:55 GMT+0000 (UTC)");
    var campaignId = "Ibp7rkOnlG";
    var module = require('cloud/campaign.js');
    module.removeExtraPointsFunction(request, response, campaignId, sentRewardDate);
});

// -----------------------------------
Parse.Cloud.job("SendPushToCampaignParticipants", function(request, response) 
{
  /*
    curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
      -H "Content-Type: application/json" \
      -d '{"skip":0}' \
      https://api.parse.com/1/jobs/SendPushToCampaignParticipants

      */

    var campaignId = "qIvlZpiIo3";
    var module = require('cloud/campaign.js');
    var pushMessage = "Que tal uma apetitosa recompensa? Vem pro Johnnie e resgate agora seus pontos extras!";
    module.sendPushToCampaignParticipantsFunction(request, response, campaignId, pushMessage);
});

// -----------------------------------
Parse.Cloud.define("CheckPoints", function(request, response) 
{  
	var module = require('cloud/points.js');
    module.checkPointsFunction(request, response);
});

// -----------------------------------
Parse.Cloud.define("GetPointsByUser", function(request, response) 
{  
	var module = require('cloud/user.js');
    module.getPointsByUserFunction(request, response);
});

// -----------------------------------
Parse.Cloud.beforeSave("Points", function(request, response) 
{
    var pointsObject = request.object;
    var module = require('cloud/points.js');
    module.handleInvalidStore(request, response, pointsObject);
});

// // -----------------------------------
// Parse.Cloud.beforeSave(Parse.User, function(request, response) 
// {
//     var user = request.object;
//     var module = require('cloud/user.js');
//     module.setNewUserUnsubscribed(request, response, user);
// });

// // -----------------------------------
// Parse.Cloud.afterSave(Parse.User, function(request, response) 
// {
//     var user = request.object;
//     var module = require('cloud/user.js');
//     module.subscribeAndSendWelcomeEmailToNewUser(request, response, user);  
// });

// -----------------------------------
Parse.Cloud.define("SubscribeAllUsers", function(request, response) 
{
    var module = require('cloud/email.js');
    module.subscribeAllUsersFunction(request, response);	
});


/* ------------- CAMPAIGN METHODS ------------- */

Parse.Cloud.job("SendCampaign", function(request, response) 
{  
    /*
    curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
      -H "Content-Type: application/json" \
      -d '{"skip":0}' \
      https://api.parse.com/1/jobs/SendCampaign

      curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
      -H "Content-Type: application/json" \
      -d '{"skip":100}' \
      https://api.parse.com/1/jobs/SendCampaign

      curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
      -H "Content-Type: application/json" \
      -d '{"skip":200}' \
      https://api.parse.com/1/jobs/SendCampaign

      curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
      -H "Content-Type: application/json" \
      -d '{"skip":300}' \
      https://api.parse.com/1/jobs/SendCampaign

      curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
      -H "Content-Type: application/json" \
      -d '{"skip":400}' \
      https://api.parse.com/1/jobs/SendCampaign

      curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
      -H "Content-Type: application/json" \
      -d '{"skip":500}' \
      https://api.parse.com/1/jobs/SendCampaign
*/

    var campaignId = "qIvlZpiIo3";
    var rewardId = "wvxjNntMdq"; // +3 pontos extras
    var pushMessage = "Que tal 3 pontos a mais no Natal Johnnie? Resgate agora! o/";
    var module = require('cloud/campaign.js');
    module.sendChristmasCampaignFunction(request, response, campaignId, rewardId, pushMessage);
});

// -----------------------------------
Parse.Cloud.job("SendEmailToCampaignParticipants", function(request, response) 
{  
    /*
    curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
      -H "Content-Type: application/json" \
      -d '{"skip":0}' \
      https://api.parse.com/1/jobs/SendEmailToCampaignParticipants

      curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
      -H "Content-Type: application/json" \
      -d '{"skip":100}' \
      https://api.parse.com/1/jobs/SendEmailToCampaignParticipants

      curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
      -H "Content-Type: application/json" \
      -d '{"skip":200}' \
      https://api.parse.com/1/jobs/SendEmailToCampaignParticipants

      curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
      -H "Content-Type: application/json" \
      -d '{"skip":300}' \
      https://api.parse.com/1/jobs/SendEmailToCampaignParticipants

      curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
      -H "Content-Type: application/json" \
      -d '{"skip":400}' \
      https://api.parse.com/1/jobs/SendEmailToCampaignParticipants

      curl -k -X POST \
      -H "X-Parse-Application-Id: MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe" \
      -H "X-Parse-Master-Key: 9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU" \
      -H "Content-Type: application/json" \
      -d '{"skip":500}' \
      https://api.parse.com/1/jobs/SendEmailToCampaignParticipants
    */

    // configure campaign variables
    var campaignId = "qIvlZpiIo3";
    var templateName = "johnnie-campanha-natal-progressivo";
    var subject = "Natal Johnnie 3, 6 e 9 pontos extras!";
    var module = require('cloud/campaign.js');
    module.sendEmailToCampaignParticipantsFunction(request, response, campaignId, templateName, subject);
});

// -----------------------------------
// verifica se usou +3 pontos e adiciona +6 - skip 0
Parse.Cloud.job("CheckUsedCampaign3to6000", function(request, response) 
{  
    var currentRewardId = "wvxjNntMdq";
    var targetRewardId = "I4uBcpmM2E";
    var pushMessage = "Parabéns! Por ter resgatado seus 3 pontos extras, você ganhou um cupom de +6 pontos!";
    var campaignId = "qIvlZpiIo3";
    var module = require('cloud/campaign.js');
    module.checkUsedChristmasCampaignFunction(request, response, 0, campaignId, currentRewardId, targetRewardId, pushMessage);
});

// verifica se usou +3 pontos e adiciona +6 - skip 100
Parse.Cloud.job("CheckUsedCampaign3to6100", function(request, response) 
{  
    var currentRewardId = "wvxjNntMdq";
    var targetRewardId = "I4uBcpmM2E";
    var pushMessage = "Parabéns! Por ter resgatado seus 3 pontos extras, você ganhou um cupom de +6 pontos!";
    var campaignId = "qIvlZpiIo3";
    var module = require('cloud/campaign.js');
    module.checkUsedChristmasCampaignFunction(request, response, 100, campaignId, currentRewardId, targetRewardId, pushMessage);
});

// verifica se usou +3 pontos e adiciona +6 - skip 200
Parse.Cloud.job("CheckUsedCampaign3to6200", function(request, response) 
{  
    var currentRewardId = "wvxjNntMdq";
    var targetRewardId = "I4uBcpmM2E";
    var pushMessage = "Parabéns! Por ter resgatado seus 3 pontos extras, você ganhou um cupom de +6 pontos!";
    var campaignId = "qIvlZpiIo3";
    var module = require('cloud/campaign.js');
    module.checkUsedChristmasCampaignFunction(request, response, 200, campaignId, currentRewardId, targetRewardId, pushMessage);
});

// verifica se usou +3 pontos e adiciona +6 - skip 300
Parse.Cloud.job("CheckUsedCampaign3to6300", function(request, response) 
{  
    var currentRewardId = "wvxjNntMdq";
    var targetRewardId = "I4uBcpmM2E";
    var pushMessage = "Parabéns! Por ter resgatado seus 3 pontos extras, você ganhou um cupom de +6 pontos!";
    var campaignId = "qIvlZpiIo3";
    var module = require('cloud/campaign.js');
    module.checkUsedChristmasCampaignFunction(request, response, 300, campaignId, currentRewardId, targetRewardId, pushMessage);
});

// verifica se usou +3 pontos e adiciona +6 - skip 400
Parse.Cloud.job("CheckUsedCampaign3to6400", function(request, response) 
{  
    var currentRewardId = "wvxjNntMdq";
    var targetRewardId = "I4uBcpmM2E";
    var pushMessage = "Parabéns! Por ter resgatado seus 3 pontos extras, você ganhou um cupom de +6 pontos!";
    var campaignId = "qIvlZpiIo3";
    var module = require('cloud/campaign.js');
    module.checkUsedChristmasCampaignFunction(request, response, 400, campaignId, currentRewardId, targetRewardId, pushMessage);
});

// verifica se usou +3 pontos e adiciona +6 - skip 500
Parse.Cloud.job("CheckUsedCampaign3to6500", function(request, response) 
{  
    var currentRewardId = "wvxjNntMdq";
    var targetRewardId = "I4uBcpmM2E";
    var pushMessage = "Parabéns! Por ter resgatado seus 3 pontos extras, você ganhou um cupom de +6 pontos!";
    var campaignId = "qIvlZpiIo3";
    var module = require('cloud/campaign.js');
    module.checkUsedChristmasCampaignFunction(request, response, 500, campaignId, currentRewardId, targetRewardId, pushMessage);
});

//--------------------------------------------
// verifica se usou +6 pontos e adiciona +9 - skip 000
Parse.Cloud.job("CheckUsedCampaign6to9000", function(request, response) 
{  
    var currentRewardId = "I4uBcpmM2E";
    var targetRewardId = "VDXMlACXF9";
    var pushMessage = "Parabéns! Por ter resgatado seus 6 pontos extras, você ganhou um cupom de +9 pontos!";
    var campaignId = "qIvlZpiIo3";
    var module = require('cloud/campaign.js');
    module.checkUsedChristmasCampaignFunction(request, response, 0, campaignId, currentRewardId, targetRewardId, pushMessage);
});

// verifica se usou +6 pontos e adiciona +9 - skip 100
Parse.Cloud.job("CheckUsedCampaign6to9100", function(request, response) 
{  
    var currentRewardId = "I4uBcpmM2E";
    var targetRewardId = "VDXMlACXF9";
    var pushMessage = "Parabéns! Por ter resgatado seus 6 pontos extras, você ganhou um cupom de +9 pontos!";
    var campaignId = "qIvlZpiIo3";
    var module = require('cloud/campaign.js');
    module.checkUsedChristmasCampaignFunction(request, response, 100, campaignId, currentRewardId, targetRewardId, pushMessage);
});

// verifica se usou +6 pontos e adiciona +9 - skip 200
Parse.Cloud.job("CheckUsedCampaign6to9200", function(request, response) 
{  
    var currentRewardId = "I4uBcpmM2E";
    var targetRewardId = "VDXMlACXF9";
    var pushMessage = "Parabéns! Por ter resgatado seus 6 pontos extras, você ganhou um cupom de +9 pontos!";
    var campaignId = "qIvlZpiIo3";
    var module = require('cloud/campaign.js');
    module.checkUsedChristmasCampaignFunction(request, response, 200, campaignId, currentRewardId, targetRewardId, pushMessage);
});

// verifica se usou +6 pontos e adiciona +9 - skip 300
Parse.Cloud.job("CheckUsedCampaign6to9300", function(request, response) 
{  
    var currentRewardId = "I4uBcpmM2E";
    var targetRewardId = "VDXMlACXF9";
    var pushMessage = "Parabéns! Por ter resgatado seus 6 pontos extras, você ganhou um cupom de +9 pontos!";
    var campaignId = "qIvlZpiIo3";
    var module = require('cloud/campaign.js');
    module.checkUsedChristmasCampaignFunction(request, response, 300, campaignId, currentRewardId, targetRewardId, pushMessage);
});

// verifica se usou +6 pontos e adiciona +9 - skip 400
Parse.Cloud.job("CheckUsedCampaign6to9400", function(request, response) 
{  
    var currentRewardId = "I4uBcpmM2E";
    var targetRewardId = "VDXMlACXF9";
    var pushMessage = "Parabéns! Por ter resgatado seus 6 pontos extras, você ganhou um cupom de +9 pontos!";
    var campaignId = "qIvlZpiIo3";
    var module = require('cloud/campaign.js');
    module.checkUsedChristmasCampaignFunction(request, response, 400, campaignId, currentRewardId, targetRewardId, pushMessage);
});

// verifica se usou +6 pontos e adiciona +9 - skip 500
Parse.Cloud.job("CheckUsedCampaign6to9500", function(request, response) 
{  
    var currentRewardId = "I4uBcpmM2E";
    var targetRewardId = "VDXMlACXF9";
    var pushMessage = "Parabéns! Por ter resgatado seus 6 pontos extras, você ganhou um cupom de +9 pontos!";
    var campaignId = "qIvlZpiIo3";
    var module = require('cloud/campaign.js');
    module.checkUsedChristmasCampaignFunction(request, response, 500, campaignId, currentRewardId, targetRewardId, pushMessage);
});
