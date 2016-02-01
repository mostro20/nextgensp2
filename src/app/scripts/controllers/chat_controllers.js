'use strict';

/**
 * @ngdoc function
 * @name nextgensp2.controller:ChatFreeTextCtrl
 * @description
 * # ChatFreeTextCtrl
 * Controller of the nextgensp2
 */
angular.module('nextgensp2')
  .controller('ChatFreeTextCtrl', function ($scope) {
    console.log('ChatFreeTextCtrl');
  });

/**
 * @ngdoc function
 * @name nextgensp2.controller:ChatLoadingCtrl
 * @description
 * # ChatLoadingCtrl
 * Controller of the nextgensp2
 */
angular.module('nextgensp2')
  .controller('ChatLoadingCtrl', function ($scope) {

  });

/**
 * @ngdoc function
 * @name nextgensp2.controller:ChatLocationCtrl
 * @description
 * # ChatLocationCtrl
 * Controller of the nextgensp2
 */
angular.module('nextgensp2')
  .controller('ChatLocationCtrl', function ($scope,loginservice, NgMap, $timeout) {
    $scope.query = $scope.$parent.moduleData;
    $scope.responses = $scope.query.children.filter(function(item) { return item.type == 'response'; })

    $scope.autoCompleteVal={};
    $scope.geolocation = {};
    $scope.showMap = false;
    $scope.$on('g-places-autocomplete:select', function (event, data){
      console.log(data);
      $timeout(function timoutCall(){
          updateMap();
        }, 300);
    });

    function updateMap(){
      $scope.geolocation.latlngStr = $scope.autoCompleteVal.geometry.location.lat()+","+$scope.autoCompleteVal.geometry.location.lng();
      $scope.geolocation.latlngObj = new google.maps.LatLng($scope.autoCompleteVal.geometry.location.lat(), $scope.autoCompleteVal.geometry.location.lng());
      $scope.showMap = true;
      $timeout(function timoutCall(){
        google.maps.event.trigger($scope.map, 'resize');
        $scope.map.setCenter($scope.geolocation.latlngObj);
        // Hard coded to select BCC option
        //$scope.$emit("chatModuleEvents", $scope.query.children[2].id, "");
      });
    }

    function reset(){
      //reset selection
      for(var i=0; i<$scope.responses.length; i++){
        $scope.responses[i].isSelected = false;
      }
    }

    reset();

    $scope.answerClicked = function(index, id){
      console.log(index, id);
      reset();
      $scope.responses[index].isSelected = true;
      $scope.$emit("chatModuleEvents", id, "");
    }
  });



/**
 * @ngdoc function
 * @name nextgensp2.controller:ChatMultipleChoiceCtrl
 * @description
 * # ChatMultipleChoiceCtrl
 * Controller of the nextgensp2
 */
angular.module('nextgensp2')
  .controller('ChatMultipleChoiceCtrl', ['$scope','$rootScope', '$location', 'loginservice', 'ngDialog', function ($scope,$rootScope, $location, loginservice, ngDialog) {
    console.log('ChatMultipleChoiceCtrl');
    console.log($scope.$parent.moduleData);

    $scope.query = $scope.$parent.moduleData;

    $scope.responses = $scope.query.children.filter(function(item) { return item.type == 'response' || item.type == 'linkage'; });
    $scope.services = $scope.query.children.filter(function(item) { return item.type == 'service'; });

    $scope.serviceClicked = function(service) {
      $rootScope.sidePanelService = service;
      
      //Show side menu
      $scope.$emit("chatSidePanelEvent");
    }

    $scope.answerClicked = function(index, response){
      console.log(index, response.id);
      $scope.query.children[index].isSelected = !$scope.query.children[index].isSelected;
    }

    $scope.okClicked = function(){
      //Look through and get selected
      var ids=[];
      for(var i=0; i<$scope.query.children.length; i++){
        if($scope.query.children[i].isSelected){
          ids.push($scope.query.children[i].id);
        }
      }
      console.log("okClicked");
      console.log(ids);
      $scope.$emit("chatMultiModuleEvents", ids, "");
    }
  }]);

/**
 * @ngdoc function
 * @name nextgensp2.controller:ChatResourcesCtrl
 * @description
 * # ChatResourcesCtrl
 * Controller of the nextgensp2
 */
angular.module('nextgensp2')
  .controller('ChatResourcesCtrl', function ($scope, $location,loginservice) {
    console.log('ChatResourcesCtrl');
  });


angular.module('nextgensp2')
  .controller('ChatOptionsCtrl', function ($scope, $location, ngDialog, $rootScope) {
    console.log("ChatOptionsCtrl");

    $scope.query = $scope.$parent.moduleData;
    $scope.responses = $scope.query.children.filter(function(item) { return item.type == 'response' || item.type == 'linkage'; });

    $scope.summaryClicked = function() {
      $scope.sessionStats = $rootScope.sessionStats;
      console.log(JSON.stringify($scope.sessionStats));
      ngDialog.open({
        template:"partials/chat_summary.html",
        scope:$scope
      });
    }

    $scope.answerClicked = function(response){
      console.log("answerClicked");
      if(response.type == 'linkage') {
        $scope.$emit("chatModuleLinkage", response.queryId);
      } else {
        $scope.$emit("chatModuleEvents", response.id, "");
      }
    }
  });


/**
 * @ngdoc function
 * @name nextgensp2.controller:ChatSingleChoiceCtrl
 * @description
 * # ChatSingleChoiceCtrl
 * Controller of the nextgensp2
 */
angular.module('nextgensp2')
  .controller('ChatSingleChoiceCtrl', ['$scope','$rootScope', '$location', 'loginservice', 'ngDialog', function ($scope, $rootScope, $location,loginservice, ngDialog) {
    console.log('ChatSingleChoiceCtrl');
    $scope.query = $scope.$parent.moduleData;
    console.log($scope.services);

    $scope.responses = $scope.query.children.filter(function(item) { return item.type == 'response' || item.type == 'linkage'; });
    $scope.services = $scope.query.children.filter(function(item) { return item.type == 'service'; });
    console.log("$scope.services");
    console.log($scope.services);
    console.log($scope.query);
    $scope.serviceClicked = function(service) {
      $rootScope.sidePanelService = service;
      
      //Show side menu
      $scope.$emit("chatSidePanelEvent");
    }

    function reset(){
      //reset selection
      for(var i=0; i<$scope.responses.length; i++){
        $scope.responses[i].isSelected = false;
      }
    }

    reset();

    $scope.answerClicked = function(index, response){
      console.log(index, response.id);
      reset();
      $scope.responses[index].isSelected = true;

      if(response.type == 'response') {
        $scope.$emit("chatModuleEvents", response.id, "");
      }
      else if(response.type == 'linkage') {
        $scope.$emit("chatModuleLinkage", response.queryId);
      }
    }
  }]);

/**
 * @ngdoc function
 * @name nextgensp2.controller:ChatSummaryCtrl
 * @description
 * # ChatSummaryCtrl
 * Controller of the nextgensp2
 */
angular.module('nextgensp2')
  .controller('ChatSummaryCtrl', function ($scope, $location,loginservice) {
    console.log('ChatSummaryCtrl');

  });
/**
 * @ngdoc function
 * @name nextgensp2.controller:ChatSummaryCtrl
 * @description
 * # ChatSummaryCtrl
 * Controller of the nextgensp2
 */
angular.module('nextgensp2')
  .controller('SidePanelCtrl', function ($scope) {
    
    $scope.closeClicked = function(){
      $scope.$emit("chatSidePanelEvent");
    };

  });


