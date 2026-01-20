'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

// Spring configuration for natural, satisfying tap feedback
const springConfig = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 17,
}

interface PressableProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  disabled?: boolean
  /** Scale when pressed (default: 0.95) */
  tapScale?: number
  /** Scale on hover (default: 1.02) */
  hoverScale?: number
}

/**
 * A wrapper component that adds satisfying spring-physics tap interactions.
 * Use this to wrap any element that should feel "pressable".
 */
export const Pressable = forwardRef<HTMLDivElement, PressableProps>(
  function Pressable(
    {
      children,
      disabled = false,
      tapScale = 0.95,
      hoverScale = 1.02,
      className = '',
      ...props
    },
    ref
  ) {
    return (
      <motion.div
        ref={ref}
        whileHover={disabled ? undefined : { scale: hoverScale }}
        whileTap={disabled ? undefined : { scale: tapScale }}
        transition={springConfig}
        className={className}
        style={{ cursor: disabled ? 'default' : 'pointer' }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

interface PressableButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode
  /** Scale when pressed (default: 0.95) */
  tapScale?: number
  /** Scale on hover (default: 1.02) */
  hoverScale?: number
}

/**
 * A motion button with spring-physics tap interactions.
 * Use this for buttons that need satisfying press feedback.
 */
export const PressableButton = forwardRef<HTMLButtonElement, PressableButtonProps>(
  function PressableButton(
    {
      children,
      disabled = false,
      tapScale = 0.95,
      hoverScale = 1.02,
      className = '',
      ...props
    },
    ref
  ) {
    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? undefined : { scale: hoverScale }}
        whileTap={disabled ? undefined : { scale: tapScale }}
        transition={springConfig}
        disabled={disabled}
        className={className}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)
