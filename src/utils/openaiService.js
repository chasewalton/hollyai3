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

export const processContentAndGenerateIntroduction = async (processedContent, themeData) => {
  try {
    const contentSummary = processedContent.map(item => `ID: ${item.id}\nAbstract: ${item.abstract}\nContent: ${item.content}`).join('\n\n');
    const themeSummary = themeData.map(theme => `Theme: ${theme.text}, Importance: ${theme.rating}`).join('\n');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k", // Using a model with larger context window
      messages: [
        {
          role: "system",
          content: "You are an expert academic writer tasked with generating a comprehensive introduction for a research paper. Use the provided content and themes to create a well-structured, informative introduction that sets the context for the research, highlights key themes, and presents a clear research question or objective. Your response should demonstrate the use of Hybrid Retrieval-Generation Models, Knowledge-Enhanced Text Generation, Memory-Augmented Neural Networks (MANNs), and Attention Mechanisms in synthesizing the information."
        },
        {
          role: "user",
          content: `Based on the following processed content and themes, generate a comprehensive introduction for a research paper:

Processed Content:
${contentSummary}

Themes and their importance:
${themeSummary}

Please write an introduction that:
1. Provides context for the research topic
2. Highlights the key themes and their significance
3. Identifies gaps in current knowledge or areas of controversy
4. Presents a clear research question or objective
5. Briefly outlines the structure of the paper
6. Demonstrates the use of advanced NLP techniques in synthesizing the information

The introduction should be well-structured, engaging, and approximately 500-750 words long.`
        }
      ],
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating introduction:', error);
    throw error;
  }
};