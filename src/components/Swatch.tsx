// Small color square that pairs a candidate with their hue. Decorative: the
// name always sits next to it.
export function Swatch({ color, size = 'md' }: { color: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={`rcv-swatch shrink-0 rounded-[2px] ${size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'}`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}
