var assert = require("assert");
var Q = require("q");
var whiletrue = require("../src/whiletrue.js");

var REQUESTED_ITERATIONS = 10;
var TEST_TIMEOUT = 20000;

describe("whiletrue", function () {

    describe("definition", function(){

        it("Should be defined on environment", function(){

            //Confirm if "whiletrue" exists
            assert.ok(whiletrue);
        });

    });

    describe("Q", function(){

        it("Should resolve Q.all", function(done){

            //Set timeout for test
            this.timeout(TEST_TIMEOUT);

            var arr = [];

            var pippo = function(){
                var deferred = Q.defer();
                setTimeout(function(){
                    deferred.resolve(true);
                }, 100);
                var promise = deferred.promise;
                return promise;
            }

            for (var i = 0; i < 10; i++){
                var pro = pippo();
                arr.push(pro);
            }

            Q.all(arr).then(function(){
                assert.ok(true);
                done();
            });
        });


    });

    describe("run", function(){

        it("Should works in parallel", function (done) {

            //Set timeout for test
            this.timeout(TEST_TIMEOUT);

            //Condition: iterate 10 times
            function condition(state){
                console.log("Parallel: condition. [" + state.index + "/" + state.iterations + "]");
                return state.index < REQUESTED_ITERATIONS;
            }

            //Task: do some work, then invoke "done"
            function longTask(done, state){

                //Do some stuff here...
                console.log("Parallel: doing some stuff...[" + state.index + "/" + state.iterations + "]");

                setTimeout(function(){

                    //Task completed: remember to invoke ALWAYS "done"
                    console.log("Paralle: task completed! [" + state.index + "/" + state.iterations + "]");
                    done();

                }, 1000 * state.index);
            }

            //Setup: Create a "whiletrue" runner with 10 ms delay
            var runner = whiletrue(condition, longTask, 1000);

            //Start execution
            runner.runParallel()
                .then(function(allResults){

                    //Write all durations
                    for (var i = 0; i < allResults.length; i++){
                        console.log("time.duration" + allResults[i].time.duration);
                    }

                    console.log("Parallel: all completed!");
                    assert(runner.iterations == REQUESTED_ITERATIONS);
                }).
                finally(done);
        });

        it("Should works with long tasks", function (done) {

            //Set timeout for test
            this.timeout(TEST_TIMEOUT);

            //Condition: iterate 10 times
            function condition(state){
                return state.iterations < REQUESTED_ITERATIONS;
            }

            //Task: do some work, then invoke "done"
            function longTask(done){

                //Do some stuff here...
                console.log("Doing some stuff...");

                setTimeout(function(){

                    //Task completed: remember to invoke ALWAYS "done"
                    console.log("Task completed!");
                    done();

                }, 100);
            }

            //Setup: Create a "whiletrue" runner with 10 ms delay
            var runner = whiletrue(condition, longTask, 10);

            //Start execution
            runner.run()
                .then(function(){

                    //Assert test
                    assert(runner.iterations == REQUESTED_ITERATIONS);

                }).
                finally(done);
        });

        it("Should produce same output in serial and parallel mode", function(done){

            //Set timeout for test
            this.timeout(TEST_TIMEOUT);

            //Running condition
            var condition = function(state){

                //Index is lower that requested iterations
                return state.index < REQUESTED_ITERATIONS;
            };

            //Execution task
            var task = function(done, state){

                //Write state to console
                console.log("state: " +
                    "iterations:" + state.iterations + ", " +
                    "index:" + state.index + ", " +
                    "time.start" + state.timer.start);

                //Invoke "done" to mark completion
                done();
            };

            //Create a new whiletrue runner (delay: 100 ms)
            var runner = whiletrue(condition, task, 100);

            //Create promises fro "run" and "runParallel" execution
            var runPromise = runner.run();
            var runParallelPromise = runner.runParallel();
            var doneTest = done;

            //Wait for all promises
            Q.all([runPromise, runParallelPromise])
                .then(function(allResults){

                    if (allResults.length != 2){

                        //Fail if there aren't 2 results
                        assert.fail();
                    }
                    else{

                        for(var i = 0; i < allResults[0].length; i++){
                            if (allResults[0].index != allResults[1].index ||
                                allResults[0].iterations != allResults[1].iterations)
                                assert.fail();
                        }

                        //Confirm
                        assert(true);
                    }
                })
                .finally(doneTest);
        });

        it("Should iterate 10 times", function (done) {

            //Set timeout for test
            this.timeout(TEST_TIMEOUT);

            var someArray = [];

            //While someArray length il less than 10 elements
            var condition = function runningCondition(){
                return someArray.length < REQUESTED_ITERATIONS;
            };

            //Task to run
            var task = function(done, state){

                //Increment array
                var elem = { iter: state.iterations, delay: state.delay };
                someArray.push(elem);

                //Invoke "done" to mark completion
                done();
            };

            //Create a new whiletrue runner (delay: 100 ms)
            var runner = whiletrue(condition, task, 100);

            //Start execution
            runner.run()
                .then(function(){

                    //Assert test
                    assert(runner.iterations == REQUESTED_ITERATIONS);

                }).
                finally(done);
        });
    })
});