import { create } from 'zustand'
import type {
  Customer,
  InjectionRecord,
  InjectionProjectType,
  InjectionRecordPoint,
  Medicine,
  InjectionPhoto,
  PostopReminder,
  ReceptionItem,
  FollowupRecord,
  ExportRecord,
  TimelineNote
} from '@/types'

interface AppState {
  currentCustomer: Customer | null
  currentInjection: InjectionRecord | null
  customers: Customer[]
  receptionList: ReceptionItem[]
  injectionRecords: InjectionRecord[]
  followupRecords: FollowupRecord[]
  exportRecords: ExportRecord[]
  medicines: Medicine[]
  setCurrentCustomer: (customer: Customer | null) => void
  setCurrentInjection: (injection: InjectionRecord | null) => void
  initInjection: (customerId: string, customerName: string, projectType: InjectionProjectType, projectName: string) => void
  addInjectionPoint: (point: InjectionRecordPoint) => void
  removeInjectionPoint: (pointId: string) => void
  updateInjectionPoint: (pointId: string, updates: Partial<InjectionRecordPoint>) => void
  addMedicine: (medicine: Medicine) => void
  removeMedicine: (medicineId: string) => void
  updateMedicine: (medicineId: string, updates: Partial<Medicine>) => void
  setMedicines: (medicines: Medicine[]) => void
  addPhoto: (photo: InjectionPhoto) => void
  setAbnormalNotes: (notes: string) => void
  setDoctorName: (doctorName: string) => void
  setDoctorSignature: (signature: string, signatureTime: Date) => void
  setPostopReminders: (reminders: PostopReminder[]) => void
  confirmInjection: () => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (customer: Customer) => void
  setCustomers: (customers: Customer[]) => void
  setReceptionList: (list: ReceptionItem[]) => void
  updateReceptionStatus: (id: string, status: ReceptionItem['status']) => void
  setInjectionRecords: (records: InjectionRecord[]) => void
  setFollowupRecords: (records: FollowupRecord[]) => void
  setExportRecords: (records: ExportRecord[]) => void
  addExportRecord: (record: ExportRecord) => void
  addTimelineNote: (recordId: string, note: Omit<TimelineNote, 'id' | 'createTime'>) => void
  updateTimelineNote: (recordId: string, noteId: string, updates: Partial<TimelineNote>) => void
  deleteTimelineNote: (recordId: string, noteId: string) => void
  syncCurrentToRecords: () => void
  clearCurrent: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  currentCustomer: null,
  currentInjection: null,
  customers: [],
  receptionList: [],
  injectionRecords: [],
  followupRecords: [],
  exportRecords: [],
  medicines: [],

  setCurrentCustomer: (customer) => set({ currentCustomer: customer }),

  setCurrentInjection: (injection) => set({ currentInjection: injection }),

