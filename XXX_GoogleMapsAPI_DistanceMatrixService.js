
var XXX_GoogleMapsAPI_DistanceMatrixService =
{
	nativeDistanceMatrixService: false,
	
	distanceMatrixRequestObjects: [],
	
	initialize: function ()
	{
        this.nativeDistanceMatrixService = new google.maps.DistanceMatrixService();
	},
		
	getRideInformationForGeoPositions: function (fromLatitude, fromLongitude, toLatitude, toLongitude, completedCallback, failedCallback)
	{
		var fromGeoPosition = 
		{
			latitude: fromLatitude,
			longitude: fromLongitude
		};
		var toGeoPosition = 
		{
			latitude: toLatitude,
			longitude: toLongitude
		};
		
		return this.getRideInformationForAddressStrings('geoPosition', fromGeoPosition, toGeoPosition, completedCallback, failedCallback);
	},
	
	getRideInformationForRawAddressStrings: function (fromRawAddressString, toRawAddressString, completedCallback, failedCallback)
	{
		return this.getRideInformationForAddressStrings('rawAddressString', fromRawAddressString, toRawAddressString, completedCallback, failedCallback);
	},
	
	getRideInformation: function (sourceType, from, to, completedCallback, failedCallback)
	{
		sourceType = XXX_Default.toOption(sourceType, ['rawAddressString', 'geoPosition'], 'rawAddressString');
		
		var data = {};
		
		if (sourceType == 'rawAddressString')
		{
			data.origins = [from];
			data.destinations = [to];
		}
		else if (sourceType == 'geoPosition')
		{
			data.origins = [new google.maps.LatLng(from.latitude, from.longitude)];
			data.destinations = [new google.maps.LatLng(to.latitude, to.longitude)];
		}
		data.travelMode = google.maps.TravelMode.DRIVING;
		data.avoidHighways = false;
		data.avoidTolls = false;
		data.unitSystem = google.maps.UnitSystem.METRIC;
		
		var foundPreviousDistanceMatrixRequestObject = false;
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.distanceMatrixRequestObjects); i < iEnd; ++i)
		{
			var previousDistanceMatrixRequestObject = this.distanceMatrixRequestObjects[i];
			
			var isTheSame = false;
			
			if (sourceType == previousDistanceMatrixRequestObject.sourceType)
			{
				if (sourceType == 'rawAddressString')
				{
					if (previousDistanceMatrixRequestObject.fromRawAddressString == from && previousDistanceMatrixRequestObject.toRawAddressString == to)
					{
						isTheSame = true;
					}
				}
				else if (sourceType == 'geoPosition')
				{
					if (previousDistanceMatrixRequestObject.fromGeoPosition.latitude == from.latitude && previousDistanceMatrixRequestObject.fromGeoPosition.longitude == from.longitude && previousDistanceMatrixRequestObject.toGeoPosition.latitude == to.latitude && previousDistanceMatrixRequestObject.toGeoPosition.longitude == to.longitude)
					{
						isTheSame = true;
					}
				}
			}
			
			if (isTheSame && previousDistanceMatrixRequestObject.responded)
			{
				if (previousDistanceMatrixRequestObject.completed)
				{
					if (completedCallback)
					{
						completedCallback(previousDistanceMatrixRequestObject.result);
					}
				}
				else if (previousDistanceMatrixRequestObject.failed)
				{
					if (failedCallback)
					{
						failedCallback();
					}
				}
				
				foundPreviousDistanceMatrixRequestObject = true;
				break;
			}
		}
		
		if (!foundPreviousDistanceMatrixRequestObject)
		{
			var distanceMatrixRequestObjectIndex = XXX_Array.getFirstLevelItemTotal(this.distanceMatrixRequestObjects);
			
			var distanceMatrixRequestObject =
			{
				sourceType: sourceType,				
				from: from,
				to: to,
				completedCallback: false,
				failedCallback: false,
				failed: false,
				completed: false,
				result: false,
				responded: false
			};
			
			if (sourceType == 'rawAddressString')
			{
				distanceMatrixRequestObject.fromRawAddressString = from;
				distanceMatrixRequestObject.toRawAddressString = to;
			}
			else if (sourceType == 'geoPosition')
			{
				distanceMatrixRequestObject.fromGeoPosition = from;
				distanceMatrixRequestObject.toGeoPosition = to;
			}
			
			if (completedCallback)
			{
				distanceMatrixRequestObject.completedCallback = completedCallback;
			}
			
			if (failedCallback)
			{
				distanceMatrixRequestObject.failedCallback = failedCallback;
			}
			
			this.distanceMatrixRequestObjects.push(distanceMatrixRequestObject);
			
			if (this.nativeDistanceMatrixService)
			{
				this.nativeDistanceMatrixService.getDistanceMatrix(data, function (result, status)
				{
					XXX_GoogleMapsAPI_DistanceMatrixService.distanceMatrixReponseHandler(status, result, distanceMatrixRequestObjectIndex);
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
	
	distanceMatrixReponseHandler: function (status, result, distanceMatrixRequestObjectIndex)
	{
		if (this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex])
		{
			if (!(status == google.maps.DistanceMatrixStatus.OVER_QUERY_LIMIT || status == google.maps.DistanceMatrixStatus.UNKNOWN_ERROR))
			{
				this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex].responded = true;
			
				if (status == google.maps.DistanceMatrixStatus.OK)
				{
					var extraInformation =
					{
						sourceType: this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex].sourceType
					};
					
					if (extraInformation.sourceType == 'rawAddressString')
					{
						extraInformation.fromRawAddressString = this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex].fromRawAddressString;
						extraInformation.toRawAddressString = this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex].toRawAddressString;
					}
					else if (extraInformation.sourceType == 'geoPosition')
					{
						extraInformation.fromGeoPosition = this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex].fromGeoPosition;
						extraInformation.toGeoPosition = this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex].toGeoPosition;
					}
										
					var parsedDistanceMatrixResult = this.parseDistanceMatrixResponse(result, extraInformation);
					
					if (parsedDistanceMatrixResult)
					{
						this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex].completed = true;
					
						this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex].result = parsedDistanceMatrixResult;
												
						if (this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex].completedCallback)
						{
							this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex].completedCallback(parsedDistanceMatrixResult);
						}
					}
					else
					{
						this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex].failed = true;
					
						if (this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex].failedCallback)
						{
							this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex].failedCallback('parseError');
						}
						
						XXX_JS.errorNotification(1, 'Distance matrix response parsing failed');
					}
				}
				else
				{
					this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex].failed = true;
					
					if (this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex].failedCallback)
					{
						this.distanceMatrixRequestObjects[distanceMatrixRequestObjectIndex].failedCallback(status);
					}
					
					XXX_JS.errorNotification(1, 'Distance matrix failed ' + status);
				}
			}
		}
		else
		{
			XXX_JS.errorNotification(1, 'Invalid distance matrix request object index');
		}
	},
	
	parseDistanceMatrixResponse: function (response, extraInformation)
	{
		var result = false;
		
		if (XXX_Array.getFirstLevelItemTotal(response.destinationAddresses))
		{
			result = {};
			
			if (XXX_Type.isArray(extraInformation))
			{
				result = XXX_Array.merge(result, extraInformation);
			}
			
			/*
			
			A,B
			C,D
			
			0,0 = A -> C
			0,1 = A -> D
			1,0 = B -> C
			1,1 = B -> D
			
			*/
			
			result.distance = response.rows[0].elements[0].distance.value;
			result.duration = response.rows[0].elements[0].duration.value;
			result.fromFormattedAddressString = response.originAddresses[0];
			result.toFormattedAddressString = response.destinationAddresses[0];
		}
		
		return result;
	}
};

XXX_DOM_Ready.addEventListener(function ()
{
	XXX_GoogleMapsAPI_DistanceMatrixService.initialize();
});