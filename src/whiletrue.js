(function (root, factory) {

    //UMD - Universal Module Definition
	if (typeof define === 'function' && define.amd) {
        //AMD: register as an anonymous module without dependencies
        define(['q'], factory);
    } else if (typeof exports === 'object') {
        //Node: does not work with strict CommonJS, but only CommonJS-like 
		//environments that support module.exports, like Node.
        module.exports = factory(require('q'));
    } else {
        //Browser: globals (root is window)
        root.whiletrue = factory(root.Q);
    }	
}(this, function (Q) {

    //Check if "Q" is available
    if (!Q) throw new Error("whiletrue requires 'Q' library");

	//Constructor function
    function whiletrue(condition, task, delay) {

        //Check arguments
        if (!condition) throw new Error("Argument 'condition' is invalid");
        if (!task) throw new Error("Argument 'task' is invalid");
        if (!delay) throw new Error("Argument 'delay' is invalid");

        //Check if condition and task are function, and delay is number
        if (typeof condition !== "function") throw new Error("Condition must be a function");
        if (typeof task !== "function") throw new Error("Task must be a function");
        if (typeof delay !== "number") throw new Error("Delay must be a number");

        //Check if delay is a valid number
        if (delay <= 0) throw new Error("Delay must be a number greater then zero");

        //Set global settings
        var self = this;
        self.delay = delay;
        self.condition = condition;
        self.task = task;
        self.iterations = 0;

        //Set function of prototype
        self.run = run;
        self.runParallel = runParallel;

        //Promise builder function
        function buildPromise (currentState){

            //Create new deferred for current iteration
            var iterationDeferred = Q.defer();

            //Set timeout for execution
            setTimeout(function(){

                //Run task (inside promise)
                promiseTask(currentState)
                    .then(function(time){

                        //Increment total iterations completed
                        self.iterations++;

                        //Create result of completed execution
                        var executionResult = {
                            iterations: self.iterations,
                            delay: currentState.delay,
                            index: currentState.index,
                            time: time
                        };

                        //Resolve iteration promise
                        iterationDeferred.resolve(executionResult);
                    });

            }, self.delay);

            //Returns promise
            return iterationDeferred.promise;
        };

        function runParallel(){

            //Create new main deferred
            var mainDeferred = Q.defer();

            //Define an array of promise
            var allPromises = [];

            //Define current state
            var state = {
                iterations: self.iterations,
                delay: self.delay,
                index: 0
            };

            //Iterate for each requested iterations
            while (self.condition(state)){

                //Create promise of execution
                var promiseMe = buildPromise(state);

                //Push promise on array
                allPromises.push(promiseMe);

                //Create state for current iteration
                state = {
                    iterations: self.iterations,
                    delay: self.delay,
                    index: allPromises.length
                };
            }

            //When all promises are resolved
            Q.all(allPromises).then(function(allResults){

                //Resolve main promise
                mainDeferred.resolve(allResults);
            });

            //returns main deferred
            return mainDeferred.promise;
        }

        //Runs execution of task
        function run(){

            //Create a promise using "Q"
            var deferred = Q.defer();

            //Define all results
            var allResults = [];

            //Define atomic function for task run
            var atom = function(){

                //Create argument for condition and task
                var state = {
                    iterations: self.iterations,
                    delay: self.delay,
                    index: allResults.length
                };

                //Check the running condition
                var result = self.condition(state);

                //Is result is not true, resolve and exit
                if (result == false){

                    //Execute resolve of execution
                    deferred.resolve(allResults);
                }
                else{

                    //Run task (inside promise)
                    promiseTask(state)
                        .then(function(time){

                            //Increment iterations
                            self.iterations++;

                            //Create execution result
                            var executionResult = {
                                iterations: self.iterations,
                                delay: self.delay,
                                index: allResults.length,
                                time: time
                            };

                            //Push to all results
                            allResults.push(executionResult);

                            //Set timeout for next execution
                            setTimeout(atom, self.delay);
                        });
                }
            }

            //Execute operation for the first time (this
            //is required to start the task immediately
            atom();

            //Returns promise
            return deferred.promise;
        }

        //Task wrapped inside promise
        function promiseTask(state){

            //Create a promise using "Q"
            var deferred = Q.defer();

            //Get start date
            var start = new Date();

            //Append time to state
            state.timer = {
                start: start,
                duration: null,
            };

            //Invoke task
            self.task(function(){

                //Detect time
                var time = {
                    start: start,
                    duration: new Date() - start
                };

                //Resolve current task with timing
                deferred.resolve(time);

            }, state);

            //Returns promise
            return deferred.promise;
        }

        //Return for chaining
        return self;
    }
	
	//Constructor instance
	function constructor(condition, task, delay){
		
		//Returns new instance of "whiletrue"
		return new whiletrue(condition, task, delay);
	}
  
	//Exports functions
	return constructor;
}));