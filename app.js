const h = React.createElement;
const { useState, useEffect, useRef } = React;

const SONG_SRC = "happy_birthday.mp3";
const PHOTO1 = "photo1.jpg";
const PHOTO2 = "photo2.jpg";

function useSong() {
  const ref = useRef(null);
  const get = () => {
    if (!ref.current) { const a = new Audio(SONG_SRC); a.loop = true; a.volume = 0.8; ref.current = a; }
    return ref.current;
  };
  return {
    start() { try { const a = get(); a.currentTime = 0; a.play().catch(console.error); } catch (e) { console.error(e); } },
    stop() { if (ref.current) ref.current.pause(); },
    resume() { try { get().play().catch(console.error); } catch (e) { console.error(e); } }
  };
}

const WISHES = [
  n => "Happy Birthday, " + n + "! May your day be full of joy.",
  n => n + ", you make every day brighter. Keep shining!",
  n => "Wishing you love, laughter and endless cake, " + n + ".",
  n => "May every dream you have come true this year, " + n + ".",
  n => "You are the best sister in the world, " + n + "!"
];

function Memories({ name }) {
  const items = [[PHOTO1, "Born to ride, " + name, "-4deg"], [PHOTO2, "Cutest look ever", "3deg"]];
  return h("div", null,
    h("div", { className: "memories" }, items.map(([src, cap, r], i) =>
      h("figure", { key: i, className: "polaroid", style: { "--r": r, animationDelay: i * 0.6 + "s" } },
        h("img", { src, alt: cap }),
        h("figcaption", null, cap)))),
    h("p", { className: "made" }, "Made with love, just for you"));
}

const COLORS = ["#ff7aa8", "#ffd27a", "#8fe3c8", "#b79cff", "#ff9a6b"];
const BALLOONS = Array.from({ length: 8 }, (_, i) => ({ left: 4 + i * 12.5, color: COLORS[i % 5], dur: 11 + (i * 7) % 8, delay: -(i * 3) % 11 }));
const PIECES = Array.from({ length: 70 }, (_, i) => ({ left: Math.random() * 100, color: COLORS[i % 5], dur: 2.5 + Math.random() * 3, delay: Math.random() * 1.2 }));

function Balloons() {
  return h("div", { "aria-hidden": true }, BALLOONS.map((b, i) => h("div", { key: i, className: "balloon", style: { left: b.left + "%", background: b.color, animationDuration: b.dur + "s", animationDelay: b.delay + "s" } })));
}
function Confetti() {
  return h("div", { "aria-hidden": true }, PIECES.map((p, i) => h("i", { key: i, className: "conf", style: { left: p.left + "%", background: p.color, animationDuration: p.dur + "s", animationDelay: p.delay + "s" } })));
}

function Cake({ layers, candle, out }) {
  return h("div", { className: "cake", "aria-label": "Birthday cake" },
    h("div", { className: "plate" }),
    [1, 2, 3, 4].map(i => layers >= i && h("div", { key: i, className: "layer l" + i })),
    candle && h("div", { className: "candle" }),
    candle && !out && h("div", { className: "flame" }),
    out && h("div", { className: "smoke" }));
}

function App() {
  const [name, setName] = useState("");
  const [stage, setStage] = useState("form");
  const [layers, setLayers] = useState(0);
  const [candle, setCandle] = useState(false);
  const [wish, setWish] = useState(0);
  const [muted, setMuted] = useState(false);
  const [out, setOut] = useState(false);
  const song = useSong();
  const clean = name.trim();

  const submit = e => {
    e.preventDefault();
    if (!clean) return;
    song.start(); setMuted(false);
    setLayers(0); setCandle(false); setOut(false); setWish(0); setStage("show");
  };

  useEffect(() => {
    if (stage !== "show") return;
    const ids = [1, 2, 3, 4].map(i => setTimeout(() => setLayers(i), 1200 + i * 900));
    ids.push(setTimeout(() => setCandle(true), 1200 + 5 * 900));
    return () => ids.forEach(clearTimeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "show") return;
    const id = setInterval(() => setWish(w => (w + 1) % WISHES.length), 4000);
    return () => clearInterval(id);
  }, [stage]);

  const toggle = () => { muted ? song.resume() : song.stop(); setMuted(!muted); };
  const reset = () => { song.stop(); setStage("form"); };

  if (stage === "form") {
    return h("form", { className: "form", onSubmit: submit },
      h("h1", null, "A little surprise"),
      h("p", { className: "sub" }, "Type your name to open your birthday gift."),
      h("input", { value: name, onChange: e => setName(e.target.value), placeholder: "Your name", "aria-label": "Your name", maxLength: 30, autoFocus: true }),
      h("button", { className: "go", type: "submit" }, "Open my surprise"));
  }
  return h("div", null,
    h("button", { className: "mute", onClick: toggle }, muted ? "Music off" : "Music on"),
    h("h1", null, "Happy Birthday"),
    h("p", { className: "name" }, clean),
    h("p", { className: "wish", key: wish }, WISHES[wish](clean)),
    h(Balloons),
    out && h(Confetti),
    h(Cake, { layers, candle, out }),
    candle && !out && h("button", { className: "blow", onClick: () => setOut(true) }, "Blow out the candle"),
    out && h("p", { className: "final" }, "Your wish is on its way, " + clean + ". Don’t tell anyone!"),
    out && h(Memories, { name: clean }),
    h("button", { className: "again", onClick: reset }, "Try another name"));
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
