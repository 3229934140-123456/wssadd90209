import type { InjectionRecord, PostopReminder, FollowupRecord, ExportRecord } from '@/types'

export const mockInjectionRecords: InjectionRecord[] = [
  {
    id: 'inj_20260615_001',
    customerId: 'cust_001',
    customerName: '张女士',
    projectType: 'botox',
    projectName: '肉毒除皱',
    points: [
      {
        pointId: 'forehead_center',
        pointName: '额纹中央',
        side: 'center',
        depth: 'medium',
        needleCount: 3,
        singleDose: 4,
        totalDose: 12,
        color: '#FF4D4F'
      },
      {
        pointId: 'crow_left',
        pointName: '左侧鱼尾纹',
        side: 'left',
        depth: 'superficial',
        needleCount: 3,
        singleDose: 3,
        totalDose: 9,
        color: '#1890FF'
      },
      {
        pointId: 'crow_right',
        pointName: '右侧鱼尾纹',
        side: 'right',
        depth: 'superficial',
        needleCount: 3,
        singleDose: 3,
        totalDose: 9,
        color: '#1890FF'
      },
      {
        pointId: 'glabella',
        pointName: '眉间纹',
        side: 'center',
        depth: 'medium',
        needleCount: 4,
        singleDose: 5,
        totalDose: 20,
        color: '#722ED1'
      }
    ],
    medicines: [
      {
        id: 'med_001',
        name: '保妥适',
        brand: 'Allergan',
        batchNumber: 'B202601001',
        expiryDate: '2027-01-15',
        specification: '100U/瓶',
        totalDose: 100,
        usedDose: 50,
        remainingDose: 50,
        unit: 'U',
        scanTime: '2026-06-15T09:05:00Z',
        verified: true,
        verifiedAt: '2026-06-15T09:05:30Z'
      }
    ],
    photos: [
      {
        id: 'photo_001',
        type: 'front',
        url: 'https://picsum.photos/id/64/600/800',
        markers: [
          { id: 'm1', x: 50, y: 20, color: '#FF4D4F', label: '额纹' },
          { id: 'm2', x: 50, y: 28, color: '#722ED1', label: '眉间' }
        ],
        createTime: '2026-06-15T09:10:00Z'
      },
      {
        id: 'photo_002',
        type: 'side_left',
        url: 'https://picsum.photos/id/91/600/800',
        markers: [
          { id: 'm3', x: 25, y: 35, color: '#1890FF', label: '鱼尾纹' }
        ],
        createTime: '2026-06-15T09:11:00Z'
      }
    ],
    abnormalNotes: '客户注射后略有头晕，休息15分钟后缓解',
    doctorSignature: 'doctor_sign_001',
    doctorName: '王医生',
    signatureTime: '2026-06-15T09:30:00Z',
    postopReminders: [
      { id: 'rem_001', title: '冰敷护理', content: '注射后48小时内间断冰敷，每次15分钟', type: 'ice', time: '2026-06-15', completed: true },
      { id: 'rem_002', title: '饮食禁忌', content: '一周内避免辛辣、海鲜、酒精等刺激性食物', type: 'diet', time: '2026-06-22', completed: false },
      { id: 'rem_003', title: '复诊观察', content: '术后2周复诊，观察效果及是否需要补量', type: 'followup', time: '2026-06-29', completed: false }
    ],
    status: 'completed',
    createTime: '2026-06-15T09:00:00Z',
    updateTime: '2026-06-15T09:30:00Z',
    timelineNotes: [
      {
        id: 'note_001',
        nodeType: 'medicine',
        nodeTime: '2026-06-15T09:05:30Z',
        note: '药品批号核验异常，联系药房确认后手动确认通过，批号B202601001外包装略有磨损但内容物无异常',
        nurseName: '操作护士',
        createTime: '2026-06-15T09:06:15Z'
      },
      {
        id: 'note_002',
        nodeType: 'photo',
        nodeTime: '2026-06-15T09:10:00Z',
        note: '拍照时客户头部略向左侧偏斜，已手动调整体位后重拍，正面照和左侧面照均已重新采集',
        nurseName: '操作护士',
        createTime: '2026-06-15T09:12:30Z'
      }
    ]
  },
  {
    id: 'inj_20260610_001',
    customerId: 'cust_002',
    customerName: '李女士',
    projectType: 'hyaluronic',
    projectName: '玻尿酸填充',
    points: [
      {
        pointId: 'cheek_left',
        pointName: '左侧苹果肌',
        side: 'left',
        depth: 'deep',
        needleCount: 1,
        singleDose: 1,
        totalDose: 1,
        color: '#FF4D4F'
      },
      {
        pointId: 'cheek_right',
        pointName: '右侧苹果肌',
        side: 'right',
        depth: 'deep',
        needleCount: 1,
        singleDose: 1,
        totalDose: 1,
        color: '#FF4D4F'
      }
    ],
    medicines: [
      {
        id: 'med_002',
        name: '乔雅登雅致',
        brand: 'Allergan',
        batchNumber: 'H202602015',
        expiryDate: '2028-02-20',
        specification: '1ml/支',
        totalDose: 2,
        usedDose: 2,
        remainingDose: 0,
        unit: 'ml',
        scanTime: '2026-06-10T10:15:00Z',
        verified: true,
        verifiedAt: '2026-06-10T10:15:30Z'
      }
    ],
    photos: [
      {
        id: 'photo_003',
        type: 'front',
        url: 'https://picsum.photos/id/177/600/800',
        markers: [],
        createTime: '2026-06-10T10:20:00Z'
      }
    ],
    abnormalNotes: '',
    doctorSignature: 'doctor_sign_002',
    doctorName: '李医生',
    signatureTime: '2026-06-10T10:45:00Z',
    postopReminders: [
      { id: 'rem_004', title: '冰敷护理', content: '注射后48小时内间断冰敷', type: 'ice', time: '2026-06-10', completed: true },
      { id: 'rem_005', title: '避免按摩', content: '两周内避免按摩注射部位', type: 'observe', time: '2026-06-24', completed: false }
    ],
    status: 'completed',
    createTime: '2026-06-10T10:00:00Z',
    updateTime: '2026-06-10T10:45:00Z',
    timelineNotes: []
  },
  {
    id: 'inj_20260528_001',
    customerId: 'cust_003',
    customerName: '王女士',
    projectType: 'botox',
    projectName: '肉毒除皱',
    points: [
      {
        pointId: 'forehead_center',
        pointName: '额纹中央',
        side: 'center',
        depth: 'medium',
        needleCount: 4,
        singleDose: 5,
        totalDose: 20,
        color: '#FF4D4F'
      }
    ],
    medicines: [
      {
        id: 'med_003',
        name: '衡力',
        brand: '兰州生物',
        batchNumber: 'B202603008',
        expiryDate: '2027-03-10',
        specification: '100U/瓶',
        totalDose: 100,
        usedDose: 20,
        remainingDose: 80,
        unit: 'U',
        scanTime: '2026-05-28T14:20:00Z',
        verified: true,
        verifiedAt: '2026-05-28T14:20:30Z'
      }
    ],
    photos: [],
    abnormalNotes: '',
    doctorSignature: 'doctor_sign_003',
    doctorName: '王医生',
    signatureTime: '2026-05-28T14:45:00Z',
    postopReminders: [],
    status: 'completed',
    createTime: '2026-05-28T14:00:00Z',
    updateTime: '2026-05-28T14:45:00Z',
    timelineNotes: []
  }
]

