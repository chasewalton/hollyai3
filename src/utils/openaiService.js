import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateMeshQuery = async (searchTerm) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "chatgpt-4o-latest",
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
      model: "chatgpt-4o-latest",
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
    const contentSummary = processedContent.map(item => `
      ID: ${item.id}
      Abstract: ${item.abstract}
      Content: ${item.content}
      Hybrid Retrieval-Generation: ${item.hybridRetrievalGeneration}
      Knowledge-Enhanced Text Generation: ${item.knowledgeEnhancedTextGeneration}
      Memory-Augmented Neural Networks: ${item.memoryAugmentedNeuralNetworks}
      Attention Mechanisms Content Extraction: ${item.attentionMechanismsContentExtraction}
    `).join('\n\n');

    const themeSummary = themeData.map(theme => `Theme: ${theme.text}, Importance: ${theme.rating}`).join('\n');

    const completion = await openai.chat.completions.create({
      model: "chatgpt-4o-latest",
      messages: [
        {
          role: "system",
          content: "You are an expert academic writer with advanced knowledge in AI and NLP techniques. Your task is to generate a comprehensive introduction for a research paper, leveraging the provided content, themes, and advanced NLP processing results. The introduction should demonstrate a deep understanding of Hybrid Retrieval-Generation Models, Knowledge-Enhanced Text Generation, Memory-Augmented Neural Networks (MANNs), and Attention Mechanisms in synthesizing information."
        },
        {
          role: "user",
          content: `Based on the following processed content, themes, and advanced NLP processing results, generate a sophisticated introduction for a research paper:

Processed Content:
${contentSummary}

Themes and their importance:
${themeSummary}

Create an introduction that:
1. Provides a nuanced context for the research topic, showing how it fits into the broader field of AI and NLP.
2. Highlights the key themes and their significance, demonstrating how they interrelate and contribute to the research question.
3. Identifies specific gaps in current knowledge or areas of controversy, referencing the provided content.
4. Presents a clear, focused research question or objective that addresses these gaps or controversies.
5. Outlines the structure of the paper, explaining how each section will contribute to answering the research question.
6. Demonstrates the innovative use of advanced NLP techniques (Hybrid Retrieval-Generation, Knowledge-Enhanced Text Generation, MANNs, and Attention Mechanisms) in synthesizing the information.
7. Includes precise in-line citations referencing the provided content IDs.

The introduction should be:
- Sophisticated and academically rigorous
- Well-structured and engaging
- Approximately 750-1000 words long
- Use in-line citations in the format [ID] when referencing specific information from the processed content
- Showcase a deep understanding of the AI and NLP techniques used in the research

Additionally, conclude the introduction with a brief paragraph that outlines how the paper will leverage these advanced NLP techniques to address the research question.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating introduction:', error);
    throw error;
  }
};
