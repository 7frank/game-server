var parseHTML = require('parsehtml');
export function createRegion(color = "#7BC8A4") {
    //const tpl = `<a-box position="0 1 0"  width="10.5" height="1" depth="10.5" color="green" custom-shadow></a-box>`
    const tpl = `<a-entity class="region"></a-entity> `;
    const el = parseHTML(tpl);
    return el;
}


export 
function createEntity() {

    // Create a Cube Mesh with basic material
    /*var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshStandardMaterial({ color: "#433F81",transparent:true, opacity:0.5 });
    var cube = new THREE.Mesh(geometry, material);
    return cube
*/

    const el = parseHTML(`<a-box  color="#433F81" shadow="cast: true;receive: true"></a-box>`)

    return el
}

export 
function createEntityFromData(data) {

    const el = parseHTML(`<a-entity></a-entity>`)
    const dataEl = parseHTML(data)
    el.append(dataEl)

    return el
}

export 
function createEntityHTML(selector = "#steve", text = "Hello",PLAYER_SIZE=1.8) {

    var htmlSnippet = `<a-entity  position="0 ${-PLAYER_SIZE} 0">
    
    <a-text position="0 2.5 0" scale="3 3 3" color="black" align='center' value=" ${text}"></a-text>
    <a-entity id="local-player-model" gltf-model="${selector}" shadow="cast: true;receive: true"></a-entity>
    </a-entity>`,
        html = parseHTML(htmlSnippet);

    return html

}



