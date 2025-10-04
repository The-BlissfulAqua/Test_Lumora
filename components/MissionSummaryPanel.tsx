import React, { useState, useCallback } from 'react';
import { Alert } from '../types';
import { GeminiService, isApiKeyConfigured } from '../services/GeminiService';

interface MissionSummaryPanelProps {
  alert: Alert;
}

const MissionSummaryPanel: React.FC<MissionSummaryPanelProps> = ({ alert }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSummary('');
    try {
      const result = await GeminiService.summarizeEvidence(alert);
       if (result.startsWith('Error:')) {
        setError(result);
      } else {
        setSummary(result);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [alert]);

  if (!isApiKeyConfigured) {
    return null;
  }

  return (
    <div className="bg-navy-dark rounded-lg p-4 animate-fadeIn">
      <h4 className="text-lg font-bold text-accent-cyan mb-3">AI Mission Summary</h4>
      
      <button
        onClick={handleSummarize}
        disabled={isLoading}
        className="w-full bg-accent-cyan text-command-blue font-bold py-2 rounded-md hover:bg-opacity-80 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Generating Summary...' : 'Generate Mission Summary'}
      </button>

       <div className="mt-3 bg-command-blue rounded-lg p-3 min-h-[100px] text-sm">
         {isLoading && (
            <div className="flex items-center justify-center text-slate-dark h-full">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-cyan mr-3"></div>
                <span>Summarizing...</span>
            </div>
         )}
         {error && (
            <div className="text-alert-red">
                <p className="font-bold">Summary Failed</p>
                <p>{error}</p>
            </div>
         )}
         {summary && <p className="whitespace-pre-wrap text-slate-light">{summary}</p>}
         {!isLoading && !error && !summary && <p className="text-slate-dark">Mission summary will appear here.</p>}
      </div>
    </div>
  );
};

export default MissionSummaryPanel;
