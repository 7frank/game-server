/*
TODO test out some code gen with decorators that can be used for easier server/client models

const isServer = process && process.env
const BUSBUS:any={}


function Client(target, name, descriptor) {
    console.log(target);     // im Beispiel: Calculator {}
    console.log(name);       // im Beispiel: calculateSum
    console.log(descriptor); // im Beispiel: Object {value: function,  enumerable: false, configurable: true, writable: true}

    // const fn= target[name]


    if (!isServer)
        Object.defineProperty(target, name, {
            get:  ()=> {
               return function(...args)
               {
                return  BUSBUS.send("incData",this.uuid,args)
               }
            }
        })

}

function Server(target, name, descriptor) {
    console.log(target);     // im Beispiel: Calculator {}
    console.log(name);       // im Beispiel: calculateSum
    console.log(descriptor); // im Beispiel: Object {value: function,  enumerable: false, configurable: true, writable: true}

    // 
    //  const fn= target[name]

    if (isServer)
        Object.defineProperty(target, name, {
            set: function () {
                console.log()

            }
        })


}



class Model {
    @Server  //this part would be not accessible on the server directly
    //@hidden
    data = 1;

    @Server  //this part would be not accessible on the server directly
   // @visible
    clientReadablePosition = new THREE.Vector3

    @Client
    incData() {
        this.data++
    }


}
// code gen would create meta code with an eventbus/buffer structure that only sends data in intervals or batches of certain size
// incData(data) => bus.send("incData",this.uuid,data)
// on client
// new Model().data=123  //data is ignored

*/
