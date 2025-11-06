const Image = require('../entities/Image');
const Tag = require('../entities/Tag');
const TabPreset = require('../entities/TabPreset');

function seedImages() {
  // 画像を追加する場合は、ここに Image オブジェクトを追加してください
  // 例:
  // new Image({
  //   id: 'unique-id',
  //   url: 'https://example.com/your-image.jpg',  // または /static/image.jpg など
  //   width: 1920,
  //   height: 1080,
  //   createdAt: new Date(),
  //   tags: ['nature', 'featured'],  // タグは複数指定可能
  //   title: '画像タイトル',
  //   description: '画像の説明'
  // })
  
  // Start with empty gallery - use UI to upload images
  return [];
}
function seedTags() {
  return [
    new Tag({ id: 'nature', name: 'Nature', color: '#4caf50' }),
    new Tag({ id: 'featured', name: 'Featured', color: '#ff9800' }),
    new Tag({ id: 'people', name: 'People', color: '#2196f3' })
  ];
}
function seedTabPresets() {
  return [
    new TabPreset({ id: 'all', name: 'All', tagIds: [], logic: 'OR' }),
    new TabPreset({ id: 'natureSet', name: 'Nature + Featured', tagIds: ['nature','featured'], logic: 'AND' }),
    new TabPreset({ id: 'people', name: 'People', tagIds: ['people'], logic: 'OR' })
  ];
}
module.exports = { seedImages, seedTags, seedTabPresets };