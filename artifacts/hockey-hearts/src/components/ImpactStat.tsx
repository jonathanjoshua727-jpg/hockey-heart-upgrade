interface ImpactStatProps {
  number: string;
  label: string;
}

export function ImpactStat({ number, label }: ImpactStatProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="font-serif text-5xl md:text-6xl font-bold text-white mb-2">
        {number}
      </div>
      <div className="text-secondary font-medium tracking-wide uppercase text-sm">
        {label}
      </div>
    </div>
  );
}
