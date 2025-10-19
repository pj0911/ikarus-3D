// App.jsx
import React, { useEffect, useMemo, useState } from "react";



const fontOptions = ["Inter", "Roboto", "Poppins", "system-ui"];
const fontWeights = [300, 400, 500, 600, 700];
const shadowOptions = ["none", "small", "medium", "large"];
const galleryAlignments = ["left", "center", "right"];

const defaultConfig = {
  layout: "desktop",
  variant: "layoutA",
  typography: { family: "Inter", weight: 500, size: 16 },
  button: { radius: 8, shadow: "medium", align: "right", bg: "#D86D53", text: "#ffffff" },
  gallery: { alignment: "left", spacing: 8, borderRadius: 6, images: [] },
  general: { cardRadius: 12, containerPadding: 24, sectionBg: "#ffffff" },
  stroke: { color: "#e6e6e6", weight: 1 },
};

/* ---------- helpers ---------- */
function loadGoogleFont(family) {
  if (!family) return;
  if (family === "system-ui") return;
  const name = family.replace(/\s+/g, "+");
  const href = `https://fonts.googleapis.com/css2?family=${name}:wght@300;400;500;600;700&display=swap`;
  if (!document.querySelector(`link[data-font="${name}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-font", name);
    document.head.appendChild(link);
  }
}

function downloadJSON(filename, obj) {
  const data = JSON.stringify(obj, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- small input components ---------- */
function NumberInput({ value, onChange, min = 0, max = 200, ariaLabel }) {
  const handle = (e) => {
    const raw = e.target.value;
    const n = Number(raw);
    if (raw === "") {
      onChange(min);
      return;
    }
    if (Number.isNaN(n)) return;
    let v = n;
    if (v < min) v = min;
    if (v > max) v = max;
    onChange(Math.round(v * 100) / 100);
  };

  return (
    <input
      aria-label={ariaLabel}
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={handle}
      style={{
        width: 84,
        padding: "6px 8px",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: "#fff",
      }}
    />
  );
}

function ColorInput({ value, onChange, ariaLabel }) {
  // combined color picker + hex input
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input
        aria-label={ariaLabel}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 36, height: 32, padding: 0, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }}
      />
      <input
        aria-label={`${ariaLabel}-hex`}
        type="text"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          // basic validation - allow # + 3/6 hex
          if (/^#([0-9A-Fa-f]{0,6})$/.test(v) || v === "") {
            // fill when complete
            if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v)) onChange(v);
            else onChange(v);
          }
        }}
        style={{
          width: 96,
          padding: "6px 8px",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          background: "#fff",
        }}
      />
    </div>
  );
}

/* ---------- Editor Panel ---------- */
function EditorPanel({ config, setConfig, onImportJSON, onResetToDefault }) {
  // helper to update nested
  const update = (path, value) => {
    setConfig((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  // gallery image upload handler
  const handleGalleryUpload = (files) => {
    const arr = Array.from(files).slice(0, 8); // limit to 8 images
    const urls = arr.map((f) => URL.createObjectURL(f));
    // append to config.gallery.images or replace if empty
    setConfig((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.gallery.images = urls;
      return copy;
    });
  };

  const handleImageClear = () => {
    setConfig((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.gallery.images = [];
      return copy;
    });
  };

  return (
    <div style={{ padding: 18, width: "100%", boxSizing: "border-box", height: "100%", overflowY: "auto" }}>
      <h3 style={{ margin: "0 0 12px 0" }}>UI Editor</h3>

      <section style={{ marginBottom: 14 }}>
        <h4 style={{ margin: "8px 0" }}>Layout & Variant</h4>
        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ flex: 1 }}>
            <div style={{ fontSize: 12, marginBottom: 6 }}>Device</div>
            <select
              aria-label="Layout device"
              value={config.layout}
              onChange={(e) => update("layout", e.target.value)}
              style={{ width: "100%", padding: 8, borderRadius: 8 }}
            >
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
            </select>
          </label>

          <label style={{ flex: 1 }}>
            <div style={{ fontSize: 12, marginBottom: 6 }}>Variant</div>
            <select
              aria-label="design variant"
              value={config.variant}
              onChange={(e) => update("variant", e.target.value)}
              style={{ width: "100%", padding: 8, borderRadius: 8 }}
            >
              <option value="layoutA">Layout A</option>
              <option value="layoutB">Layout B</option>
            </select>
          </label>
        </div>
      </section>

      <section style={{ marginBottom: 14 }}>
        <h4 style={{ margin: "8px 0" }}>Typography</h4>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12 }}>Font Family</label>
            <select
              aria-label="font family"
              value={config.typography.family}
              onChange={(e) => update("typography.family", e.target.value)}
              style={{ width: "100%", padding: 8, borderRadius: 8 }}
            >
              {fontOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div style={{ width: 120 }}>
            <label style={{ fontSize: 12 }}>Weight</label>
            <select
              aria-label="font weight"
              value={config.typography.weight}
              onChange={(e) => update("typography.weight", Number(e.target.value))}
              style={{ width: "100%", padding: 8, borderRadius: 8 }}
            >
              {fontWeights.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div style={{ width: 120 }}>
            <label style={{ fontSize: 12 }}>Size (px)</label>
            <NumberInput
              ariaLabel="font size"
              value={config.typography.size}
              onChange={(v) => update("typography.size", v)}
              min={10}
              max={60}
            />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 14 }}>
        <h4 style={{ margin: "8px 0" }}>Button</h4>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <div style={{ minWidth: 96 }}>Radius</div>
          <NumberInput ariaLabel="button radius" value={config.button.radius} onChange={(v) => update("button.radius", v)} min={0} max={40} />
          <div style={{ minWidth: 96, marginLeft: 12 }}>Shadow</div>
          <select aria-label="button shadow" value={config.button.shadow} onChange={(e) => update("button.shadow", e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8 }}>
            {shadowOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ minWidth: 96 }}>Align</div>
          <select aria-label="button align" value={config.button.align} onChange={(e) => update("button.align", e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>

          <div style={{ marginLeft: 12, minWidth: 48 }}>BG</div>
          <ColorInput ariaLabel="button background color" value={config.button.bg} onChange={(v) => update("button.bg", v)} />

          <div style={{ marginLeft: 12, minWidth: 48 }}>Text</div>
          <ColorInput ariaLabel="button text color" value={config.button.text} onChange={(v) => update("button.text", v)} />
        </div>
      </section>

      <section style={{ marginBottom: 14 }}>
        <h4 style={{ margin: "8px 0" }}>Gallery / Images</h4>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12 }}>Alignment</label>
            <select aria-label="gallery alignment" value={config.gallery.alignment} onChange={(e) => update("gallery.alignment", e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8 }}>
              {galleryAlignments.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div style={{ width: 140 }}>
            <label style={{ fontSize: 12 }}>Spacing</label>
            <NumberInput ariaLabel="gallery spacing" value={config.gallery.spacing} onChange={(v) => update("gallery.spacing", v)} min={0} max={40} />
          </div>

          <div style={{ width: 140 }}>
            <label style={{ fontSize: 12 }}>Image Radius</label>
            <NumberInput ariaLabel="gallery radius" value={config.gallery.borderRadius} onChange={(v) => update("gallery.borderRadius", v)} min={0} max={40} />
          </div>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ display: "inline-block" }}>
            <input
              aria-label="gallery upload"
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleGalleryUpload(e.target.files)}
            />
            <button style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer" }}>Upload Images</button>
          </label>

          <button onClick={handleImageClear} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>
            Clear Images
          </button>
        </div>
      </section>

      <section style={{ marginBottom: 14 }}>
        <h4 style={{ margin: "8px 0" }}>General / Stroke</h4>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12 }}>Card Radius</label>
            <NumberInput ariaLabel="card radius" value={config.general.cardRadius} onChange={(v) => update("general.cardRadius", v)} min={0} max={48} />
          </div>

          <div style={{ width: 140 }}>
            <label style={{ fontSize: 12 }}>Padding</label>
            <NumberInput ariaLabel="container padding" value={config.general.containerPadding} onChange={(v) => update("general.containerPadding", v)} min={0} max={80} />
          </div>

          <div style={{ width: 220 }}>
            <label style={{ fontSize: 12 }}>Section BG</label>
            <ColorInput ariaLabel="section background color" value={config.general.sectionBg} onChange={(v) => update("general.sectionBg", v)} />
          </div>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ minWidth: 80 }}>Stroke</div>
          <NumberInput ariaLabel="stroke weight" value={config.stroke.weight} onChange={(v) => update("stroke.weight", v)} min={0} max={8} />
          <ColorInput ariaLabel="stroke color" value={config.stroke.color} onChange={(v) => update("stroke.color", v)} />
        </div>
      </section>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button
          onClick={() => downloadJSON("ui-config.json", config)}
          style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: "#111827", color: "#fff" }}
        >
          Export JSON
        </button>

        <label style={{ display: "inline-block" }}>
          <input
            aria-label="import json"
            type="file"
            accept=".json,application/json"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const cfg = JSON.parse(reader.result);
                  onImportJSON(cfg);
                } catch {
                  alert("Invalid JSON");
                }
              };
              reader.readAsText(file);
            }}
          />
          <button style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Import JSON</button>
        </label>

        <button
          onClick={() => onResetToDefault()}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}
        >
          Reset
        </button>
      </div>

      <div style={{ marginTop: 12, color: "#6b7280", fontSize: 13 }}>
        Tip: Upload up to 8 images for the gallery — they appear in the preview immediately. Export saves your current config including uploaded image object URLs (note: those are session-specific).
      </div>
    </div>
  );
}


function ProductCard({ config }) {
  const typography = {
    fontFamily: config.typography.family === "system-ui" ? "system-ui, -apple-system, 'Segoe UI', Roboto" : config.typography.family,
    fontWeight: config.typography.weight,
    fontSize: `${config.typography.size}px`,
  };

  const buttonShadowMap = {
    none: "none",
    small: "0 1px 3px rgba(0,0,0,0.08)",
    medium: "0 6px 18px rgba(0,0,0,0.12)",
    large: "0 14px 40px rgba(0,0,0,0.16)",
  };

  const cardStyle = {
    background: config.general.sectionBg,
    borderRadius: config.general.cardRadius,
    padding: config.general.containerPadding,
    border: `${config.stroke.weight}px solid ${config.stroke.color}`,
    boxSizing: "border-box",
    width: "100%",
    color: "#111827",
  };

  const btnStyle = {
    backgroundColor: config.button.bg,
    color: config.button.text,
    borderRadius: config.button.radius,
    padding: "10px 14px",
    boxShadow: buttonShadowMap[config.button.shadow] || "none",
    border: "none",
    cursor: "pointer",
  };

  const galleryStyle = {
    display: "flex",
    gap: config.gallery.spacing,
    justifyContent:
      config.gallery.alignment === "left" ? "flex-start" : config.gallery.alignment === "center" ? "center" : "flex-end",
    alignItems: "center",
  };

  // images: prefer uploaded images, else placeholder picsum
  const images = useMemo(() => {
    if (config.gallery.images && config.gallery.images.length > 0) return config.gallery.images;
    return Array.from({ length: 5 }).map((_, i) => `https://picsum.photos/seed/${i + 1}/600/400`);
  }, [config.gallery.images]);

  
  if (config.variant === "layoutB") {
    return (
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ width: 240 }}>
          <div style={{ display: "grid", gap: 8 }}>
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`img-${i}`}
                style={{ width: "100%", borderRadius: config.gallery.borderRadius, display: "block", objectFit: "cover", height: 120 }}
              />
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={cardStyle}>
            <h2 style={{ margin: 0, ...typography }}>Cozy Lounge Chair</h2>
            <p style={{ marginTop: 8, marginBottom: 12, color: "#6b7280" }}>Customize your chair</p>

            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: "#f3f4f6", border: `1px solid ${config.stroke.color}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 120, background: "#f8fafc", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#9ca3af" }}>Image / Media</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: config.button.align === "left" ? "flex-start" : config.button.align === "center" ? "center" : "flex-end" }}>
              <button style={btnStyle}>Add to cart</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // layoutA default
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div
            style={{
              width: "100%",
              height: 320,
              background: "#fbfbfb",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img src={images[0]} alt="product" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: config.gallery.borderRadius }} />
          </div>

          <div style={{ display: "flex", gap: config.gallery.spacing, marginTop: 12, justifyContent: galleryStyle.justifyContent }}>
            {images.slice(1).map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`thumb-${i}`}
                style={{
                  width: 64,
                  height: 64,
                  objectFit: "cover",
                  borderRadius: config.gallery.borderRadius,
                  border: `1px solid ${config.stroke.color}`,
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ width: 340 }}>
          <h2 style={{ margin: 0, ...typography }}>Cozy Lounge Chair</h2>
          <p style={{ marginTop: 8, marginBottom: 12, color: "#6b7280" }}>Customize your chair</p>

          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ padding: 8, background: "#fff", borderRadius: 8, border: `1px solid ${config.stroke.color}` }}>
              <div style={{ marginBottom: 8 }}>Material</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["#7B3F00", "#B85C50", "#5B6D5B", "#2D8A6A", "#8B5E83"].map((c, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: 999, background: c, border: "2px solid #fff", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }} />
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: config.button.align === "left" ? "flex-start" : config.button.align === "center" ? "center" : "flex-end" }}>
              <button style={btnStyle}>Add to cart</button>
            </div>

            <div style={{ color: "#6b7280", fontSize: 14 }}>
              Price: <strong>$200</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- App root ---------- */
export default function App() {
  const [config, setConfig] = useState(() => {
    try {
      const stored = localStorage.getItem("ui-editor-config-v1");
      if (stored) return JSON.parse(stored);
    } catch {}
    return defaultConfig;
  });

  /* Persist & font load */
  useEffect(() => {
    try {
      localStorage.setItem("ui-editor-config-v1", JSON.stringify(config));
    } catch {}
  }, [config]);

  useEffect(() => {
    loadGoogleFont(config.typography.family);
  }, [config.typography.family]);

  /* Import JSON handler */
  const handleImportJSON = (cfg) => {
    // minimal validation: required keys
    if (!cfg || !cfg.typography) {
      alert("Invalid config");
      return;
    }
    setConfig(cfg);
  };

  const handleResetToDefault = () => {
    setConfig(defaultConfig);
    // clear stored object URLs if any (not necessary here)
    // reload fonts
    loadGoogleFont(defaultConfig.typography.family);
  };

  /* preview container styles responsive */
  const containerStyle = {
    display: "flex",
    gap: 16,
    alignItems: "stretch",
    height: "100vh",
    boxSizing: "border-box",
    background: "#f3f4f6",
    padding: 12,
    overflow: "hidden",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto",
  };

  const previewWrapper = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    boxSizing: "border-box",
    overflow: "auto",
    minWidth: 0,
  };

  const previewCardBox =
    config.layout === "desktop"
      ? { width: "100%", maxWidth: 1500, height: 720, boxShadow: "0 8px 40px rgba(2,6,23,0.08)", borderRadius: 14, background: "#fff", padding: 20 }
      : { width: 360, height: 780, boxShadow: "0 8px 40px rgba(2,6,23,0.08)", borderRadius: 22, background: "#fff", padding: 12 };

  // small responsive wrapper for the editor panel
  const editorPaneStyle = {
    width: 380,
    maxWidth: "50%",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
    overflow: "hidden",
  };

  return (
    <div style={containerStyle}>
      <div style={previewWrapper}>
        <div style={previewCardBox}>
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", overflow: "auto" }}>
              <ProductCard config={config} />
            </div>
          </div>
        </div>
      </div>

      <div style={editorPaneStyle}>
        <EditorPanel config={config} setConfig={setConfig} onImportJSON={handleImportJSON} onResetToDefault={handleResetToDefault} />
      </div>
    </div>
  );
}
