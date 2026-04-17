require('dotenv').config({ path: '.env.local' });
const { xai } = require('@ai-sdk/xai');
const { streamText } = require('ai');

// Example: Generate a creative holiday description
async function generateHoliday() {
    try {
        if (!process.env.XAI_API_KEY) {
            console.error('Error: XAI_API_KEY not found in .env.local');
            console.log('Please set up .env.local with: XAI_API_KEY=your_key_here');
            return;
        }

        console.log('🤖 Generating creative holiday with Grok-4...\n');

        const result = await streamText({
            model: xai('grok-4'),
            prompt: 'Invent a new holiday and describe its traditions, colors, and how people celebrate it.',
        });

        for await (const textPart of result.textStream) {
            process.stdout.write(textPart);
        }

        console.log('\n\n✅ Generation complete!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

generateHoliday();
