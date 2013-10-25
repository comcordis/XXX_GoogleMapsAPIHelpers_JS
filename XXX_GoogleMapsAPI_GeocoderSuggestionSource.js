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
			processedSuggestion.data.dataType = 'googleMapsAPI_parsedGeocoderResult';
			
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
			this.completedCallback(valueAskingSuggestions, suggestions);
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
