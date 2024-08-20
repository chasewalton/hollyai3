import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateMeshQuery = async (searchTerm) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
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
      model: "gpt-4",
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

export const processContentAndGenerateIntroduction = async (processedContent, themeData, updateProgress) => {
  try {
    updateProgress('Hybrid Retrieval-Generation Models', 50);
    const contentSummary = processedContent.map(item => `
      ID: ${item.id}
      Abstract: ${item.abstract}
      Content: ${item.content}
    `).join('\n\n');
    updateProgress('Hybrid Retrieval-Generation Models', 100);

    updateProgress('Knowledge-Enhanced Text Generation', 50);
    const themeSummary = themeData.map(theme => `Theme: ${theme.text}, Importance: ${theme.rating}`).join('\n');
    updateProgress('Knowledge-Enhanced Text Generation', 100);

    updateProgress('Memory-Augmented Neural Networks (MANNs)', 50);
    updateProgress('Attention Mechanisms', 50);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert academic writer with advanced knowledge in writing grants and protocols. Your task is to generate a comprehensive introduction for a research paper, leveraging the provided content and themes. Use advanced NLP techniques such as Hybrid Retrieval-Generation Models, Knowledge-Enhanced Text Generation, Memory-Augmented Neural Networks (MANNs), and Attention Mechanisms in your approach."
        },
        {
          role: "user",
          content: `Based on the following processed content and themes, generate a sophisticated introduction for a research paper:
Processed Content:
${contentSummary}
Themes and their importance:
${themeSummary}
Create an introduction that:
1. Provides a nuanced context for the research topic.
2. Highlights the key themes and their significance, demonstrating how they interrelate and contribute to the research question.
3. Identifies specific gaps in current knowledge or areas of controversy, referencing the provided content.
4. Presents a clear, focused research question or objective that addresses these gaps or controversies.
5. Includes precise in-line citations referencing the provided content IDs.
The introduction should be:
- Sophisticated and academically rigorous
- Well-structured and engaging
- Approximately 750-1000 words long
- Use in-line citations in the format [ID] when referencing specific information from the processed content`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    updateProgress('Memory-Augmented Neural Networks (MANNs)', 100);
    updateProgress('Attention Mechanisms', 100);
    updateProgress('Content Extraction', 100);
    updateProgress('Draft Generation', 100);
    updateProgress('Final Refinement', 100);

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating introduction:', error);
    throw error;
  }
};