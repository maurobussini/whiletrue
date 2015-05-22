describe("whiletrue", function () {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

	//Define dummy data for test
	var times = [];

    //Task to run more that once
    function someTaskToRunMoreThanOnce(){

        //Generate a random number between 0 and 99
        var randomNumber = Math.floor((Math.random() * 100));

        //Create object
        var generateItem = {
            time: new Date(),
            value: randomNumber
        };

        //Push created object to array
        times.push(generateItem);
    }

    //Function that should return false value to stop execution
    function runningCondition(){

        //Stop execution when we will have 10 elements
        return times.length < 10;
    }

    describe("definition", function(){

        it("Should be defined on environment", function(){

            expect(whiletrue).toBeDefined();
        });

    });

	//run
	describe("run", function () {
		
		it("Should iterate 10 times", function (done) {

            var someArray = [];

            //While someArray length il less than 10 elements
            var condition = function runningCondition(){
                return someArray.length < 10;
            };

            //Task to run
            var task = function(done, state){

                //Increment array
                var elem = { iter: state.iterations, delay: state.delay };
                someArray = someArray.push(elem);

                //Invoke "done" to mark completion
                done();
            };

            //Create a new whiletrue runner (delay: 10 ms)
			var runner = whiletrue(condition, task, 10);

            //Start execution
            runner.run()
                .then(function(){

                    //Assert test
                    expect(times.length).toEqual(10);
                    expect(runner.iterations).toEqual(10);

                }).
                finally(done);
		});

        it("Should works with long tasks", function (done) {

            //Condition: iterate 10 times
            function condition(state){
                return state.iterations < 10;
            }

            //Task: do some work, then invoke "done"
            function longTask(done){

                //Do some stuff here...
                console.log("Doing some stuff...");

                setTimeout(function(){

                    //Task completed: remember to invoke ALWAYS "done"
                    console.log("Task completed!");
                    done();

                }, 1000);
            }

            //Setup: Create a "whiletrue" runner with 10 ms delay
            var runner = whiletrue(condition, longTask, 10);

            //Start execution
            runner.run()
                .then(function(){

                    //Assert test
                    expect(runner.iterations).toEqual(10);

                }).
                finally(done);
        });
	});

});