var XXX_GoogleMapsAPI_MapPositionDragger = function (suggestionController, latitude, longitude, mapContainer)
{
	this.elements = {};
	
	this.suggestionController = suggestionController;
	
	this.elements.input = suggestionController.elements.input;
	this.elements.parent = XXX_DOM.getParent(this.elements.input);
	
	if (mapContainer)
	{
		this.elements.mapContainer = mapContainer;
	}
	else
	{
		this.elements.mapContainer = XXX_DOM.createElementNode('div');
		XXX_CSS.setClass(this.elements.mapContainer, 'dialog');
		XXX_CSS.setStyle(this.elements.mapContainer, 'width', '320px');
		XXX_CSS.setStyle(this.elements.mapContainer, 'height', '180px');
		XXX_DOM.appendChildNode(XXX_DOM.getBody(), this.elements.mapContainer);
	
	}
	
	this.geoPosition = false;
	
	if (XXX_Type.isValue(latitude))
	{
		this.geoPosition =
		{
			latitude: latitude,
			longitude: longitude
		};
	}
	
	var options =
	{
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP/*,
		mapTypeControl: false,
		streetViewControl: false*/
	};
	
	this.elements.nativeMap = new google.maps.Map(this.elements.mapContainer, options);
	
	this.elements.nativeMarker = new google.maps.Marker(
	{
		map: this.elements.nativeMap,
    	draggable: true
	});
	
	if (XXX_Type.isValue(latitude))
	{
		this.setPosition(latitude, longitude);
	}
	
	var XXX_GoogleMapsAPI_MapPositionDragger_instance = this;
	
	google.maps.event.addListener(this.elements.nativeMarker, 'dragend', function ()
	{
		var latitude = XXX_GoogleMapsAPI_MapPositionDragger_instance.elements.nativeMarker.getPosition().lat();
		var longitude = XXX_GoogleMapsAPI_MapPositionDragger_instance.elements.nativeMarker.getPosition().lng();
		
		XXX_GoogleMapsAPI_MapPositionDragger_instance.markerDragged(latitude, longitude);
	});
	
	this.parsedGeocoderResults = false;
	
	this.eventDispatcher = new XXX_EventDispatcher();
		
	XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.mapContainer, 'mouseDown', function (nativeEvent)
	{
		nativeEvent.preventDefault();
		nativeEvent.stopPropagation();
	});
	
	XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.input, 'blur', function (nativeEvent)
	{
		XXX_GoogleMapsAPI_MapPositionDragger_instance.hide();
	});
	
	XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.input, 'focus', function (nativeEvent)
	{
		XXX_GoogleMapsAPI_MapPositionDragger_instance.show();
		//XXX_GoogleMapsAPI_MapPositionDragger_instance.rerender();
	});
	
	this.suggestionController.eventDispatcher.addEventListener('change', function ()
	{
		XXX_GoogleMapsAPI_MapPositionDragger_instance.propagateFromSuggestionController();
		//XXX_GoogleMapsAPI_MapPositionDragger_instance.show();
	});
	
	this.eventDispatcher.addEventListener('change', function ()
	{
		XXX_GoogleMapsAPI_MapPositionDragger_instance.propagateFromMarker();
	});
	
	this.reposition();
	this.hide();
};

XXX_GoogleMapsAPI_MapPositionDragger.prototype.propagateFromSuggestionController = function ()
{
	var tempData = this.suggestionController.getData();
	
	if (tempData && XXX_Type.isValue(tempData.latitude))
	{
		this.setPosition(tempData.latitude, tempData.longitude);
		
		this.show();
	}
	else
	{
		this.hide();
	}
};

XXX_GoogleMapsAPI_MapPositionDragger.prototype.propagateFromMarker = function ()
{
	if (this.parsedGeocoderResults && this.parsedGeocoderResults[0])
	{
		this.suggestionController.setValue(this.parsedGeocoderResults[0].formattedAddressString);
		this.suggestionController.updateLineCharacterLength();
	}
};

XXX_GoogleMapsAPI_MapPositionDragger.prototype.markerDragged = function (latitude, longitude)
{
	var XXX_GoogleMapsAPI_MapPositionDragger_instance = this;
	
	var completedCallback = function (parsedGeocoderResults)
	{
		XXX_GoogleMapsAPI_MapPositionDragger_instance.parsedGeocoderResults = parsedGeocoderResults;
		
		XXX_GoogleMapsAPI_MapPositionDragger_instance.eventDispatcher.dispatchEventToListeners('change');
	};
	
	var failedCallback = function ()
	{
		XXX_GoogleMapsAPI_MapPositionDragger_instance.parsedGeocoderResults = false;
				
		XXX_GoogleMapsAPI_MapPositionDragger_instance.eventDispatcher.dispatchEventToListeners('change');
	};
	
	XXX_GoogleMapsAPI_GeocoderService.lookupGeoPosition(latitude, longitude, false, completedCallback, failedCallback);
	
};

XXX_GoogleMapsAPI_MapPositionDragger.prototype.setPosition = function (latitude, longitude)
{
	if (XXX_Type.isValue(latitude))
	{
		this.geoPosition =
		{
			latitude: latitude,
			longitude: longitude
		};
			
		var nativeGeoPosition = new google.maps.LatLng(this.geoPosition.latitude, this.geoPosition.longitude);
	    this.elements.nativeMarker.setPosition(nativeGeoPosition);
	    this.elements.nativeMap.setCenter(nativeGeoPosition);
    }
};

XXX_GoogleMapsAPI_MapPositionDragger.prototype.getParsedGeocoderResults = function ()
{
	return this.parsedGeocoderResults;
};


XXX_GoogleMapsAPI_MapPositionDragger.prototype.show = function ()
{
	if (this.geoPosition != false)
	{
		XXX_CSS.setStyle(this.elements.mapContainer, 'visibility', 'visible');
		
		this.reposition();
	}
};

XXX_GoogleMapsAPI_MapPositionDragger.prototype.hide = function ()
{
	XXX_CSS.setStyle(this.elements.mapContainer, 'visibility', 'hidden');
};

XXX_GoogleMapsAPI_MapPositionDragger.prototype.reposition = function ()
{
	//XXX_CSS_Position.nextToOffsetElement(this.elements.input, this.elements.mapContainer, ['topRight'], 10);
};