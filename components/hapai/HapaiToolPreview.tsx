import Image from 'next/image';

type HapaiToolVisual =
  | 'vessel'
  | 'caption'
  | 'brief'
  | 'og-card'
  | 'tagline'
  | 'project-picker';

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
        <div className="absolute inset-0 bg-[#FAF7F2]" />
        <div className="absolute left-1/2 top-5 h-[82%] w-[64%] -translate-x-1/2 rounded-[3px] border border-[rgba(35,33,31,0.14)] bg-white p-5 shadow-[0_20px_48px_rgba(35,33,31,0.12)]">
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

  if (visual === 'tagline') {
    return (
      <div className={previewClass}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(212,168,83,0.24),transparent_32%),#FAF7F2]" />
        <div className="absolute left-5 right-5 top-5 space-y-3">
          {['plainspoken', 'editorial', 'premium'].map((style, index) => (
            <div
              key={style}
              className="rounded-[6px] border border-[rgba(35,33,31,0.10)] bg-white/72 p-3"
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
