import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useNavigate } from 'react-router-dom';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSearchTerm = new URLSearchParams(location.search).get('query') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedResults, setSelectedResults] = useState([]);
  const [yearFilter, setYearFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [savedResults, setSavedResults] = useState([]);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [textAvailability, setTextAvailability] = useState('');
  const [articleType, setArticleType] = useState('');
  const [publicationDate, setPublicationDate] = useState('');

  const fetchPubMedResults = async () => {
    const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchTerm)}&retmode=json&retmax=100`);
    const data = await response.json();
    const ids = data.esearchresult.idlist;
    
    const summaryResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`);
    const summaryData = await summaryResponse.json();
    
    return Object.values(summaryData.result).filter(item => item.uid);
  };

  const { data: results, isLoading, isError, refetch } = useQuery({
    queryKey: ['pubmedSearch', searchTerm],
    queryFn: fetchPubMedResults,
    enabled: !!searchTerm,
  });

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
    const selectedArticles = filteredResults.filter(result => selectedResults.includes(result.uid));
    const articlesData = await Promise.all(selectedArticles.map(async (article) => {
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
          { role: 'user', content: `Analyze the following abstracts and identify the top 5 recurring themes:\n\n${articlesData.map(article => `Title: ${article.title}\nAbstract: ${article.abstract}\n\n`).join('')}` }
        ]
      })
    });

    const themes = await openAIResponse.json();
    navigate('/theme-analysis', { state: { themes: themes.choices[0].message.content } });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">PubMed Search</h1>
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
          {isLoading && <p>Loading...</p>}
          {isError && <p>Error fetching results. Please try again.</p>}

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