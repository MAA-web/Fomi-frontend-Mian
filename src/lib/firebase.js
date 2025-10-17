import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD30aonqxxZmEGT4wp6wF6plSERSnxn63A",
  authDomain: "ai-project-auth.firebaseapp.com",
  clientId: "404242243323-ttm8scm22ed049cvelrp4hl2iua8a210.apps.googleusercontent.com",
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { auth };
export default app;
