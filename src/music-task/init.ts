import * as fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { service } from '../utils';

const init = async (directory: string, idObj: { maxId: number }) => {
  const files = fs.readdirSync(directory);

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await init(filePath, idObj); // 如果是目录，则递归调用
    } else {
      const fileType = file.substring(file.lastIndexOf('.') + 1);
      const arr = path.basename(filePath, path.extname(filePath)).split('_');

      if (fileType === 'mp3' || fileType === 'flac') {
        if (arr.length !== 2) {
          const data = await service.post('/music', { name: 'test' });
          console.log('------ndzy------新增music记录', data.data, '------ndzy------');

          idObj.maxId++;
          const newPath = path.dirname(filePath) + `/${idObj.maxId}_${uuidv4()}.${fileType}`;
          fs.renameSync(filePath, newPath);
          fs.writeFileSync(path.dirname(filePath) + `/name.txt`, path.basename(filePath, path.extname(filePath)));
        }
      }
    }
  }
};

export const musicTaskInit = async (directory: string) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  let maxId;
  const data: any = await service('/music?sort=id%2CDESC&limit=1');
  console.log('------ndzy------', data, '------ndzy------');

  if (data) {
    maxId = data[0].id;
  }

  console.log('------ndzy------', '当前最大music记录id: ' + maxId, data, '------ndzy------');

  await init(directory, { maxId });

  fs.writeFileSync(`${directory}/version.json`, JSON.stringify({ version: new Date().valueOf() }, null, 2));

  console.log('------ndzy------', '更新版本号', '------ndzy------');

  console.log('------ndzy------', '初始化完成', '------ndzy------');
};
