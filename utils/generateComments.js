import { db } from "../firebaseConfig.js";
import { ref, set, get, update } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import { groq } from "../index.js";

const generateComments = async (mediaUserData) => {
  const dbRef = ref(db, "comment-delays/");
  const commentDelays = await get(dbRef);
  console.log(commentDelays.val());

  Object.keys(mediaUserData).forEach((userId) => {
    Object.keys(mediaUserData[userId]).forEach(async (postId) => {
      const currentTimeInSeconds = Math.round(Date.now() / 1000);
      console.log(`CURRENT TIME: ${currentTimeInSeconds}`);

      if (
        commentDelays.val() &&
        commentDelays.val()[userId] &&
        commentDelays.val()[userId][postId]
      ) {
        console.log(commentDelays.val()[userId][postId]);

        if (
          parseInt(commentDelays.val()[userId][postId]["delay"]) <=
          currentTimeInSeconds
        ) {
          console.log("executing comment");
          const commentDbRef = ref(db, `media-data/${userId}/${postId}`);

          try {
            const snapshot = await get(commentDbRef);
            const currentData = snapshot.val();
            const currentComments = currentData.comments || [];

            // getting current date
            const date = new Date();
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const createdAt = `${day}-${month}-${year}`;

            console.log(
              `USER CONTENT: ${mediaUserData[userId][postId]["content"]}`
            );

            // generating comment from llm
            groq.chat.completions
              .create({
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a complete human, you act like human, your texting style is like human, you sometimes do typing mistakes just like humans, you also sometimes use emojis. Your task is to comment on a given tweet or content in the most human way possible. The comment must not be too long or you will get penalty. You only have to provide the comment only, no other text. Sometimes your comments are sarcastic as humans and sometimes supportive.",
                  },
                  {
                    role: "user",
                    content: mediaUserData[userId][postId]["content"],
                  },
                ],
                model: "llama-3.1-8b-instant",
                temperature: 0.6,
                max_tokens: 1024,
                top_p: 1,
                stream: false,
                stop: null,
              })
              .then(async (response) => {
                const comment = response.choices[0].message.content;
                console.log(`COMMENT: ${comment}`);

                const newComment = {
                  commentText: comment,
                  commentId: uuidv4(),
                  commentedAt: createdAt,
                };
                const updatedComments = [...currentComments, newComment];

                await update(commentDbRef, {
                  comments: updatedComments,
                });

                console.log("commet done");

                const commentDelayRef = ref(
                  db,
                  `comment-delays/${userId}/${postId}`
                );
                await update(commentDelayRef, {
                  delay:
                    currentTimeInSeconds +
                    Math.floor(
                      Math.random() * 60 +
                        1 +
                        mediaUserData[userId][postId]["comments"].length
                    ),
                });

                console.log("delay done");
              })
              .catch((err) => console.error(`ERROR LLM: ${err}`));
          } catch (err) {
            console.error(`ERR: ${err}`);
          }
        }
      } else {
        console.log("empty");

        const newDbRef = ref(db, "comment-delays/" + userId + "/" + postId);
        set(newDbRef, {
          delay: currentTimeInSeconds + Math.floor(Math.random() * 60 + 1), // time in seconds
        })
          .then(() => console.log("Done"))
          .catch((err) => console.log(`ERR: ${err}`));
      }
    });
  });
};

export { generateComments };
