import "./barber-pole.css";

/**
 * A classic barber pole: glass cylinder with a moving helix, chrome dome and
 * collars, wide base, plus its reflection and contact shadow.
 *
 * Deliberately not a 3D model — no GLB download, no WebGL context, and it
 * renders identically on every device. See ASSET-GUIDE.md if you would rather
 * swap in a modelled version later.
 */

function PoleBody() {
  return (
    <div className="pole">
      <div className="pole__finial" />
      <div className="pole__dome" />
      <div className="pole__ring pole__ring--top" />
      <div className="pole__glass">
        <div className="pole__stripes" />
        <div className="pole__cylinder" />
        <div className="pole__gloss" />
      </div>
      <div className="pole__ring pole__ring--bottom" />
      <div className="pole__base" />
    </div>
  );
}

export function BarberPole() {
  return (
    <div className="pole-scene">
      <PoleBody />
      <div className="pole-shadow" aria-hidden="true" />
      <div className="pole-reflection" aria-hidden="true">
        <PoleBody />
      </div>
    </div>
  );
}

export default BarberPole;
