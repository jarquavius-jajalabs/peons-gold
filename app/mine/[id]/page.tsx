import MineClient from './MineClient'

export function generateStaticParams() {
  return [{ id: 'm1' }, { id: 'm2' }, { id: 'm3' }, { id: 'm4' }, { id: 'm5' }]
}

export default function MinePage({ params }: { params: { id: string } }) {
  return <MineClient id={params.id} />
}
