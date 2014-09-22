var environmentsApp = angular.module('environmentsApp', [])

environmentsApp.controller('EnvironmentsCtrl', [ "$scope", "$http", function($scope, $http) {
	
	function App(name, url, healthy, healthchecks) {
	    this.name = name;
	    this.url = url;
	    this.healthy = healthy;
	    this.healthchecks = healthchecks;
	}
	
	function Env(name) {
		 this.name = name;
		 this.applications = {};
	}
	
	if(!$scope.environments) $scope.environments = {}; 
	if(!$scope.envData) $scope.envData = {}; 
	
	// get the list of environments
	$http.get('envs/envs.json').success(function(data) {

		// iterate over environments JSON to get environment configuration
		for (var i = 0; i < data.environments.length; i++) {
			$http.get('envs/' + data.environments[i] + '.json').success(function(data) {
				
				var envName = data.name;
				$scope.environments[envName] = data;
				$scope.envData[envName] = new Env(envName);
				
				// iterate over each health check
				for (var i = 0; i < data.applications.length; i++) {
					
					// fix scope of data in loop using a closure
					// (http://stackoverflow.com/questions/17244614/promise-in-a-loop)
					var appName = data.applications[i].name;
					var appUrl = data.applications[i].url;
					(function(envName, appName, appUrl, i) {
						
						var process = function(data, status) {
							var healthy = (status == 200);
							console.log(envName + ":" + appName + ":" + healthy);
							$scope.envData[envName].applications[i] = new App(appName, appUrl, healthy, data);
							$scope.updated = Date.now();
						};
						$http.get("/proxy/?url=" + appUrl).success(process).error(process);
						
					})(envName, appName, appUrl, i);
				}
			});
		}
	});
} ]);