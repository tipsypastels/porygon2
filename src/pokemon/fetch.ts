import { Hydrator } from './hydrator';
import { getKindConstructors, Kind, Kinds } from './kind';

export async function fetch<K extends Kind>(kind: K, id: string) {
  const raw = await fetchRaw(kind, id);
  const ctor = getKindConstructors()[kind];

  const hydrator = new Hydrator(raw);
  ctor.hydrate(hydrator);

  const hydratedRaw = await hydrator.hydrate();
  return new ctor(id, hydratedRaw) as Kinds[K];
}

export async function fetchRaw<K extends Kind>(kind: K, id: string) {
  const mod = await import(`./data/${kind}/${id}`);
  return mod.default;
}
