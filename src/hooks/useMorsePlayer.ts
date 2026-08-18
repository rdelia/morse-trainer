import { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { MorseAudioPlayer } from '../morse/audio'
import type { ToneEvent } from '../morse/scheduler'
import { useSettingsStore } from '../stores/settingsStore'

export function useMorsePlayer() {
  const settings = useSettingsStore((s) => s.settings)
  const [playing, setPlaying] = useState(false)
  const [toneOn, setToneOn] = useState(false)
  const playerRef = useRef<MorseAudioPlayer | null>(null)

  const timing = useMemo(
    () => ({
      characterWpm: settings.characterWpm,
      effectiveWpm: settings.effectiveWpm,
    }),
    [settings.characterWpm, settings.effectiveWpm],
  )

  useEffect(() => {
    const player = new MorseAudioPlayer({
      frequencyHz: settings.frequencyHz,
      volume: settings.volume,
      timing,
      onPlayingChange: setPlaying,
      onEvent: (e: ToneEvent) => {
        if (e.type === 'on') setToneOn(true)
        if (e.type === 'off' || e.type === 'done') setToneOn(false)
      },
    })
    playerRef.current = player
    return () => player.destroy()
  }, [])

  useEffect(() => {
    playerRef.current?.updateOptions({
      frequencyHz: settings.frequencyHz,
      volume: settings.volume,
      timing,
    })
  }, [settings.frequencyHz, settings.volume, timing])

  const playText = useCallback(async (text: string) => {
    return (await playerRef.current?.playText(text)) ?? false
  }, [])

  const playProsign = useCallback(async (name: string) => {
    return (await playerRef.current?.playProsign(name)) ?? false
  }, [])

  const stop = useCallback(() => {
    playerRef.current?.cancel()
  }, [])

  return { playText, playProsign, stop, playing, toneOn }
}
