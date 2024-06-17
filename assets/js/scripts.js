// Key for accessing OpenWeather API
var apiKey = '64f2ee2a8261daa4d9f780f5b365f275';
// Default city for weather information
var defaultCity = "Toronto";

// Get the current date and time
var currentDate = moment().format('dddd, MMMM Do YYYY');
var currentDateTime = moment().format('YYYY-MM-DD HH:MM:SS');

var cityHistory = [];

// Event listener for the search button
$('.search').on("click", function (event) {
	event.preventDefault();
	var cityInput = $(this).parent('.btnPar').siblings('.textVal').val().trim();
	if (cityInput === "") {
		return;
	};
	cityHistory.push(cityInput);
	localStorage.setItem('city', JSON.stringify(cityHistory));
	$('.fiveForecast').empty();
	updateHistory();
	getCurrentWeather();
});

// Update search history and create buttons for each searched city
function updateHistory() {
	var historyContainer = $('.cityHist');
	historyContainer.empty();

	for (let i = 0; i < cityHistory.length; i++) {
		var row = $('<div class="row histBtnRow">');
		var button = $('<button class="btn btn-outline-secondary histBtn" type="button">').text(cityHistory[i]);
		row.append(button);
		historyContainer.prepend(row);
	}

	// Event listener for history buttons
	$('.histBtn').on("click", function (event) {
		event.preventDefault();
		defaultCity = $(this).text();
		$('.fiveForecast').empty();
		getCurrentWeather();
	});
}

// Get current weather for the selected city
function getCurrentWeather() {
	var currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${defaultCity}&units=imperial&appid=${apiKey}`;
	var cardTodayBody = $('.cardBodyToday');

	cardTodayBody.empty();

	$.ajax({
		url: currentWeatherUrl,
		method: 'GET',
	}).then(function (response) {
		$('.cardTodayCityName').text(response.name);
		$('.cardTodayDate').text(currentDate);
		$('.icons').attr('src', `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`);

		cardTodayBody.append(`<p>Temperature: ${response.main.temp} °F</p>`);
		cardTodayBody.append(`<p>Feels Like: ${response.main.feels_like} °F</p>`);
		cardTodayBody.append(`<p>Humidity: ${response.main.humidity} %</p>`);
		cardTodayBody.append(`<p>Wind Speed: ${response.wind.speed} MPH</p>`);

		var cityLon = response.coord.lon;
		var cityLat = response.coord.lat;

		var uvIndexUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=hourly,daily,minutely&appid=${apiKey}`;

		$.ajax({
			url: uvIndexUrl,
			method: 'GET',
		}).then(function (response) {
			var uvIndex = response.current.uvi;
			var uvIndexSpan = $('<span>').text(uvIndex);
			var uvIndexParagraph = $('<p>').text('UV Index: ').append(uvIndexSpan);

			cardTodayBody.append(uvIndexParagraph);

			if (uvIndex <= 2) {
				uvIndexSpan.addClass('green');
			} else if (uvIndex <= 5) {
				uvIndexSpan.addClass('yellow');
			} else if (uvIndex <= 7) {
				uvIndexSpan.addClass('orange');
			} else if (uvIndex <= 10) {
				uvIndexSpan.addClass('red');
			} else {
				uvIndexSpan.addClass('purple');
			}
		});
	});
	getFiveDayForecast();
}

// Get five-day weather forecast for the selected city
function getFiveDayForecast() {
	var fiveDayForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${defaultCity}&units=imperial&appid=${apiKey}`;

	$.ajax({
		url: fiveDayForecastUrl,
		method: 'GET',
	}).then(function (response) {
		var forecastArray = response.list;
		var forecastData = [];

		$.each(forecastArray, function (index, value) {
			var forecastObject = {
				date: value.dt_txt.split(' ')[0],
				time: value.dt_txt.split(' ')[1],
				temp: value.main.temp,
				feels_like: value.main.feels_like,
				icon: value.weather[0].icon,
				humidity: value.main.humidity
			};

			if (forecastObject.time === "12:00:00") {
				forecastData.push(forecastObject);
			}
		});

		var fiveForecastContainer = $('.fiveForecast');

		for (let i = 0; i < forecastData.length; i++) {
			var forecastCard = $('<div class="card text-white bg-primary mb-3 cardOne" style="max-width: 200px;">');
			var cardHeader = $('<div class="card-header">').text(moment(forecastData[i].date).format('MM-DD-YYYY'));
			var cardBody = $('<div class="card-body">');
			var icon = $('<img class="icons">').attr('src', `https://openweathermap.org/img/wn/${forecastData[i].icon}@2x.png`);

			cardBody.append(icon);
			cardBody.append(`<p>Temperature: ${forecastData[i].temp} °F</p>`);
			cardBody.append(`<p>Feels Like: ${forecastData[i].feels_like} °F</p>`);
			cardBody.append(`<p>Humidity: ${forecastData[i].humidity} %</p>`);

			forecastCard.append(cardHeader);
			forecastCard.append(cardBody);
			fiveForecastContainer.append(forecastCard);
		}
	});
}

// Initialize the application with stored history or default city
function initLoad() {
	var storedHistory = JSON.parse(localStorage.getItem('city'));
	if (storedHistory !== null) {
		cityHistory = storedHistory;
	}
	updateHistory();
	getCurrentWeather();
}

initLoad();
