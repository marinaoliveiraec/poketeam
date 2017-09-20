    var app = angular.module('poketeam', ['ngRoute']);

	app.run(function ($rootScope) {
		$rootScope.$on('scope.stored', function (event, data) {
			console.log("scope.stored", data);
		});
	});
	
    app.config(function($routeProvider) {
		
        $routeProvider

            .when('/', {
                templateUrl : 'src/templates/novo.html',
                controller  : 'novoController'
            })

            .when('/times', {
                templateUrl : 'src/templates/times.html',
                controller  : 'allTimesController'
            });
    });

    app.controller('teamController', function($scope,$http, $q,Scopes) {
		Scopes.store('teamController', $scope);
		
		$scope.PokeapiURL = 'http://pokeapi.co/api/v2/';
		$scope.editElement = {'nomePokemon':"",'idTime':0,'nomeTime':"",'movesEdit':[]};
		$scope.editando = false;
		$scope.urlMoves = $scope.PokeapiURL + 'move/';
		$scope.moves = [];
		$scope.times = [];
		$scope.novoTime = {'nome':"",'id':0,'pokemons':[]};
		$scope.pokemons = [];
		$scope.carregando = true;
		
		function buildMove(move){
            move = move.name;
            return move;
        }

        function getMoves(url){
            var defered = $q.defer();
			$http.get(url, {cache: true}).success(function(response){
				if(response.next != null){
					getMoves(response.next).then(function(ret){
						$scope.moves = $scope.moves.concat(ret);
					},function(){
						$scope.moves = [];
					});
				} 
                var ret = response.results;
				ret = ret.map(buildMove);
                defered.resolve(ret);
            }).error(function(){
                defered.reject([]);
            });
            return defered.promise;
        }

        function buildPokemon(pokemon){
            pokemon.id = pokemon.entry_number;
            var name = pokemon.pokemon_species.name.toLowerCase();
            pokemon.name = name;
			pokemon.img = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/"+pokemon.entry_number+".png";
            return pokemon;
        }

        function getAll(){
            var defered = $q.defer();
            var url = $scope.PokeapiURL + 'pokedex/1/';
            $http.get(url, {cache: true}).success(function(response){
                var pokemons = response.pokemon_entries;
                pokemons = pokemons.map(buildPokemon);
                defered.resolve(pokemons);
            }).error(function(){
                defered.reject([]);
            });
            return defered.promise;
        }

		getAll().then(function(pokemons){
			$scope.pokemons = pokemons;
			$scope.carregando = false;
		},function(){
			$scope.pokemons = [];
			$scope.carregando = false;
		});
		
		getMoves($scope.urlMoves).then(function(ret){
			$scope.moves = ret;
		},function(){
			$scope.moves = [];
		});
			
		$scope.incluiPokemon = function (pokemon){
			let arrayPokemons = $scope.novoTime.pokemons;
			//valida se existe no time
			existe = false;
			for(i=0;i<arrayPokemons.length; i++){
				if(arrayPokemons[i].id == pokemon.id){
					existe = true;
				}
			}
			if(existe){
				alert('Você já escolheu este pokemon! Não vale o mesmo pokemon duas vezes no mesmo time...');
			} else if(arrayPokemons.length < 6){
				pokemon.habilidades=[];
				arrayPokemons.push(pokemon);
			} else {
				alert('O time pode ter no máximo 6 pokemons! \nDica: Grave este time e monte mais um!');
			}
		}
			
		$scope.excluiPokemon = function (id){
			let arrayPokemons = $scope.novoTime.pokemons;
			array = [];
			for(i=0;i<arrayPokemons.length; i++){
				if(arrayPokemons[i].id != id){
					array.push(arrayPokemons[i]);
				}
			}
			$scope.novoTime.pokemons = array;
		}
			
		$scope.adicionaTime = function (){
			$scope.novoTime.id++;
			$scope.times.push(angular.copy($scope.novoTime));
			$scope.novoTime = {'nome':"",'id':$scope.novoTime.id,'pokemons':[]};
		}

		$scope.setElementEditMove = function (id,nomeTime,name){
			$scope.editElement.nomePokemon = name;
			$scope.editElement.idTime = id;
			$scope.editElement.nomeTime = nomeTime;
			$scope.editando = true;
		}
		
		$scope.editMove = function (move){
			if($scope.editElement.movesEdit.indexOf(move) != -1){
				alert('Você já escolheu esta habilidade para este pokemon!');
			} else if($scope.editElement.movesEdit.length < 4) {
				$scope.editElement.movesEdit.push(move)
			} else {
				alert('O pokemon pode ter no máximo 4 habilidades!');
			}
		}
			
		$scope.finalizaEditMoves = function (){
			$scope.editElement = {'nomePokemon':"",'idTime':0,'nomeTime':"",'movesEdit':[]};
			$scope.editando = false;
		}
			
		$scope.saveMoves = function (){
			for(i=0;i<$scope.times.length; i++){
				if($scope.times[i].id == $scope.editElement.idTime){
					for(j=0;j<$scope.times[i].pokemons.length; j++){
						if($scope.times[i].pokemons[j].name == $scope.editElement.nomePokemon){
							$scope.times[i].pokemons[j].habilidades = angular.copy($scope.editElement.movesEdit);
							break;
						}
					}
				}
			}
			$scope.finalizaEditMoves();
		}
	
    });

    app.controller('novoController', function ($scope, Scopes) {
		$scope = Scopes.get('teamController');
	});
	
    app.controller('allTimesController', function($scope, Scopes) {
        $scope = Scopes.get('teamController');
    });

	app.factory('Scopes', function ($rootScope) {
    var mem = {};
    return {
        store: function (key, value) {
            $rootScope.$emit('scope.stored', key);
            mem[key] = value;
        },
        get: function (key) {
            return mem[key];
        }
    };
});
	