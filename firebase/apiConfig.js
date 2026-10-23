import { getFirestore, doc, getDoc } from "firebase/firestore";
import app from "./firebase";
import { setBaseUrl } from "../url/url";

const db = getFirestore(app);
const FALLBACK_URL = "http://15.135.166.93:8000/";

export const getBaseUrl = async () => {
  try {
    const ref = doc(db, "baseUrl", "Api");
    const snap = await getDoc(ref);

    console.log("EXISTS:", snap.exists());
    console.log("DATA:", snap.data());

    if (snap.exists() && snap.data()?.url) {
      const fetchedUrl = snap.data()?.url;
      setBaseUrl(fetchedUrl);
      return fetchedUrl;
    }
  } catch (error) {
    console.error("Failed to fetch base URL from Firestore, using fallback:", error);
  }

  setBaseUrl(FALLBACK_URL);
  return FALLBACK_URL;
};