import React, { useRef, useState, useEffect } from 'react'
import { View, Text, Button, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'

interface SignaturePadProps {
  onSave: (signatureData: string) => void
  onCancel?: () => void
  doctorName?: string
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel, doctorName = '' }) => {
  const canvasRef = useRef<any>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const ctxRef = useRef<any>(null)

  useEffect(() => {
    initCanvas()
  }, [])

  const initCanvas = () => {
    const query = Taro.createSelectorQuery()
    query.select('#signatureCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = Taro.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)
        ctx.strokeStyle = '#1D2129'
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctxRef.current = ctx
      })
  }

  const getPosition = (e: any) => {
    const touch = e.touches[0] || e.changedTouches[0]
    const query = Taro.createSelectorQuery()
    query.select('#signaturePadContainer').boundingClientRect()
    const rect = query.execSync()[0]
    if (!rect) return { x: 0, y: 0 }
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    }
  }

  const handleStart = (e: any) => {
    e.preventDefault()
    const pos = getPosition(e)
    ctxRef.current?.beginPath()
    ctxRef.current?.moveTo(pos.x, pos.y)
    setIsDrawing(true)
    setHasSignature(true)
  }

  const handleMove = (e: any) => {
    e.preventDefault()
    if (!isDrawing) return
    const pos = getPosition(e)
    ctxRef.current?.lineTo(pos.x, pos.y)
    ctxRef.current?.stroke()
  }

  const handleEnd = (e: any) => {
    e.preventDefault()
    ctxRef.current?.closePath()
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const query = Taro.createSelectorQuery()
    query.select('#signatureCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setHasSignature(false)
      })
  }

  const saveSignature = () => {
    if (!hasSignature) {
      Taro.showToast({ title: '请先签名', icon: 'none' })
      return
    }

    const query = Taro.createSelectorQuery()
    query.select('#signatureCanvas')
      .fields({ node: true })
      .exec((res) => {
        if (!res[0]) return
        const canvas = res[0].node
        const dataUrl = canvas.toDataURL('image/png')
        console.log('[Signature] Signature saved successfully')
        onSave(dataUrl)
      })
  }

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>医生电子签名</Text>
        {doctorName && (
          <Text className={styles.doctorName}>医生：{doctorName}</Text>
        )}
      </View>

      <View
        id='signaturePadContainer'
        className={styles.padContainer}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        <Canvas
          id='signatureCanvas'
          type='2d'
          className={styles.canvas}
        />
        {!hasSignature && (
          <View className={styles.placeholder}>
            <Text className={styles.placeholderText}>请在此处签名</Text>
          </View>
        )}
      </View>

      <View className={styles.hint}>
        <Text className={styles.hintText}>
          请在上方区域用手指签名，签名将作为医疗记录的一部分
        </Text>
      </View>

      <View className={styles.actions}>
        <Button className={styles.cancelBtn} onClick={onCancel}>
          取消
        </Button>
        <Button className={styles.clearBtn} onClick={clearCanvas}>
          清除
        </Button>
        <Button
          className={styles.confirmBtn}
          onClick={saveSignature}
          disabled={!hasSignature}
        >
          确认签名
        </Button>
      </View>
    </View>
  )
}

export default SignaturePad
