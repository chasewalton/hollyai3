import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { processContentAndGenerateIntroduction } from '@/utils/openaiService';
import CitationTooltip from '../components/CitationTooltip';

const IntroductionDraft = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [introductionDraft, setIntroductionDraft] = useState('');
  const [processedIntroduction, setProcessedIntroduction] = useState([]);
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [steps, setSteps] = useState([
    { name: 'Hybrid Retrieval-Generation Models', progress: 0, description: 'Retrieving relevant information from PDFs and generating initial content.' },
    { name: 'Knowledge-Enhanced Text Generation', progress: 0, description: 'Using extracted knowledge to generate factually accurate text with in-line citations.' },
    { name: 'Memory-Augmented Neural Networks (MANNs)', progress: 0, description: 'Storing and accessing information from multiple PDFs to effectively combine information from different sources.' },
    { name: 'Attention Mechanisms', progress: 0, description: 'Focusing on the most relevant parts of the text within PDFs to identify key points and determine citation placement.' },
    { name: 'Content Extraction', progress: 0, description: 'Extracting key concepts, quotes, and summaries from the retrieved information.' },
    { name: 'Draft Generation', progress: 0, description: 'Generating the introduction draft using the extracted content.' },
    { name: 'Final Refinement', progress: 0, description: 'Refining and polishing the generated draft for coherence and clarity.' }
  ]);

  const [feedback, setFeedback] = useState({
    contentFocus: '',
    toneAndStyle: '',
    clarityAndReadability: '',
    structureAndFlow: '',
    accuracyAndRelevance: '',
    citationsAndReferences: '',
    lengthAndDetail: '',
    purposeAndAudience: '',
    personalization: '',
    specificWordChoice: ''
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleDiscardConfirm = () => {
    navigate('/project');
  };

  const handleSave = async () => {
    try {
      // Simulating sending data to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/project');
    } catch (error) {
      console.error('Error saving introduction draft:', error);
      alert('Failed to save the introduction draft. Please try again.');
    }
  };

  const handleFeedbackChange = (e) => {
    setFeedback({
      ...feedback,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitFeedback = () => {
    console.log('Feedback submitted:', feedback);
    alert('Feedback submitted successfully!');
  };

  useEffect(() => {
    const generateIntroduction = async () => {
      try {
        const savedResults = JSON.parse(localStorage.getItem('savedResults') || '[]');
        const processedContent = savedResults.map(result => ({
          id: result.uid,
          content: result.content || '',
          abstract: result.abstract || ''
        }));
        const themeData = location.state?.themes || [];
        
        for (const step of steps) {
          await processStep(step.name);
        }

        const generatedIntroduction = await processContentAndGenerateIntroduction(
          processedContent,
          themeData,
          (stepName, progress) => {
            setSteps(prevSteps => prevSteps.map(s => 
              s.name === stepName ? { ...s, progress } : s
            ));
          }
        );
        setIntroductionDraft(generatedIntroduction);
        
        // Process the introduction to add citation tooltips
        const processedText = generatedIntroduction.split(/(\[ID\d+\])/).map((part, index) => {
          if (part.match(/\[ID\d+\]/)) {
            const citationId = part.slice(1, -1);
            const citationSource = processedContent.find(item => item.id === citationId)?.title || 'Unknown source';
            return { type: 'citation', content: part, source: citationSource };
          }
          return { type: 'text', content: part };
        });
        setProcessedIntroduction(processedText);
        
        setShowIntroduction(true);
        setShowFeedbackForm(true);
      } catch (error) {
        console.error('Error generating introduction:', error);
        setIntroductionDraft('Failed to generate introduction. Please try again.');
      }
    };

    generateIntroduction();
  }, []);

  const processStep = async (stepName) => {
    const totalIterations = 100;
    for (let i = 0; i <= totalIterations; i++) {
      const progress = Math.min((i / totalIterations) * 100, 100);
      setSteps(prevSteps => prevSteps.map(s => 
        s.name === stepName ? { ...s, progress } : s
      ));
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold">Introduction Draft</h1>
        </div>
        <div className="space-x-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Discard</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your introduction draft.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No</AlertDialogCancel>
                <AlertDialogAction onClick={handleDiscardConfirm}>Yes</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
      <div className="flex gap-6">
        <AnimatePresence mode="wait">
          {!showFeedbackForm ? (
            <motion.div
              key="loading"
              initial={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="w-1/2"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Generation Process</CardTitle>
                </CardHeader>
                <CardContent>
                  {steps.map((step, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">{step.name}</span>
                        <span>{Math.round(step.progress)}%</span>
                      </div>
                      <Progress value={step.progress} className="mb-2" />
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.5 }}
              className="w-1/2"
            >
              <Card>
                <CardHeader>
                  <CardTitle>What would you like to change?</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); handleSubmitFeedback(); }} className="space-y-4">
                    {Object.entries(feedback).map(([key, value]) => (
                      <div key={key}>
                        <Label htmlFor={key} className="font-semibold">
                          {key.split(/(?=[A-Z])/).join(' ')}:
                        </Label>
                        <Textarea
                          id={key}
                          name={key}
                          value={value}
                          onChange={handleFeedbackChange}
                          placeholder={`Enter your feedback about ${key.split(/(?=[A-Z])/).join(' ').toLowerCase()}...`}
                        />
                      </div>
                    ))}
                    <Button type="submit" className="w-full">Submit Feedback</Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Draft Introduction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap">
                {showIntroduction ? (
                  processedIntroduction.map((part, index) => (
                    part.type === 'citation' ? (
                      <CitationTooltip key={index} citation={part.source}>
                        {part.content}
                      </CitationTooltip>
                    ) : (
                      <span key={index}>{part.content}</span>
                    )
                  ))
                ) : (
                  'Generating introduction...'
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntroductionDraft;