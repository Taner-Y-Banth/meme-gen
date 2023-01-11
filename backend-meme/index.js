import { Configuration, OpenAIApi } from "openai";
import minimist from 'minimist';
import { NstrumentaClient } from 'nstrumenta';
import ws from 'ws';
import randomWords from 'random-words';

const argv = minimist(process.argv.slice(2));
const wsUrl = argv.wsUrl;
const nstClient = new NstrumentaClient();

const configuration = new Configuration({
  apiKey: argv.apiKey,
});
const openai = new OpenAIApi(configuration);

let currentText = "rick astley singing never gonna give you up";

nstClient.addListener("open", () => {

  console.log("websocket opened successfully");
try{
  nstClient.addSubscription('textgen', async (msg) => {

    const prompt = `write a ${randomWords(1)} meme in 18 words or less`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 1,
      max_tokens: 36,
      top_p: 1,
      best_of: 5,
      frequency_penalty: 1,
      presence_penalty: 1,
    });

    const quote = response.data.choices[0].text;
    currentText = prompt

    console.log(`TEXT PROMPT: ${prompt}`)

    nstClient.send(
      msg.responseChannel, {
      quote
    });

  });

  nstClient.addSubscription('imggen', async (msg) => {

    const textresponse = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `describe a meme image based on ${currentText}`,
      temperature: 1,
      max_tokens: 36,
      top_p: 1,
      best_of: 5,
      frequency_penalty: 1,
      presence_penalty: 1,
    });

    const prompt = textresponse.data.choices[0].text;
    console.log(`IMAGE PROMPT: ${prompt}`);

    const imgresponse = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = imgresponse.data.data[0].url;

    nstClient.send(
      msg.responseChannel, {
      imageUrl
    });
  
  });
}catch{
  console.error();
}
});

console.log("nstrumenta connect");

nstClient.connect({ wsUrl, nodeWebSocket: ws });