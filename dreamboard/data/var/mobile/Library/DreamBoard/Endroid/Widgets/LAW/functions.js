var locale;

var updateInterval = 10;

var postal;

document.ontouchmove = function(event) {

	event.preventDefault();

}

function onLoad(){

	if(localStorage.getItem("zip")==null)

		setTimeout(onLoad, 1000);

	else{

		document.getElementById("animationFrame").src=localStorage.getItem("cacheanimation");

		locale= localStorage.getItem("zip");

		validateWeatherLocation(escape(locale).replace(/^%u/g, "%"), setPostal);

		checkZip();

	}

}

function checkZip(){

	if(localStorage.getItem("zip")!=locale){

		setTimeout(onLoad, 1000);

	}else{

		setTimeout(checkZip, 500);

	}

}

function setPostal(obj){	

	if (obj.error == false){

		if(obj.cities.length > 0){

			postal = escape(obj.cities[0].zip).replace(/^%u/g, "%");

			weatherRefresherTemp();

		}

	}else{

		setTimeout('validateWeatherLocation(escape(locale).replace(/^%u/g, "%"), setPostal)', Math.round(1000*60*5));

	}

}

function dealWithWeather(obj){

	var Conditions = ["thunderstorm","rain","rain","thunderstorm","thunderstorm","rain","rain","snow","snow","rain","snow","rain","rain","snow","snow","snow","snow","snow","snow","fog","fog","fog","fog","cloud","cloud","cloud","cloud","cloud","cloud","cloud","cloud","sun","sun","moon","sun","rain","sun","thunderstorm","thunderstorm","thunderstorm","thunderstorm","snow","snow","snow","cloud","thunderstorm","snow","thunderstorm","blank"];

	document.getElementById("animationFrame").src="Animations/"+Conditions[obj.icon]+".html";

	localStorage.setItem("cacheanimation", ("Animations/"+Conditions[obj.icon]+".html"));

}

function weatherRefresherTemp(){

	fetchWeatherData(dealWithWeather,postal);

	setTimeout(onLoad, 60*1000*updateInterval);

}

function constructError (string)

{

	return {error:true, errorString:string};

}

function findChild (element, nodeName)

{

	var child;

	for (child = element.firstChild; child != null; child = child.nextSibling)

	{

		if (child.nodeName == nodeName)

			return child;

	}

	return null;

}

function fetchWeatherData (callback, zip)

{

	url="http://weather.yahooapis.com/forecastrss?u=f&p=";

	var xml_request = new XMLHttpRequest();

	xml_request.onload = function(e) {xml_loaded(e, xml_request, callback);}

	xml_request.overrideMimeType("text/xml");

	xml_request.open("GET", url+zip);

	xml_request.setRequestHeader("Cache-Control", "no-cache");

	xml_request.send(null); 

	return xml_request;

}

function xml_loaded (event, request, callback)

{

	if (request.responseXML)

	{

		var obj = {error:false, errorString:null};

		var effectiveRoot = findChild(findChild(request.responseXML, "rss"), "channel");

		obj.city = findChild(effectiveRoot, "yweather:location").getAttribute("city");

		obj.realFeel = findChild(effectiveRoot, "yweather:wind").getAttribute("chill"); 	

		conditionTag = findChild(findChild(effectiveRoot, "item"), "yweather:condition");

		obj.temp = conditionTag.getAttribute("temp");

		obj.icon = conditionTag.getAttribute("code");

		obj.description = conditionTag.getAttribute("text"); 

		var div = document.createElement("div");

		div.innerHTML = request.responseText;

		var list = div.getElementsByTagName("yweather:forecast");

		obj.high = list[0].getAttribute("high");

		obj.low = list[0].getAttribute("low");

		callback (obj); 

	}else{

		callback ({error:true, errorString:"XML request failed. no responseXML"});

	}

}

function validateWeatherLocation (location, callback)

{

	var obj = {error:false, errorString:null, cities: new Array};

	obj.cities[0] = {zip: location};

	callback (obj);

}

