import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, ChevronDown, ChevronUp, Save, Download, ArrowLeft, ExternalLink } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { generateMeshQuery } from '@/utils/openaiService';
import { generateEndNoteXML } from '@/utils/endnoteGenerator';

const API_KEY = '1d4ccfa738c68098e6d65207184849e55408';
const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSearchTerm = new URLSearchParams(location.search).get('query') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const projectInfo = location.state?.projectInfo || {};

  const [selectedResults, setSelectedResults] = useState([]);
  const [filters, setFilters] = useState({
    yearRange: [1900, new Date().getFullYear()],
    authors: [],
    textAvailability: '',
    articleTypes: [],
    publicationDateRange: [new Date(1900, 0, 1), new Date()],
    journalCategories: [],
    citationCount: [0, 1000],
    studyTypes: [],
    languages: [],
    subjectAreas: [],
  });
  const [savedResults, setSavedResults] = useState(() => {
    const saved = localStorage.getItem('savedResults');
    return saved ? JSON.parse(saved) : [];
  });
  const [meshQuery, setMeshQuery] = useState('');
  const [sortMethod, setSortMethod] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  const resetFilters = useCallback(() => {
    setFilters({
      yearRange: [1900, new Date().getFullYear()],
      authors: [],
      textAvailability: '',
      articleTypes: [],
      publicationDateRange: [new Date(1900, 0, 1), new Date()],
      journalCategories: [],
      citationCount: [0, 1000],
      studyTypes: [],
      languages: [],
      subjectAreas: [],
    });
  }, []);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const fetchPubMedResults = async () => {
    try {
      const searchUrl = `${BASE_URL}esearch.fcgi?db=pubmed&term=${encodeURIComponent(meshQuery)}&retmode=json&retmax=100&api_key=${API_KEY}`;
      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) {
        throw new Error(`HTTP error! status: ${searchResponse.status}`);
      }
      const searchData = await searchResponse.json();
      const ids = searchData.esearchresult.idlist;
      
      const summaryUrl = `${BASE_URL}esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json&api_key=${API_KEY}`;
      const summaryResponse = await fetch(summaryUrl);
      if (!summaryResponse.ok) {
        throw new Error(`HTTP error! status: ${summaryResponse.status}`);
      }
      const summaryData = await summaryResponse.json();
      
      return Object.values(summaryData.result).filter(item => item.uid).map(item => ({
        id: item.uid,
        title: item.title,
        authors: item.authors.map(author => author.name),
        year: parseInt(item.pubdate.split(' ')[0]),
        uid: item.uid,
        articleType: item.pubtype[0] || 'Unknown',
        language: item.lang[0] || 'Unknown',
        journal: item.fulljournalname || 'Unknown',
        citationCount: Math.floor(Math.random() * 1000), // Simulated citation count
      }));
    } catch (error) {
      console.error('Error fetching PubMed results:', error);
      throw error;
    }
  };

  const { data: searchResults, isLoading: isSearchLoading, error: searchError, refetch } = useQuery({
    queryKey: ['pubmedSearch', meshQuery, filters],
    queryFn: fetchPubMedResults,
    enabled: !!meshQuery,
  });

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    try {
      const generatedMeshQuery = await generateMeshQuery(searchTerm);
      setMeshQuery(generatedMeshQuery);
      refetch();
    } catch (error) {
      console.error('Error generating MeSH query:', error);
      // Handle error (e.g., show an alert to the user)
    }
  }, [searchTerm, refetch]);

  const handleSaveResults = useCallback(() => {
    const updatedResults = [...savedResults, ...selectedResults];
    setSavedResults(updatedResults);
    localStorage.setItem('savedResults', JSON.stringify(updatedResults));
  }, [savedResults, selectedResults]);

  const handleDownloadResults = useCallback(() => {
    const resultsText = selectedResults.map(result => 
      `Title: ${result.title}\nAuthors: ${result.authors.join(', ')}\nYear: ${result.year}\nPubMed ID: ${result.uid}\nPubMed Link: https://pubmed.ncbi.nlm.nih.gov/${result.uid}/\n\n`
    ).join('');
    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pubmed_results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [selectedResults]);

  const handleDownloadEndNote = useCallback(() => {
    const endNoteXML = generateEndNoteXML(savedResults);
    const blob = new Blob([endNoteXML], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'endnote_library.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [savedResults]);

  const handleNextStep = useCallback(() => {
    navigate('/theme-analysis', { state: { themes: savedResults.map(result => result.title).join('\n') } });
  }, [navigate, savedResults]);

  const filteredResults = useMemo(() => {
    if (!searchResults) return [];
    return searchResults.filter(result => {
      return (
        (result.year >= filters.yearRange[0] && result.year <= filters.yearRange[1]) &&
        (filters.authors.length === 0 || result.authors.some(author => filters.authors.includes(author))) &&
        (filters.articleTypes.length === 0 || filters.articleTypes.includes(result.articleType)) &&
        (filters.languages.length === 0 || filters.languages.includes(result.language))
        // Add more filter conditions here as needed
      );
    });
  }, [searchResults, filters]);

  const sortedResults = useMemo(() => {
    if (!filteredResults) return [];
    const sorted = [...filteredResults];
    switch (sortMethod) {
      case 'yearAsc':
        return sorted.sort((a, b) => a.year - b.year);
      case 'yearDesc':
        return sorted.sort((a, b) => b.year - a.year);
      case 'titleAsc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'titleDesc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'citationCount':
        return sorted.sort((a, b) => b.citationCount - a.citationCount);
      default: // 'relevance'
        return sorted;
    }
  }, [filteredResults, sortMethod]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Extract unique authors, article types, and languages from search results
  const uniqueAuthors = useMemo(() => {
    if (!searchResults) return [];
    return [...new Set(searchResults.flatMap(result => result.authors))];
  }, [searchResults]);

  const uniqueArticleTypes = useMemo(() => {
    if (!searchResults) return [];
    return [...new Set(searchResults.map(result => result.articleType))];
  }, [searchResults]);

  const uniqueLanguages = useMemo(() => {
    if (!searchResults) return [];
    return [...new Set(searchResults.map(result => result.language))];
  }, [searchResults]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-6 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Search Results</h1>
        </div>
        <Button onClick={handleNextStep}>Next Step</Button>
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

      {meshQuery && (
        <Alert className="mb-4">
          <AlertTitle>Generated MeSH Query</AlertTitle>
          <AlertDescription>{meshQuery}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <div className="w-1/4">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Year Range</label>
              <Slider
                min={1900}
                max={new Date().getFullYear()}
                step={1}
                value={filters.yearRange}
                onValueChange={(value) => handleFilterChange('yearRange', value)}
              />
              <div className="flex justify-between mt-1">
                <span>{filters.yearRange[0]}</span>
                <span>{filters.yearRange[1]}</span>
              </div>
            </div>

            <div>
              <label className="block mb-2">Authors</label>
              <Select
                value={filters.authors}
                onValueChange={(value) => handleFilterChange('authors', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select authors" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueAuthors.map((author) => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2">Article Types</label>
              <Select
                value={filters.articleTypes}
                onValueChange={(value) => handleFilterChange('articleTypes', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select article types" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueArticleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2">Languages</label>
              <Select
                value={filters.languages}
                onValueChange={(value) => handleFilterChange('languages', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select languages" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueLanguages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2">Citation Count</label>
              <Slider
                min={0}
                max={1000}
                step={10}
                value={filters.citationCount}
                onValueChange={(value) => handleFilterChange('citationCount', value)}
              />
              <div className="flex justify-between mt-1">
                <span>{filters.citationCount[0]}</span>
                <span>{filters.citationCount[1]}+</span>
              </div>
            </div>

            <Button onClick={resetFilters} className="w-full">Reset Filters</Button>
          </div>
        </div>

        <div className="w-2/4">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <div className="flex justify-between mb-4">
            <Button onClick={handleSaveResults}>
              <Save className="mr-2 h-4 w-4" /> Save Results
            </Button>
            <Button onClick={handleDownloadResults}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Select value={sortMethod} onValueChange={setSortMethod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="yearAsc">Year (Ascending)</SelectItem>
                <SelectItem value="yearDesc">Year (Descending)</SelectItem>
                <SelectItem value="titleAsc">Title (A-Z)</SelectItem>
                <SelectItem value="titleDesc">Title (Z-A)</SelectItem>
                <SelectItem value="citationCount">Citation Count</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {searchError ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Error fetching search results: {searchError.message}</AlertDescription>
            </Alert>
          ) : isSearchLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Authors</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Citations</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedResults.some(r => r.id === result.id)}
                        onCheckedChange={(checked) => {
                          setSelectedResults(prev =>
                            checked
                              ? [...prev, result]
                              : prev.filter(r => r.id !== result.id)
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell>{result.title}</TableCell>
                    <TableCell>{result.authors.join(', ')}</TableCell>
                    <TableCell>{result.year}</TableCell>
                    <TableCell>{result.articleType}</TableCell>
                    <TableCell>{result.language}</TableCell>
                    <TableCell>{result.citationCount}</TableCell>
                    <TableCell>
                      <a href={`https://pubmed.ncbi.nlm.nih.gov/${result.uid}/`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                        PubMed <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Results</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {savedResults.length > 0 ? (
                savedResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between mb-2 p-2 bg-gray-100 rounded">
                    <span className="text-sm truncate flex-1 mr-2">{result.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSavedResults(prev => prev.filter(r => r.id !== result.id));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No saved results yet.</p>
              )}
            </CardContent>
            <CardContent>
              <Button onClick={handleDownloadEndNote} className="w-full">
                <Download className="mr-2 h-4 w-4" /> Download EndNote
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
