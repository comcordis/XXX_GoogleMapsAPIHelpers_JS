
/*

Google Maps API JavaScript problems:

User agent accept language header determines result language. Not influencable.
Region determines the result bias. Settable

Invoertaal: 

Resultatentaal: Op basis van accept-header

*/

var XXX_GoogleMapsAPI_PlacesService =
{
	nativePlacesService: false,
	
	placesRequestObjects: [],
	
	initialize: function ()
	{
        var googleAttribution = XXX_DOM.get('googleMapsAPIAttribution');
        
        this.nativePlacesService = new google.maps.places.PlacesService(googleAttribution);
	},
	
	lookupPlace: function (rawPlaceString, locationBias, completedCallback, failedCallback)
	{
		var data = {};
		data.query = rawPlaceString;
		if (locationBias)
		{
			data.region = locationBias;
		}

		var foundPreviousPlacesRequestObject = false;
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.placesRequestObjects); i < iEnd; ++i)
		{
			var previousPlacesRequestObject = this.placesRequestObjects[i];
			
			if (previousPlacesRequestObject.type == 'rawPlaceString')
			{			
				if (previousPlacesRequestObject.rawPlaceString == rawPlaceString && previousPlacesRequestObject.responded)
				{
					if (previousPlacesRequestObject.completed)
					{
						if (completedCallback)
						{
							completedCallback(previousPlacesRequestObject.results);
						}
					}
					else if (previousPlacesRequestObject.failed)
					{
						if (failedCallback)
						{
							failedCallback();
						}
					}
					
					XXX_JS.errorNotification(1, 'Previous places request');
					
					foundPreviousPlacesRequestObject = true;
					break;
				}
			}
		}
		
		if (!foundPreviousPlacesRequestObject)
		{
			var placesRequestObjectIndex = XXX_Array.getFirstLevelItemTotal(this.placesRequestObjects);
			
			var placesRequestObject =
			{
				type: 'rawPlaceString',
				rawPlaceString: rawPlaceString,
				locationBias: locationBias,
				completedCallback: false,
				failedCallback: false,
				failed: false,
				completed: false,
				results: false,
				responded: false
			};
			
			if (completedCallback)
			{
				placesRequestObject.completedCallback = completedCallback;
			}
			
			if (failedCallback)
			{
				placesRequestObject.failedCallback = failedCallback;
			}
			
			this.placesRequestObjects.push(placesRequestObject);
			
					XXX_JS.errorNotification(1, 'New places request');
					
			if (this.nativePlacesService)
			{
				this.nativePlacesService.textSearch(data, function (results, status)
				{
					XXX_GoogleMapsAPI_PlacesService.placesReponseHandler(status, results, placesRequestObjectIndex);					
				});
			}
			else
			{
				if (failedCallback)
				{
					failedCallback();
				}
			}
		}
	},
	
	placesReponseHandler: function (status, results, placesRequestObjectIndex)
	{
		if (this.placesRequestObjects[placesRequestObjectIndex])
		{
			if (!(status == google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT || status == google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR || status == google.maps.places.PlacesServiceStatus.ERROR))
			{			
				this.placesRequestObjects[placesRequestObjectIndex].responded = true;
			
				if (status == google.maps.places.PlacesServiceStatus.OK)
				{
					var extraInformation =
					{
						rawPlaceString: this.placesRequestObjects[placesRequestObjectIndex].rawPlaceString,
						locationBias: this.placesRequestObjects[placesRequestObjectIndex].locationBias
					};
					
					var parsedPlacesResults = this.parsePlacesResponse(results, extraInformation);
					
					if (parsedPlacesResults)
					{
						this.placesRequestObjects[placesRequestObjectIndex].completed = true;
					
						this.placesRequestObjects[placesRequestObjectIndex].results = parsedPlacesResults;
						
						
						if (this.placesRequestObjects[placesRequestObjectIndex].completedCallback)
						{
							this.placesRequestObjects[placesRequestObjectIndex].completedCallback(parsedPlacesResults);
						}
					}
					else
					{
						this.placesRequestObjects[placesRequestObjectIndex].failed = true;
					
						if (this.placesRequestObjects[placesRequestObjectIndex].failedCallback)
						{
							this.placesRequestObjects[placesRequestObjectIndex].failedCallback('parseError');
						}
						
						XXX_JS.errorNotification(1, 'Places response parsing failed');
					}
				}
				else
				{
					this.placesRequestObjects[placesRequestObjectIndex].failed = true;
					
					if (this.placesRequestObjects[placesRequestObjectIndex].failedCallback)
					{
						this.placesRequestObjects[placesRequestObjectIndex].failedCallback(status);
					}
					
					XXX_JS.errorNotification(1, 'Places failed ' + status + ' ' + this.placesRequestObjects[placesRequestObjectIndex].addressString);
				}
			}
			else
			{
				XXX_JS.errorNotification(1, 'Places response try again later');
			}
		}
		else
		{
			XXX_JS.errorNotification(1, 'Invalid places request object index');
		}
	},

	parsePlacesResponse: function (response, extraInformation)
	{
		var results = false;
		
		if (XXX_Array.getFirstLevelItemTotal(response))
		{
			results = [];
			
			for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(response); i < iEnd; ++i)
			{
				results.push(this.parsePlacesResult(response[i], extraInformation));
			}
		}
		
		return results;
	},
	
	parsePlacesResult: function (placesResult, extraInformation)
	{
		var result = false;
		
		if (placesResult.formatted_address != '')
		{
			var result =
			{
				formattedAddressString: '',
				latitude: 0,
				longitude: 0,
				places_ID: '',
				places_reference: '',
				attributions: [],
				name: '',
				types: []
			};
			
			if (XXX_Type.isArray(extraInformation))
			{
				results = XXX_Array.merge(result, extraInformation);
			}
			
			// Native google LatLng object
			if (placesResult.geometry.location.lat)
			{
				result.latitude = placesResult.geometry.location.lat();
			}
			if (placesResult.geometry.location.lng)
			{
				result.longitude = placesResult.geometry.location.lng();
			}
			if (XXX_Type.isValue(placesResult.formatted_address))
			{
				result.formattedAddressString = placesResult.formatted_address;
			}
			// https://developers.google.com/places/documentation/supported_types
			if (XXX_Type.isArray(placesResult.types))
			{
				result.types = placesResult.types;
			}
			if (XXX_Type.isArray(placesResult.attributions))
			{
				result.attributions = placesResult.attributions;
			}
			if (placesResult.name)
			{
				result.name = placesResult.name;
			}
			if (placesResult.reference)
			{
				result.places_reference = placesResult.reference;
			}
			if (placesResult.id)
			{
				result.places_ID = placesResult.id;
			}
		}
		
		return result;
	}
};

XXX_DOM_Ready.addEventListener(function ()
{
	XXX_GoogleMapsAPI_PlacesService.initialize();
});