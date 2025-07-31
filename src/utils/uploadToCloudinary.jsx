import axios from 'axios';

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'socialMediaApp'); 
  formData.append('cloud_name', 'dx1libiis');

  try {
    const res = await axios.post('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', formData);
    return res.data.secure_url;
  } catch (err) {
    console.error('Cloudinary Upload Error:', err);
    return null;
  }
};

export default uploadToCloudinary;