export const mockFollowupRecords: FollowupRecord[] = [
  {
    id: 'foll_001',
    injectionRecordId: 'inj_20260615_001',
    customerId: 'cust_001',
    customerName: '张女士',
    followupDate: '2026-06-22',
    absorptionRate: 15,
    satisfactionScore: 4,
    effectLevel: 'good',
    needsFollowup: true,
    supplementAreas: ['左侧鱼尾纹', '右侧鱼尾纹'],
    comparisonPhotos: [
      {
        oldPhotoUrl: 'https://picsum.photos/id/64/600/800',
        newPhotoUrl: 'https://picsum.photos/seed/followup_new_1/600/800'
      }
    ],
    notes: '客户反馈效果良好，额纹基本平复，鱼尾纹略有残留，建议3个月后补量',
    nextFollowupDate: '2026-09-22',
    savedComparisons: []
  },
  {
    id: 'foll_002',
    injectionRecordId: 'inj_20260610_001',
    customerId: 'cust_002',
    customerName: '李女士',
    followupDate: '2026-06-20',
    absorptionRate: 20,
    satisfactionScore: 3,
    effectLevel: 'fair',
    needsFollowup: true,
    supplementAreas: ['左侧苹果肌'],
    comparisonPhotos: [
      {
        oldPhotoUrl: 'https://picsum.photos/id/177/600/800',
        newPhotoUrl: 'https://picsum.photos/seed/followup_new_2/600/800'
      }
    ],
    notes: '苹果肌填充效果自然，左侧略有吸收，建议1个月后复诊评估是否补量',
    nextFollowupDate: '2026-07-20',
    savedComparisons: []
  },
  {
    id: 'foll_003',
    injectionRecordId: 'inj_20260528_001',
    customerId: 'cust_003',
    customerName: '王女士',
    followupDate: '2026-06-18',
    absorptionRate: 25,
    satisfactionScore: 5,
    effectLevel: 'excellent',
    needsFollowup: false,
    supplementAreas: [],
    comparisonPhotos: [
      {
        oldPhotoUrl: 'https://picsum.photos/id/65/600/800',
        newPhotoUrl: 'https://picsum.photos/seed/followup_new_3/600/800'
      }
    ],
    notes: '额纹改善明显，客户满意，暂无补量需求，建议半年后再次治疗',
    nextFollowupDate: '2026-12-18',
    savedComparisons: []
  }
]

export const mockExportRecords: ExportRecord[] = [
  {
    id: 'exp_001',
    customerId: 'cust_001',
    customerName: '张女士',
    injectionRecordId: 'inj_20260615_001',
    projectType: 'botox',
    projectName: '肉毒除皱',
    injectionDate: '2026-06-15T09:00:00Z',
    exportTime: '2026-06-15T10:00:00Z',
    exportType: 'pdf',
    status: 'success',
    exportScope: 'full'
  },
  {
    id: 'exp_002',
    customerId: 'cust_002',
    customerName: '李女士',
    injectionRecordId: 'inj_20260610_001',
    projectType: 'hyaluronic',
    projectName: '玻尿酸填充',
    injectionDate: '2026-06-10T10:00:00Z',
    exportTime: '2026-06-10T11:00:00Z',
    exportType: 'pdf',
    status: 'success',
    exportScope: 'points_only'
  }
]
