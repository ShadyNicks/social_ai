import { groq } from "../index.js";

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

export { handleGenerateLLMResponse };
