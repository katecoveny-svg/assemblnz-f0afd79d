/** Browser-only renderer shared by private Studio and the anonymous sample editor.
 * No storage, network, authentication or provider dependencies. */
export type VideoScene = { label: string; title: string; body: string };
export type VideoDesign = {
  client: string;
  approved: unknown;
  scenes?: VideoScene[];
  frame: {
    tokens: { ink: string; font: string };
    content: { headline: string; intro: string; problem: string; solution: string; next: string };
  };
};
export type VideoFormat="landscape"|"portrait"|"square";
export const videoNodes=["headline","problem","solution","next"] as const;
export function videoScenes(d:VideoDesign){return d.scenes ?? [{label:"THE POSSIBILITY",title:d.frame.content.headline,body:d.frame.content.intro},{label:"THE MOMENT THAT MATTERS",title:"A better customer moment.",body:d.frame.content.problem},{label:"THE EXPERIENCE",title:"The next step takes shape.",body:d.frame.content.solution},{label:"THE INVITATION",title:"Let’s make it real.",body:d.frame.content.next}];}
export function videoSize(format:VideoFormat){return format==="portrait"?[720,1280]:format==="square"?[1080,1080]:[1280,720];}
function lines(ctx:CanvasRenderingContext2D,text:string,width:number){const words=text.replace(/\s+/g," ").trim().split(" ");const result:string[]=[];let line="";for(const word of words){if(ctx.measureText(word).width>width){if(line){result.push(line);line="";}let part="";for(const char of word){if(ctx.measureText(part+char).width>width){result.push(part);part=char;}else part+=char;}line=part;continue;}const test=line?line+" "+word:word;if(ctx.measureText(test).width>width&&line){result.push(line);line=word;}else line=test;}if(line)result.push(line);return result;}
function block(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,w:number,h:number,size:number,font:string,weight=400){let rows:string[]=[];let n=size;do{ctx.font=`${weight} ${n}px ${font}`;rows=lines(ctx,text,w);if(rows.length*n*1.2<=h)break;n-=1;}while(n>15);rows.forEach((s,i)=>ctx.fillText(s,x,y+i*n*1.2));return rows.length*n*1.2;}
export function paintVideo(canvas:HTMLCanvasElement,d:VideoDesign,time:number,format:VideoFormat,seconds:number,images?:HTMLImageElement|HTMLImageElement[]|null){
const [w,h]=videoSize(format);if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;const ctx=canvas.getContext("2d");if(!ctx)throw Error("Video canvas is unavailable.");const scenes=videoScenes(d),index=Math.min(3,Math.floor(time/seconds)),local=Math.max(0,time-index*seconds),s=scenes[index],t=d.frame.tokens,pad=w*.065,portrait=format==="portrait",image=Array.isArray(images)?images[index]||images[0]:images;const font=t.font==="Georgia"?"Georgia,serif":`${t.font},Arial,sans-serif`;ctx.globalAlpha=1;ctx.fillStyle=t.ink;ctx.fillRect(0,0,w,h);
if(image){const zoom=1.03+(local/seconds)*.065,ratio=Math.max(w/image.naturalWidth,h/image.naturalHeight)*zoom;ctx.drawImage(image,(w-image.naturalWidth*ratio)/2+(local/seconds-.5)*18,(h-image.naturalHeight*ratio)/2,image.naturalWidth*ratio,image.naturalHeight*ratio);const shade=ctx.createLinearGradient(0,h,portrait?w*.3:w,0);shade.addColorStop(0,"rgba(24,17,26,.86)");shade.addColorStop(.6,"rgba(24,17,26,.26)");shade.addColorStop(1,"rgba(24,17,26,.06)");ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);}ctx.fillStyle="#fffaf5";ctx.textBaseline="top";ctx.font=`400 ${w*.026}px ${font}`;block(ctx,d.client+". / creative",pad,pad*.7,w*.75,h*.1,w*.026,font);ctx.font=`400 ${w*.011}px ${font}`;ctx.fillText(`0${index+1} / 04`,w-pad-w*.055,pad*.85);
const reveal=1-Math.pow(1-Math.min(local/.85,1),3);ctx.save();ctx.translate(0,(1-reveal)*28);ctx.globalAlpha=reveal;ctx.font=`500 ${w*.012}px ${font}`;ctx.fillText(s.label,pad,h*(portrait?.48:.43));const titleY=h*(portrait?.53:.49),textW=portrait?w-pad*2:w*.69;const titleHeight=block(ctx,s.title,pad,titleY,textW,h*.20,portrait?55:65,font,400);ctx.globalAlpha=reveal*.9;block(ctx,s.body,pad,titleY+titleHeight+22,textW,h*.14,portrait?26:22,font);ctx.restore();ctx.fillStyle="#fffaf5";ctx.font=`400 ${w*.011}px ${font}`;ctx.globalAlpha=.7;ctx.fillText(d.approved?"REVIEWED REVISION":"ILLUSTRATIVE CONCEPT / FOR REVIEW",pad,h-pad*.7);ctx.globalAlpha=1;const gap=8,barW=(w-pad*2-gap*3)/4;for(let i=0;i<4;i++){ctx.fillStyle="#fffaf5";ctx.globalAlpha=.2;ctx.fillRect(pad+i*(barW+gap),h-pad*1.15,barW,2);ctx.globalAlpha=1;if(i<=index)ctx.fillRect(pad+i*(barW+gap),h-pad*1.15,barW*(i<index?1:Math.min(local/seconds,1)),2);}ctx.globalAlpha=1;}

