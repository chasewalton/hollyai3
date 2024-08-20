import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateMeshQuery = async (searchTerm) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that converts user queries into MeSH (Medical Subject Headings) search queries for PubMed. Only return the MeSH query, nothing else."
        },
        {
          role: "user",
          content: `Convert this search term to a MeSH query: ${searchTerm}`
        }
      ],
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating MeSH query:', error);
    throw error;
  }
};

export const generateAITheme = async (existingThemes) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates additional research themes based on existing themes. Generate a single, concise theme that is related to but distinct from the existing themes."
        },
        {
          role: "user",
          content: `Based on these existing themes: ${existingThemes.join(', ')}, suggest a new, related research theme.`
        }
      ],
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI theme:', error);
    throw error;
  }
};