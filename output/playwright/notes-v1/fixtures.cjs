const fs = require('node:fs'); const sharp = require('../../../node_modules/sharp');
const image = 'data:image/jpeg;base64,'+fs.readFileSync(__dirname+'/../notes/synthetic-1.jpg').toString('base64');
const page = {id:'00000000-0000-4000-8000-000000000001',name:'synthetic-import.jpg',image,text:'Imported synthetic text.',reviewed:true};
const make = (pages,title='Synthetic imported notes')=>({version:1,title,pages});
const write = (name,notes)=>fs.writeFileSync(__dirname+'/'+name+'.json',JSON.stringify(notes));
write('valid-backup',make([page])); write('empty-id',make([{...page,id:''}])); write('duplicate-id',make([page,page]));
write('fake-jpeg',make([{...page,image:'data:image/jpeg;base64,YWJj'}]));
(async()=>{const large=await sharp({create:{width:1601,height:1,channels:3,background:'#fffdfb'}}).jpeg().toBuffer();write('oversized-jpeg',make([{...page,image:'data:image/jpeg;base64,'+large.toString('base64')}]));const png=await sharp(Buffer.from(image.split(',')[1],'base64')).png().toBuffer();write('disguised-png',make([{...page,image:'data:image/jpeg;base64,'+png.toString('base64')}]));})();
