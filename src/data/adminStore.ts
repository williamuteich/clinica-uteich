// Admin data types and localStorage-based persistence

export interface Patient {
  id: string;
  cpf: string;
  name: string;
  birthDate: string;
  phone: string;
  cep: string;
  state: string;
  city: string;
  street: string;
  number: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  procedures: string;
  notes: string;
  professional: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  date: string;
  time: string;
  reason: string;
  status: "agendado" | "confirmado" | "cancelado" | "concluido";
}

export interface Attendance {
  id: string;
  patientId: string;
  date: string;
  time: string;
  procedures: { name: string; value: number }[];
  totalValue: number;
  notes: string;
}

const KEYS = {
  patients: "admin_patients",
  records: "admin_records",
  appointments: "admin_appointments",
  attendances: "admin_attendances",
};

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Patients
export const getPatients = () => load<Patient>(KEYS.patients);
export const savePatient = (p: Omit<Patient, "id" | "createdAt" | "updatedAt">) => {
  const patients = getPatients();
  const now = new Date().toISOString();
  const patient: Patient = { ...p, id: genId(), createdAt: now, updatedAt: now };
  patients.push(patient);
  save(KEYS.patients, patients);
  return patient;
};
export const updatePatient = (id: string, data: Partial<Patient>) => {
  const patients = getPatients();
  const idx = patients.findIndex((p) => p.id === id);
  if (idx >= 0) {
    patients[idx] = { ...patients[idx], ...data, updatedAt: new Date().toISOString() };
    save(KEYS.patients, patients);
  }
  return patients[idx];
};
export const deletePatient = (id: string) => {
  save(KEYS.patients, getPatients().filter((p) => p.id !== id));
};

// Medical Records
export const getRecords = () => load<MedicalRecord>(KEYS.records);
export const getRecordsByPatient = (patientId: string) =>
  getRecords().filter((r) => r.patientId === patientId);
export const saveRecord = (r: Omit<MedicalRecord, "id">) => {
  const records = getRecords();
  const record: MedicalRecord = { ...r, id: genId() };
  records.push(record);
  save(KEYS.records, records);
  return record;
};

// Appointments
export const getAppointments = () => load<Appointment>(KEYS.appointments);
export const saveAppointment = (a: Omit<Appointment, "id">) => {
  const appointments = getAppointments();
  const appointment: Appointment = { ...a, id: genId() };
  appointments.push(appointment);
  save(KEYS.appointments, appointments);
  return appointment;
};
export const updateAppointment = (id: string, data: Partial<Appointment>) => {
  const appointments = getAppointments();
  const idx = appointments.findIndex((a) => a.id === id);
  if (idx >= 0) {
    appointments[idx] = { ...appointments[idx], ...data };
    save(KEYS.appointments, appointments);
  }
  return appointments[idx];
};
export const deleteAppointment = (id: string) => {
  save(KEYS.appointments, getAppointments().filter((a) => a.id !== id));
};

// Attendances
export const getAttendances = () => load<Attendance>(KEYS.attendances);
export const saveAttendance = (a: Omit<Attendance, "id">) => {
  const attendances = getAttendances();
  const attendance: Attendance = { ...a, id: genId() };
  attendances.push(attendance);
  save(KEYS.attendances, attendances);
  return attendance;
};
