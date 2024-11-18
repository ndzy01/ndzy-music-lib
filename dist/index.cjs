"use strict";
// The require scope
var __webpack_require__ = {};
/************************************************************************/ // webpack/runtime/compat_get_default_export
(()=>{
    // getDefaultExport function for compatibility with non-ESM modules
    __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ? function() {
            return module['default'];
        } : function() {
            return module;
        };
        __webpack_require__.d(getter, {
            a: getter
        });
        return getter;
    };
})();
// webpack/runtime/define_property_getters
(()=>{
    __webpack_require__.d = function(exports1, definition) {
        for(var key in definition)if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports1, key)) Object.defineProperty(exports1, key, {
            enumerable: true,
            get: definition[key]
        });
    };
})();
// webpack/runtime/has_own_property
(()=>{
    __webpack_require__.o = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };
})();
// webpack/runtime/make_namespace_object
(()=>{
    // define __esModule on exports
    __webpack_require__.r = function(exports1) {
        if ('undefined' != typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports1, Symbol.toStringTag, {
            value: 'Module'
        });
        Object.defineProperty(exports1, '__esModule', {
            value: true
        });
    };
})();
/************************************************************************/ var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);
// EXPORTS
__webpack_require__.d(__webpack_exports__, {
    musicTaskEnd: ()=>/* reexport */ musicTaskEnd,
    musicTaskInit: ()=>/* reexport */ musicTaskInit,
    musicTaskUpdateFiles: ()=>/* reexport */ musicTaskUpdateFiles
});
const external_axios_namespaceObject = require("axios");
var external_axios_default = /*#__PURE__*/ __webpack_require__.n(external_axios_namespaceObject);
const service = external_axios_default().create({
    baseURL: 'https://ndzy-s.vercel.app',
    timeout: 60000,
    withCredentials: false
});
service.interceptors.request.use((config)=>config, (error)=>{
    Promise.reject(error).then();
});
service.interceptors.response.use((response)=>response.data, (error)=>{
//
});
const musicTaskEnd = async ()=>{
    try {
        await service('/music/update/github/data');
        console.log('------ndzy------', '完成', '------ndzy------');
    } catch (error) {
        console.log('------ndzy------', '出错了', '------ndzy------');
    }
};
const external_fs_namespaceObject = require("fs");
const external_path_namespaceObject = require("path");
var external_path_default = /*#__PURE__*/ __webpack_require__.n(external_path_namespaceObject);
const external_uuid_namespaceObject = require("uuid");
const init = async (directory, idObj)=>{
    const files = external_fs_namespaceObject.readdirSync(directory);
    for(let index = 0; index < files.length; index++){
        const file = files[index];
        const filePath = external_path_default().join(directory, file);
        const stat = external_fs_namespaceObject.statSync(filePath);
        if (stat.isDirectory()) await init(filePath, idObj); // 如果是目录，则递归调用
        else {
            const fileType = file.substring(file.lastIndexOf('.') + 1);
            const arr = external_path_default().basename(filePath, external_path_default().extname(filePath)).split('_');
            if ('mp3' === fileType || 'flac' === fileType) {
                if (2 !== arr.length) {
                    const data = await service.post('/music', {
                        name: 'test'
                    });
                    console.log('------ndzy------新增music记录', data.data, '------ndzy------');
                    idObj.maxId++;
                    const newPath = external_path_default().dirname(filePath) + `/${idObj.maxId}_${(0, external_uuid_namespaceObject.v4)()}.${fileType}`;
                    external_fs_namespaceObject.renameSync(filePath, newPath);
                    external_fs_namespaceObject.writeFileSync(external_path_default().dirname(filePath) + "/name.txt", external_path_default().basename(filePath, external_path_default().extname(filePath)));
                }
            }
        }
    }
};
const musicTaskInit = async (directory)=>{
    if (!external_fs_namespaceObject.existsSync(directory)) external_fs_namespaceObject.mkdirSync(directory, {
        recursive: true
    });
    let maxId;
    const { data } = await service('/music?sort=id%2CDESC&limit=1');
    if (data) maxId = data[0].id;
    console.log('------ndzy------', '当前最大music记录id: ' + maxId, data, '------ndzy------');
    await init(directory, {
        maxId
    });
    external_fs_namespaceObject.writeFileSync(`${directory}/version.json`, JSON.stringify({
        version: new Date().valueOf()
    }, null, 2));
    console.log('------ndzy------', '更新版本号', '------ndzy------');
    console.log('------ndzy------', '初始化完成', '------ndzy------');
};
const updateFiles = async (directory, githubName)=>{
    const files = external_fs_namespaceObject.readdirSync(directory);
    for(let index = 0; index < files.length; index++){
        const file = files[index];
        const filePath = external_path_default().join(directory, file);
        const stat = external_fs_namespaceObject.statSync(filePath);
        if (stat.isDirectory()) await updateFiles(filePath, githubName); // 如果是目录，则递归调用
        else {
            const fileType = file.substring(file.lastIndexOf('.') + 1);
            const [id, _] = external_path_default().basename(filePath, external_path_default().extname(filePath)).split('_');
            if ('mp3' === fileType || 'flac' === fileType) {
                const newPath = external_path_default().dirname(filePath) + `/${id}_${(0, external_uuid_namespaceObject.v4)()}.${fileType}`;
                external_fs_namespaceObject.renameSync(filePath, newPath);
                const name = external_fs_namespaceObject.readFileSync(external_path_default().dirname(filePath) + "/name.txt", {
                    encoding: 'utf-8'
                });
                const data = await service.patch('/music/${id}', {
                    url: `https://www.ndzy01.com/${githubName}/${newPath.split('/resource/')[1]}`,
                    fileType,
                    name
                });
                console.log('------ndzy------更新music记录', data, data.data, {
                    url: `https://www.ndzy01.com/${githubName}/${newPath.split('/resource/')[1]}`,
                    fileType,
                    name
                }, '------ndzy------');
            }
        }
    }
};
const musicTaskUpdateFiles = async (directory, name)=>{
    await updateFiles(directory, name);
    external_fs_namespaceObject.writeFileSync(`${directory}/version.json`, JSON.stringify({
        version: new Date().valueOf()
    }, null, 2));
    console.log('------ndzy------', '更新版本号', '------ndzy------');
    console.log('------ndzy------', '更新完成', '------ndzy------');
};
var __webpack_export_target__ = exports;
for(var i in __webpack_exports__)__webpack_export_target__[i] = __webpack_exports__[i];
if (__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, '__esModule', {
    value: true
});
