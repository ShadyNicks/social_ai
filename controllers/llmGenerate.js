import { groq } from "../index.js";
import { push, ref, set, get } from "firebase/database";
import { db } from "../firebaseConfig.js";
import { generateComments } from "../utils/generateComments.js";

const handleGenerateComments = async (req, res) => {
  if (!req.query.api_key)
    return res.status(400).json({ msg: "No API key was given", code: 0 });
  if (req.query.api_key !== process.env.API_KEY)
    return res.status(400).json({ msg: "lol wrong api key", code: 0 });

  const dbRef = ref(db, "media-data/");
  get(dbRef)
    .then(async (snapshot) => {
      if (snapshot.exists()) {
        generateComments(snapshot.val());
      } else {
        console.log("No data available");
        // return res.send("ok");
      }
    })
    .catch((err) => {
      console.log(err);
      return res.send(err);
    });
  return res.send("ok");
};

const handleGenerateLLMResponse = async (req, res) => {
  if (!req.query.api_key)
    return res.status(400).json({ msg: "No API key was given", code: 0 });
  if (req.query.api_key !== process.env.API_KEY)
    return res.status(400).json({ msg: "lol wrong api key", code: 0 });

  const { prompt } = req.query;
  if (!prompt)
    return res.json({ msg: "No prompt was given", code: 0, content: "" });

  console.log(prompt);
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Your name is elon musk",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null,
    });

    const dataRef = ref(db, "data");
    const newData = push(dataRef);
    await set(newData, {
      data: chatCompletion.choices[0].message.content,
      timestamp: Date.now(),
    });

    return res.json({
      content: chatCompletion.choices[0].message.content,
      msg: "succes",
      code: 1,
    });
  } catch (err) {
    console.log(`ERROR: ${err}`);
    return res.status(501).json({ msg: "Internal server error", code: 0, err });
  }
};

export { handleGenerateLLMResponse, handleGenerateComments };
