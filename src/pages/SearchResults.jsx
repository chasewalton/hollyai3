import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useNavigate } from 'react-router-dom';
import { X, ChevronDown, ChevronUp, Save, Download, ArrowLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoadingOverlay from '@/components/LoadingOverlay';
import { useMeshTerms, generateMeshCombinations } from '@/utils/meshConverter';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSearchTerm = new URLSearchParams(location.search).get('query') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const projectInfo = location.state?.projectInfo || {};

  const handleBack = () => {
    navigate(-1);
  };
  const [selectedResults, setSelectedResults] = useState([]);
  const [yearFilter, setYearFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [savedResults, setSavedResults] = useState([]);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [textAvailability, setTextAvailability] = useState('');
  const [articleType, setArticleType] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [meshSearchTerm, setMeshSearchTerm] = useState('');

  const { data: meshTerms, isLoading: isMeshLoading, error: meshError } = useMeshTerms(searchTerm);
  const [meshCombinations, setMeshCombinations] = useState([]);

  useEffect(() => {
    if (meshTerms && meshTerms.length > 0) {
      const combinations = generateMeshCombinations(meshTerms);
      setMeshCombinations(combinations);
      setMeshSearchTerm(combinations[0]);
    } else if (meshTerms && meshTerms.length === 0) {
      // If no MeSH terms are found, use the original search term
      setMeshCombinations([searchTerm]);
      setMeshSearchTerm(searchTerm);
    }
  }, [meshTerms, searchTerm]);

  const handleSaveResults = () => {
    const newSavedResults = filteredResults.filter(result => selectedResults.includes(result.uid));
    setSavedResults(prevSaved => [...prevSaved, ...newSavedResults]);
    setSelectedResults([]);
    alert('Selected results have been saved.');
  };

  const handleDownloadPDFs = () => {
    const selectedPDFs = filteredResults.filter(result => selectedResults.includes(result.uid));
    selectedPDFs.forEach(result => {
      const pdfUrl = `https://www.ncbi.nlm.nih.gov/pmc/articles/${result.pmc}/pdf/`;
      window.open(pdfUrl, '_blank');
    });
    alert('PDF downloads have been initiated for selected results.');
  };

  const fetchPubMedResults = async () => {
    const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(meshSearchTerm)}&retmode=json&retmax=100`);
    const data = await response.json();
    const ids = data.esearchresult.idlist;
    
    const summaryResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`);
    const summaryData = await summaryResponse.json();
    
    return Object.values(summaryData.result).filter(item => item.uid);
  };

  const { data: results, isLoading: isQueryLoading, isError, error, refetch } = useQuery({
    queryKey: ['pubmedSearch', meshSearchTerm],
    queryFn: fetchPubMedResults,
    enabled: false,
  });

  useEffect(() => {
    if (location.state?.performSearch && meshSearchTerm) {
      refetch();
    }
  }, [location.state, refetch, meshSearchTerm]);

  const handleResultSelection = (uid) => {
    setSelectedResults(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleRemoveSavedResult = (uid) => {
    setSavedResults(prev => prev.filter(result => result.uid !== uid));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search-results?query=${encodeURIComponent(searchTerm)}`);
    refetch();
  };

  const filteredResults = results?.filter(result => {
    const yearMatch = !yearFilter || result.pubdate.includes(yearFilter);
    const authorMatch = !authorFilter || result.authors.some(author => 
      author.name.toLowerCase().includes(authorFilter.toLowerCase())
    );
    const textAvailabilityMatch = !textAvailability || (
      (textAvailability === 'abstract' && result.hasabstract === 'Y') ||
      (textAvailability === 'free_full_text' && result.pmc !== '') ||
      (textAvailability === 'full_text' && (result.pmc !== '' || result.fulljournalname !== ''))
    );
    const articleTypeMatch = !articleType || result.pubtype.includes(articleType);
    const publicationDateMatch = !publicationDate || (
      (publicationDate === '1_year' && new Date(result.pubdate) >= new Date().setFullYear(new Date().getFullYear() - 1)) ||
      (publicationDate === '5_years' && new Date(result.pubdate) >= new Date().setFullYear(new Date().getFullYear() - 5)) ||
      (publicationDate === '10_years' && new Date(result.pubdate) >= new Date().setFullYear(new Date().getFullYear() - 10))
    );
    return yearMatch && authorMatch && textAvailabilityMatch && articleTypeMatch && publicationDateMatch;
  });

  const timelineData = filteredResults?.reduce((acc, result) => {
    const year = new Date(result.pubdate).getFullYear();
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});

  const resetFilters = () => {
    setYearFilter('');
    setAuthorFilter('');
    setTextAvailability('');
    setArticleType('');
    setPublicationDate('');
  };

  const handleNextStep = async () => {
    if (savedResults.length === 0) {
      alert("Please save at least one article before proceeding.");
      return;
    }

    setIsLoading(true);

    try {
      const articlesData = await Promise.all(savedResults.map(async (article) => {
        const abstractResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${article.uid}&retmode=text&rettype=abstract`);
        const abstractText = await abstractResponse.text();
        return {
          title: article.title,
          abstract: abstractText,
          fullText: article.pmc ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${article.pmc}/` : null
        };
      }));

      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-svcacct-dALVXu6jJh-OP43b-fHTG6DGJNHALbST0gDrnpAoQfqqKVlmssgnlT3BlbkFJ0rb1xLB-W1zvuGuYjujubIxT20SMUbiMkYY2ib7lqwW-5AlLtQPXgA'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that analyzes scientific abstracts and identifies recurring themes.' },
            { role: 'user', content: `Analyze the following abstracts and identify the top 5 recurring themes. Also, consider the following project information:
              Project Title: ${projectInfo.projectTitle}
              Project Type: ${projectInfo.projectType}
              Number of Paragraphs: ${projectInfo.numParagraphs}
              Number of References: ${projectInfo.numReferences}

              Abstracts:
              ${articlesData.map(article => `Title: ${article.title}\nAbstract: ${article.abstract}\n\n`).join('')}` }
          ]
        })
      });

      if (!openAIResponse.ok) {
        throw new Error('Failed to get response from OpenAI');
      }

      const themes = await openAIResponse.json();
      setIsLoading(false);
      navigate('/theme-analysis', { 
        state: { 
          themes: themes.choices[0].message.content,
          projectInfo: projectInfo,
          savedResults: savedResults
        } 
      });
    } catch (error) {
      console.error('Error in theme analysis:', error);
      setIsLoading(false);
      alert('An error occurred during theme analysis. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <LoadingOverlay isLoading={isLoading} />
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold">PubMed Search</h1>
        </div>
        <Button size="lg" onClick={handleNextStep}>Next Step</Button>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter your search query"
            className="flex-grow"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>
      {isMeshLoading ? (
        <p>Converting to MeSH terms...</p>
      ) : meshError ? (
        <p>Error converting to MeSH terms: {meshError.message}</p>
      ) : meshCombinations.length > 0 ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">MeSH Term Combinations:</h3>
          <Select value={meshSearchTerm} onValueChange={setMeshSearchTerm}>
            <SelectTrigger>
              <SelectValue placeholder="Select MeSH combination" />
            </SelectTrigger>
            <SelectContent>
              {meshCombinations.map((combo, index) => (
                <SelectItem key={index} value={combo}>{combo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <p>No MeSH terms found. Using original search term.</p>
      )}

      <div className="flex gap-4">
        {/* Filters Column */}
        <div className="w-1/4">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="space-y-4">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Year" />
              </SelectTrigger>
              <SelectContent>
                {['2024', '2023', '2022', '2021', '2020'].map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by Author"
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
            />

            <Select value={textAvailability} onValueChange={setTextAvailability}>
              <SelectTrigger>
                <SelectValue placeholder="Text Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="abstract">Abstract</SelectItem>
                <SelectItem value="free_full_text">Free Full Text</SelectItem>
                <SelectItem value="full_text">Full Text</SelectItem>
              </SelectContent>
            </Select>

            <Select value={articleType} onValueChange={setArticleType}>
              <SelectTrigger>
                <SelectValue placeholder="Article Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Books and Documents">Books and Documents</SelectItem>
                <SelectItem value="Clinical Trial">Clinical Trial</SelectItem>
                <SelectItem value="Meta-Analysis">Meta-Analysis</SelectItem>
                <SelectItem value="Randomized Controlled Trial">Randomized Controlled Trial</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
                <SelectItem value="Systematic Review">Systematic Review</SelectItem>
              </SelectContent>
            </Select>

            <Select value={publicationDate} onValueChange={setPublicationDate}>
              <SelectTrigger>
                <SelectValue placeholder="Publication Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1_year">1 year</SelectItem>
                <SelectItem value="5_years">5 years</SelectItem>
                <SelectItem value="10_years">10 years</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={resetFilters} className="w-full">Reset Filters</Button>
          </div>

          <div className="mt-4">
            <Button onClick={() => setIsTimelineExpanded(!isTimelineExpanded)} className="w-full">
              {isTimelineExpanded ? 'Collapse Timeline' : 'Expand Timeline'}
              {isTimelineExpanded ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
            </Button>
          </div>

          {isTimelineExpanded && timelineData && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Search Results Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Number of Results</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(timelineData).sort((a, b) => b[0] - a[0]).map(([year, count]) => (
                      <TableRow key={year}>
                        <TableCell>{year}</TableCell>
                        <TableCell>{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Search Results Column */}
        <div className="w-1/2">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <div className="flex space-x-2 mb-4">
            <Button onClick={handleSaveResults}>Save Results</Button>
            <Button onClick={handleDownloadPDFs}>Download PDFs</Button>
          </div>
          {isQueryLoading && <p>Loading...</p>}
          {isError && <p>Error fetching results: {error?.message || 'Please try again.'}</p>}

          {filteredResults && (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <Card key={result.uid}>
                  <CardHeader className="flex flex-row items-center space-x-4">
                    <Checkbox
                      id={`result-${result.uid}`}
                      checked={selectedResults.includes(result.uid)}
                      onCheckedChange={() => handleResultSelection(result.uid)}
                    />
                    <CardTitle>{result.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Authors: {result.authors.map(author => author.name).join(', ')}</p>
                    <p className="text-sm text-gray-600">Published: {result.pubdate}</p>
                    <a href={`https://pubmed.ncbi.nlm.nih.gov/${result.uid}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      View on PubMed
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Saved Results Column */}
        <div className="w-1/4">
          <h2 className="text-xl font-semibold mb-4">Saved Results</h2>
          {savedResults.length > 0 ? (
            <ul className="space-y-2">
              {savedResults.map(result => (
                <li key={result.uid} className="flex items-center justify-between">
                  <a href={`https://pubmed.ncbi.nlm.nih.gov/${result.uid}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate mr-2">
                    {result.title}
                  </a>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveSavedResult(result.uid)}>
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No saved results yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;