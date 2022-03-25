declare global {
  namespace NodeJS {
    interface ProcessEnv {
      __JSON_UPLOAD_SECRET: string;
    }
  }
}

export {};
