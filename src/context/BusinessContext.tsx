import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { BusinessProfile, BusinessAssessment } from "../types/business";

interface BusinessContextValue {
  profile: BusinessProfile | null;
  assessment: BusinessAssessment | null;
  setProfile: (profile: BusinessProfile) => void;
  setAssessment: (assessment: BusinessAssessment) => void;
  clearAll: () => void;
}

const BusinessContext = createContext<BusinessContextValue | null>(null);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<BusinessProfile | null>(null);
  const [assessment, setAssessmentState] = useState<BusinessAssessment | null>(null);

  const setProfile = useCallback((p: BusinessProfile) => setProfileState(p), []);
  const setAssessment = useCallback((a: BusinessAssessment) => setAssessmentState(a), []);
  const clearAll = useCallback(() => {
    setProfileState(null);
    setAssessmentState(null);
  }, []);

  return (
    <BusinessContext.Provider value={{ profile, assessment, setProfile, setAssessment, clearAll }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessProfile(): BusinessContextValue {
  const ctx = useContext(BusinessContext);
  if (!ctx) {
    throw new Error("useBusinessProfile must be used within a <BusinessProvider>");
  }
  return ctx;
}
