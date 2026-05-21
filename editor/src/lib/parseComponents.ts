export interface ComponentDef {
  name: string;
  code: string;
  start: number;
  end: number;
}

// Find all top-level PascalCase component definitions.
// Each spans from its declaration start to the next declaration (or EOF).
export function parseComponents(code: string): ComponentDef[] {
  // Match: (export default)? (export)? const|function|class PascalName
  const re = /^(?:export\s+default\s+)?(?:export\s+)?(?:const|function|class)\s+([A-Z][a-zA-Z0-9]*)/mg;
  const hits: Array<{ name: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    hits.push({ name: m[1], index: m.index });
  }
  if (hits.length === 0) return [];

  return hits.map((hit, i) => {
    const start = hit.index;
    const end = i < hits.length - 1 ? hits[i + 1].index : code.length;
    return { name: hit.name, code: code.slice(start, end).trimEnd(), start, end };
  });
}

// Replace a component's code slice in the full source and return the new full code.
export function patchComponent(fullCode: string, def: ComponentDef, newComponentCode: string): string {
  return fullCode.slice(0, def.start) + newComponentCode + fullCode.slice(def.end);
}
