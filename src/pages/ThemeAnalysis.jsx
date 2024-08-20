import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import LoadingOverlay from '@/components/LoadingOverlay';
import { ArrowLeft } from 'lucide-react';
import { generateAITheme, processContentAndGenerateIntroduction } from '@/utils/openaiService';

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
  const [introductionDraft, setIntroductionDraft] = useState('');

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
      return { id: result.uid, content: `Simulated PDF content for ${result.title}`, abstract: result.abstract || '' };
    }));
    setPdfs(retrievedPDFs);
  };

  const updateLoadingProgress = async (stepName, start, end) => {
    for (let i = start; i <= end; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setLoadingSteps(prevSteps => prevSteps.map(step => 
        step.name === stepName ? { ...step, progress: i } : step
      ));
    }
  };

  const processContent = async () => {
    await updateLoadingProgress('Hybrid Retrieval-Generation Models', 0, 100);
    await updateLoadingProgress('Knowledge-Enhanced Text Generation', 0, 100);
    await updateLoadingProgress('Memory-Augmented Neural Networks (MANNs)', 0, 100);
    await updateLoadingProgress('Attention Mechanisms', 0, 100);
    await updateLoadingProgress('Content Extraction', 0, 100);
  };

  const handleNextStep = async () => {
    setIsLoading(true);
    try {
      const savedResults = JSON.parse(localStorage.getItem('savedResults') || '[]');
      await retrievePDFs(savedResults);
      
      await processContent();

      const processedContent = pdfs.map(pdf => ({
        id: pdf.id,
        content: pdf.content,
        abstract: pdf.abstract
      }));

      const themeData = themes.map(theme => ({
        text: theme.text,
        importance: theme.rating
      }));

      await updateLoadingProgress('Draft Generation', 0, 50);
      const generatedIntroduction = await processContentAndGenerateIntroduction(processedContent, themeData);
      await updateLoadingProgress('Draft Generation', 50, 100);

      setIntroductionDraft(generatedIntroduction);

      await updateLoadingProgress('Final Refinement', 0, 100);
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
        <Button onClick={handleNextStep}>Generate Introduction</Button>
      </div>
      <div className="flex gap-6">
        <div className="w-1/2">
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
        <div className="w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Generated Introduction Draft</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap">
                {introductionDraft || "The introduction will be generated here after processing the themes and content."}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ThemeAnalysis;