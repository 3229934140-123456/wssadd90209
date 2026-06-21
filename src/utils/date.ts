import dayjs from 'dayjs'

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format)
}

export const formatDateTime = (date: string | Date, format: string = 'YYYY-MM-DD HH:mm'): string => {
  return dayjs(date).format(format)
}

export const formatTime = (date: string | Date, format: string = 'HH:mm'): string => {
  return dayjs(date).format(format)
}

export const getAge = (birthDate: string | Date): number => {
  return dayjs().diff(dayjs(birthDate), 'year')
}

export const isExpired = (expiryDate: string): boolean => {
  return dayjs(expiryDate).isBefore(dayjs())
}

export const getDaysDiff = (date1: string | Date, date2: string | Date): number => {
  return dayjs(date1).diff(dayjs(date2), 'day')
}

export const addDays = (date: string | Date, days: number): string => {
  return dayjs(date).add(days, 'day').format('YYYY-MM-DD')
}

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    waiting: '等待中',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
    draft: '草稿',
    confirmed: '已确认'
  }
  return statusMap[status] || status
}

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    waiting: 'warning',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'error',
    draft: 'default',
    confirmed: 'primary'
  }
  return colorMap[status] || 'default'
}

export const getProjectTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    botox: '肉毒除皱',
    hyaluronic: '玻尿酸填充',
    contour: '轮廓固定'
  }
  return typeMap[type] || type
}

export const getDepthText = (depth: string): string => {
  const depthMap: Record<string, string> = {
    superficial: '浅层',
    medium: '中层',
    deep: '深层'
  }
  return depthMap[depth] || depth
}

export const getSideText = (side: string): string => {
  const sideMap: Record<string, string> = {
    left: '左侧',
    right: '右侧',
    bilateral: '双侧',
    center: '中央'
  }
  return sideMap[side] || side
}

export const getPhotoTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    front: '正面',
    side_left: '左侧面',
    side_right: '右侧面',
    oblique: '斜位'
  }
  return typeMap[type] || type
}
