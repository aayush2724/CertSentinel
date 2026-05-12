import { motion } from 'framer-motion';

const STEPS = [
  { id: 'upload',   label: 'File uploaded' },
  { id: 'preprocess', label: 'Preprocessing image' },
  { id: 'ocr',      label: 'Running OCR' },
  { id: 'classify', label: 'Analyzing & classifying' },
];

function getActiveIndex(stage, pollStatus) {
  if (stage === 'uploading') return 0;
  if (pollStatus === 'PROCESSING') return 2;
  if (pollStatus === 'DONE') return 4;
  return 1;
}

export default function VerificationProgress({ stage, pollStatus }) {
  const activeIndex = getActiveIndex(stage, pollStatus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '8px 0' }}
    >
      <p style={{
        margin: '0 0 28px',
        fontFamily: 'var(--font-body)',
        fontSize: '15px',
        color: 'var(--text-secondary)',
      }}>
        Verifying certificate…
      </p>

      <motion.ul
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        style={{ listStyle: 'none', padding: 0, margin: 0 }}
      >
        {STEPS.map((step, i) => {
          const isDone   = i < activeIndex;
          const isActive = i === activeIndex;
          const isPending = i > activeIndex;

          return (
            <motion.li
              key={step.id}
              variants={{
                hidden:  { opacity: 0, x: -8 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 0',
                borderBottom: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{
                width: '22px', height: '22px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isDone && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24"
                      fill="none" stroke="var(--accent-teal)" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                )}
                {isActive && <PulsingDot />}
                {isPending && (
                  <div style={{
                    width: '8px', height: '8px',
                    borderRadius: '50%',
                    border: '1.5px solid var(--border)',
                  }} />
                )}
              </div>

              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: isDone   ? 'var(--accent-teal)'
                     : isActive ? 'var(--text-primary)'
                     :            'var(--text-tertiary)',
                fontWeight: isActive ? 500 : 400,
                transition: 'color 0.3s',
              }}>
                {step.label}
                {isActive && (
                  <AnimatedEllipsis />
                )}
              </span>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.div>
  );
}

function PulsingDot() {
  return (
    <div style={{ position: 'relative', width: '10px', height: '10px' }}>
      <motion.div
        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          background: 'var(--accent)',
          opacity: 0.4,
        }}
      />
      <div style={{
        position: 'absolute', inset: '2px',
        borderRadius: '50%',
        background: 'var(--accent)',
      }} />
    </div>
  );
}

function AnimatedEllipsis() {
  return (
    <motion.span
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.2, repeat: Infinity }}
      style={{ color: 'var(--text-tertiary)', marginLeft: '1px' }}
    >
      …
    </motion.span>
  );
}
