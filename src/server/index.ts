/*
 * embed webpack-dev-server
 */
let webpack, webpackDevMiddleware, webpackHotMiddleware, webpackConfig;
if (process.env.NODE_ENV !== "production") {
    webpack = require("webpack");
    webpackDevMiddleware = require("webpack-dev-middleware");
    webpackConfig = require("../../webpack.config");
    webpackHotMiddleware = require("webpack-hot-middleware");
}
  
import * as colyseus from "colyseus";
import * as http from "http";
import * as express from "express";
import * as path from "path";
import * as basicAuth from "express-basic-auth";
import { monitor } from "@colyseus/monitor";

import { ContainerRoom } from "./rooms/physics/ContainerRoom";
import { PhysicsContainerState } from "./rooms/region/ContainerState";


export const port = Number(process.env.PORT || 8080);
export const endpoint = "localhost";

export let STATIC_DIR: string;

const app = express();
const gameServer = new colyseus.Server({ server: http.createServer(app) });


// TODO we'll need a broker that connects actual rooms and regions with each other
// this way we can have multiple stateless node instances have run in parallel (maybe spawning rooms on demand) instead of one monolith


/*
gameServer.register("world-server-1", AFramePhysicsRoom, {
    position: { x: 0, y: 0, z: 0 },
    boundingBox: {
        min: { x: -5000, y: 0, z: -5000 },
        max: { x: 5000, y: 10, z: 5000 }
    },
    data: `<a-box  width="10000" height="0.01" depth="10000" color="white" shadow></a-box> `
});
*/


gameServer.register("aframe-region-1", ContainerRoom, {
    boxCount: 50,
    position: { x: 0, y: 0, z: 0 },
    boundingBox: {
        min: { x: -5, y: 0, z: -5 },
        max: { x: 5, y: 10, z: 5 }
    },
    data: `<a-box  width="10.5" height="0.1" depth="10.5" color="433F81" shadow></a-box> `
});
gameServer.register("aframe-region-2", ContainerRoom, {
    boxCount: 5,
    position: { x: 20, y: 0, z: 0 },
    boundingBox: {
        min: { x: -5, y: 0, z: -5 },
        max: { x: 5, y: 10, z: 5 }
    },
    data: `<a-box  width="10.5" height="0.1" depth="10.5" color="green" shadow></a-box> `
});



// TODO add regions to world at position x

  

if (process.env.NODE_ENV !== "production") {
    const webpackCompiler = webpack(webpackConfig({}));
    app.use(webpackDevMiddleware(webpackCompiler, {}));
    app.use(webpackHotMiddleware(webpackCompiler));

    // on development, use "../../" as static root
    STATIC_DIR = path.resolve(__dirname, "..", "..");

} else {
    // on production, use ./public as static root
    STATIC_DIR = path.resolve(__dirname, "public");
}
console.log("STATIC_DIR", STATIC_DIR)
app.use("/", express.static(STATIC_DIR));


// add colyseus monitor
const auth = basicAuth({ users: { 'admin': 'admin' }, challenge: true });
app.use("/colyseus", auth, monitor(gameServer));

gameServer.listen(port);
console.log(`Listening on http://${endpoint}:${port}`);