  initInjection: (customerId, customerName, projectType, projectName) => {
    const newInjection: InjectionRecord = {
      id: `inj_${Date.now()}`,
      customerId,
      customerName,
      projectType,
      projectName,
      points: [],
      medicines: [],
      photos: [],
      abnormalNotes: '',
      doctorSignature: '',
      doctorName: '',
      signatureTime: '',
      postopReminders: [],
      timelineNotes: [],
      status: 'draft',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
    console.log('[Store] Initialized injection record:', newInjection.id)
    set({ currentInjection: newInjection })
  },

  addInjectionPoint: (point) => {
    const { currentInjection } = get()
    if (!currentInjection) return
    const updated = {
      ...currentInjection,
      points: [...currentInjection.points, point],
      updateTime: new Date().toISOString()
    }
    console.log('[Store] Added injection point:', point.pointName)
    set({ currentInjection: updated })
  },

  removeInjectionPoint: (pointId) => {
    const { currentInjection } = get()
    if (!currentInjection) return
    const updated = {
      ...currentInjection,
      points: currentInjection.points.filter(p => p.pointId !== pointId),
      updateTime: new Date().toISOString()
    }
    console.log('[Store] Removed injection point:', pointId)
    set({ currentInjection: updated })
  },

  updateInjectionPoint: (pointId, updates) => {
    const { currentInjection } = get()
    if (!currentInjection) return
    const updated = {
      ...currentInjection,
      points: currentInjection.points.map(p =>
        p.pointId === pointId ? { ...p, ...updates } : p
      ),
      updateTime: new Date().toISOString()
    }
    console.log('[Store] Updated injection point:', pointId)
    set({ currentInjection: updated })
  },

  addMedicine: (medicine) => {
    const { currentInjection } = get()
    if (!currentInjection) return
    const updated = {
      ...currentInjection,
      medicines: [...currentInjection.medicines, medicine],
      updateTime: new Date().toISOString()
    }
    console.log('[Store] Added medicine:', medicine.name)
    set({ currentInjection: updated })
  },

  removeMedicine: (medicineId) => {
    const { currentInjection } = get()
    if (!currentInjection) return
    const updated = {
      ...currentInjection,
      medicines: currentInjection.medicines.filter(m => m.id !== medicineId),
      updateTime: new Date().toISOString()
    }
    console.log('[Store] Removed medicine:', medicineId)
    set({ currentInjection: updated })
  },

  updateMedicine: (medicineId, updates) => {
    const { currentInjection, medicines } = get()
    if (currentInjection) {
      const updated = {
        ...currentInjection,
        medicines: currentInjection.medicines.map(m => {
          if (m.id === medicineId) {
            const merged = { ...m, ...updates }
            if (updates.usedDose !== undefined) {
              merged.remainingDose = merged.totalDose - merged.usedDose
            }
            return merged
          }
          return m
        }),
        updateTime: new Date().toISOString()
      }
      console.log('[Store] Updated medicine in injection:', medicineId)
      set({ currentInjection: updated })
    }
    const updatedMedicines = medicines.map(m => {
      if (m.id === medicineId) {
        const merged = { ...m, ...updates }
        if (updates.usedDose !== undefined) {
          merged.remainingDose = merged.totalDose - merged.usedDose
        }
        return merged
      }
      return m
    })
    console.log('[Store] Updated medicine globally:', medicineId)
    set({ medicines: updatedMedicines })
  },

  setMedicines: (meds) => {
    console.log('[Store] Set medicines:', meds.length)
    set({ medicines: meds })
  },

  addPhoto: (photo) => {
    const { currentInjection } = get()
    if (!currentInjection) return
    const updated = {
      ...currentInjection,
      photos: [...currentInjection.photos, photo],
      updateTime: new Date().toISOString()
    }
    console.log('[Store] Added photo:', photo.type)
    set({ currentInjection: updated })
  },

  setAbnormalNotes: (notes) => {
    const { currentInjection } = get()
    if (!currentInjection) return
    const updated = {
      ...currentInjection,
      abnormalNotes: notes,
      updateTime: new Date().toISOString()
    }
    set({ currentInjection: updated })
  },

  setDoctorName: (doctorName) => {
    const { currentInjection } = get()
    if (!currentInjection) return
    const updated = {
      ...currentInjection,
      doctorName,
      updateTime: new Date().toISOString()
    }
    console.log('[Store] Set doctor name:', doctorName)
    set({ currentInjection: updated })
  },

  setDoctorSignature: (signature, signatureTime) => {
    const { currentInjection } = get()
    if (!currentInjection) return
    const updated = {
      ...currentInjection,
      doctorSignature: signature,
      signatureTime: signatureTime.toISOString(),
      status: 'completed',
      updateTime: new Date().toISOString()
    }
    console.log('[Store] Doctor signature completed')
    set({ currentInjection: updated })
  },

  setPostopReminders: (reminders) => {
    const { currentInjection } = get()
    if (!currentInjection) return
    const updated = {
      ...currentInjection,
      postopReminders: reminders,
      updateTime: new Date().toISOString()
    }
    set({ currentInjection: updated })
  },

  confirmInjection: () => {
    const { currentInjection, injectionRecords } = get()
    if (!currentInjection) return
    const finalRecord = {
      ...currentInjection,
      status: 'completed' as const,
      updateTime: new Date().toISOString()
    }
    console.log('[Store] Injection record confirmed:', finalRecord.id)
    set({
      currentInjection: finalRecord,
      injectionRecords: [finalRecord, ...injectionRecords]
    })
  },

  addCustomer: (customer) => {
    const { customers } = get()
    set({ customers: [customer, ...customers] })
    console.log('[Store] Added customer:', customer.name)
  },

  updateCustomer: (customer) => {
    const { customers } = get()
    set({
      customers: customers.map(c => c.id === customer.id ? customer : c)
    })
  },

  setCustomers: (customers) => set({ customers }),

  setReceptionList: (list) => set({ receptionList: list }),

  updateReceptionStatus: (id, status) => {
    const { receptionList } = get()
    set({
      receptionList: receptionList.map(r =>
        r.id === id ? { ...r, status } : r
      )
    })
  },

  setInjectionRecords: (records) => set({ injectionRecords: records }),

  setFollowupRecords: (records) => set({ followupRecords: records }),

  setExportRecords: (records) => set({ exportRecords: records }),

  addExportRecord: (record) => {
    const { exportRecords } = get()
    set({ exportRecords: [record, ...exportRecords] })
    console.log('[Store] Added export record:', record.id)
  },

  addTimelineNote: (recordId, note) => {
    const { currentInjection, injectionRecords } = get()
    const newNote: TimelineNote = {
      ...note,
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createTime: new Date().toISOString()
    }
    let updatedCurrent = currentInjection
    if (currentInjection && currentInjection.id === recordId) {
      updatedCurrent = {
        ...currentInjection,
        timelineNotes: [...currentInjection.timelineNotes, newNote],
        updateTime: new Date().toISOString()
      }
    }
    const updatedRecords = injectionRecords.map(r =>
      r.id === recordId
        ? { ...r, timelineNotes: [...r.timelineNotes, newNote], updateTime: new Date().toISOString() }
        : r
    )
    console.log('[Store] Added timeline note to record:', recordId)
    set({ currentInjection: updatedCurrent, injectionRecords: updatedRecords })
  },

  updateTimelineNote: (recordId, noteId, updates) => {
    const { currentInjection, injectionRecords } = get()
    let updatedCurrent = currentInjection
    if (currentInjection && currentInjection.id === recordId) {
      updatedCurrent = {
        ...currentInjection,
        timelineNotes: currentInjection.timelineNotes.map(n =>
          n.id === noteId ? { ...n, ...updates } : n
        ),
        updateTime: new Date().toISOString()
      }
    }
    const updatedRecords = injectionRecords.map(r =>
      r.id === recordId
        ? {
            ...r,
            timelineNotes: r.timelineNotes.map(n =>
              n.id === noteId ? { ...n, ...updates } : n
            ),
            updateTime: new Date().toISOString()
          }
        : r
    )
    console.log('[Store] Updated timeline note:', noteId, 'in record:', recordId)
    set({ currentInjection: updatedCurrent, injectionRecords: updatedRecords })
  },

  deleteTimelineNote: (recordId, noteId) => {
    const { currentInjection, injectionRecords } = get()
    let updatedCurrent = currentInjection
    if (currentInjection && currentInjection.id === recordId) {
      updatedCurrent = {
        ...currentInjection,
        timelineNotes: currentInjection.timelineNotes.filter(n => n.id !== noteId),
        updateTime: new Date().toISOString()
      }
    }
    const updatedRecords = injectionRecords.map(r =>
      r.id === recordId
        ? {
            ...r,
            timelineNotes: r.timelineNotes.filter(n => n.id !== noteId),
            updateTime: new Date().toISOString()
          }
        : r
    )
    console.log('[Store] Deleted timeline note:', noteId, 'from record:', recordId)
    set({ currentInjection: updatedCurrent, injectionRecords: updatedRecords })
  },

  syncCurrentToRecords: () => {
    const { currentInjection, injectionRecords } = get()
    if (!currentInjection) return
    const idx = injectionRecords.findIndex(r => r.id === currentInjection.id)
    const updated = idx >= 0
      ? injectionRecords.map(r => r.id === currentInjection.id ? { ...currentInjection } : r)
      : [{ ...currentInjection }, ...injectionRecords]
    console.log('[Store] Synced current to records:', currentInjection.id, idx >= 0 ? 'updated' : 'added')
    set({ injectionRecords: updated })
  },

  clearCurrent: () => set({
    currentCustomer: null,
    currentInjection: null
  })
}))
