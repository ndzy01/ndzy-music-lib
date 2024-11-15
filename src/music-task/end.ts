import { service } from '../utils';

export const musicTaskEnd = async () => {
  try {
    await service('/music/update/github/data');
    console.log('------ndzy------', '完成', '------ndzy------');
  } catch (error) {
    console.log('------ndzy------', '出错了', '------ndzy------');
  }
};
