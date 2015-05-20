(function (root, factory) {

    //UMD - Universal Module Definition
	if (typeof define === 'function' && define.amd) {
        //AMD: register as an anonymous module without dependencies
        define([], factory);
    } else if (typeof exports === 'object') {
        //Node: does not work with strict CommonJS, but only CommonJS-like 
		//environments that support module.exports, like Node.
        module.exports = factory();
    } else {
        //Browser: globals (root is window)
        root.whiletrue = factory();
    }	
}(this, function () {

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

        //Runs execution of task
        function run(){

            //Create a promise using "Q"
            var deferred = Q.defer();

            //Define atomic function for task run
            var atom = function(){

                //Check the running condition
                var result = self.condition();

                //Is result is not true, resolve and exit
                if (result == false){

                    //Execute resolve of execution
                    deferred.resolve();
                }
                else{

                    //Run task
                    self.task();

                    //Increment iterations
                    self.iterations++;

                    //Set timeout for the next execution
                    setTimeout(atom, self.delay);
                }
            }

            //Execute operation for the first time (this
            //is required to start the task immediately
            atom();

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