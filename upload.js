let COS = require('cos-nodejs-sdk-v5')

const fs = require('fs');
const path = require('path')

const delList = []


const Region = 'ap-shanghai'

const SECRET_ID = 'AKIDPdbJknb7NM3TdV6QUGp78sLXS7UaOwDC'
const SECRET_KEY = 'jBMGsDI6dtsb3E8m9F4cttc4Fp9CyThe'
let client = new COS({
  SecretId: SECRET_ID,
  SecretKey: SECRET_KEY,
});

const bucket = 'blog-1307709117'
//判断当前字符串是否以str结束
if (typeof String.prototype.endsWith !== 'function') {
  String.prototype.endsWith = function (str) {
    return this.slice(-str.length) == str;
  };
}

/* 上传 */
function multipartUpload(src, _dist) {
  client.putObject({
    Bucket: bucket,
    Region: Region,
    Key: _dist,
    StorageClass: 'STANDARD',
    Body: fs.createReadStream(src), // 上传文件对象
    onProgress: function (progressData) {
      console.log(JSON.stringify(progressData));
    }
  }, function (err, data) {
    console.log('上传完成')
    console.log(err || data);
  });
}

/* 批量删除 */
async function deleteMulti(dist, src, objList) {
  console.log('删除数量：', objList.length)
  if (objList.length === 0) {
    addFiles(src, dist)
    return
  }
  // 删除
  client.deleteMultipleObject({
    Bucket: bucket,
    Region: Region,
    Objects: delList
  }, function (err, data) {
    console.log(err || data);
    addFiles(src, dist)
    objList = []
  });


}

/* 获取要添加的文件 */
async function addFiles(src, dist) {
  var docs = fs.readdirSync(src);
  docs.forEach(function (doc) {
    var _src = src + '/' + doc,
      _dist = dist + '/' + doc;
    var st = fs.statSync(_src);
    // 判断是否为文件
    if (st.isFile() && doc !== '.DS_Store') {
      if (_src.endsWith('.js')
        || _src.endsWith('.css')
        || _src.endsWith('.ttf')
        || _src.endsWith('.wof')
        || _src.endsWith('.png')
        || _src.endsWith('.ico')
        || _src.endsWith('.html')) {
        multipartUpload(_src, _dist)
      }
      console.log(_src + '是文件', _dist)
    }
    // 若是是目录则递归调用自身
    else if (st.isDirectory()) {
      // console.log(_src+'是文件夹')
      addFiles(_src, _dist);
    }
  })
}



/* 查询全部的资源 */
function listDir(dist, src, nextMarker) {
  client.getBucket({
    Bucket: bucket,
    Region: Region,
    Prefix: dist,
    Marker: nextMarker //起始对象键标记
  }, function (err, data) {
    console.log(err || data);
    if (data && data.Contents.length > 0) {
      data.Contents.forEach(function (obj) {
        console.log('Object: %s', obj.Key);
        delList.push({
          Key: obj.Key
        })
      });

      if (data.IsTruncated === 'true') { // 是否有更多
        console.log('-------更多数据-------', data.NextMarker)
        listDir(dist, src, data.NextMarker)
      } else {
        deleteMulti(dist, src, delList)
      }
    } else {
      addFiles(src, dist)
    }
  });

}

function uploadOSS(src, dist) {
  // 全部的
  listDir(dist, src)
}
const local = path.join(__dirname, "./dist");
uploadOSS(local,'')
module.exports = uploadOSS
