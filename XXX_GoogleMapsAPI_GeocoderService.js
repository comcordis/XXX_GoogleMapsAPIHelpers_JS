
/*

Google Maps API JavaScript problems:

User agent accept language header determines result language. Not influencable.
Region determines the result bias. Settable

Invoertaal: 

Resultatentaal: Op basis van accept-header

*/

var XXX_GoogleMapsAPI_GeocoderService =
{
	nativeGeocoderService: false,
	
	geocoderRequestObjects: [],
	
	initialize: function ()
	{
        this.nativeGeocoderService = new google.maps.Geocoder();
	},
	
	detectGeoPositionFromBrowser: function ()
	{
		if (XXX_HTTP_Browser_Geolocation)
		{		
			var completedCallback = function (results)
			{
				if (XXX_Array.getFirstLevelItemTotal(results))
				{
					XXX_HTTP_Browser_Geolocation.data = results[0];
					
					alert(XXX_String_JSON.encode(XXX_HTTP_Browser_Geolocation.data));
				}
			};
			
			var failedCallback = function ()
			{
			};
			
			var coordinateCallback = function (latitude, longitude)
			{				
				XXX_GoogleMapsAPI_GeocoderService.lookupGeoPosition(latitude, longitude, false, completedCallback, failedCallback);
			};
			
			XXX_HTTP_Browser_Geolocation.getCoordinate(coordinateCallback);
		}
	},
		
	lookupGeoPosition: function (latitude, longitude, locationBias, completedCallback, failedCallback)
	{		
		var nativeGeoPosition = new google.maps.LatLng(XXX_Type.makeFloat(latitude), XXX_Type.makeFloat(longitude));
		
		var data = {};
		data.latLng = nativeGeoPosition;
		if (locationBias)
		{
			data.region = locationBias;
		}
		
		var foundPreviousGeocoderRequestObject = false;
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.geocoderRequestObjects); i < iEnd; ++i)
		{
			var previousGeocoderRequestObject = this.geocoderRequestObjects[i];
			
			if (previousGeocoderRequestObject.lookupType == 'geoPosition')
			{
				if (previousGeocoderRequestObject.latitude == latitude && previousGeocoderRequestObject.longitude == longitude && previousGeocoderRequestObject.responded)
				{
					if (previousGeocoderRequestObject.completed)
					{
						if (completedCallback)
						{
							completedCallback(previousGeocoderRequestObject.results);
						}
					}
					else if (previousGeocoderRequestObject.failed)
					{
						if (failedCallback)
						{
							failedCallback();
						}
					}
					
					foundPreviousGeocoderRequestObject = true;
					break;
				}
			}
		}
		
		if (!foundPreviousGeocoderRequestObject)
		{
			var geocoderRequestObjectIndex = XXX_Array.getFirstLevelItemTotal(this.geocoderRequestObjects);
			
			var geocoderRequestObject =
			{
				lookupType: 'geoPosition',
				latitude: latitude,
				longitude: longitude,
				nativeGeoPosition: nativeGeoPosition,
				languageCode: XXX_HTTP_Browser.firstLanguage.languageCode,
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
				geocoderRequestObject.completedCallback = completedCallback;
			}
			
			if (failedCallback)
			{
				geocoderRequestObject.failedCallback = failedCallback;
			}
			
			this.geocoderRequestObjects.push(geocoderRequestObject);
			
			if (this.nativeGeocoderService)
			{
				this.nativeGeocoderService.geocode(data, function (results, status)
				{
					XXX_GoogleMapsAPI_GeocoderService.geocoderReponseHandler(status, results, geocoderRequestObjectIndex);					
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
	
	lookupRawAddress: function (rawAddressString, locationBias, completedCallback, failedCallback)
	{
		var data = {};
		data.address = rawAddressString;
		if (locationBias)
		{
			data.region = locationBias;
		}

		var foundPreviousGeocoderRequestObject = false;
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.geocoderRequestObjects); i < iEnd; ++i)
		{
			var previousGeocoderRequestObject = this.geocoderRequestObjects[i];
			
			if (previousGeocoderRequestObject.lookupType == 'rawAddressString')
			{			
				if (previousGeocoderRequestObject.rawAddressString == rawAddressString && previousGeocoderRequestObject.responded)
				{
					if (previousGeocoderRequestObject.completed)
					{
						if (completedCallback)
						{
							completedCallback(previousGeocoderRequestObject.results);
						}
					}
					else if (previousGeocoderRequestObject.failed)
					{
						if (failedCallback)
						{
							failedCallback();
						}
					}
					
					XXX_JS.errorNotification(1, 'Previous geocoder request');
					
					foundPreviousGeocoderRequestObject = true;
					break;
				}
			}
		}
		
		if (!foundPreviousGeocoderRequestObject)
		{
			var geocoderRequestObjectIndex = XXX_Array.getFirstLevelItemTotal(this.geocoderRequestObjects);
			
			var geocoderRequestObject =
			{
				lookupType: 'rawAddressString',
				rawAddressString: rawAddressString,
				languageCode: XXX_HTTP_Browser.firstLanguage.languageCode,
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
				geocoderRequestObject.completedCallback = completedCallback;
			}
			
			if (failedCallback)
			{
				geocoderRequestObject.failedCallback = failedCallback;
			}
			
			this.geocoderRequestObjects.push(geocoderRequestObject);
			
					XXX_JS.errorNotification(1, 'New geocoder request');
					
			if (this.nativeGeocoderService)
			{
				this.nativeGeocoderService.geocode(data, function (results, status)
				{
					XXX_GoogleMapsAPI_GeocoderService.geocoderReponseHandler(status, results, geocoderRequestObjectIndex);					
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
	
	geocoderReponseHandler: function (status, results, geocoderRequestObjectIndex)
	{
		if (this.geocoderRequestObjects[geocoderRequestObjectIndex])
		{
			if (!(status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT || status == google.maps.GeocoderStatus.UNKNOWN_ERROR || status == google.maps.GeocoderStatus.ERROR))
			{			
				this.geocoderRequestObjects[geocoderRequestObjectIndex].responded = true;
			
				if (status == google.maps.GeocoderStatus.OK)
				{
					
					var extraInformation =
					{
						lookupType: this.geocoderRequestObjects[geocoderRequestObjectIndex].lookupType,
						locationBias: this.geocoderRequestObjects[geocoderRequestObjectIndex].locationBias,
						languageCode: this.geocoderRequestObjects[geocoderRequestObjectIndex].languageCode
					};
					
					if (this.geocoderRequestObjects[geocoderRequestObjectIndex].lookupType == 'rawAddressString')
					{
						extraInformation.rawAddressString = this.geocoderRequestObjects[geocoderRequestObjectIndex].rawAddressString;
					}
					else if (this.geocoderRequestObjects[geocoderRequestObjectIndex].lookupType == 'geoPosition')
					{
						extraInformation.latitude = this.geocoderRequestObjects[geocoderRequestObjectIndex].latitude;
						extraInformation.longitude = this.geocoderRequestObjects[geocoderRequestObjectIndex].longitude;
					}
										
					var parsedGeocoderResults = this.parseGeocoderResponse(results, extraInformation);
					
					if (parsedGeocoderResults)
					{
						this.geocoderRequestObjects[geocoderRequestObjectIndex].completed = true;
					
						this.geocoderRequestObjects[geocoderRequestObjectIndex].results = parsedGeocoderResults;
						
						
						if (this.geocoderRequestObjects[geocoderRequestObjectIndex].completedCallback)
						{
							this.geocoderRequestObjects[geocoderRequestObjectIndex].completedCallback(parsedGeocoderResults);
						}
					}
					else
					{
						this.geocoderRequestObjects[geocoderRequestObjectIndex].failed = true;
					
						if (this.geocoderRequestObjects[geocoderRequestObjectIndex].failedCallback)
						{
							this.geocoderRequestObjects[geocoderRequestObjectIndex].failedCallback('parseError');
						}
						
						XXX_JS.errorNotification(1, 'Geocoder response parsing failed');
					}
				}
				else
				{
					this.geocoderRequestObjects[geocoderRequestObjectIndex].failed = true;
					
					if (this.geocoderRequestObjects[geocoderRequestObjectIndex].failedCallback)
					{
						this.geocoderRequestObjects[geocoderRequestObjectIndex].failedCallback(status);
					}
					
					XXX_JS.errorNotification(1, 'Geocoder failed ' + status + ' ' + this.geocoderRequestObjects[geocoderRequestObjectIndex].addressString);
				}
			}
			else
			{
				XXX_JS.errorNotification(1, 'Geocoder response try again later');
			}
		}
		else
		{
			XXX_JS.errorNotification(1, 'Invalid geocoder request object index');
		}
	},
	
	parseGeocoderResponse: function (response, extraInformation)
	{
		var results = false;
		
		if (XXX_Array.getFirstLevelItemTotal(response))
		{
			results = [];
			
			for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(response); i < iEnd; ++i)
			{
				results.push(this.parseGeocoderResult(response[i], extraInformation));
			}
		}
		
		return results;
	},
	
	parseGeocoderResult: function (geocoderResult, extraInformation)
	{
		var result = false;
		
		if (geocoderResult.formatted_address != '')
		{
			var result =
			{
				formattedAddressString: '',
				latitude: 0,
				longitude: 0,
				types: [],
				streetNumber: '',
				street: '',
				city: '',
				stateOrProvince: '',
				country: '',
				postalCode: '',
				precisionType: '',
				isPartialMatch: false
			};
			
			if (XXX_Type.isArray(extraInformation))
			{
				result = XXX_Array.merge(result, extraInformation);
			}
			
			// Native google LatLng object
			if (geocoderResult.geometry.location.lat)
			{
				result.latitude = geocoderResult.geometry.location.lat();
			}
			if (geocoderResult.geometry.location.lng)
			{
				result.longitude = geocoderResult.geometry.location.lng();
			}
			if (XXX_Type.isValue(geocoderResult.formatted_address))
			{
				result.formattedAddressString = geocoderResult.formatted_address;
			}
			// https://developers.google.com/places/documentation/supported_types
			if (XXX_Type.isArray(geocoderResult.types))
			{
				result.types = geocoderResult.types;
			}
			if (result.partial_match)
			{
				result.isPartialMatch = XXX_Type.makeBoolean(geocoderResult.partial_match);
			}
			
			if (geocoderResult.geometry.location_type)
			{
				result.precisionType = geocoderResult.geometry.location_type;
			}
			
			for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(geocoderResult.address_components); i < iEnd; ++i)
			{
				var address_component = geocoderResult.address_components[i];
				
				for (var j = 0, jEnd = XXX_Array.getFirstLevelItemTotal(address_component.types); j < jEnd; ++j)
				{
					var type = address_component.types[j];
					
					if (type == 'street_number')
					{
						result.streetNumber = address_component.long_name;
					}
					else if (type == 'route')
					{
						result.street = address_component.long_name;
					}
					else if (type == 'locality')
					{
						result.city = address_component.long_name;
					}
					else if (type == 'administrative_area_level_1')
					{
						result.stateOrProvince = address_component.long_name;
						result.stateOrProvinceCode = address_component.short_name;
					}
					else if (type == 'country')
					{
						result.country = address_component.long_name;
						result.countryCode = address_component.short_name;
					}
					else if (type == 'postal_code')
					{
						result.postalCode = address_component.short_name;
					}
				}				
			}
		}
		
		return result;
	}	
};

XXX_DOM_Ready.addEventListener(function ()
{
	XXX_GoogleMapsAPI_GeocoderService.initialize();
});