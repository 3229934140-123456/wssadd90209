export interface Customer {
  id: string
  name: string
  gender: 'male' | 'female'
  age: number
  phone: string
  avatar: string
  allergyHistory: string[]
  medicalHistory: string[]
  lastVisitDate: string
  totalVisits: number
  notes: string
  createTime: string
}

export type InjectionProjectType = 'botox' | 'hyaluronic' | 'contour'

export interface InjectionProject {
  type: InjectionProjectType
  name: string
  description: string
}

export interface FacialPoint {
  id: string
  name: string
  area: string
  x: number
  y: number
  defaultDepth: 'superficial' | 'medium' | 'deep'
}

export interface InjectionRecordPoint {
  pointId: string
  pointName: string
  side: 'left' | 'right' | 'bilateral' | 'center'
  depth: 'superficial' | 'medium' | 'deep'
  needleCount: number
  singleDose: number
  totalDose: number
  color: string
}

export interface Medicine {
  id: string
  name: string
  brand: string
  batchNumber: string
  expiryDate: string
  specification: string
  totalDose: number
  usedDose: number
  remainingDose: number
  unit: string
  scanTime: string
  verified: boolean
  verifiedAt: string
}

export interface InjectionPhoto {
  id: string
  type: 'front' | 'side_left' | 'side_right' | 'oblique'
  url: string
  markers: PhotoMarker[]
  createTime: string
}

export interface PhotoMarker {
  id: string
  x: number
  y: number
  color: string
  label: string
}

export interface PostopReminder {
  id: string
  title: string
  content: string
  type: 'ice' | 'diet' | 'observe' | 'medication' | 'followup'
  time: string
  completed: boolean
}

export interface InjectionRecord {
  id: string
  customerId: string
  customerName: string
  projectType: InjectionProjectType
  projectName: string
  points: InjectionRecordPoint[]
  medicines: Medicine[]
  photos: InjectionPhoto[]
  abnormalNotes: string
  doctorSignature: string
  doctorName: string
  signatureTime: string
  postopReminders: PostopReminder[]
  status: 'draft' | 'confirmed' | 'completed'
  createTime: string
  updateTime: string
}

export interface FollowupRecord {
  id: string
  injectionRecordId: string
  customerId: string
  customerName: string
  followupDate: string
  absorptionRate: number
  supplementAreas: string[]
  comparisonPhotos: {
    oldPhotoUrl: string
    newPhotoUrl: string
  }[]
  notes: string
  nextFollowupDate: string
}

export interface ExportRecord {
  id: string
  customerId: string
  customerName: string
  injectionRecordId: string
  projectType: InjectionProjectType
  projectName: string
  injectionDate: string
  exportTime: string
  exportType: 'pdf' | 'image'
  status: 'pending' | 'success' | 'failed'
}

export interface ReceptionItem {
  id: string
  customerId: string
  customerName: string
  customerAvatar: string
  appointmentTime: string
  projectType: InjectionProjectType
  projectName: string
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled'
  nurseName: string
  roomNumber: string
}

export const INJECTION_PROJECTS: InjectionProject[] = [
  { type: 'botox', name: '肉毒除皱', description: '改善动态皱纹，如额纹、鱼尾纹、眉间纹等' },
  { type: 'hyaluronic', name: '玻尿酸填充', description: '填充凹陷部位，如苹果肌、太阳穴、下巴等' },
  { type: 'contour', name: '轮廓固定', description: '塑造面部轮廓，提升紧致，改善松弛' }
]

