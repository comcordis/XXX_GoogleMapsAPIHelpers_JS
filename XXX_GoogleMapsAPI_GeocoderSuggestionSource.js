var XXX_GoogleMapsAPI_GeocoderSuggestionSource = function ()
{
	this.valueAskingSuggestion = '';
	this.completedCallback = false;
	this.failedCallback = false;
};

XXX_GoogleMapsAPI_GeocoderSuggestionSource.prototype.completedResponseHandler = function (valueAskingSuggestions, results)
{
	if (valueAskingSuggestions == this.valueAskingSuggestions)
	{
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(results); i < iEnd; ++i)
		{
			results[i].value = results[i].formattedAddressString;
		}
		
		var simpleIndex = new XXX_Search_SimpleIndex('split', 'simplified', 'googleMapsAPI_parsedGeocoderResult');
		simpleIndex.addSources(results);
				
		simpleIndex.executeQuery(this.valueAskingSuggestions);
		var suggestionsResponse = simpleIndex.getSuggestionProviderSourceResponse();
		
		if (this.completedCallback)
		{
			this.completedCallback(valueAskingSuggestions, suggestionsResponse);
		}
	}
};

XXX_GoogleMapsAPI_GeocoderSuggestionSource.prototype.failedResponseHandler = function (valueAskingSuggestions)
{
	if (valueAskingSuggestions == this.valueAskingSuggestions)
	{
		if (this.failedCallback)
		{
			this.failedCallback(valueAskingSuggestions);
		}
	}
};

XXX_GoogleMapsAPI_GeocoderSuggestionSource.prototype.requestSuggestions = function (valueAskingSuggestions, completedCallback, failedCallback)
{
	this.valueAskingSuggestions = valueAskingSuggestions;
	this.completedCallback = completedCallback;
	this.failedCallback = failedCallback;
	
	var  XXX_GoogleMapsAPI_GeocoderSuggestionSource_instance = this;
	
	var completedCallback = function (results)
	{
		XXX_GoogleMapsAPI_GeocoderSuggestionSource_instance.completedResponseHandler(valueAskingSuggestions, results);
	};
	
	var failedCallback = function ()
	{
		XXX_GoogleMapsAPI_GeocoderSuggestionSource_instance.failedResponseHandler(valueAskingSuggestions);
	};
	
	XXX_GoogleMapsAPI_GeocoderService.lookupAddress(valueAskingSuggestions, false, completedCallback, failedCallback);
};

XXX_GoogleMapsAPI_GeocoderSuggestionSource.prototype.getRequestSuggestionsCallback = function ()
{
	var XXX_GoogleMapsAPI_GeocoderSuggestionSource_instance = this;
	
	var requestSuggestionsCallback = function (valueAskingSuggestions, completedCallback, failedCallback)
	{
		return XXX_GoogleMapsAPI_GeocoderSuggestionSource_instance.requestSuggestions(valueAskingSuggestions, completedCallback, failedCallback);
	};
	
	return requestSuggestionsCallback;
};
