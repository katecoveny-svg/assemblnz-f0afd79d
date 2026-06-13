import Image from 'next/image';
import type { HapaiToolVisual } from '@/lib/hapai/shareable-tools';

type HapaiToolPreviewProps = {
  visual: HapaiToolVisual;
};

const previewClass =
  'relative h-full min-h-[190px] overflow-hidden bg-[#EFEAE1] text-[#23211F]';

export function HapaiToolPreview({ visual }: HapaiToolPreviewProps) {
  if (visual === 'vessel') {
    return (
      <div className={previewClass}>
        <Image
          src="/img/hapai/tools/vessel-studio-wide.jpg"
          alt=""
          fill
          sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#23211F]/48 to-transparent p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#FAF7F2]">
            prompt studio
          </p>
        </div>
      </div>
    );
  }

  if (visual === 'caption') {
    return (
      <div className={previewClass}>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#FAF7F2_0%,#EFEAE1_58%,#E8E4DE_100%)]" />
        <div className="absolute left-5 right-5 top-5 rounded-[6px] border border-[rgba(35,33,31,0.12)] bg-[#FAF7F2]/82 p-4 shadow-[0_18px_42px_rgba(35,33,31,0.08)]">
          <div className="mb-4 flex gap-2">
            {['linkedin', 'instagram', 'x'].map((label) => (
              <span
                key={label}
                className="rounded-full border border-[rgba(35,33,31,0.14)] px-2 py-1 font-mono text-[9px] tracking-[0.14em] text-[#2B6B57]"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="space-y-2">
            <span className="block h-2.5 w-[92%] rounded-full bg-[#2B6B57]/72" />
            <span className="block h-2.5 w-[78%] rounded-full bg-[#23211F]/20" />
            <span className="block h-2.5 w-[64%] rounded-full bg-[#23211F]/16" />
          </div>
        </div>
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
          <p className="font-display text-3xl italic leading-none text-[#23211F]">caption variants</p>
          <span className="h-12 w-12 rounded-full bg-[#AC5838]/88" />
        </div>
      </div>
    );
  }

  if (visual === 'brief') {
    return (
      <div className={previewClass}>
        <Image
          src="/img/hapai/tools/brief-generator-auaha.jpg"
          alt=""
          fill
          sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
          className="object-cover object-[50%_42%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#23211F]/10 via-transparent to-[#FAF7F2]/18" />
        <div className="absolute left-5 top-5 h-[78%] w-[52%] rounded-[3px] border border-white/48 bg-white/72 p-4 shadow-[0_20px_48px_rgba(35,33,31,0.16)] backdrop-blur-sm">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#2B6B57]">
            one-page brief
          </p>
          <div className="mt-5 space-y-2">
            <span className="block h-3 w-[78%] bg-[#23211F]" />
            <span className="block h-3 w-[54%] bg-[#23211F]" />
          </div>
          <div className="mt-7 space-y-2">
            {[86, 70, 92, 58].map((width) => (
              <span
                key={width}
                className="block h-2 rounded-full bg-[#23211F]/18"
                style={{ width: `${width}%` }}
              />
            ))}
          </div>
          <div className="absolute bottom-5 left-5 right-5 border-t border-[rgba(35,33,31,0.12)] pt-4">
            <span className="block h-2 w-[44%] rounded-full bg-[#D4A853]" />
          </div>
        </div>
      </div>
    );
  }

  if (visual === 'morning-brief') {
    return (
      <div className={previewClass}>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#FAF7F2_0%,#EFEAE1_54%,#DCE8E1_100%)]" />
        <div className="absolute left-5 right-5 top-5 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/82 p-4 shadow-[0_18px_42px_rgba(35,33,31,0.10)]">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#2B6B57]">9am brief</p>
            <span className="rounded-full bg-[#2B6B57] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#FAF7F2]">
              draft
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {[1, 2, 3].map((rank) => (
              <div key={rank} className="grid grid-cols-[22px_1fr] items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#2B6B57]/28 font-mono text-[9px] text-[#2B6B57]">
                  {rank}
                </span>
                <span className="h-2 rounded-full bg-[#23211F]/16" />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-5 left-5 right-5 rounded-[8px] border border-[rgba(43,107,87,0.18)] bg-[#FAF7F2]/84 p-3">
          <p className="font-display text-3xl italic leading-none text-[#103F35]">what matters today</p>
        </div>
      </div>
    );
  }

  if (visual === 'electrify') {
    return (
      <div className={previewClass}>
        <Image
          src="/img/hapai/tools/electrify-vessel.jpg"
          alt=""
          fill
          sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
          className="object-cover object-[50%_38%]"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#23211F]/44 via-transparent to-[#FAF7F2]/10" />
        <div className="absolute bottom-4 left-4 right-4 rounded-[6px] border border-white/35 bg-[#FAF7F2]/78 p-3 shadow-[0_18px_42px_rgba(35,33,31,0.16)] backdrop-blur-sm">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#2B6B57]">
            energy calculator
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {['fleet', 'heat', 'solar'].map((label) => (
              <span
                key={label}
                className="rounded-full border border-[rgba(35,33,31,0.14)] bg-white/54 px-2 py-1 text-center font-mono text-[8px] uppercase tracking-[0.12em] text-[#23211F]"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (visual === 'og-card') {
    return (
      <div className={previewClass}>
        <div className="absolute inset-4 rounded-[6px] border border-[rgba(35,33,31,0.12)] bg-[#FAF7F2] shadow-[0_20px_48px_rgba(35,33,31,0.10)]">
          <div className="absolute inset-y-0 left-0 w-2 bg-[#2B6B57]" />
          <div className="absolute left-7 top-6 font-mono text-[9px] uppercase tracking-[0.22em] text-[#2B6B57]">
            social card
          </div>
          <div className="absolute bottom-8 left-7 right-28">
            <p className="font-display text-4xl font-semibold leading-[0.9] text-[#103F35]">
              Mahi that earns its proof.
            </p>
            <span className="mt-4 block h-2 w-[72%] rounded-full bg-[#23211F]/18" />
          </div>
          <div className="absolute bottom-8 right-8 h-20 w-20 rounded-full border border-[#D4A853] bg-[#EFEAE1]" />
        </div>
      </div>
    );
  }

  if (visual === 'meeting') {
    return (
      <div className={previewClass}>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#FAF7F2,#EFEAE1)]" />
        <div className="absolute left-5 right-5 top-5 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/78 p-4 shadow-[0_18px_42px_rgba(35,33,31,0.10)]">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#2B6B57]">record live</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="h-10 w-10 rounded-full bg-[#B42828]" />
            <span className="font-mono text-[10px] tracking-[0.16em] text-[#6B6661]">00:18</span>
          </div>
          <div className="mt-5 space-y-2">
            {[88, 72, 94].map((width) => <span key={width} className="block h-2 rounded-full bg-[#23211F]/16" style={{ width: `${width}%` }} />)}
          </div>
        </div>
        <p className="absolute bottom-6 left-5 font-display text-3xl italic leading-none">proper notes</p>
      </div>
    );
  }

  if (visual === 'voyage') {
    return (
      <div className={previewClass}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,rgba(217,168,90,0.30),transparent_34%),linear-gradient(135deg,#FAF7F2_0%,#EFEAE1_56%,#DCE8E1_100%)]" />
        <div className="absolute left-5 top-5 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/80 p-4 shadow-[0_18px_42px_rgba(35,33,31,0.10)]">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#2B6B57]">voyage italy</p>
          <p className="mt-3 font-display text-3xl italic leading-none text-[#103F35]">today&apos;s travel desk</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {['weather', 'fx', 'tickets', 'phrases'].map((item) => (
              <span key={item} className="rounded-full border border-[rgba(43,107,87,0.18)] bg-[#FAF7F2]/80 px-2 py-1 text-center font-mono text-[8px] uppercase tracking-[0.12em] text-[#2B6B57]">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute bottom-5 left-5 right-5 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#103F35] p-4 text-[#FAF7F2] shadow-[0_18px_42px_rgba(35,33,31,0.12)]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#D9A85A]">rome</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#FAF7F2]/70">eur → nzd</span>
          </div>
          <div className="mt-3 space-y-2">
            {[92, 74, 82].map((width) => (
              <span key={width} className="block h-2 rounded-full bg-[#FAF7F2]/22" style={{ width: `${width}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (visual === 'study') {
    return (
      <div className={previewClass}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(217,168,90,0.24),transparent_34%),linear-gradient(135deg,#FAF7F2_0%,#EFEAE1_58%,#DCE8E1_100%)]" />
        <div className="absolute left-5 right-5 top-5 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/82 p-4 shadow-[0_18px_42px_rgba(35,33,31,0.10)]">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#2B6B57]">study helper</p>
            <span className="rounded-full bg-[#D9A85A]/24 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#8A5B10]">
              exam
            </span>
          </div>
          <p className="mt-4 font-display text-3xl italic leading-none text-[#103F35]">essay spine</p>
          <div className="mt-4 space-y-2">
            {['thesis', 'evidence', 'explain'].map((item, index) => (
              <div key={item} className="grid grid-cols-[22px_1fr] items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#2B6B57]/28 font-mono text-[8px] text-[#2B6B57]">
                  {index + 1}
                </span>
                <span className="rounded-full border border-[rgba(43,107,87,0.15)] bg-[#FAF7F2] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#2B6B57]">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-5 left-5 right-5 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#103F35] p-4 text-[#FAF7F2] shadow-[0_18px_42px_rgba(35,33,31,0.12)]">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#D9A85A]">20-minute sprint</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {['recall', 'plan', 'write'].map((item) => (
              <span key={item} className="rounded-full bg-[#FAF7F2]/12 px-2 py-1 text-center font-mono text-[8px] uppercase tracking-[0.12em]">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (visual === 'privacy') {
    return (
      <div className={previewClass}>
        <div className="absolute inset-0 bg-[#FAF7F2]" />
        <div className="absolute inset-5 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/80 p-4 shadow-[0_18px_42px_rgba(35,33,31,0.10)]">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#2B6B57]">privacy act</p>
          <p className="mt-4 font-display text-3xl leading-none text-[#103F35]">IPP map</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {['IPP 1', 'IPP 3A', 'IPP 5', 'IPP 12'].map((pill) => <span key={pill} className="rounded-full bg-[#2B6B57]/10 px-2 py-1 font-mono text-[9px] text-[#2B6B57]">{pill}</span>)}
          </div>
        </div>
      </div>
    );
  }

  if (visual === 'fridge') {
    return (
      <div className={previewClass}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(217,188,122,0.32),transparent_38%),#FAF7F2]" />
        <div className="absolute left-5 top-5 h-24 w-24 rounded-[18px] border border-white bg-[#D9A85A]/28 shadow-[0_18px_42px_rgba(35,33,31,0.12)]" />
        <div className="absolute bottom-5 left-5 right-5 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/78 p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#2B6B57]">kai planner</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {['produce', 'pantry', 'dairy', 'meals'].map((item) => <span key={item} className="rounded-full border border-[rgba(35,33,31,0.12)] px-2 py-1 text-center font-mono text-[8px] uppercase tracking-[0.12em]">{item}</span>)}
          </div>
        </div>
      </div>
    );
  }

  if (visual === 'food-temp') {
    return (
      <div className={previewClass}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(172,88,56,0.24),transparent_34%),#FAF7F2]" />
        <div className="absolute inset-5 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/80 p-4 shadow-[0_18px_42px_rgba(35,33,31,0.10)]">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#AC5838]">food safety log</p>
          <div className="mt-5 space-y-3">
            {[
              ['Main fridge', '3.4°C', '#2B6B57'],
              ['Freezer', '-19°C', '#2B6B57'],
              ['Hot hold', '54°C', '#9A3412'],
            ].map(([label, temp, colour]) => (
              <div key={label} className="flex items-center justify-between rounded-[6px] border border-[rgba(35,33,31,0.08)] bg-[#FAF7F2] px-3 py-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#6B6661]">{label}</span>
                <span className="text-sm font-medium" style={{ color: colour }}>{temp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (visual === 'tagline') {
    return (
      <div className={previewClass}>
        <Image
          src="/img/hapai/tools/tagline-workshop-auaha.jpg"
          alt=""
          fill
          sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
          className="object-cover object-[50%_38%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#23211F]/36 via-[#FAF7F2]/8 to-transparent" />
        <div className="absolute left-5 right-5 top-5 space-y-3">
          {['plainspoken', 'editorial', 'premium'].map((style, index) => (
            <div
              key={style}
              className="rounded-[6px] border border-white/42 bg-white/72 p-3 shadow-[0_12px_28px_rgba(35,33,31,0.12)] backdrop-blur-sm"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#7B3F8F]">
                {style}
              </p>
              <p className="mt-1 font-display text-2xl italic leading-none">
                {index === 0 ? 'Built to be believed.' : index === 1 ? 'Proof, held lightly.' : 'Quiet work. Strong record.'}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual === 'customs') {
    return (
      <div className={previewClass}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_16%,rgba(58,125,110,0.22),transparent_36%),linear-gradient(135deg,#FAF7F2_0%,#EFEAE1_56%,#D7E7E0_100%)]" />
        <div className="absolute inset-5 rounded-[8px] border border-[rgba(35,33,31,0.1)] bg-white/82 p-4 shadow-[0_18px_42px_rgba(35,33,31,0.1)]">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#3A7D6E]">customs entry</p>
            <span className="rounded-full bg-[#3A7D6E]/12 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#3A7D6E]">
              draft
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {['invoice', 'line items', 'customs value'].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-[6px] border border-[rgba(35,33,31,0.08)] bg-[#F7F4EE] px-3 py-1.5">
                <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#6B6661]">{item}</span>
                <span className="h-1.5 w-12 rounded-full bg-[#3A7D6E]/40" />
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono text-[8px] uppercase tracking-[0.12em] text-[#9A3412]">tariff · broker confirms</p>
        </div>
      </div>
    );
  }

  if (visual === 'wishlist') {
    return (
      <div className={previewClass}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_16%,rgba(217,168,90,0.26),transparent_38%),linear-gradient(135deg,#FAF7F2_0%,#EFEAE1_58%,#E3EFE7_100%)]" />
        <div className="absolute inset-5 rounded-[8px] border border-[rgba(35,33,31,0.1)] bg-white/82 p-4 shadow-[0_18px_42px_rgba(35,33,31,0.1)]">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#2B6B57]">the wishlist</p>
          <p className="mt-3 font-display text-3xl font-light italic leading-none text-[#103F35]">one job, handed off</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {['Pīkau', 'Manaaki', 'Waihanga', 'Core'].map((k) => (
              <span key={k} className="rounded-full border border-[rgba(43,107,87,0.2)] bg-[#F0F5F1] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#2B6B57]">{k}</span>
            ))}
          </div>
          <span className="mt-4 inline-flex items-center gap-1 rounded-full border border-[rgba(217,168,90,0.4)] bg-[#FBF3E2] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#8A5B10]">sealed evidence</span>
        </div>
      </div>
    );
  }

  if (visual === 'admin-tax') {
    return (
      <div className={previewClass}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(43,107,87,0.2),transparent_36%),linear-gradient(135deg,#FAF7F2_0%,#EFEAE1_58%,#E3EFE7_100%)]" />
        <div className="absolute inset-5 rounded-[8px] border border-[rgba(35,33,31,0.1)] bg-white/82 p-4 shadow-[0_18px_42px_rgba(35,33,31,0.1)]">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#2B6B57]">the admin tax</p>
          <p className="mt-3 font-display text-4xl font-light leading-none text-[#103F35]">$112k<span className="align-top text-base">/yr</span></p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {['hrs/week', 'reclaimable'].map((label) => (
              <div key={label} className="rounded-[6px] border border-[rgba(43,107,87,0.18)] bg-[#F0F5F1] px-2 py-1.5">
                <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#2B6B57]">{label}</span>
                <span className="mt-1 block h-1.5 w-10 rounded-full bg-[#2B6B57]/40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={previewClass}>
      <div className="absolute inset-0 bg-[#FAF7F2]" />
      <div className="absolute left-5 right-5 top-5 rounded-[6px] border border-[rgba(35,33,31,0.12)] bg-white/78 p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#2B6B57]">
          project picker
        </p>
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((rank) => (
            <div key={rank} className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2B6B57] font-mono text-[10px] text-[#FAF7F2]">
                {rank}
              </span>
              <span className="h-2 flex-1 rounded-full bg-[#23211F]/18" />
            </div>
          ))}
        </div>
      </div>
      <p className="absolute bottom-6 left-5 font-display text-3xl italic leading-none">
        ranked next steps
      </p>
    </div>
  );
}
