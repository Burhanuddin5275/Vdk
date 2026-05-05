import { getFirestore, doc, getDoc } from "firebase/firestore";
import app from "./firebase";

const db = getFirestore(app);
let cachedBaseUrl = null;

export const getBaseUrl = async () => {
  const ref = doc(db, "baseUrl", "Api");
  const snap = await getDoc(ref);

  console.log("EXISTS:", snap.exists());
  console.log("DATA:", snap.data());

  return snap.exists() ? snap.data()?.url : null;
};