// Imports the Google Cloud client library
import textToSpeech from '@google-cloud/text-to-speech';

// Import other required libraries
import fs from 'fs';
import util from 'util';
// Creates a client
const client = new textToSpeech.TextToSpeechClient();
async function quickStart() {
	// The text to synthesize
	const text = 'Does anyone want to buy a flip phone?';

	// Construct the request
	const request = {
		input: { text: text },
		// Select the language and SSML voice gender (optional)
		voice: { languageCode: 'en-GB', ssmlGender: "" },
		// select the type of audio encoding
		audioConfig: { audioEncoding: 'MP3' },
	};

	// Performs the text-to-speech request
	const [response] = await client.synthesizeSpeech(request as any);
	// Write the binary audio content to a local file
	const writeFile = util.promisify(fs.writeFile);
	await writeFile('output.mp3', response.audioContent!, 'binary');
	console.log('Audio content written to file: output.mp3');
}
quickStart();
