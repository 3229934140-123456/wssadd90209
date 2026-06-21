import type { ReceptionItem } from '@/types'

export const mockReceptionList: ReceptionItem[] = [
  {
    id: 'rec_001',
    customerId: 'cust_001',
    customerName: '张女士',
    customerAvatar: 'https://picsum.photos/id/64/200/200',
    appointmentTime: '2026-06-22 09:00',
    projectType: 'botox',
    projectName: '肉毒除皱',
    status: 'in_progress',
    nurseName: '李护士',
    roomNumber: '手术室1'
  },
  {
    id: 'rec_002',
    customerId: 'cust_002',
    customerName: '李女士',
    customerAvatar: 'https://picsum.photos/id/91/200/200',
    appointmentTime: '2026-06-22 09:30',
    projectType: 'hyaluronic',
    projectName: '玻尿酸填充',
    status: 'waiting',
    nurseName: '王护士',
    roomNumber: '手术室2'
  },
  {
    id: 'rec_003',
    customerId: 'cust_010',
    customerName: '郑女士',
    customerAvatar: 'https://picsum.photos/id/1027/200/200',
    appointmentTime: '2026-06-22 10:00',
    projectType: 'contour',
    projectName: '轮廓固定',
    status: 'waiting',
    nurseName: '李护士',
    roomNumber: '手术室1'
  },
  {
    id: 'rec_004',
    customerId: 'cust_003',
    customerName: '王女士',
    customerAvatar: 'https://picsum.photos/id/177/200/200',
    appointmentTime: '2026-06-22 10:30',
    projectType: 'botox',
    projectName: '肉毒除皱',
    status: 'completed',
    nurseName: '张护士',
    roomNumber: '手术室3'
  },
  {
    id: 'rec_005',
    customerId: 'cust_006',
    customerName: '赵女士',
    customerAvatar: 'https://picsum.photos/id/64/200/200',
    appointmentTime: '2026-06-22 11:00',
    projectType: 'hyaluronic',
    projectName: '玻尿酸填充',
    status: 'waiting',
    nurseName: '王护士',
    roomNumber: '手术室2'
  },
  {
    id: 'rec_006',
    customerId: 'cust_004',
    customerName: '陈女士',
    customerAvatar: 'https://picsum.photos/id/338/200/200',
    appointmentTime: '2026-06-22 14:00',
    projectType: 'botox',
    projectName: '肉毒除皱',
    status: 'cancelled',
    nurseName: '李护士',
    roomNumber: '手术室1'
  },
  {
    id: 'rec_007',
    customerId: 'cust_008',
    customerName: '周女士',
    customerAvatar: 'https://picsum.photos/id/177/200/200',
    appointmentTime: '2026-06-22 14:30',
    projectType: 'hyaluronic',
    projectName: '玻尿酸填充',
    status: 'waiting',
    nurseName: '张护士',
    roomNumber: '手术室3'
  },
  {
    id: 'rec_008',
    customerName: '刘女士',
    customerId: 'cust_005',
    customerAvatar: 'https://picsum.photos/id/1027/200/200',
    appointmentTime: '2026-06-22 15:30',
    projectType: 'contour',
    projectName: '轮廓固定',
    status: 'waiting',
    nurseName: '王护士',
    roomNumber: '手术室2'
  }
]
