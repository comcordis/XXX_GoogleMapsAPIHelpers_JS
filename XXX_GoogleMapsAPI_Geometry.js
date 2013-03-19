var XXX_GoogleMapsAPI_Geometry =
{
	getDistanceBetweenGeoPositions: function (aLatitude, aLongitude, bLatitude, bLongitude)
	{
		var result = false;
		
		var a = new google.maps.LatLng(aLatitude, aLongitude);
		var b = new google.maps.LatLng(bLatitude, bLongitude);
		
		result = google.maps.geometry.spherical.computeDistanceBetween(a, b);
		
		return result;
	},
	
	offsetGeoPosition: function (latitude, longitude, offset, heading)
	{
		var result = false;
		
		var geoPosition = new google.maps.LatLng(latitude, longitude);
		
		result = google.maps.geometry.spherical.computeOffset(geoPosition, offset, heading);
		
		return result;
	}
};