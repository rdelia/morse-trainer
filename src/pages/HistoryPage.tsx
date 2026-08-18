import { useTranslation } from 'react-i18next'
import './HistoryPage.css'

interface WikiLink {
  label: string
  href: string
}

interface HistorySection {
  title: string
  paragraphs: string[]
  links: WikiLink[]
}

interface HistoryFact {
  title: string
  text: string
  links: WikiLink[]
}

interface AcronymItem {
  code: string
  meaning: string
}

interface AcronymGroup {
  title: string
  intro?: string
  items: AcronymItem[]
  links: WikiLink[]
}

function WikiList({ links, caption }: { links: WikiLink[]; caption: string }) {
  if (!links?.length) return null
  return (
    <p className="history-links">
      <span className="history-links__label">{caption}</span>
      {links.map((link, i) => (
        <span key={`${link.href}-${i}`}>
          {i > 0 ? <span aria-hidden> · </span> : null}
          <a href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
        </span>
      ))}
    </p>
  )
}

function slug(title: string, index: number): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return base || `section-${index + 1}`
}

export function HistoryPage() {
  const { t } = useTranslation('history')
  const sections = t('sections', { returnObjects: true }) as HistorySection[]
  const facts = t('facts', { returnObjects: true }) as HistoryFact[]
  const acronymGroups = t('acronymGroups', { returnObjects: true }) as AcronymGroup[]
  const wiki = t('wiki')

  return (
    <article className="history">
      <header className="page-hero">
        <h1>{t('title')}</h1>
        <p className="lede muted">{t('subtitle')}</p>
      </header>

      <p className="history-intro">{t('intro')}</p>

      {Array.isArray(sections) ? (
        <nav className="history-toc" aria-label={t('toc')}>
          <h2>{t('toc')}</h2>
          <ol>
            {sections.map((section, i) => (
              <li key={slug(section.title, i)}>
                <a href={`#${slug(section.title, i)}`}>{section.title}</a>
              </li>
            ))}
            {Array.isArray(acronymGroups) ? (
              <li>
                <a href="#acronyms">{t('acronymsTitle')}</a>
              </li>
            ) : null}
            <li>
              <a href="#facts">{t('factsTitle')}</a>
            </li>
          </ol>
        </nav>
      ) : null}

      {Array.isArray(sections)
        ? sections.map((section, i) => (
            <section key={slug(section.title, i)} id={slug(section.title, i)} className="history-section">
              <h2>{section.title}</h2>
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
              <WikiList links={section.links} caption={`${wiki}:`} />
            </section>
          ))
        : null}

      {Array.isArray(acronymGroups) ? (
        <section id="acronyms" className="history-section">
          <h2>{t('acronymsTitle')}</h2>
          <p>{t('acronymsIntro')}</p>
          {acronymGroups.map((group) => (
            <div key={group.title} className="history-acronym-group">
              <h3>{group.title}</h3>
              {group.intro ? <p>{group.intro}</p> : null}
              <dl className="history-acronyms">
                {group.items.map((item) => (
                  <div key={item.code} className="history-acronym">
                    <dt>{item.code}</dt>
                    <dd>{item.meaning}</dd>
                  </div>
                ))}
              </dl>
              <WikiList links={group.links} caption={`${wiki}:`} />
            </div>
          ))}
        </section>
      ) : null}

      {Array.isArray(facts) ? (
        <section id="facts" className="history-section">
          <h2>{t('factsTitle')}</h2>
          <div className="history-facts">
            {facts.map((fact) => (
              <article key={fact.title} className="history-fact">
                <h3>{fact.title}</h3>
                <p>{fact.text}</p>
                <WikiList links={fact.links} caption={`${wiki}:`} />
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <p className="history-note muted">{t('sourcesNote')}</p>
    </article>
  )
}
