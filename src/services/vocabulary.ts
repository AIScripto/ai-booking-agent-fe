import { useState, useEffect } from 'react';
import { api } from './api';

export interface IndustryVocabulary {
  resourceLabel: string;
  customerLabel: string;
  serviceLabel: string;
  statusInProgress: string;
}

export function useVocabulary() {
  const [vocabulary, setVocabulary] = useState<IndustryVocabulary>({
    resourceLabel: 'Doctor / Specialist',
    customerLabel: 'Patient',
    serviceLabel: 'Consultation',
    statusInProgress: 'In Consultation',
  });
  const [industry, setIndustry] = useState<string>('HEALTHCARE');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api
      .getVocabulary()
      .then((data) => {
        setVocabulary(data.vocabulary);
        setIndustry(data.industry);
      })
      // Falls back to the healthcare defaults above so the UI still renders
      // readable labels when the tenant lookup fails.
      .catch((err) => console.error('[useVocabulary] Error fetching vocabulary:', err))
      .finally(() => setLoading(false));
  }, []);

  return { vocabulary, industry, loading };
}
