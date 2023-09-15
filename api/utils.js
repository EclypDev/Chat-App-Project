import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});

const openai = new OpenAIApi(configuration);


function generateNumericId(number) {
    const min = 1;
    const max = number;
    let numericId = '';
  
    for (let i = 0; i < 10; i++) {
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      numericId += randomNumber.toString();
    }
  
    return parseInt(numericId);
  }
  async function getOpenAIResponse(prompt) {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 0.9,
            max_tokens: 400,
        });
        return response.data.choices[0].text;
    } catch (e) {
        console.log("Error OpenAI:", e.message);
        return null;
    }
}
  export { generateNumericId, getOpenAIResponse }