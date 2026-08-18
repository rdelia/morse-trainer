import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from './locales/en/common.json'
import enLearn from './locales/en/learn.json'
import enPractice from './locales/en/practice.json'
import enSettings from './locales/en/settings.json'
import enReference from './locales/en/reference.json'
import enProgress from './locales/en/progress.json'
import enSend from './locales/en/send.json'
import enHistory from './locales/en/history.json'

import itCommon from './locales/it/common.json'
import itLearn from './locales/it/learn.json'
import itPractice from './locales/it/practice.json'
import itSettings from './locales/it/settings.json'
import itReference from './locales/it/reference.json'
import itProgress from './locales/it/progress.json'
import itSend from './locales/it/send.json'
import itHistory from './locales/it/history.json'

import esCommon from './locales/es/common.json'
import esLearn from './locales/es/learn.json'
import esPractice from './locales/es/practice.json'
import esSettings from './locales/es/settings.json'
import esReference from './locales/es/reference.json'
import esProgress from './locales/es/progress.json'
import esSend from './locales/es/send.json'
import esHistory from './locales/es/history.json'

import frCommon from './locales/fr/common.json'
import frLearn from './locales/fr/learn.json'
import frPractice from './locales/fr/practice.json'
import frSettings from './locales/fr/settings.json'
import frReference from './locales/fr/reference.json'
import frProgress from './locales/fr/progress.json'
import frSend from './locales/fr/send.json'
import frHistory from './locales/fr/history.json'

import roCommon from './locales/ro/common.json'
import roLearn from './locales/ro/learn.json'
import roPractice from './locales/ro/practice.json'
import roSettings from './locales/ro/settings.json'
import roReference from './locales/ro/reference.json'
import roProgress from './locales/ro/progress.json'
import roSend from './locales/ro/send.json'
import roHistory from './locales/ro/history.json'

import vaCommon from './locales/ca-valencia/common.json'
import vaLearn from './locales/ca-valencia/learn.json'
import vaPractice from './locales/ca-valencia/practice.json'
import vaSettings from './locales/ca-valencia/settings.json'
import vaReference from './locales/ca-valencia/reference.json'
import vaProgress from './locales/ca-valencia/progress.json'
import vaSend from './locales/ca-valencia/send.json'
import vaHistory from './locales/ca-valencia/history.json'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        learn: enLearn,
        practice: enPractice,
        settings: enSettings,
        reference: enReference,
        progress: enProgress,
        send: enSend,
        history: enHistory,
      },
      it: {
        common: itCommon,
        learn: itLearn,
        practice: itPractice,
        settings: itSettings,
        reference: itReference,
        progress: itProgress,
        send: itSend,
        history: itHistory,
      },
      es: {
        common: esCommon,
        learn: esLearn,
        practice: esPractice,
        settings: esSettings,
        reference: esReference,
        progress: esProgress,
        send: esSend,
        history: esHistory,
      },
      fr: {
        common: frCommon,
        learn: frLearn,
        practice: frPractice,
        settings: frSettings,
        reference: frReference,
        progress: frProgress,
        send: frSend,
        history: frHistory,
      },
      ro: {
        common: roCommon,
        learn: roLearn,
        practice: roPractice,
        settings: roSettings,
        reference: roReference,
        progress: roProgress,
        send: roSend,
        history: roHistory,
      },
      'ca-valencia': {
        common: vaCommon,
        learn: vaLearn,
        practice: vaPractice,
        settings: vaSettings,
        reference: vaReference,
        progress: vaProgress,
        send: vaSend,
        history: vaHistory,
      },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'it', 'es', 'fr', 'ro', 'ca-valencia'],
    defaultNS: 'common',
    ns: ['common', 'learn', 'practice', 'settings', 'reference', 'progress', 'send', 'history'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: [],
    },
  })

export default i18n
