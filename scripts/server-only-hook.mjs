import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Le chargeur de tests de Node ne résout ni les imports sans extension
// (`./access`) ni l'alias `@/` du tsconfig. On ne remplace une résolution
// que lorsqu'elle échoue, pour laisser passer le reste (next, node:).

const root = fileURLToPath(new URL("..", import.meta.url));

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    return {
      shortCircuit: true,
      url: new URL("./server-only-stub.mjs", import.meta.url).href,
    };
  }

  if (specifier.startsWith("@/")) {
    const file = typescriptFile(join(root, "src", specifier.slice(2)));
    if (file) return { shortCircuit: true, url: pathToFileURL(file).href };
  }

  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (specifier.startsWith("./") || specifier.startsWith("../")) {
      const parent = context.parentURL ? fileURLToPath(context.parentURL) : root;
      const file = typescriptFile(join(dirname(parent), specifier));
      if (file) return { shortCircuit: true, url: pathToFileURL(file).href };
    }
    // Certains paquets (next/headers) s'importent sans extension : Node, lui,
    // ne les trouve que sous le fichier .js publié.
    if (!specifier.startsWith(".") && !specifier.endsWith(".js")) {
      try {
        return await nextResolve(`${specifier}.js`, context);
      } catch {
        // On garde l'erreur d'origine.
      }
    }
    throw error;
  }
}

function typescriptFile(base) {
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.mts`, join(base, "index.ts")];
  return candidates.find((file) => existsSync(file));
}
