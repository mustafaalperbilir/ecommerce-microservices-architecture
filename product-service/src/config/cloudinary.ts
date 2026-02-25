import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Dashboard'dan aldığın bilgileri buraya ekle
cloudinary.config({
  cloud_name: 'djctra7eh',
  api_key: '529423424784763',
  api_secret: 'TiHKkqfanZTcpPEhTiWtbIkDt3A'
});

export default cloudinary;