const ipc = require('electron').ipcRenderer
const storage = require('electron-json-storage')

const selectDirBtn = document.getElementById('select-grid-import')

selectDirBtn.addEventListener('click', function (event) {
  ipc.send('open-grid-import-dialog')
})

ipc.on('selected-grid-import-directory', function (event, path) {
  document.getElementById('selected-grid-import-file').innerHTML = `You selected: ${path}`
})

ipc.on('display-grid-import-directory', function(event, grids_list) {

    var display = document.getElementById('displayed-grid-import-file');
    var content = "<p>您导入了如下" + grids_list.length + "期的数据：</p><p>";
    for (let i = 0; i < grids_list.length; i++) {
        content += grids_list[i] + " ";
    }
    content += "</p>";
    display.innerHTML = content;

})

