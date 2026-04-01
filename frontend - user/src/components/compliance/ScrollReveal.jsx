import { motion, useReducedMotion } from 'framer-motion'

const ease = [0.22, 1, 0.36, 1]

export function FadeIn({ children, className = '', delay = 0, y = 28 }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -10% 0px' }}
      transition={{ duration: reduce ? 0 : 0.55, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({ children, className = '', stagger = 0.07, delayChildren = 0 }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: reduce ? 0 : stagger,
            delayChildren: reduce ? 0 : delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease },
  },
}

export function StaggerItem({ children, className = '' }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}

export function MotionSection({ children, className = '', id }) {
  const reduce = useReducedMotion()
  return (
    <motion.section
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 36 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08, margin: '0px 0px -8% 0px' }}
      transition={{ duration: reduce ? 0 : 0.65, ease }}
    >
      {children}
    </motion.section>
  )
}
