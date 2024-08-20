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

  const handleSaveSelection = () => {
    const newSavedResults = selectedResults.map(uid => results.find(r => r.uid === uid)).filter(Boolean);
    setSavedResults(prev => [...prev, ...newSavedResults]);
    setSelectedResults([]);
  };

  const handleRemoveSavedResult = (uid) => {
    setSavedResults(prev => prev.filter(result => result.uid !== uid));
  };

  const handleDownloadPDFs = () => {
    console.log('Downloading PDFs for:', selectedResults);
    alert('Downloading PDFs for selected articles. This feature requires integration with PubMed Central API.');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search-results?query=${encodeURIComponent(searchTerm)}`);
    refetch();
  };

  const handleSaveAndSearch = () => {
    handleSaveSelection();
    handleSearch(new Event('submit'));
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

  return (
    <div className="container mx-auto p-4 flex">
      <div className="w-3/4 pr-4">
        <h1 className="text-3xl font-bold mb-6">Search Results</h1>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Refine your search query"
              className="flex-grow"
            />
            <Button type="submit">Search</Button>
            <Button type="button" onClick={handleSaveAndSearch}>Save Results and Search Again</Button>
          </div>
        </form>

        <div className="mb-4 flex flex-wrap gap-4">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[180px]">
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
            className="w-[200px]"
          />

          <Select value={textAvailability} onValueChange={setTextAvailability}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Text Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="abstract">Abstract</SelectItem>
              <SelectItem value="free_full_text">Free Full Text</SelectItem>
              <SelectItem value="full_text">Full Text</SelectItem>
            </SelectContent>
          </Select>

          <Select value={articleType} onValueChange={setArticleType}>
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Publication Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1_year">1 year</SelectItem>
              <SelectItem value="5_years">5 years</SelectItem>
              <SelectItem value="10_years">10 years</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={resetFilters}>Reset Filters</Button>
        </div>

        <div className="mb-4">
          <Button onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}>
            {isTimelineExpanded ? 'Collapse Timeline' : 'Expand Timeline'}
            {isTimelineExpanded ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
          </Button>
        </div>

        {isTimelineExpanded && timelineData && (
          <Card className="mb-4">
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

        {isLoading && <p>Loading...</p>}
        {isError && <p>Error fetching results. Please try again.</p>}

        {filteredResults && (
          <div className="mb-4 space-x-2">
            <Button onClick={handleSaveSelection}>Save Selected Results</Button>
            <Button onClick={handleDownloadPDFs}>Download Selected PDFs</Button>
          </div>
        )}

        {filteredResults && (
          <div className="grid gap-4">
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

      <div className="w-1/4 pl-4 border-l">
        <h2 className="text-2xl font-bold mb-4">Saved Results</h2>
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
  );
};

export default SearchResults;