export const FACIAL_POINTS_CONFIG: Record<string, FacialPoint[]> = {
  botox: [
    { id: 'forehead_center', name: '额纹中央', area: '额部', x: 50, y: 20, defaultDepth: 'medium' },
    { id: 'forehead_left', name: '额纹左侧', area: '额部', x: 35, y: 22, defaultDepth: 'medium' },
    { id: 'forehead_right', name: '额纹右侧', area: '额部', x: 65, y: 22, defaultDepth: 'medium' },
    { id: 'glabella', name: '眉间纹', area: '眉间', x: 50, y: 28, defaultDepth: 'medium' },
    { id: 'crow_left', name: '左侧鱼尾纹', area: '眼周', x: 25, y: 35, defaultDepth: 'superficial' },
    { id: 'crow_right', name: '右侧鱼尾纹', area: '眼周', x: 75, y: 35, defaultDepth: 'superficial' },
    { id: 'bunny_left', name: '左侧鼻背纹', area: '鼻部', x: 40, y: 42, defaultDepth: 'superficial' },
    { id: 'bunny_right', name: '右侧鼻背纹', area: '鼻部', x: 60, y: 42, defaultDepth: 'superficial' },
    { id: 'orbicularis_oris', name: '口周纹', area: '口周', x: 50, y: 65, defaultDepth: 'superficial' },
    { id: 'mentalis', name: '颏肌', area: '下颌', x: 50, y: 80, defaultDepth: 'medium' }
  ],
  hyaluronic: [
    { id: 'temple_left', name: '左侧太阳穴', area: '颞部', x: 20, y: 30, defaultDepth: 'deep' },
    { id: 'temple_right', name: '右侧太阳穴', area: '颞部', x: 80, y: 30, defaultDepth: 'deep' },
    { id: 'cheek_left', name: '左侧苹果肌', area: '颊部', x: 30, y: 48, defaultDepth: 'deep' },
    { id: 'cheek_right', name: '右侧苹果肌', area: '颊部', x: 70, y: 48, defaultDepth: 'deep' },
    { id: 'nasolabial_left', name: '左侧鼻唇沟', area: '鼻周', x: 40, y: 58, defaultDepth: 'medium' },
    { id: 'nasolabial_right', name: '右侧鼻唇沟', area: '鼻周', x: 60, y: 58, defaultDepth: 'medium' },
    { id: 'lip_upper', name: '上唇', area: '唇部', x: 50, y: 62, defaultDepth: 'medium' },
    { id: 'lip_lower', name: '下唇', area: '唇部', x: 50, y: 68, defaultDepth: 'medium' },
    { id: 'chin', name: '下巴', area: '下颌', x: 50, y: 82, defaultDepth: 'deep' },
    { id: 'jawline_left', name: '左侧下颌缘', area: '下颌', x: 30, y: 75, defaultDepth: 'deep' },
    { id: 'jawline_right', name: '右侧下颌缘', area: '下颌', x: 70, y: 75, defaultDepth: 'deep' }
  ],
  contour: [
    { id: 'brow_left', name: '左侧眉弓', area: '眉部', x: 35, y: 28, defaultDepth: 'deep' },
    { id: 'brow_right', name: '右侧眉弓', area: '眉部', x: 65, y: 28, defaultDepth: 'deep' },
    { id: 'malar_left', name: '左侧颧弓', area: '颊部', x: 28, y: 45, defaultDepth: 'deep' },
    { id: 'malar_right', name: '右侧颧弓', area: '颊部', x: 72, y: 45, defaultDepth: 'deep' },
    { id: 'nasal_base', name: '鼻基底', area: '鼻周', x: 50, y: 55, defaultDepth: 'deep' },
    { id: 'chin_projection', name: '下巴前突', area: '下颌', x: 50, y: 85, defaultDepth: 'deep' },
    { id: 'mandible_left', name: '左侧下颌角', area: '下颌', x: 25, y: 78, defaultDepth: 'deep' },
    { id: 'mandible_right', name: '右侧下颌角', area: '下颌', x: 75, y: 78, defaultDepth: 'deep' }
  ]
}

export const POINT_COLORS = ['#FF4D4F', '#1890FF', '#722ED1', '#FA8C16', '#52C41A']

export const DEPTH_OPTIONS = [
  { value: 'superficial', label: '浅层' },
  { value: 'medium', label: '中层' },
  { value: 'deep', label: '深层' }
]

export const SIDE_OPTIONS = [
  { value: 'left', label: '左侧' },
  { value: 'right', label: '右侧' },
  { value: 'bilateral', label: '双侧' },
  { value: 'center', label: '中央' }
]
