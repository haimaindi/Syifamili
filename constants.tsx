
import { FamilyMember } from './types';

export const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    relation: 'Father',
    birthDate: '1980-05-15',
    bloodType: 'O+',
    allergies: [{ id: 'a1', name: 'Kacang', reaction: 'Gatal parah dan pembengkakan' }],
    photoUrl: 'https://picsum.photos/seed/budi/200',
    isElderly: false,
    isChild: false
  },
  {
    id: '2',
    name: 'Siti Aminah',
    relation: 'Mother',
    birthDate: '1982-11-20',
    bloodType: 'A-',
    allergies: [{ id: 'a2', name: 'Debu', reaction: 'Bersin terus-menerus' }],
    photoUrl: 'https://picsum.photos/seed/siti/200',
    isElderly: false,
    isChild: false
  },
  {
    id: '3',
    name: 'Eyang Subur',
    relation: 'Grandparent',
    birthDate: '1945-01-01',
    bloodType: 'B+',
    allergies: [],
    photoUrl: 'https://picsum.photos/seed/eyang/200',
    isElderly: true,
    isChild: false
  },
  {
    id: '4',
    name: 'Baby Rizky',
    relation: 'Child',
    birthDate: '2024-01-10',
    bloodType: 'O+',
    allergies: [],
    photoUrl: 'https://picsum.photos/seed/rizky/200',
    isElderly: false,
    isChild: true
  }
];

export const VACCINATION_SCHEDULE_IDAI = [
  { age: 'Lahir', vaccines: ['Hepatitis B (HB-0)', 'Polio 0'] },
  { age: '1 Bulan', vaccines: ['BCG'] },
  { age: '2 Bulan', vaccines: ['DPT-HB-Hib 1', 'Polio 1', 'PCV 1', 'Rotavirus 1'] },
  { age: '3 Bulan', vaccines: ['DPT-HB-Hib 2', 'Polio 2', 'Rotavirus 2'] },
  { age: '4 Bulan', vaccines: ['DPT-HB-Hib 3', 'Polio 3 (IPV 1)', 'PCV 2', 'Rotavirus 3 (Pentavalen)'] },
  { age: '6 Bulan', vaccines: ['PCV 3', 'Influenza 1'] },
  { age: '9 Bulan', vaccines: ['MR 1'] },
  { age: '12 Bulan', vaccines: ['PCV 4 (Booster)', 'Varisela 1', 'Hepatitis A 1'] },
  { age: '15 Bulan', vaccines: ['DPT-HB-Hib 4 (Booster)'] },
  { age: '18 Bulan', vaccines: ['MR 2', 'Polio 4'] },
  { age: '24 Bulan', vaccines: ['Hepatitis A 2', 'Tifoid 1'] },
  { age: '5-7 Tahun', vaccines: ['MR 3', 'DT (Booster)', 'Polio 5'] },
  { age: '10-12 Tahun', vaccines: ['Td (Booster)', 'HPV 1', 'HPV 2 (setelah 6-12 bulan)'] },
  { age: '18 Tahun', vaccines: ['Td (Booster tiap 10 thn)'] }
];
