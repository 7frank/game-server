#!/usr/bin/env node

const convert = require('fbx2gltf');
const mini = require('minimist')
var glob = require("glob")

const fs = require('fs')

function checkFileExists(filepath) {
    return new Promise((resolve, reject) => {
        fs.access(filepath, fs.F_OK, error => {
            if (!error)
                resolve()
            else
                reject(error)
        });
    });
}

console.log('Welcome to FXB2GLFT cli tool');


var argv = mini(process.argv.slice(2));

if (argv._.length == 1) argv._.push(argv._[0].split('.').slice(0, -1).join('.') + ".glb")
console.log("convert =>", argv._[0], argv._[1])

glob(argv._[0], {}, function (err, files) {
    // files is an array of filenames.
    // If the `nonull` option is set, and nothing
    // was found, then files is ["**/*.js"]
    // er is an error object or null.
    console.log(files)


    files.forEach(inputFile => {
        const outputFile = inputFile.split('.').slice(0, -1).join('.') + ".glb"
        checkFileExists(outputFile)
            .then(() => console.log('does already exist:', outputFile))
            .catch(() => {

                convert(inputFile, outputFile, []).then(
                    destPath => {
                        console.log("converted to", destPath)
                        // yay, do what we will with our shiny new GLB file!
                    },
                    error => {
                        console.error(error.message)
                        // ack, conversion failed: inspect 'error' for details
                    }
                );


            })

    });


});

