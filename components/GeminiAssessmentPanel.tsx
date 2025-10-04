import React, { useState, useCallback } from 'react';
import { Alert } from '../types';
import { GeminiService, isApiKeyConfigured } from '../services/GeminiService';

interface GeminiAssessmentPanelProps {
  selectedAlerts: Alert[];
}

const GeminiAssessmentPanel: React.FC<GeminiAssessmentPanelProps> = ({ selectedAlerts }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAssessment = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAssessment('');
    try {
      const result = await GeminiService.generateThreatAssessment(selectedAlerts);
      if (result.startsWith('Error:')) {
        setError(result);
      } else {
        setAssessment(result);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAlerts]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(assessment);
  };

  const renderContent = () => {
    if (!isApiKeyConfigured) {
      return <p className="text-slate-dark text-center">AI Service is not configured. Please provide an API key to enable this feature.</p>;
    }
    if (isLoading) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-cyan"></div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-alert-red">
          <p className="font-bold">Analysis Failed</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }
    if (assessment) {
      return (
        <>
          <div className="whitespace-pre-wrap text-slate-light text-sm prose">
            <p>{assessment}</p>
          </div>
          <button
            onClick={handleCopyText}
            className="absolute top-2 right-2 p-1.5 bg-navy-dark rounded-md text-slate-dark hover:text-accent-cyan"
            title="Copy to Clipboard"
            aria-label="Copy assessment to clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </>
      );
    }
    return <p className="text-slate-dark text-center">Your assessment will appear here.</p>;
  };

  return (
    <div className="bg-navy-light rounded-2xl shadow-lg p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold text-accent-cyan mb-2 flex-shrink-0">AI Threat Assessment</h3>
      <p className="text-sm text-slate-dark mb-4 flex-shrink-0">Select incidents from the log and generate an AI-powered analysis.</p>
      
      <button
        onClick={handleGenerateAssessment}
        disabled={isLoading || selectedAlerts.length === 0 || !isApiKeyConfigured}
        className="w-full bg-accent-cyan text-command-blue font-bold py-2 rounded-md hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
      >
        {isLoading ? 'Analyzing...' : `Generate Assessment (${selectedAlerts.length} selected)`}
      </button>

      <div className="mt-4 bg-command-blue rounded-lg p-4 flex-grow overflow-y-auto min-h-[200px] relative">
       {renderContent()}
      </div>
    </div>
  );
};

export default GeminiAssessmentPanel;