export function videoVtt(d: VideoDesign, seconds: number) {
  const stamp = (s: number) => `00:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}.000`;
  const text = (s: string) => s.replace(/\s+/g, ' ').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return 'WEBVTT\n\n' + videoScenes(d).map((scene, i) => `${stamp(i * seconds)} --> ${stamp((i + 1) * seconds)}\n${text(scene.title)}\n${text(scene.body)}\n`).join('\n');
}

export function videoMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return ['video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(mime => MediaRecorder.isTypeSupported(mime));
}

/** Real-time, foreground capture. Audio starts only after the recorder is ready. */
export async function recordVideo(
  canvas: HTMLCanvasElement, d: VideoDesign, format: VideoFormat, seconds: number,
  progress: (n: number) => void, signal: AbortSignal,
  images?: HTMLImageElement | HTMLImageElement[] | null, audioFile?: File | null,
): Promise<{ blob: Blob; extension: string }> {
  const mimeType = videoMimeType();
  if (!mimeType || !canvas.captureStream) throw Error('Video encoding is unavailable. Try a current Chrome, Edge or Safari browser, or download the project and captions.');
  if (signal.aborted) throw Error('Video export cancelled. Your project is unchanged.');
  await document.fonts.ready;
  paintVideo(canvas, d, 0, format, seconds, images);
  const stream = canvas.captureStream(24);
  let audio: HTMLAudioElement | undefined;
  let context: AudioContext | undefined;
  let audioUrl: string | undefined;
  let frame = 0;
  try {
    if (audioFile) {
      audioUrl = URL.createObjectURL(audioFile);
      audio = new Audio(audioUrl);
      context = new AudioContext();
      const destination = context.createMediaStreamDestination();
      context.createMediaElementSource(audio).connect(destination);
      destination.stream.getAudioTracks().forEach(track => stream.addTrack(track));
      await context.resume();
    }
    if (signal.aborted || document.hidden) throw Error('Keep this tab visible and try exporting again.');
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
    return await new Promise((resolve, reject) => {
      const chunks: BlobPart[] = [];
      let settled = false;
      let timeout: ReturnType<typeof setTimeout>;
      const cleanup = () => {
        cancelAnimationFrame(frame);
        clearTimeout(timeout);
        signal.removeEventListener('abort', abort);
        document.removeEventListener('visibilitychange', visibility);
      };
      const fail = (message: string) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (recorder.state !== 'inactive') recorder.stop();
        reject(Error(message));
      };
      const abort = () => fail('Video export cancelled. Your project is unchanged.');
      const visibility = () => { if (document.hidden) fail('Export stopped because this tab was hidden. Keep it visible and try again.'); };
      signal.addEventListener('abort', abort, { once: true });
      document.addEventListener('visibilitychange', visibility);
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onerror = () => fail('The browser could not encode this video. Try again or download the project.');
      recorder.onstop = () => {
        if (settled) return;
        settled = true;
        cleanup();
        const blob = new Blob(chunks, { type: recorder.mimeType });
        if (!blob.size) reject(Error('No video frames were captured. Try again or download the project.'));
        else resolve({ blob, extension: recorder.mimeType.includes('mp4') ? 'mp4' : 'webm' });
      };
      recorder.onstart = async () => {
        try {
          if (settled) return;
          if (audio) { audio.currentTime = 0; await audio.play(); }
          if (settled) { audio?.pause(); return; }
          const start = performance.now();
          const total = seconds * 4;
          const draw = (now: number) => {
            if (settled) return;
            try {
              const elapsed = (now - start) / 1000;
              paintVideo(canvas, d, Math.min(elapsed, total - .01), format, seconds, images);
              progress(Math.min(1, elapsed / total));
              if (elapsed < total) frame = requestAnimationFrame(draw);
              else { audio?.pause(); recorder.stop(); }
            } catch { fail('A video frame could not be drawn. Remove the image and try again.'); }
          };
          frame = requestAnimationFrame(draw);
        } catch { fail('Narration could not play. Remove it or choose another audio file, then try again.'); }
      };
      timeout = setTimeout(() => fail('Encoding took too long. Keep the tab visible and try again.'), seconds * 4000 + 15_000);
      try { recorder.start(500); } catch { fail('The browser could not start encoding. Try another browser or download the project.'); }
    });
  } finally {
    cancelAnimationFrame(frame);
    stream.getTracks().forEach(track => track.stop());
    audio?.pause();
    if (context) await context.close();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }
}
