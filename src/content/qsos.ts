export interface QsoScript {
  id: string
  /** Morse payload — conventional ham English abbreviations */
  lines: string[]
  /** i18n note key under practice.qsoNotes */
  noteKey: string
}

export const QSO_SCRIPTS: QsoScript[] = [
  {
    id: 'qso-basic',
    lines: [
      'CQ CQ CQ DE W1AW W1AW K',
      'W1AW DE K2XX K2XX KN',
      'K2XX DE W1AW UR RST 599 BK',
      'W1AW DE K2XX R TNX FER RPRT NAME BOB BT QTH NYC BK',
      'K2XX DE W1AW R TNX NAME SUE QTH BOS BT 73 SK',
    ],
    noteKey: 'basic',
  },
  {
    id: 'qso-short',
    lines: ['CQ DE N0ABC K', 'N0ABC DE W9XYZ KN', 'W9XYZ DE N0ABC 73 SK'],
    noteKey: 'short',
  },
]
