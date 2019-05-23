# test serverside physics with omio
* https://github.com/lo-th/Oimo.js/
* note omio itself has a nodejs incompatible version but who knows maybe there will be a compatible one
* needs to implement worker by hand 
    * worker_threads since node 10.5
    * https://blog.logrocket.com/node-js-multithreading-what-are-worker-threads-and-why-do-they-matter-48ab102f8b10

* whitestorm js and goblinphysics might also be options    

# ai-behaviour
* https://medium.com/ironequal/pathfinding-like-a-king-part-1-3013ea2c099
    * article contains different approaches 
* steering-behaviour
* navmesh
* raycasting for local 


# feature-steering-physics-astar

* the goal of the feature branch is to merge several movement related components to work together
    * steering 
    * physics
    * pathfinding with astar
        * nav-mesh


```typescript
export
    class Actor extends SerializableEntity {

    constructor() {
        super()
        this.putComponent(GenericBody)
            // position 
            // rotation
            // direction
            // velocity

        this.putComponent(Physics)
        this.putComponent(Pathfinding)
        this.putComponent(Steering)  // active, entity is steering in direction or following path
    }
}
```
