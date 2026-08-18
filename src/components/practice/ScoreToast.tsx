import { useTranslation } from 'react-i18next'
import './ScoreToast.css'

export function ScoreToast({
  kind,
  pattern,
}: {
  kind: 'correct' | 'incorrect' | null
  pattern?: string
}) {
  const { t } = useTranslation(['common', 'practice'])
  if (!kind) return null
  return (
    <div className={`score-toast score-toast--${kind}`} role="status">
      <strong>{kind === 'correct' ? t('common:correct') : t('common:incorrect')}</strong>
      {pattern ? (
        <span className="score-toast__pattern">
          {t('practice:reveal', { pattern })}
        </span>
      ) : null}
    </div>
  )
}
