import dotenv from 'dotenv';

dotenv.config({ silent: true });

export default {
  secret: process.env.AUTH_SECRET,
  aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
};
