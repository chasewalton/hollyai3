import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import LoadingOverlay from '@/components/LoadingOverlay';
import { ArrowLeft } from 'lucide-react';
import { generateAITheme } from '@/utils/openaiService';

const ThemeAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialThemes = location.state?.themes ? location.state.themes.split('\n').filter(theme => theme.trim() !== '') : [];
  const [themes, setThemes] = useState(initialThemes.map(theme => ({ text: theme, rating: 5 })));
  const [newTheme, setNewTheme] = useState('');
  const [newThemeRating, setNewThemeRating] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState([
    { name: 'Hybrid Retrieval-Generation Models', progress: 0 },
    { name: 'Knowledge-Enhanced Text Generation', progress: 0 },
    { name: 'Memory-Augmented Neural Networks (MANNs)', progress: 0 },
    { name: 'Attention Mechanisms', progress: 0 },
    { name: 'Content Extraction', progress: 0 },
    { name: 'Draft Generation', progress: 0 },
    { name: 'Final Refinement', progress: 0 }
  ]);
  const [pdfs, setPdfs] = useState([]);
  const [isGeneratingAITheme, setIsGeneratingAITheme] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleRatingChange = (index, newRating) => {
    const updatedThemes = [...themes];
    updatedThemes[index].rating = newRating;
    setThemes(updatedThemes);
  };

  const handleAddTheme = () => {
    if (newTheme.trim() !== '') {
      setThemes([...themes, { text: newTheme, rating: newThemeRating }]);
      setNewTheme('');
      setNewThemeRating(5);
    }
  };

  const retrievePDFs = async (savedResults) => {
    // Simulating PDF retrieval
    const retrievedPDFs = await Promise.all(savedResults.map(async (result) => {
      // In a real scenario, you would fetch the actual PDF content here
      return { id: result.uid, content: `Simulated PDF content for ${result.title}` };
    }));
    setPdfs(retrievedPDFs);
  };

  const runHybridRetrievalGenerationModels = async (pdfs) => {
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setLoadingSteps(prevSteps => prevSteps.map(step => 
        step.name === 'Hybrid Retrieval-Generation Models' ? { ...step, progress: i } : step
      ));
    }
    // In a real scenario, you would process the PDFs and generate initial content here
    console.log('Hybrid Retrieval-Generation Models completed');
    return 'Initial content generated from PDFs';
  };

  const runKnowBERT = async (initialContent) => {
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setLoadingSteps(prevSteps => prevSteps.map(step => 
        step.name === 'Knowledge-Enhanced Text Generation' ? { ...step, progress: i } : step
      ));
    }
    // In a real scenario, you would use KnowBERT to enhance the text with knowledge and citations
    console.log('KnowBERT processing completed');
    return 'Enhanced content with factual accuracy and citations';
  };

  const runMANNs = async (enhancedContent) => {
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setLoadingSteps(prevSteps => prevSteps.map(step => 
        step.name === 'Memory-Augmented Neural Networks (MANNs)' ? { ...step, progress: i } : step
      ));
    }
    // In a real scenario, you would use MANNs to combine information from multiple sources
    console.log('MANNs processing completed');
    return 'Unified content with information from multiple sources';
  };

  const handleNextStep = async () => {
    setIsLoading(true);
    try {
      const savedResults = JSON.parse(localStorage.getItem('savedResults') || '[]');
      await retrievePDFs(savedResults);
      
      const initialContent = await runHybridRetrievalGenerationModels(pdfs);
      const enhancedContent = await runKnowBERT(initialContent);
      const unifiedContent = await runMANNs(enhancedContent);

      // Generate introduction draft (placeholder for now)
      const introductionDraft = "This is a placeholder for the generated introduction draft based on the unified content.";

      navigate('/introduction-draft', { state: { introductionDraft } });
    } catch (error) {
      console.error('Error in theme analysis:', error);
      alert('An error occurred during theme analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAITheme = async () => {
    setIsGeneratingAITheme(true);
    try {
      const existingThemes = themes.map(theme => theme.text);
      const newAITheme = await generateAITheme(existingThemes);
      setThemes([...themes, { text: newAITheme, rating: 5 }]);
    } catch (error) {
      console.error('Error generating AI theme:', error);
      alert('An error occurred while generating the AI theme. Please try again.');
    } finally {
      setIsGeneratingAITheme(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <LoadingOverlay isLoading={isLoading} message="Processing themes and generating content" steps={loadingSteps} />
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold">Theme Analysis</h1>
        </div>
        <Button onClick={handleNextStep}>Next Step</Button>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recurring Themes</CardTitle>
        </CardHeader>
        <CardContent>
          {themes.length > 0 ? (
            themes.map((theme, index) => (
              <div key={index} className="flex justify-between items-center mb-4">
                <p className="font-semibold w-1/2">{theme.text}</p>
                <div className="flex items-center w-1/2">
                  <Slider
                    value={[theme.rating]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => handleRatingChange(index, value[0])}
                    className="w-64 mr-4"
                  />
                  <span className="w-8 text-right">{theme.rating}/10</span>
                </div>
              </div>
            ))
          ) : (
            <p>No themes available. Please go back and select articles for analysis.</p>
          )}
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate Additional AI-identified Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGenerateAITheme} 
            disabled={isGeneratingAITheme}
            className="w-full"
          >
            {isGeneratingAITheme ? 'Generating...' : 'Generate AI Theme'}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add Custom Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Input
              type="text"
              value={newTheme}
              onChange={(e) => setNewTheme(e.target.value)}
              placeholder="Enter a new theme"
              className="w-1/2 mr-4"
            />
            <div className="flex items-center w-1/2">
              <Slider
                value={[newThemeRating]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setNewThemeRating(value[0])}
                className="w-64 mr-4"
              />
              <span className="w-8 text-right">{newThemeRating}/10</span>
            </div>
          </div>
          <Button onClick={handleAddTheme} className="w-full">Add Theme</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeAnalysis;