var XXX_GoogleMapsAPI_PlacesSuggestionSource = function ()
{
	this.valueAskingSuggestion = '';
	this.completedCallback = false;
	this.failedCallback = false;
};

XXX_GoogleMapsAPI_PlacesSuggestionSource.prototype.completedResponseHandler = function (results)
{
	var suggestions = [];
		
	for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(results); i < iEnd; ++i)
	{
		var result = results[i];
		
		var processedSuggestion = {};
		
		var suggestedValue = '';
		if (XXX_String.beginsWith(result.formattedAddressString, result.name))
		{
			suggestedValue = result.formattedAddressString;
		}
		else
		{
			suggestedValue = result.name + ', ' + result.formattedAddressString;
		}
		
		processedSuggestion.suggestedValue = suggestedValue;
		processedSuggestion.valueAskingSuggestions = this.valueAskingSuggestions;
		processedSuggestion.complement = '';
		processedSuggestion.label = result.name;
		processedSuggestion.data = result;
		processedSuggestion.data.dataType = 'googleMapsAPI_parsedPlacesResult';
		
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

XXX_GoogleMapsAPI_PlacesSuggestionSource.prototype.failedResponseHandler = function ()
{
	if (this.failedCallback)
	{
		this.failedCallback();
	}
};

XXX_GoogleMapsAPI_PlacesSuggestionSource.prototype.requestSuggestions = function (valueAskingSuggestions, completedCallback, failedCallback)
{
	this.valueAskingSuggestions = valueAskingSuggestions;
	this.completedCallback = completedCallback;
	this.failedCallback = failedCallback;
	
	var  XXX_GoogleMapsAPI_PlacesSuggestionSource_instance = this;
	
	var completedCallback = function (results)
	{
		XXX_GoogleMapsAPI_PlacesSuggestionSource_instance.completedResponseHandler(results);
	};
	
	var failedCallback = function ()
	{
		XXX_GoogleMapsAPI_PlacesSuggestionSource_instance.failedResponseHandler();
	};
	
	XXX_GoogleMapsAPI_PlacesService.lookupPlace(valueAskingSuggestions, false, completedCallback, failedCallback);
};

XXX_GoogleMapsAPI_PlacesSuggestionSource.prototype.getRequestSuggestionsCallback = function ()
{
	var XXX_GoogleMapsAPI_PlacesSuggestionSource_instance = this;
	
	var requestSuggestionsCallback = function (valueAskingSuggestions, completedCallback, failedCallback)
	{
		return XXX_GoogleMapsAPI_PlacesSuggestionSource_instance.requestSuggestions(valueAskingSuggestions, completedCallback, failedCallback);
	};
	
	return requestSuggestionsCallback;
};
