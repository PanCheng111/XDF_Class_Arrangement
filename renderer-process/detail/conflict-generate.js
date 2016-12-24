const ipc = require('electron').ipcRenderer
const storage = require('electron-json-storage');

const selectDirBtn = document.getElementById('select-conflict-generate')

selectDirBtn.addEventListener('click', function (event) {
  ipc.send('open-conflict-generate-dialog')
})

ipc.on('selected-conflict-generate-directory', function (event, path) {
  document.getElementById('selected-conflict-generate-file').innerHTML = `文件保存路径: ${path}`
})

