const path = require('path')
const dayjs = require('dayjs')
const util = require('util')
const events = require('events')
const Client = require('ssh2').Client
const fs = require('fs')
const ProgressBar = require('progress');
const inquirer = require('inquirer')

// host port username password
const server = require('./ssh-config')

const basePath = '/www/wwwroot/'     // 服务器网站根目录
let baseDir = 'dist'            // 项目目录名称
let back_up_dir = 'back_up' // 备份目录名称,需手动在服务器创建，可选,注意目录名后有斜杠  比如  back_up/
const bakDirName = baseDir + '.bak' + dayjs().format('YYYY-M-D-HH:mm:ss') // 备份文件名
const buildPath = path.resolve('./dist') // 本地项目编译后的文件目录

function doConnect(server, then) { //连接服务器
  const conn = new Client()
  conn.on('ready', function () {
    then && then(conn)
  }).on('error', function (err) {
    console.error('connect error!', err)
  }).on('close', function () {
    conn.end()
  }).connect(server)
}

function doShell(server, cmd, then) { //执行远程命令
  doConnect(server, function (conn) {
    conn.shell(function (err, stream) {
      if (err) throw err
      else {
        let buf = ''
        stream.on('close', function () {
          conn.end()
          then && then(err, buf)
        }).on('data', function (data) {
          buf = buf + data
        }).stderr.on('data', function (data) {
          console.log('stderr: ' + data)
        })
        stream.end(cmd)
      }
    })
  })
}

function doGetFileAndDirList(localDir, dirs, files) { //递归获取所以文件目录
  const dir = fs.readdirSync(localDir)
  for (let i = 0; i < dir.length; i++) {
    const p = path.join(localDir, dir[i])
    const stat = fs.statSync(p)
    if (stat.isDirectory()) {
      dirs.push(p)
      doGetFileAndDirList(p, dirs, files)
    }
    else {
      files.push(p)
    }
  }
}

function Control() {
  events.EventEmitter.call(this)
}

util.inherits(Control, events.EventEmitter)

const control = new Control()

control.on('doNext', function (todos, then) {
  if (todos.length > 0) {
    const func = todos.shift()
    func(function (err) {
      if (err) {
        then(err)
        throw err
      }
      else {
        control.emit('doNext', todos, then)
      }
    })
  }
  else {
    then(null)
  }
})

function doUploadFile(server, localPath, remotePath, then) { //上传文件
  doConnect(server, function (conn) {
    conn.sftp(function (err, sftp) {
      if (err) {
        then(err)
      }
      else {
        sftp.fastPut(localPath, remotePath, function (err, result) {
          conn.end()
          then(err, result)
        })
      }
    })
  })
}

function doUploadDir(server, localDir, remoteDir, then) {
  let dirs = []
  let files = []
  doGetFileAndDirList(localDir, dirs, files)

  // 创建远程目录
  console.log('开始创建远程目录')
  let todoDir = []
  dirs.forEach(function (dir) {
    todoDir.push(function (done) {
      const to = path.join(remoteDir, dir.slice(localDir.length + 1)).replace(/[\\]/g, '/')
      const cmd = 'mkdir -p ' + to + '\r\nexit\r\n'
      // console.log(`cmd::${cmd}`)
      doShell(server, cmd, done)
    })// end of push
  })

  // 上传文件
  console.log('准备上传文件:')
  let todoFile = []
  let total = files.length;
  let bar = new ProgressBar('上传进度：[:bar] :percent   剩余时长::etas', { total, width: 50 });
  files.forEach(function (file) {
    todoFile.push(function (done) {
      const to = path.join(remoteDir, file.slice(localDir.length + 1)).replace(/[\\]/g, '/')
      // console.log('upload ' + to)
      bar.tick(1);
      doUploadFile(server, file, to, done)
    })
  })
  control.emit('doNext', todoDir, function (err) {
    if (err) {
      throw err
    }
    else {
      control.emit('doNext', todoFile, then)
    }
  })
}


let mutual = {
  chooseDir (err, dirList) {
    if (err) {
      console.log(err)
      return false
    }
    dirList.push('我要新建目录')
    const promptList = [
      {
        type: 'list',
        message: '请选择要上传到的项目目录:',
        name: 'dir',
        choices: dirList,
      }
    ];

    inquirer.prompt(promptList).then(answers => {

      if (answers.dir === '我要新建目录') {
        mutual.mkNewDir()
        return false
      } else if (answers.dir.includes(basePath)) {
        baseDir = basePath
      }
      else {
        baseDir = answers.dir
      }
      init()

    }).catch(err => {
      console.log(err)
    })
  },
  mkNewDir () {
    const promptList = [
      {
        type: 'input',
        message: '请输入要创建的目录名称:',
        name: 'dir',

      }
    ];

    inquirer.prompt(promptList).then(answers => {
      if (!answers.dir) {
        console.error('警告：文件名不能为空')
        return false
      }
      baseDir = answers.dir
      init()
    })
  }

}
/**
* 描述：获取远程文件路径下文件列表信息
* 参数：server 远程电脑凭证；
*		remotePath 远程路径；
*		isFile 是否是获取文件，true获取文件信息，false获取目录信息；
*		then 回调函数
* 回调：then(err, dirs) ： dir, 获取的列表信息
*/
function getFileOrDirList(server, remotePath, isFile, then) {
  const cmd = "find " + remotePath + " -type " + (isFile == true ? "f" : "d") + "\r\nexit\r\n";
  doShell(server, cmd, function (err, data) {
    const remoteFile = ['dist'];
    then(err, remoteFile);
  })
};


function init() {
  console.log('\n--------配置如下--------------\n')
  console.log(`服务器host:            ${server.host}`)
  console.log(`项目文件夹:            ${baseDir}`)
  console.log(`项目部署以及备份目录:  ${basePath}`)
  console.log(`备份后的文件夹名:      ${bakDirName}`)
  console.log('\n--------开始部署--------------\n')
  doShell(server, `mv ${basePath}/${baseDir} ${basePath}/${back_up_dir}${bakDirName}\nexit\n`) //备份远程目录文件
  doUploadDir(server, buildPath, `${basePath}/${baseDir}`, () => console.log('\n--------部署成功--------------'))
}

getFileOrDirList(server, basePath, false, mutual.chooseDir)
