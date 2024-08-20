import { create } from 'xmlbuilder2';

/**
 * Generate EndNote XML from a list of papers
 * @param {Array} papers - Array of paper objects
 * @returns {string} EndNote XML as a string
 */
export function generateEndNoteXML(papers) {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('xml')
      .ele('records');

  papers.forEach((paper) => {
    const record = root.ele('record');
    
    // Ref-type (assuming all are journal articles, modify as needed)
    record.ele('ref-type', { name: 'Journal Article' }).txt('17');
    
    // Authors
    const contributors = record.ele('contributors')
      .ele('authors');
    paper.authors.forEach((author) => {
      contributors.ele('author').txt(author);
    });
    
    // Title
    record.ele('titles')
      .ele('title').txt(paper.title);
    
    // Year
    if (paper.year) {
      record.ele('dates')
        .ele('year').txt(paper.year.toString());
    }
    
    // Journal
    if (paper.journal) {
      record.ele('periodical')
        .ele('full-title').txt(paper.journal);
    }
    
    // PubMed ID
    if (paper.uid) {
      record.ele('accession-num').txt(paper.uid);
    }
    
    // URL
    record.ele('urls')
      .ele('related-urls')
        .ele('url').txt(`https://pubmed.ncbi.nlm.nih.gov/${paper.uid}/`);
    
    // Article Type
    if (paper.articleType) {
      record.ele('keywords')
        .ele('keyword').txt(paper.articleType);
    }
    
    // Language
    if (paper.language) {
      record.ele('language').txt(paper.language);
    }
  });

  return root.end({ prettyPrint: true });
}