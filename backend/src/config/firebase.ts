import * as admin from "firebase-admin";
import path from "path";

const serviceAccount = require(path.join(
  __dirname,
  "../../serviceAccountKey.json"
));

const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return admin;
};

export const firebaseAdmin = initializeFirebaseAdmin();
