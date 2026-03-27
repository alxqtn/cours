import { render } from "npm:ejs@3";

const distDir = new URL("../../dist/", import.meta.url).pathname;
const templatePath = new URL("./index.template.html", import.meta.url).pathname;

function formatSlideName(filename: string): string {
  return filename
    .replace(/\.html$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDiagramName(filename: string): string {
  return filename
    .replace(/\.excalidraw\.svg$/, "")
    .replace(/\.svg$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const files: string[] = [];
for await (const entry of Deno.readDir(distDir)) {
  if (entry.isFile) files.push(entry.name);
}

const slideFiles = files.filter(
  (f) => f.endsWith(".html") && f !== "index.html"
);
const diagramFiles = files.filter((f) => f.endsWith(".svg"));

const slides = slideFiles.map((file) => ({
  file,
  name: formatSlideName(file),
}));

const diagrams = diagramFiles.map((file) => ({
  file,
  name: formatDiagramName(file),
}));

slides.sort((a, b) => a.name.localeCompare(b.name, "fr"));
diagrams.sort((a, b) => a.name.localeCompare(b.name, "fr"));

const template = await Deno.readTextFile(templatePath);
const html = render(template, { slides, diagrams });

await Deno.writeTextFile(`${distDir}/index.html`, html);
console.log(
  `Generated index.html with ${slides.length} slides and ${diagrams.length} diagrams`
);
