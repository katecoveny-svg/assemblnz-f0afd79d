'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './do-live.css';

type InteractionStatus = 'IDLE' | 'IN_PROGRESS';

type LiveSession = {
  uri: string;
  model: string;
  mode: 'standard' | 'extended';
};

function pageContext() {
  const selected = window.getSelection()?.toString()?.trim() || '';
  return {
    url: window.location.href,
    title: document.title,
    selectedText: selected.slice(0, 2500),
    pageText: (document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 5000),
  };
}

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function DoGeminiLive() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState<InteractionStatus>('IDLE');
  const [note, setNote] = useState('Talk to DO. It can prepare work from the page while you keep talking.');
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioRef = useRef<AudioContext | null>(null);
  const outputAudioRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playQueueRef = useRef<ArrayBuffer[]>([]);
  const playingRef = useRef(false);

  const playNext = useCallback(() => {
    if (playingRef.current || playQueueRef.current.length === 0) return;
    const audio = outputAudioRef.current;
    if (!audio) return;
    const chunk = playQueueRef.current.shift();
    if (!chunk) return;

    const pcm = new Int16Array(chunk);
    const floats = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) floats[i] = pcm[i] / 32768;
    const buffer = audio.createBuffer(1, floats.length, 24000);
    buffer.copyToChannel(floats, 0);
    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.connect(audio.destination);
    source.onended = () => {
      playingRef.current = false;
      playNext();
    };
    playingRef.current = true;
    source.start();
  }, []);

  const disconnect = useCallback(() => {
    const ws = wsRef.current;
    wsRef.current = null;
    if (ws && ws.readyState < WebSocket.CLOSING) ws.close();
    processorRef.current?.disconnect();
    processorRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void inputAudioRef.current?.close();
    void outputAudioRef.current?.close();
    inputAudioRef.current = null;
    outputAudioRef.current = null;
    playQueueRef.current = [];
    playingRef.current = false;
    setConnected(false);
    setConnecting(false);
    setStatus('IDLE');
  }, []);

  useEffect(() => disconnect, [disconnect]);

  const connect = useCallback(async () => {
    if (connected || connecting) return;
    setConnecting(true);
    setNote('Starting live DO…');

    try {
      const tokenResponse = await fetch('/api/do/live-token', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'extended', voiceName: 'Kore' }),
      });
      const session = (await tokenResponse.json()) as LiveSession & { error?: string };
      if (!tokenResponse.ok || !session.uri) throw new Error(session.error || 'Live session unavailable.');

      const media = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      });
      streamRef.current = media;
      const inputAudio = new AudioContext({ sampleRate: 16000 });
      const outputAudio = new AudioContext();
      inputAudioRef.current = inputAudio;
      outputAudioRef.current = outputAudio;

      const ws = new WebSocket(session.uri);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          setup: {
            model: `models/${session.model}`,
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
              thinkingConfig: { thinkingLevel: 'LOW' },
            },
            systemInstruction: {
              parts: [{ text: [
                'You are DO by Assembl: a concise, warm New Zealand work agent.',
                'Stay useful while work is happening. Give short spoken progress updates rather than leaving silence.',
                'You may inspect the page context and PREPARE a DO agent with the compile_do_agent tool.',
                'You may not send, purchase, submit, publish, change an account, spend money, or claim an external action happened.',
                'Consequential actions always require the existing Assembl approval flow and are outside this live session.',
                `Current page context: ${JSON.stringify(pageContext())}`,
              ].join('\n') }],
            },
            tools: [{
              functionDeclarations: [{
                name: 'compile_do_agent',
                description: 'Prepare a DO agent/spec from a brief and the current webpage. This is preparation only and performs no external action.',
                behavior: 'NON_BLOCKING',
                parameters: {
                  type: 'OBJECT',
                  properties: {
                    brief: { type: 'STRING', description: 'What the user wants DO to prepare.' },
                  },
                  required: ['brief'],
                },
              }],
            }],
            realtimeInputConfig: {
              automaticActivityDetection: { disabled: false },
            },
          },
        }));

        const source = inputAudio.createMediaStreamSource(media);
        const processor = inputAudio.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        processor.onaudioprocess = (event) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const pcm = event.inputBuffer.getChannelData(0);
          const int16 = new Int16Array(pcm.length);
          for (let i = 0; i < pcm.length; i++) int16[i] = Math.max(-32768, Math.min(32767, pcm[i] * 32768));
          ws.send(JSON.stringify({
            realtimeInput: {
              mediaChunks: [{ data: toBase64(int16.buffer), mimeType: 'audio/pcm;rate=16000' }],
            },
          }));
        };
        source.connect(processor);
        processor.connect(inputAudio.destination);
        setConnected(true);
        setConnecting(false);
        setNote('Listening. Ask DO to work something out from this page.');
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(String(event.data));
        const interaction = message.interactionStatus ?? message.serverContent?.interactionStatus;
        if (interaction === 'IN_PROGRESS' || interaction === 'IDLE') {
          setStatus(interaction);
          setNote(interaction === 'IN_PROGRESS' ? 'DO is working… you can keep talking.' : 'Listening.');
        }

        for (const part of message.serverContent?.modelTurn?.parts ?? []) {
          if (part.inlineData?.data && String(part.inlineData?.mimeType || '').startsWith('audio/')) {
            playQueueRef.current.push(fromBase64(part.inlineData.data));
            playNext();
          }
        }

        const calls = message.toolCall?.functionCalls ?? [];
        for (const call of calls) {
          if (call.name !== 'compile_do_agent') continue;
          let output: unknown;
          try {
            const response = await fetch('/api/do/agents/compile', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                brief: String(call.args?.brief || '').slice(0, 2000),
                page: pageContext(),
                surface: 'web-widget',
                connector: 'hook-later',
              }),
            });
            output = await response.json();
            if (!response.ok) throw new Error('DO compile failed');
            setNote('Prepared. Review the agent before anything else happens.');
          } catch (error) {
            output = { error: error instanceof Error ? error.message : 'compile failed' };
          }
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              toolResponse: {
                functionResponses: [{
                  id: call.id,
                  name: call.name,
                  response: { output, scheduling: 'WHEN_IDLE' },
                }],
              },
            }));
          }
        }
      };

      ws.onerror = () => {
        setNote('Live voice connection failed. Text DO still works normally.');
        disconnect();
      };
      ws.onclose = () => disconnect();
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Live DO could not start.');
      disconnect();
    }
  }, [connected, connecting, disconnect, playNext]);

  return (
    <section className="do-live-dock" aria-label="Talk to DO">
      <div>
        <span className="do-small-label">LIVE DO · GEMINI 3.8</span>
        <strong>{status === 'IN_PROGRESS' ? 'Working while you talk.' : 'Talk it through.'}</strong>
        <p>{note}</p>
      </div>
      <button type="button" onClick={connected ? disconnect : connect} disabled={connecting}>
        {connecting ? 'Starting…' : connected ? 'End voice' : 'Talk to DO'}
      </button>
    </section>
  );
}
