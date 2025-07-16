import { application } from './app';
import serverless from 'serverless-http';

const handler = serverless(application);

// This ensures compatibility with AWS Lambda's CommonJS expectations
module.exports.handler = handler;
