import { set, ref } from "firebase/database";
import { db } from "../firebaseConfig.js";

const handlePostText = async (req, res) => {
  if (!req.body)
    return res.status(400).json({ msg: "Invalid request", code: 0 });
  const { content, userId, createdAt, postId } = req.body;

  const dbRef = ref(db, "media-data/" + userId + "/" + postId);
  const textData = {
    content,
    likes: 0,
    comments: 0,
    createdAt,
  };

  try {
    await set(dbRef, textData);
    return res.status(201).json({ msg: "success", code: 1 });
  } catch (err) {
    console.log(`ERROR: ${err}`);
    return res.status(501).json({ msg: "Internal server error", code: 0, err });
  }
};

export { handlePostText };
