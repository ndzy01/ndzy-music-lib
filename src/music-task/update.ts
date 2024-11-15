import * as fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { service } from '../utils';

const updateFiles = async (directory: string, githubName: string) => {
  const files = fs.readdirSync(directory);

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await updateFiles(filePath, githubName); // 如果是目录，则递归调用
    } else {
      const fileType = file.substring(file.lastIndexOf('.') + 1);
      const [id, _] = path.basename(filePath, path.extname(filePath)).split('_');

      if (fileType === 'mp3' || fileType === 'flac') {
        const newPath = path.dirname(filePath) + `/${id}_${uuidv4()}.${fileType}`;
        fs.renameSync(filePath, newPath);
        const name = fs.readFileSync(path.dirname(filePath) + `/name.txt`, { encoding: 'utf-8' });

        const data = await service.patch('/music/${id}', {
          url: `https://www.ndzy01.com/${githubName}/${newPath.split('/resource/')[1]}`,
          fileType,
          name,
        });
        console.log(
          '------ndzy------更新music记录',
          data.data,
          {
            url: `https://www.ndzy01.com/${githubName}/${newPath.split('/resource/')[1]}`,
            fileType,
            name,
          },
          '------ndzy------',
        );
      }
    }
  }
};

export const musicTaskUpdateFiles = async (directory: string, name: string) => {
  await updateFiles(directory, name);

  fs.writeFileSync(`${directory}/version.json`, JSON.stringify({ version: new Date().valueOf() }, null, 2));

  console.log('------ndzy------', '更新版本号', '------ndzy------');

  console.log('------ndzy------', '更新完成', '------ndzy------');
};
