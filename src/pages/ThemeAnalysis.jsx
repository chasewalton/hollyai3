import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import LoadingOverlay from '@/components/LoadingOverlay';

const ThemeAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialThemes = location.state?.themes ? location.state.themes.split('\n').filter(theme => theme.trim() !== '') : [];
  const [themes, setThemes] = useState(initialThemes.map(theme => ({ text: theme, rating: 5 })));
  const [newTheme, setNewTheme] = useState('');
  const [newThemeRating, setNewThemeRating] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleNextStep = async () => {
    setIsLoading(true);
    try {
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-svcacct-dALVXu6jJh-OP43b-fHTG6DGJNHALbST0gDrnpAoQfqqKVlmssgnlT3BlbkFJ0rb1xLB-W1zvuGuYjujubIxT20SMUbiMkYY2ib7lqwW-5AlLtQPXgA'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that writes introductions based on provided themes and their importance.' },
            { role: 'user', content: `Write a 4-5 paragraph introduction based on the following themes and their importance (1-10 scale):\n\n${themes.map(theme => `${theme.text} (Importance: ${theme.rating}/10)`).join('\n')}` }
          ]
        })
      });

      if (!openAIResponse.ok) {
        throw new Error('Failed to get response from OpenAI');
      }

      const introductionData = await openAIResponse.json();
      const introduction = introductionData.choices[0].message.content;
      
      navigate('/introduction-draft', { state: { introductionDraft: introduction } });
    } catch (error) {
      console.error('Error generating introduction:', error);
      alert('An error occurred while generating the introduction draft. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <LoadingOverlay isLoading={isLoading} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Theme Analysis</h1>
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