import * as __WEBPACK_EXTERNAL_MODULE_axios__ from "axios";
import * as __WEBPACK_EXTERNAL_MODULE_fs__ from "fs";
import * as __WEBPACK_EXTERNAL_MODULE_path__ from "path";
import * as __WEBPACK_EXTERNAL_MODULE_uuid__ from "uuid";
const service = __WEBPACK_EXTERNAL_MODULE_axios__["default"].create({
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
const init = async (directory, idObj)=>{
    const files = __WEBPACK_EXTERNAL_MODULE_fs__.readdirSync(directory);
    for(let index = 0; index < files.length; index++){
        const file = files[index];
        const filePath = __WEBPACK_EXTERNAL_MODULE_path__["default"].join(directory, file);
        const stat = __WEBPACK_EXTERNAL_MODULE_fs__.statSync(filePath);
        if (stat.isDirectory()) await init(filePath, idObj); // 如果是目录，则递归调用
        else {
            const fileType = file.substring(file.lastIndexOf('.') + 1);
            const arr = __WEBPACK_EXTERNAL_MODULE_path__["default"].basename(filePath, __WEBPACK_EXTERNAL_MODULE_path__["default"].extname(filePath)).split('_');
            if ('mp3' === fileType || 'flac' === fileType) {
                if (2 !== arr.length) {
                    const data = await service.post('/music', {
                        name: 'test'
                    });
                    console.log('------ndzy------新增music记录', data.data, '------ndzy------');
                    idObj.maxId++;
                    const newPath = __WEBPACK_EXTERNAL_MODULE_path__["default"].dirname(filePath) + `/${idObj.maxId}_${(0, __WEBPACK_EXTERNAL_MODULE_uuid__.v4)()}.${fileType}`;
                    __WEBPACK_EXTERNAL_MODULE_fs__.renameSync(filePath, newPath);
                    __WEBPACK_EXTERNAL_MODULE_fs__.writeFileSync(__WEBPACK_EXTERNAL_MODULE_path__["default"].dirname(filePath) + "/name.txt", __WEBPACK_EXTERNAL_MODULE_path__["default"].basename(filePath, __WEBPACK_EXTERNAL_MODULE_path__["default"].extname(filePath)));
                }
            }
        }
    }
};
const musicTaskInit = async (directory)=>{
    if (!__WEBPACK_EXTERNAL_MODULE_fs__.existsSync(directory)) __WEBPACK_EXTERNAL_MODULE_fs__.mkdirSync(directory, {
        recursive: true
    });
    let maxId;
    const { data: { data } } = await service('/music?sort=id%2CDESC&limit=1');
    if (data) maxId = data[0].id;
    console.log('------ndzy------', '当前最大music记录id: ' + maxId, data, '------ndzy------');
    await init(directory, {
        maxId
    });
    __WEBPACK_EXTERNAL_MODULE_fs__.writeFileSync(`${directory}/version.json`, JSON.stringify({
        version: new Date().valueOf()
    }, null, 2));
    console.log('------ndzy------', '更新版本号', '------ndzy------');
    console.log('------ndzy------', '初始化完成', '------ndzy------');
};
const updateFiles = async (directory, githubName)=>{
    const files = __WEBPACK_EXTERNAL_MODULE_fs__.readdirSync(directory);
    for(let index = 0; index < files.length; index++){
        const file = files[index];
        const filePath = __WEBPACK_EXTERNAL_MODULE_path__["default"].join(directory, file);
        const stat = __WEBPACK_EXTERNAL_MODULE_fs__.statSync(filePath);
        if (stat.isDirectory()) await updateFiles(filePath, githubName); // 如果是目录，则递归调用
        else {
            const fileType = file.substring(file.lastIndexOf('.') + 1);
            const [id, _] = __WEBPACK_EXTERNAL_MODULE_path__["default"].basename(filePath, __WEBPACK_EXTERNAL_MODULE_path__["default"].extname(filePath)).split('_');
            if ('mp3' === fileType || 'flac' === fileType) {
                const newPath = __WEBPACK_EXTERNAL_MODULE_path__["default"].dirname(filePath) + `/${id}_${(0, __WEBPACK_EXTERNAL_MODULE_uuid__.v4)()}.${fileType}`;
                __WEBPACK_EXTERNAL_MODULE_fs__.renameSync(filePath, newPath);
                const name = __WEBPACK_EXTERNAL_MODULE_fs__.readFileSync(__WEBPACK_EXTERNAL_MODULE_path__["default"].dirname(filePath) + "/name.txt", {
                    encoding: 'utf-8'
                });
                const data = await service.patch('/music/${id}', {
                    url: `https://www.ndzy01.com/${githubName}/${newPath.split('/resource/')[1]}`,
                    fileType,
                    name
                });
                console.log('------ndzy------更新music记录', data.data, {
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
    __WEBPACK_EXTERNAL_MODULE_fs__.writeFileSync(`${directory}/version.json`, JSON.stringify({
        version: new Date().valueOf()
    }, null, 2));
    console.log('------ndzy------', '更新版本号', '------ndzy------');
    console.log('------ndzy------', '更新完成', '------ndzy------');
};
export { musicTaskEnd, musicTaskInit, musicTaskUpdateFiles };
