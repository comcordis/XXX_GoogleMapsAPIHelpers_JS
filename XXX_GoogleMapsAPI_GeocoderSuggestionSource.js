var XXX_GoogleMapsAPI_GeocoderSuggestionSource = function ()
{
	this.valueAskingSuggestion = '';
	this.completedCallback = false;
	this.failedCallback = false;
};

XXX_GoogleMapsAPI_GeocoderSuggestionSource.prototype.completedResponseHandler = function (results)
{
	var suggestions = [];
		
	for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(results); i < iEnd; ++i)
	{
		var result = results[i];
		
		var processedSuggestion = {};
		processedSuggestion.suggestedValue = result.formattedAddressString;
		processedSuggestion.valueAskingSuggestions = this.valueAskingSuggestions;
		processedSuggestion.complement = '';
		processedSuggestion.label = processedSuggestion.suggestedValue;
		processedSuggestion.data = result;
		processedSuggestion.data.dataType = 'parsedGeocoderResult';
		
		var valueAskingSuggestionsPosition = XXX_String.findFirstPosition(XXX_String.convertToLowerCase(processedSuggestion.suggestedValue), XXX_String.convertToLowerCase(processedSuggestion.valueAskingSuggestions));
		
		if (valueAskingSuggestionsPosition === 0)
		{
			processedSuggestion.complement = XXX_String.getPart(processedSuggestion.suggestedValue, XXX_String.getCharacterLength(processedSuggestion.valueAskingSuggestions));
		}
		
		suggestions.push(processedSuggestion);
	}
	
	suggestions =
	{
		type: 'processed',
		suggestions: suggestions
	};
		
	if (this.completedCallback)
	{
		this.completedCallback(suggestions);
	}
};

XXX_GoogleMapsAPI_GeocoderSuggestionSource.prototype.failedResponseHandler = function ()
{
	if (this.failedCallback)
	{
		this.failedCallback();
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
		XXX_GoogleMapsAPI_GeocoderSuggestionSource_instance.completedResponseHandler(results);
	};
	
	var failedCallback = function ()
	{
		XXX_GoogleMapsAPI_GeocoderSuggestionSource_instance.failedResponseHandler();
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
