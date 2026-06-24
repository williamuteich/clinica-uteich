import React from "react";

export interface BookingHeroProps {
  year: number;
}

export interface StepIndicatorProps {
  step: number;
}

export interface ErrorMessageAlertProps {
  message: string;
  showEmergency: boolean;
}

export interface StepOneProps {
  name: string;
  setName: (v: string) => void;
  phone: string;
  onChangePhone: (e: React.ChangeEvent<HTMLInputElement>) => void;
  serviceType: string;
  setServiceType: (v: string) => void;
  observation: string;
  setObservation: (v: string) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface StepTwoProps {
  minDate: string;
  selectedDate: string;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loadingSlots: boolean;
  availableTimeSlots: string[];
  selectedTime: string;
  setSelectedTime: (t: string) => void;
  onBack: () => void;
  submitting: boolean;
  onSubmit: () => void;
}
