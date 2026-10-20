// A diagnostic comparison, not a synthetic mobile FPS or INP assertion.
// It intentionally does not set an absolute latency gate from three samples.
import { appendFile, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const CATALOG_SIZE = 102;
const WIDTHS = ["320", "390"];

function finiteNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error("Invalid performance metric: " + label);
  }
  return value;
}

export function summarizePerformance(current, baseline) {
  if (current?.catalog?.cardCount !== CATALOG_SIZE) {
    throw new Error("Expected exactly 102 catalog cards");
  }

  const comparable = Boolean(
    baseline?.metadata &&
    baseline?.catalog?.cardCount === current.catalog.cardCount &&
    current?.metadata?.browser === baseline.metadata.browser &&
    current?.metadata?.browserVersion === baseline.metadata.browserVersion &&
    current?.metadata?.profile === baseline.metadata.profile &&
    current?.metadata?.samples === baseline.metadata.samples
  );
  const warnings = [];
  const rows = [];

  for (const width of WIDTHS) {
    const sample = current?.catalogViewportSummary?.[width];
    if (sample?.cardCount !== CATALOG_SIZE) {
      throw new Error("Expected exactly 102 cards at " + width + "px");
    }
    if (sample.samplesWithOverflow !== 0) {
      throw new Error("Catalog horizontal overflow at " + width + "px");
    }
    const currentMs = finiteNumber(sample?.twoFrameScrollP95Ms?.p50, width + "px scroll proxy");
    const baselineMs = baseline?.catalogViewportSummary?.[width]?.twoFrameScrollP95Ms?.p50;
    const displayBaseline = typeof baselineMs === "number" && Number.isFinite(baselineMs)
      ? baselineMs.toFixed(1) + " ms"
      : "n/d";
    let observation = "Sem comparação";
    if (comparable && typeof baselineMs === "number" && Number.isFinite(baselineMs) && baselineMs > 0) {
      const change = ((currentMs / baselineMs) - 1) * 100;
      observation = (change >= 0 ? "+" : "") + change.toFixed(1) + "%";
      if (change > 25) {
        const warning = "Investigar possível regressão de rolagem em " + width + "px: " + observation;
        warnings.push(warning);
        observation += " — Investigar";
      }
    }
    rows.push("| " + width + "px | " + currentMs.toFixed(1) + " ms | " + displayBaseline + " | " + observation + " |");
  }

  const markdown = [
    "### Catálogo PG-Arcade: 102 cartões",
    "",
    "Medida: mediana do p95 de duas animações por rolagem, não FPS, INP nem Android físico.",
    "",
    "| Largura | HEAD atual | Linha de base | Diferença |",
    "| --- | ---: | ---: | --- |",
    ...rows,
    "",
    comparable
      ? "Ambientes comparáveis (mesmo Chromium, CPU simulada e número de amostras). Alertas acima de 25% são apenas diagnósticos."
      : "Medições **não comparáveis**: quantidade de cartões, versão do navegador, perfil de CPU ou amostragem distintos. Execute a referência no mesmo ambiente antes de concluir melhora ou regressão.",
    "",
    "O benchmark de abertura dos seis jogos, o orçamento do bundle e os testes E2E permanecem independentes.",
    "",
  ].join("\n");
  return { markdown, warnings, comparable };
}

async function main() {
  const [, , reportPath, baselinePath] = process.argv;
  if (!reportPath || !baselinePath) throw new Error("Usage: node scripts/summarize-performance.mjs <current.json> <baseline.json>");
  const current = JSON.parse(await readFile(reportPath, "utf8"));
  const baseline = JSON.parse(await readFile(baselinePath, "utf8"));
  const { markdown, warnings } = summarizePerformance(current, baseline);
  process.stdout.write(markdown);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
  }
  for (const message of warnings) {
    process.stdout.write("::warning::" + message + "\n");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error); process.exitCode = 1; });
}
