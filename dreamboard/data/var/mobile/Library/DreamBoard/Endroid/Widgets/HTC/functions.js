/*

==========================
Endroid Weather Widget
==========================

Wynd.

*/
//localStorage.setItem("zip", 77429)
window.onload = onLoad;
var MiniIcons =["tstorm3","tstorm3","tstorm3","tstorm3","tstorm3","sleet","sleet","sleet","sleet","showers","sleet","showers","showers","snow1","snow1","snow1","snow1","hail","sleet","fog","fog","fog","fog","cloudy1","cloudy1","cloudy1","cloudy1","cloudy1_night","cloudy1","cloudy1_night","cloudy1","sunny_night","sunny","sunny_night","sunny","hail","sunny","tstorm3","tstorm3","tstorm3","tstorm3","snow1","snow1","snow1","cloudy1","storm1","snow1","tstorm3","dunno"];
var locale;
var updateInterval = 10;
var postal;
document.ontouchmove = function(event) {
	event.preventDefault();
}
function getDate(){
	//gets the date
	var ma = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(/\s/);
	var da = "Sun Mon Tue Wed Thu Fri Sat".split(/\s/);
	return da[new Date().getDay()] + ", " + ma[new Date().getMonth()] + " " + (new Date().getDate()<10?("0" + new Date().getDate()):new Date().getDate());
}
function getTime(){
	//gets the time
	var d = new Date();
	return (d.getHours()>=10?(d.getHours()>12?((d.getHours()-12)>=10?(d.getHours()-12):("0"+(d.getHours()-12))):d.getHours()):"0"+d.getHours())+":"+(d.getMinutes()>=10?d.getMinutes():"0"+d.getMinutes())+(d.getHours()>=12?"PM":"AM");
}
function updateClock(){
	//updates the flip clock
	var s = getTime();
	if(s.charAt(0)=='0'){
		document.getElementById("clock1").innerHTML = "<img width = '24'/><img width='57' heigth='74' src = 'Images/dg" + s.charAt(1) + ".gif' />";
	}else{
		document.getElementById("clock1").innerHTML = "<img width='57' heigth='74' src = 'Images/dg" + s.charAt(0) + ".gif' />" + "<img width='57' heigth='74' src = 'Images/dg" + s.charAt(1) + ".gif' />";
	}
	document.getElementById("clock2").innerHTML = "<img width='57' heigth='74' src = 'Images/dg" + s.charAt(3) + ".gif' />" + "<img width='57' heigth='74' src = 'Images/dg" + s.charAt(4) + ".gif' />";
	document.getElementById("apm").innerHTML = s.substring(5);
	var d = new Date();
	document.getElementById("date").innerText=getDate();
	setTimeout("updateClock()",1000*(60-(d.getSeconds())));
}
function checkZip(){
	//see if zipcode is still the same, otherwise reload the weather
	if(localStorage.getItem("zip")!=locale){
		onLoad();
	}else{
		setTimeout(checkZip, 500);
	}
}
function onLoad(){
	//loads all images of the clock
	for(var i=0; i<10; i++){
	   img = new Image();
	   img.src = "Images/dg" + i + ".gif";
	}
	if(localStorage.getItem("zip")==null)
		//if no zip code, then try again later
		setTimeout(onLoad, 500);
	else{
		//sets based on the localstorage cache
		document.getElementById("city").innerText=localStorage.getItem("cachecity");
		document.getElementById("desc").innerText=localStorage.getItem("cachedesc");
		document.getElementById("temp").innerText=localStorage.getItem("cachetemp");
		document.getElementById("high").innerText=localStorage.getItem("cachehigh");
		document.getElementById("low").innerText=localStorage.getItem("cachelow");
		document.getElementById("weatherIcon").src=localStorage.getItem("cacheicon");
		//sets zipcode to the localstorage value
		locale= localStorage.getItem("zip");
		//icon animation
		document.getElementById('icon').style.webkitTransform='scale(0)';
		document.getElementById('icon').style.opacity=0;
		//gets the weather
		validateWeatherLocation(escape(locale).replace(/^%u/g, "%"), setPostal);
		updateClock();
		//animation
		setTimeout("document.getElementById('icon').style.webkitTransform='scale(1)';",500);
		setTimeout("document.getElementById('icon').style.opacity=1;",500);
		//checks to see if the zip was changed
		checkZip();
	}
}
function setPostal(obj){	
	if (obj.error == false){
		if(obj.cities.length > 0){
			postal = escape(obj.cities[0].zip).replace(/^%u/g, "%");
			weatherRefresherTemp();
		}else{
			document.getElementById("city").innerText="Not Found";
		}
	}else{
		document.getElementById("city").innerText=obj.errorString;
		setTimeout('validateWeatherLocation(escape(locale).replace(/^%u/g, "%"), setPostal)', Math.round(1000*60*5));
	}
}
function dealWithWeather(obj){
	document.getElementById("city").innerText=obj.city;
	document.getElementById("desc").innerText=obj.description;
	document.getElementById("temp").innerText=obj.temp+"º";
	document.getElementById("high").innerText="H:"+obj.high+"º";
	document.getElementById("low").innerText="L:"+obj.low+"º";
	document.getElementById("weatherIcon").src="Images/Icons"+"/"+MiniIcons[obj.icon]+".png";
	//stores cache values
	localStorage.setItem("cachecity", obj.city);
	localStorage.setItem("cachedesc", obj.description);
	localStorage.setItem("cachetemp", (obj.temp+"º"));
	localStorage.setItem("cachehigh", ("H:"+obj.high+"º"));
	localStorage.setItem("cachelow", ("L:"+obj.low+"º"));
	localStorage.setItem("cacheicon",("Images/Icons"+"/"+MiniIcons[obj.icon]+".png"));	
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
		// high and low, from yahoo weather
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