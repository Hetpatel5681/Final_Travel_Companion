const dotenv = require('dotenv');
const result = dotenv.config();
console.log('CWD:', process.cwd());
console.log('Parsed:', result.parsed);
console.log('API Key Present:', Boolean(process.env.OPENAI_API_KEY));
