
export type Relation = 'Father' | 'Mother' | 'Child' | 'Grandparent' | 'Other';
export type Language = 'ID' | 'EN';

export interface AllergyDetail {
  id: string;
  name: string;
  reaction: string;
  photoUrl?: string;
}

export interface FileAttachment {
  url: string;
  name: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: Relation;
  birthDate: string;
  bloodType: string;
  allergies: AllergyDetail[];
  photoUrl: string;
  isElderly: boolean;
  isChild: boolean;
  nik?: string;
  insuranceNumber?: string;
  insuranceCardUrl?: string;
}

export interface MedicalRecord {
  id: string;
  memberId: string;
  title: string;
  dateTime: string;
  type: 'Lab' | 'Consultation' | 'Vaccination' | 'Prescription' | 'Clinical Photo' | 'Imaging' | 'Other';
  description: string;
  diagnosis?: string;
  saran?: string;
  obat?: string;
  doctorName?: string;
  facility?: string;
  files: FileAttachment[];
  // Vital Signs added
  temperature?: number;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  oxygen?: number;
}

export interface Appointment {
  id: string;
  memberId: string;
  title: string;
  dateTime: string;
  doctor: string;
  location: string;
  reminded: boolean;
}

export interface Medication {
  id: string;
  memberId: string;
  name: string;
  dosage: string;
  frequency: string; 
  instructions: string; 
  nextTime: string;
  active: boolean;
  fileUrl?: string;
  fileName?: string;
}

export interface HealthContact {
  id: string;
  name: string;
  type: 'Hospital' | 'Clinic' | 'Doctor' | 'Pharmacy';
  phone: string;
  address: string;
  gmapsUrl?: string;
}

export interface GrowthLog {
  id: string;
  memberId: string;
  dateTime: string;
  weight: number; 
  height: number; 
  headCircumference?: number; 
}

export interface VitalLog {
  id: string;
  memberId: string;
  dateTime: string;
  heartRate?: number;
  systolic?: number;
  diastolic?: number;
  temperature?: number;
  oxygen?: number;
}

export interface HomeCareEntry {
  id: string;
  dateTime: string;
  symptom: string;
  temperature?: number;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  oxygen?: number;
  note: string;
  files?: FileAttachment[];
}

export interface HomeCareLog {
  id: string;
  memberId: string;
  title: string;
  entries: HomeCareEntry[];
  active: boolean;
}

export interface CaregiverNote {
  id: string;
  memberId: string;
  date: string;
  dateTime: string;
  text: string;
  type: 'mobility' | 'diet' | 'sleep' | 'general';
}

export interface HealthInsight {
  title: string;
  content: string;
  source: 'AI' | 'WHO' | 'IDAI';
  type: 'info' | 'warning' | 'success';
}
