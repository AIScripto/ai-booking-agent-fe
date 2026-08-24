import { useState, useEffect } from 'react';

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
    const tenantId = localStorage.getItem('tenant_id') || '9eb441c7-f788-4137-8043-d4d7c3080879';
    fetch(`http://localhost:5000/api/v1/tenant/vocabulary?tenant_id=${tenantId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 'success' && res.data) {
          setVocabulary(res.data.vocabulary);
          setIndustry(res.data.industry);
        }
      })
      .catch((err) => console.error('[useVocabulary] Error fetching vocabulary:', err))
      .finally(() => setLoading(false));
  }, []);

  return { vocabulary, industry, loading };
}
