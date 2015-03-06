// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require_tree .
// fetch domains
executeAPI = function(load_start){
	if((window.location.search) && (load_start)){
		var reg = new RegExp(/\?search=(.*)/);
		var query = window.location.search.match(reg)[1];
	}else{
		var query = $('#domain').val();
	}

	$.ajax({
	    url: "https://domainr.com/api/json/search?client_id=example&q=" + query,
	    dataType: 'jsonp',
	    success: function(data){
	    	var search = data.query;
	    	var domains = data.results;

				$('ul').empty();
	    	$.each(domains, function(index, domain){
	    		var domainItem = buildLiContent(domain);
	    		var availability = htmlAvailability(domain["availability"]);
	    		var htmlStructure = "<li class='domain'>"+availability+domainItem+"</li>";

	    		$('#domains').append(htmlStructure)
	    	});
	    }
	});
}

// li content html
buildLiContent = function(domain){
	var suggestedDomain = "<span class='suggestedDomain'>"+domain["domain"]+"</span>";
	var suggestedPath = "<span class='suggestedPath'>"+domain["path"]+"</span>";
	return suggestedDomain + suggestedPath;
}

// redirect with a search param
formSubmit = function(){
	$('form#search').submit(function(e){
    window.location.search = '?search='+$('input#domain').val();
    return false;
	 });
}

// swap affilate
marketDomain = function(domain, name){
	var regX = new RegExp(/&registrar=(.*?)&/);
	var registar = domain.register_url.match(regX)[1];
	if(name){
		var domainName = domain["name"];
	}else{
		var domainName = domain["domain"];
	}
 // http://www.marketkarma.io/out/?reg=iwantmyname&domain=meowmeow.com
	return("http://www.marketkarma.io/out/?reg="+registar+"&domain="+domainName);
}

// html for different availabilities
htmlAvailability = function(availability){
	switch(availability){
		// case("taken"):
		// 	return "<span class='taken'></span>";

		case("available"):
			return "<img src='green_dot.png'>";
			// return "<span class='available'></span>;"

		// case("maybe"):
		// 	return "<span class='maybe'></span>";

		// case("unavailable"):
		// 	return "<span class='unavailable'></span>";

		// case("tld"):
		// 	return "<span class='tld'></span>";

		default:
			return "<span class='unavailable'></span>"
	}
}

// fetch more info on a domain
domainInfo = function(domain){
	var query = window.location.pathname;
	$.ajax({
		url: "https://domainr.com/api/json/info?client_id=example&q=" + query,
		dataType: 'jsonp',
		success: function(data){
			createDetailsHtml(data);
		}
	});
}

// input field default value
defaultInput = function(){
	if(window.location.search){
		var reg = new RegExp(/\?search=(.*)/);
		var searchCond = window.location.search.match(reg)[1];
		$('input#domain').val(searchCond);
	}
}

// send user to path-ext of domain
domainClick = function(){
	$('ul#domains').on('click', 'li.domain', function(e){
		var domainLink = $(this).closest('li.domain');
		var path = domainLink.text().replace('/','?');
		var search = '?search='+$('input#domain').val();
		var origin = window.location.origin;
		var newHref = origin +"/"+ path + search;
		window.location.replace(newHref);
	});
}

domainSet = function(){
	if(window.location.pathname === '/'){
		return false;
	}
	return true;
}

showDetails = function(){
	if(domainSet()){
		$('#details').css('opacity','1');
		domainInfo();
	}
}

createDetailsHtml = function(data){
	var newRegister = marketDomain(data);

	$('#availability').text(data.availability);
	$('#availability').attr('href', data.www_url).addClass(data.availability);
	$('#domain-name').text(data.domain)
	$('#buy-link').attr('href', marketDomain(data));
	registrarLinks(data.registrars);

}

registrarLinks = function(data){
	for(var i=0;i<=4;i++){
		var name = data[i].name;
		var url = marketDomain(data[i], true);
		var htmlStructure = "<a href='"+url+"'>"+name+"</a>";

		$('#registrars').append("<li class='registrar'>"+htmlStructure+"</li>");
	}
	// $.each(data, function(index, registrar){
	// 	var name = registrar.name;
	// 	var url = registrar.register_url;
	// 	var htmlStructure = "<a href='"+url+"'>"+name+"</a>";
	// 	$('#registrars').append("<li class='registrar'>"+htmlStructure+"</li>");
	// });
}

// bundled functions to run
runPage = function(){
	executeAPI(true);
	domainClick();
	defaultInput();
	showDetails();
	$('#domain').on('keyup', function(){
		executeAPI();
	});
	formSubmit();
}

// on dom ready
$(function(){runPage();});
$(document).on('page:load', runPage);