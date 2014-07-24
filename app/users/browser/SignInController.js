var _ = require("lodash");

function signInController($scope, $http, $window) {
  $scope.signIn = function signIn(event, register) {
    event.preventDefault();
    delete $scope.error;
    var user = _.pick($scope, "email", "password");
    var url = register ? "/users/sign-up" : "/users/sign-in";
    $http.post(url, user).then(function () {
      $window.location.href = "/";
    }).catch(function(response) {
      $scope.error = "Check your email and password and try again";
      if (response.status  === 409) {
        $scope.error = "That email is already registered. Try signing in.";
      }
    });
  };
}

module.exports = signInController;
