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

	//initializations
	describe("run", function () {
		
		it("Should iterate 10 times", function (done) {

            //Create a new whiletrue runner
			var runner = whiletrue(runningCondition, someTaskToRunMoreThanOnce, 1000);

            //Start execution
            runner.run()
                .then(function(){

                    //Assert test
                    expect(times.length).toEqual(10);
                    expecy(runner.iterations).toEqual(10);

                }).
                finally(done);
		});
	});

});