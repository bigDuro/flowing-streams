(function(){
	var app = angular.module('app', [
	  'ngRoute', 'ngTouch'
	]);

	app.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
	  $routeProvider
	    // Home
	    .when("/", {templateUrl: "partials/genres.html"})
	    // Pages
	    .when("/genres", {templateUrl: "partials/genres.html", controller: 'GenreController'})
		.when("/stations", {templateUrl: "partials/stations.html", controller: 'StationController'})
		.when("/audioplayer", {templateUrl: "partials/audioplayer.html", controller: 'PlayerController'})
	    // else 404
		.otherwise("/404", {templateUrl: "partials/404.html"});

		// http Provider
		
		// $httpProvider.defaults.useXDomain = true;

		// delete $httpProvider.defaults.headers.common['X-Requested-With'];


	}]);

	app.controller('MainController', ['$scope', '$location', function($scope, $location) {
		$scope.showSidebar = false;
		$scope.currentStation = {};
		$scope.menuItem = 'menu';
		
		// Watch side bar toggle
		$scope.$watch('showSidebar', function(model){
			console.log(model);
			// var pagewidth = $('.page-container').width();
			// $scope.pageWidth = (model) ? pagewidth + 'px' : '';
			// $scope.leftPos = (model) ? pagewidth * .75 + 'px' : '';
		});

		$scope.quickMenu = function(item){
			var currenlocation = item || 'menu'
			if(currenlocation === 'stations'){
				$location.url('genres');
				$scope.menuItem = 'menu';
			}
			else if(currenlocation === 'playlist'){
				$location.url('stations');
				$scope.menuItem = 'stations';
			}
			else{
				$location.url('genres');
				$scope.showSidebar = !$scope.showSidebar;
			}			
		};
		// Watch Genre
		$scope.$on('genreChanged', function(event, genre){
			$scope.currentStation.genre = genre;
			// $scope.currentStation.station = '';
			$scope.menuItem = 'stations';

		});
		// Watch Station
		$scope.$on('stationChanged', function(event, station){
			$scope.currentStation.station = station;
			$scope.menuItem = 'stations';
		});

		$scope.$on('isAudioPlayer', function(event, station, stations){
			$scope.currentStation.station = station;
			$scope.currentStation.stations = stations || [];
			$scope.menuItem = 'playlist';
		});

		if(!$scope.currentStation.genre){
			$location.url('genres');
		}

		$scope.user = {
			fName : 'Darryl',
			lName : 'Crockett',
			email : 'dcrockett2@hotmail.com'
		};
    }]);

	app.controller('GenreController', ['$scope', '$location', 'dataService', function($scope, $location, dataService){
		$scope.error = '';
		
		var config = {
			method : 'GET',
			url : 'http://prazor.com/index.php/rest/getGenres/'
		}

		// dataService.getData(config).then(
		// 	function(response){
		// 		$scope.genres = response.data;
		// 	},function(error){
		// 		console.log(error);
		// 	});	

		$scope.genres = [{"title":"Blended","genre_image":"","entry_id":3},{"title":"Country","genre_image":"","entry_id":7},{"title":"Inspirational","genre_image":"","entry_id":4},{"title":"Pop","genre_image":"","entry_id":2},{"title":"Premium","genre_image":"","entry_id":9},{"title":"Rock","genre_image":"","entry_id":1},{"title":"Urban","genre_image":"","entry_id":5},{"title":"World","genre_image":"","entry_id":8}];	

		$scope.setGenre = function(genre){
			$scope.$emit('genreChanged', genre);
			$location.url('stations');
		};
	}]);



	app.controller('StationController', ['$scope', '$location', 'dataService', function($scope, $location, dataService){
		// $scope.stations = stations;
		$scope.error = '';
		
		$scope.fetchStations = function() {			
			var entryID = ($scope.currentStation.genre) ? $scope.currentStation.genre.entry_id : 1,
				config = {
				method : 'GET',
				url : 'http://prazor.com/index.php/rest/getGenres/details/' + entryID
			};

			dataService.getData(config).then(
				function(response){
					$scope.stations = response.data[0].stations;
				},function(error){
					console.log(error);
				});
	    };

	    // $scope.fetchStations();

	    $scope.stations = [{"row_id":41,"station_name":"Pop Mix","station_image":"","station_id":"PRAZOR41","station_information":""},{"row_id":42,"station_name":"Love Mix","station_image":"","station_id":"PRAZOR42","station_information":""},{"row_id":43,"station_name":"Easy Mix","station_image":"","station_id":"PRAZOR43","station_information":""},{"row_id":44,"station_name":"60's","station_image":"","station_id":"PRAZOR44","station_information":""},{"row_id":45,"station_name":"70's","station_image":"","station_id":"PRAZOR45","station_information":""}];
		
		$scope.playStation = function(station){
			$scope.$emit('stationChanged', station);
		};

		$scope.playerStation = function(station){
			// $location.url('audioplayer');
			// $scope.$emit('isAudioPlayer', station, $scope.stations);			
		};
	}]);

	app.controller('PlayerController', ['$scope', function($scope){
		var audioplayer;
		$scope.playing = true;
		setPlayPauseBtn($scope.playing);

		$scope.stations = $scope.currentStation.stations;
			

		$scope.previous = function(){
			console.log('previous');
		};
		$scope.next = function(){
			console.log('next');	
		};

		$scope.playPause = function(){
			if($scope.playing){
				audioplayer.pause();
			}
			else{
				audioplayer.play();
			}

			$scope.playing = !$scope.playing;
			setPlayPauseBtn($scope.playing);			
		};

		$scope.$watch('currentStation.station.station_id',function(model){
			console.log('model: ', model);
			if(model){				
				audioplayer = new Audio('http://ice41.securenetsystems.net/PRAZOR1');
				audioplayer.autoplay = true;
			}
			
		})
	
		// Sets play btn property
		function setPlayPauseBtn(isPlaying){
			$scope.playPauseBtn = (!isPlaying) ? 'play' : 'pause';
			if(isPlaying){
				
			}
			else{
				
			}
		}
	}]);

	app.service('dataService', ['$http', '$q', '$location', '$templateCache', function($http, $q, $location, $templateCache){
		
		this.getData = function(config){
			var deferred = $q.defer();
			$http({method: config.method, url: config.url, cache: $templateCache})
				.then(					
					function(response) {
						if(response.data){
							deferred.resolve(response);
						}
						else{
							deferred.reject('Error Fetching Data');
						}
					}, 
					function(error) {
						deferred.reject(error);
					});
			
			return deferred.promise;
		}
		
	}]);
})();