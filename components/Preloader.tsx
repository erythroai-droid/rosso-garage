export default function Preloader({ pct }: { pct: number }) {
  return (
    <div className={`pre ${pct >= 100 ? 'done' : ''}`} aria-hidden={pct >= 100}>
      <div className="pre-l">Loading</div>
      <div className="pre-n">{pct}%</div>
      <div className="pre-t"><i style={{ width: pct + '%' }} /></div>
    </div>
  );
}
