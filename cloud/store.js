exports.getStoreById = function(storeId, returnBlock) 
{
	var Store = Parse.Object.extend("Store");
    var storeQuery = new Parse.Query(Store);
    storeQuery.equalTo("objectId", storeId);
    storeQuery.first(returnBlock);
}