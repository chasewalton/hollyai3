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

const IntroductionDraft = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [introductionDraft, setIntroductionDraft] = useState('');
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
    const processSteps = async () => {
      await processVariableStep(0, 'Hybrid Retrieval-Generation Models');
      await processVariableStep(1, 'Knowledge-Enhanced Text Generation');
      await processVariableStep(2, 'Memory-Augmented Neural Networks (MANNs)');
      await processVariableStep(3, 'Attention Mechanisms');
      await processFixedStep(4, 'Content Extraction');
      await processFixedStep(5, 'Draft Generation');
      await processFixedStep(6, 'Final Refinement');
      setShowIntroduction(true);
      setShowFeedbackForm(true);
    };

    processSteps();
  }, []);

  const processVariableStep = async (stepIndex, stepName) => {
    const savedResults = JSON.parse(localStorage.getItem('savedResults') || '[]');
    const processedContent = savedResults.map(result => ({
      id: result.uid,
      content: result.content || '',
      abstract: result.abstract || '',
      hybridRetrievalGeneration: result.hybridRetrievalGeneration || '',
      knowledgeEnhancedTextGeneration: result.knowledgeEnhancedTextGeneration || '',
      memoryAugmentedNeuralNetworks: result.memoryAugmentedNeuralNetworks || '',
      attentionMechanismsContentExtraction: result.attentionMechanismsContentExtraction || ''
    }));
    
    const totalIterations = 100;
    for (let i = 0; i <= totalIterations; i++) {
      const progress = Math.min((i / totalIterations) * 100, 100);
      setSteps(prevSteps => prevSteps.map((s, index) => 
        index === stepIndex ? { ...s, progress } : s
      ));
      await new Promise(resolve => setTimeout(resolve, 50));
      if (progress >= 100) break;
    }
  };

  const processFixedStep = async (stepIndex, stepName) => {
    // Simulating a task that runs in multiple iterations.
    const totalIterations = 10;
    for (let i = 0; i <= totalIterations; i++) {
      setSteps(prevSteps => prevSteps.map((step, index) => 
        index === stepIndex ? { ...step, progress: (i / totalIterations) * 100 } : step
      ));
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const generateIntroduction = async () => {
    try {
      const savedResults = JSON.parse(localStorage.getItem('savedResults') || '[]');
      const processedContent = savedResults.map(result => ({
        id: result.uid,
        content: result.content || '',
        abstract: result.abstract || ''
      }));
      const themeData = location.state?.themes || [];
      const generatedIntroduction = await processContentAndGenerateIntroduction(processedContent, themeData);
      setIntroductionDraft(generatedIntroduction);
    } catch (error) {
      console.error('Error generating introduction:', error);
      setIntroductionDraft('Failed to generate introduction. Please try again.');
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
                {showIntroduction ? introductionDraft : 'Generating introduction...'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntroductionDraft;
