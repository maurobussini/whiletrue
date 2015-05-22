whiletrue
======

Start/stop/pause/repeat: task runner in Javascript

## Usage

#### Given the following iteration condition...

```javascript
//Condition: iterate 10 times
function condition(state){
    return state.iterations < 10;
}
```

#### and the following task to run, over and over...

```javascript
//Task: do some work, then invoke "done"
function longTask(done, state){

    //Do some stuff here...
    console.log("Doing some stuff...");
    
    //Argument "state" => ex: { 
    //  iterations: 5,  //Current iteration number 
    //  delay: 10       //Delay (in ms) between iterations
    //}

    setTimeout(function(){

        //Task completed: remember to invoke ALWAYS "done"
        console.log("Task completed!");
        done();

    }, 1000);
}
```

#### just setup the "whiletrue" runner (with 10 millisecond of delay between each iterations)...

```javascript
//Setup: Create a "whiletrue" runner with 10 ms delay
var runner = whiletrue(condition, longTask, 10);
```

#### start the execution and handle the promise of "job completed"...

```javascript
//Start execution
runner.run()
    .then(function(){
        console.log("Job completed");
    });
```