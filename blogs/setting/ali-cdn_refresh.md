---
title: 阿里云cdn刷新脚本
date: 2021-12-27
tags:
 - 配置
categories:
 - 配置
---

## 阿里云cdn刷新预热脚本

基于python2.7.16，mac自带



### 安装流程

安装pip

```shell
curl https://bootstrap.pypa.io/pip/2.7/get-pip.py -o get-pip.py
sudo python get-pip.py
```

执行以下命令判断pip是否安装成功

```shell
pip --version
```

pip安装成功后安装以下包

```shell
pip install aliyun-python-sdk-cdn 

pip install aliyun-python-sdk-core
```



### Refresh.py脚本

```python
#!/usr/bin/env python
# coding=utf-8

'''Check Package'''
try:
    import os
    import sys
    import getopt
    import time
    import json
    from aliyunsdkcore.client import AcsClient
    from aliyunsdkcore.acs_exception.exceptions import ClientException
    from aliyunsdkcore.acs_exception.exceptions import ServerException
    from aliyunsdkcdn.request.v20180510.RefreshObjectCachesRequest import RefreshObjectCachesRequest
    from aliyunsdkcdn.request.v20180510.PushObjectCacheRequest import PushObjectCacheRequest
    from aliyunsdkcdn.request.v20180510.DescribeRefreshTasksRequest import DescribeRefreshTasksRequest
    from aliyunsdkcdn.request.v20180510.DescribeRefreshQuotaRequest import DescribeRefreshQuotaRequest
except:
    sys.exit("[Error] Please pip install aliyun-python-sdk-cdn and aliyun-java-sdk-core ，please install now......")


class Refresh(object):
    '''init func'''

    def __init__(self):

        self.lists = []
        self.param = {}

    def main(self, argv):
        if len(argv) < 1:
            sys.exit("\nusage: " + sys.argv[0] + " -h ")
        try:
            opts, args = getopt.getopt(argv, "hi:k:n:r:t:a:o:")
        except Exception as e:
            sys.exit("\nusage: " + sys.argv[0] + " -h ")

        for opt, arg in opts:
            if opt == '-h':
                self.helps()
                sys.exit()
            elif opt == '-i':
                self.param['-i'] = arg
            elif opt == '-k':
                self.param['-k'] = arg
            elif opt == '-r':
                self.param['-r'] = arg
            elif opt == '-t':
                self.param['-t'] = arg
            elif opt == '-a':
                self.param['-a'] = arg
            elif opt == '-o':
                self.param['-o'] = arg
            elif opt == '-n':
                self.param['-n'] = arg
            else:
                sys.exit("\nusage: " + sys.argv[0] + " -h ")

        resP = self.doCheck(self.param)
        if not isinstance(resP, bool):
            sys.exit(resP)

        try:
            client = AcsClient(
                self.param['-i'], self.param['-k'], 'cn-hangzhou')
        except NameError:
            sys.exit("[Error]: SDK module not detected")

        for g in self.doProd(self.param):
            self.lists = []
            self.doRefresh(''.join(g), self.param['-t'], client)

    def doCheck(self, param):

        try:
            for key1 in ('-i', '-k', '-r', '-t'):
                if not key1 in param.keys():
                    return "[Error]: {0} Must be by parameter".format(key1)

            try:
                if not param.has_key('-n'):
                    self.param['-n'] = 50
                if not (abs(int(param['-n'])) <= 100 and abs(int(param['-n'])) > 0):
                    return "[Error]: 0 < -n <= 100"
                else:
                    self.param['-n'] = int(param['-n'])
            except ValueError as e:
                return "[Error]: -n Must be int Type ,{0}".format(str(e))

            if not param['-t'] in ("push", "clear"):
                return "[Error]: taskType Error"
            if param.has_key('-a') and param.has_key('-o'):
                return "[Error]: -a and -o cannot exist at same time"

            if param.has_key('-a'):
                if not param['-a'] in ("domestic", "overseas"):
                    return "[Error]: Area value Error"
                if param['-t'] == 'clear':
                    return "[Error]: -t must be push and 'clear' -o use together"

            if param.has_key('-o'):
                if not param['-o'] in ("File", "Directory"):
                    return "[Error]: ObjectType value Error"
                if param['-t'] == 'push':
                    return "[Error]: -t must be clear and 'push' -a use together"

        except KeyError as e:
            return "[Error]: Parameter {0} error".format(str(e))
        return True

    def doProd(self, params):
        gop = params['-n']
        mins = 1
        maxs = 7

        with open(params['-r'], "r") as f:
            for line in f.readlines():
                if mins != maxs:
                    line = line.strip("\n") + "\n"
                else:
                    line = line.strip("\n")
                self.lists.append(line)
                if mins >= maxs:
                    yield self.lists
                    mins = maxs
                    maxs = gop + maxs - 1
                else:
                    mins += 1
            if len(self.lists) > 0:
                yield self.lists

    def doRefresh(self, lists, types, client):
        try:
            if types == 'clear':
                taskID = 'RefreshTaskId'
                request = RefreshObjectCachesRequest()
                if self.param.has_key('-o'):
                    request.set_ObjectType(self.param['-o'])
            elif types == 'push':
                taskID = 'PushTaskId'
                request = PushObjectCacheRequest()
                if self.param.has_key('-a'):
                    request.set_Area(self.param['-a'])

            taskreq = DescribeRefreshTasksRequest()
            request.set_accept_format('json')
            request.set_ObjectPath(lists)
            response = json.loads(client.do_action_with_exception(request))
            print(response)

            while True:
                count = 0
                taskreq.set_accept_format('json')
                print('------')
                print(type(response[taskID]))
                print('------')
                taskreq.set_TaskId(int(response[taskID]))
                taskresp = json.loads(client.do_action_with_exception(taskreq))
                print("[" + response[taskID] + "]" + "is doing... ...")
                for t in taskresp['Tasks']['CDNTask']:
                    if t['Status'] != 'Complete':
                        count += 1
                if count == 0:
                    break
                else:
                    continue
                time.sleep(5)
        except Exception as e:
            sys.exit("[Error]" + str(e))
    def helps(self):
        print("\nscript options explain: \
            \n\t -i <AccessKey>                  访问阿里云凭证，访问控制台上可以获得； \
            \n\t -k <AccessKeySecret>            访问阿里云密钥，访问控制台上可以获得； \
            \n\t -r <filename>                   文件名称，每行一条 URL，有特殊字符先做 URLencode，以 http/https 开头； \
            \n\t -t <taskType>                   任务类型 clear 刷新，push 预热； \
            \n\t -n [int,[..100]]                可选项，每次操作文件数量，做多 100 条； \
            \n\t -a [String,<domestic|overseas>  可选项，预热范围，不传是默认是全球；\
            \n\t    domestic                     仅中国大陆； \
            \n\t    overseas                     全球（不包含中国大陆）； \
            \n\t -o [String,<File|Directory>]    可选项，刷新的类型； \
            \n\t    File                         文件刷新（默认值）； \
            \n\t    Directory                    目录刷新")


# TODO 入口

if __name__ == '__main__':
    fun = Refresh()
    fun.main(sys.argv[1:])

```



### 创建cdn.lst文件

目标目录

```
https://dongchamao.com/
```



### 创建oss.sh及refresh.sh

```sh
# oss.sh
#!/bin/bash 
AccessKey='*****************';

AccessKeySecret='*****************';

# clear | push
action="clear"  
```

```sh
# refresh.sh
 #!/bin/bash\
. ./oss.sh

echo "开始执行cdn预热刷新"
python ./Refresh.py -i $AccessKey -k $AccessKeySecret -r ./cdn.lst -t $action
echo "刷新完成"
```



### package.json

```json
{
  "name": "cdn-refresh",
  "scripts": {
    "refresh": "bash ./refresh.sh",
  }
}
```

执行npm run refresh即可完成cdn刷新
