import React, { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, Image, Button, Canvas, ScrollView, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppStore } from '@/store/useAppStore'
import { mockInjectionRecords } from '@/data/mockInjections'
import { formatDateTime } from '@/utils/date'

const PEN_COLORS = [
  { color: '#000000', name: '黑色' },
  { color: '#1890FF', name: '蓝色' },
  { color: '#52C41A', name: '绿色' },
  { color: '#EB2F96', name: '粉色' }
]

const CHECK_ITEMS = [
  {
    id: 'points',
    title: '点位确认',
    desc: '确认所有注射点位位置、剂量、层次均正确无误'
  },
  {
    id: 'medicine',
    title: '药品核验',
    desc: '确认所用药品批号、有效期、用量均已核验并记录'
  },
  {
    id: 'photos',
    title: '照片记录',
    desc: '确认术前、术中照片已拍摄并完成标注'
  },
  {
    id: 'notes',
    title: '异常备注',
    desc: '确认术中异常情况已完整记录，处理措施明确'
  }
]

const SignaturePage: React.FC = () => {
  const [penColor, setPenColor] = useState('#000000')
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [signatureImage, setSignatureImage] = useState('')
  const [signaturePath, setSignaturePath] = useState('')
  const [localDoctorName, setLocalDoctorName] = useState('')
  const canvasRef = useRef<any>(null)
  const ctxRef = useRef<any>(null)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  const {
    currentInjection,
    currentCustomer,
    setDoctorName,
    setDoctorSignature,
    setInjectionRecords
  } = useAppStore()

  useEffect(() => {
    const { injectionRecords } = useAppStore.getState()
    if (injectionRecords.length === 0) setInjectionRecords(mockInjectionRecords)
  }, [setInjectionRecords])

  useDidShow(() => {
    console.log('[Signature] Page did show')
    initCanvas()
  })

  const initCanvas = useCallback(() => {
    const query = Taro.createSelectorQuery()
    query.select('#signatureCanvas')
      .fields({ node: true, size: true })
      .exec((res: any) => {
        if (res && res[0]) {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')

          const dpr = Taro.getSystemInfoSync().pixelRatio || 2
          canvas.width = res[0].width * dpr
          canvas.height = res[0].height * dpr
          ctx.scale(dpr, dpr)

          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.lineWidth = 3

          ctxRef.current = ctx
          canvasRef.current = canvas
          console.log('[Signature] Canvas initialized')
        }
      })
  }, [])

  const getCanvasPoint = (e: any) => {
    const touch = e.touches[0] || e.changedTouches[0]
    const query = Taro.createSelectorQuery()
    return new Promise<{ x: number; y: number }>((resolve) => {
      query.select('#signatureCanvas').boundingClientRect((rect: any) => {
        if (rect) {
          resolve({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
          })
        } else {
          resolve({ x: 0, y: 0 })
        }
      }).exec()
    })
  }

  const handleTouchStart = async (e: any) => {
    if (!ctxRef.current) return
    setIsDrawing(true)
    const point = await getCanvasPoint(e)
    lastPointRef.current = point

    ctxRef.current.beginPath()
    ctxRef.current.strokeStyle = penColor
    ctxRef.current.moveTo(point.x, point.y)
  }

  const handleTouchMove = async (e: any) => {
    if (!isDrawing || !ctxRef.current) return
    e.preventDefault()

    const point = await getCanvasPoint(e)
    if (lastPointRef.current) {
      ctxRef.current.beginPath()
      ctxRef.current.moveTo(lastPointRef.current.x, lastPointRef.current.y)
      ctxRef.current.lineTo(point.x, point.y)
      ctxRef.current.stroke()
    }
    lastPointRef.current = point
    setHasSignature(true)
  }

  const handleTouchEnd = () => {
    setIsDrawing(false)
    lastPointRef.current = null
  }

  const handleClear = () => {
    console.log('[Signature] Clear canvas')
    if (!ctxRef.current || !canvasRef.current) return

    const query = Taro.createSelectorQuery()
    query.select('#signatureCanvas').fields({ size: true }).exec((res: any) => {
      if (res && res[0]) {
        ctxRef.current.clearRect(0, 0, res[0].width, res[0].height)
        setHasSignature(false)
        setSignatureImage('')
        setSignaturePath('')
      }
    })
  }

  const handleUndo = () => {
    console.log('[Signature] Undo last stroke')
    Taro.showToast({ title: '撤销功能开发中', icon: 'none' })
  }

  const handleColorChange = (color: string) => {
    console.log('[Signature] Change pen color:', color)
    setPenColor(color)
  }

  const handleToggleCheck = (itemId: string) => {
    setCheckedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId)
      }
      return [...prev, itemId]
    })
  }

  const handlePreview = () => {
    console.log('[Signature] Preview signature')
    if (!hasSignature) {
      Taro.showToast({ title: '请先完成签名', icon: 'none' })
      return
    }

    if (!canvasRef.current) return

    Taro.canvasToTempFilePath({
      canvas: canvasRef.current,
      success: (res: any) => {
        console.log('[Signature] Temp file path:', res.tempFilePath)
        setSignaturePath(res.tempFilePath)
        setSignatureImage(res.tempFilePath)
        setShowPreview(true)
      },
      fail: (err: any) => {
        console.error('[Signature] Failed to get temp file:', err)
        Taro.showToast({ title: '生成签名失败', icon: 'none' })
      }
    })
  }

  const handleConfirm = () => {
    console.log('[Signature] Confirm signature')
    if (!hasSignature) {
      Taro.showToast({ title: '请先完成签名', icon: 'none' })
      return
    }

    if (checkedItems.length !== CHECK_ITEMS.length) {
      Taro.showToast({ title: '请确认所有检查项', icon: 'none' })
      return
    }

    if (!signaturePath) {
      Taro.showToast({ title: '请先预览签名', icon: 'none' })
      return
    }

    const finalDoctorName = localDoctorName || currentInjection?.doctorName || '张医生'
    if (!finalDoctorName.trim()) {
      Taro.showToast({ title: '请输入医生姓名', icon: 'none' })
      return
    }

    Taro.showModal({
      title: '确认签名',
      content: '签名确认后记录将被锁定，无法修改。确认提交吗？',
      confirmColor: '#1890FF',
      success: (res) => {
        if (res.confirm) {
          setDoctorName(finalDoctorName)
          setDoctorSignature(signaturePath, new Date())
          Taro.showToast({ title: '签名已确认', icon: 'success' })
          setTimeout(() => {
            Taro.navigateBack()
          }, 1500)
        }
      }
    })
  }

  const totalPoints = currentInjection?.points?.length || 0
  const totalDose = currentInjection?.points?.reduce(
    (sum: number, p: any) => sum + (p.dose || 0) * (p.needleCount || 0),
    0
  ) || 0
  const totalMedicines = currentInjection?.medicines?.length || 0

  const allChecked = checkedItems.length === CHECK_ITEMS.length

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.customerInfo}>
          {currentCustomer && (
            <Image
              className={styles.avatar}
              src={currentCustomer.avatar}
              mode='aspectFill'
            />
          )}
          <View className={styles.info}>
            <View className={styles.nameRow}>
              <Text className={styles.customerName}>
                {currentCustomer?.name || '未选择客户'}
              </Text>
            </View>
            <Text className={styles.projectType}>
              {currentInjection?.projectType
                ? currentInjection.projectType === 'botox'
                  ? '肉毒除皱'
                  : currentInjection.projectType === 'hyaluronic'
                    ? '玻尿酸填充'
                    : '轮廓固定'
                : '未选择项目'}
            </Text>
          </View>
        </View>

        <View className={styles.summaryRow}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>{totalPoints}</Text>
            <Text className={styles.summaryLabel}>注射点位</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>{totalDose.toFixed(2)}</Text>
            <Text className={styles.summaryLabel}>总剂量(ml)</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>{totalMedicines}</Text>
            <Text className={styles.summaryLabel}>使用药品</Text>
          </View>
        </View>
      </View>

      <View className={styles.signatureSection}>
        <View className={styles.sectionTitle}>
          <Text>医生签名</Text>
          <View className={styles.penColorRow}>
            {PEN_COLORS.map(c => (
              <View
                key={c.color}
                className={classnames(styles.colorOption, {
                  [styles.active]: penColor === c.color
                })}
                style={{ background: c.color }}
                onClick={() => handleColorChange(c.color)}
              ></View>
            ))}
          </View>
        </View>

        <View
          className={styles.canvasContainer}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <Canvas
            id='signatureCanvas'
            canvasId='signatureCanvas'
            type='2d'
            className={styles.signatureCanvas}
          />
          {!hasSignature && (
            <View className={styles.placeholder}>
              <View className={styles.placeholderIcon}>✍️</View>
              <Text className={styles.placeholderText}>请在上方区域手写签名</Text>
            </View>
          )}
        </View>

        <View className={styles.tips}>
          <Text className={styles.tipsText}>
            💡 提示：请使用正楷签名，确保签名清晰可辨。签名完成后点击"预览"确认，确认后记录将被锁定。
          </Text>
        </View>

        <View className={styles.checkSection}>
          {CHECK_ITEMS.map(item => (
            <View key={item.id} className={styles.checkItem}>
              <View
                className={classnames(styles.checkbox, {
                  [styles.checked]: checkedItems.includes(item.id)
                })}
                onClick={() => handleToggleCheck(item.id)}
              >
                {checkedItems.includes(item.id) && '✓'}
              </View>
              <View className={styles.checkContent}>
                <Text className={styles.checkTitle}>{item.title}</Text>
                <Text className={styles.checkDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.toolbar}>
        <Button
          className={classnames(styles.toolBtn, styles.btnClear)}
          onClick={handleClear}
        >
          🗑️ 清除
        </Button>
        <Button
          className={classnames(styles.toolBtn, styles.btnUndo)}
          onClick={handleUndo}
        >
          ↩️ 撤销
        </Button>
        <Button
          className={classnames(styles.toolBtn, styles.btnConfirm)}
          onClick={handlePreview}
          disabled={!hasSignature || !allChecked}
        >
          预览签名
        </Button>
      </View>

      {showPreview && (
        <View className={styles.previewModal} onClick={() => setShowPreview(false)}>
          <View className={styles.previewContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.previewTitle}>签名预览</Text>

            <View className={styles.previewImage}>
              <Image
                className={styles.signatureImg}
                src={signatureImage}
                mode='aspectFit'
              />
            </View>

            <View className={styles.previewInfo}>
              <View className={styles.previewInfoRow}>
                <Text className={styles.previewLabel}>医生姓名</Text>
                <Input
                  className={styles.previewInput}
                  placeholder='请输入医生姓名'
                  value={localDoctorName || currentInjection?.doctorName || ''}
                  onInput={(e) => setLocalDoctorName(e.detail.value)}
                />
              </View>
              <View className={styles.previewInfoRow}>
                <Text className={styles.previewLabel}>客户姓名</Text>
                <Text className={styles.previewValue}>
                  {currentCustomer?.name || '李女士'}
                </Text>
              </View>
              <View className={styles.previewInfoRow}>
                <Text className={styles.previewLabel}>签名时间</Text>
                <Text className={styles.previewValue}>
                  {formatDateTime(new Date())}
                </Text>
              </View>
              <View className={styles.previewInfoRow}>
                <Text className={styles.previewLabel}>确认项目</Text>
                <Text className={styles.previewValue}>
                  {checkedItems.length}/{CHECK_ITEMS.length} 项
                </Text>
              </View>
            </View>

            <View className={styles.previewActions}>
              <Button
                className={classnames(styles.previewBtn, styles.btnSecondary)}
                onClick={() => setShowPreview(false)}
              >
                返回修改
              </Button>
              <Button
                className={classnames(styles.previewBtn, styles.btnPrimary)}
                onClick={handleConfirm}
              >
                确认签名
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default SignaturePage
