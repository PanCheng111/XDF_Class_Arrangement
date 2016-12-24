const ipc = require('electron').ipcRenderer
const storage = require('electron-json-storage');

const selectDirBtn = document.getElementById('select-detail-generate')

selectDirBtn.addEventListener('click', function (event) {
  ipc.send('open-detail-generate-dialog')
})

ipc.on('selected-detail-generate-directory', function (event, path) {
  document.getElementById('selected-detail-generate-file').innerHTML = `文件保存路径: ${path}`
})

