import React, { useState, useCallback } from 'react';
import { Alert } from '../types';
import { GeminiService, isApiKeyConfigured } from '../services/GeminiService';

interface AlertExplanationPanelProps {
  alert: Alert;
}

const AlertExplanationPanel: React.FC<AlertExplanationPanelProps> = ({ alert }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleExplain = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setExplanation('');
    try {
      const result = await GeminiService.explainAlert(alert);
      if (result.startsWith('Error:')) {
        setError(result);
      } else {
        setExplanation(result);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [alert]);

  if (!isApiKeyConfigured) {
    return null; // Don't render if AI is not configured
  }

  return (
    <div className="bg-navy-dark rounded-lg p-4 animate-fadeIn">
      <h4 className="text-lg font-bold text-accent-cyan mb-3">AI Analysis</h4>
      {!explanation && !isLoading && !error && (
         <button
            onClick={handleExplain}
            disabled={isLoading}
            className="w-full bg-accent-cyan/80 text-command-blue font-bold py-2 rounded-md hover:bg-accent-cyan disabled:opacity-50 transition-colors"
        >
            Explain this Alert
        </button>
      )}
      
      {isLoading && (
        <div className="flex items-center justify-center text-slate-dark">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-cyan mr-3"></div>
            <span>Analyzing...</span>
        </div>
      )}
      
      {(explanation || error) && (
        <div>
            {error && (
                <div className="text-alert-red text-sm">
                    <p className="font-bold">Analysis Failed</p>
                    <p>{error}</p>
                </div>
            )}
            {explanation && (
                <p className="whitespace-pre-wrap text-slate-light text-sm">{explanation}</p>
            )}
             <button
                onClick={() => {
                    setExplanation('');
                    setError(null);
                }}
                className="text-xs text-accent-cyan hover:underline mt-3"
            >
                Clear & Analyze Again
            </button>
        </div>
      )}
    </div>
  );
};

export default AlertExplanationPanel;
