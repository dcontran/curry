import { Notice, Plugin } from "obsidian";
import { getClipboardText, isGdbBacktrace } from "../utils/clipboard";

async function createMermaidFromClipboard(plugin: Plugin) {
    const clipboardContent = await getClipboardText();

    if (!isGdbBacktrace(clipboardContent)) {
        new Notice(
            "Clipboard does not contain a valid GDB backtrace."
        );
        return;
    }

    const mermaid = parseTextToMermaid(clipboardContent);

    if (mermaid === "flowchart TD") {
        new Notice(
            "No valid stack frames found in clipboard. Expected a GDB backtrace."
        );
        return;
    }

    const activeFile = plugin.app.workspace.getActiveFile();

    if (!activeFile) {
        new Notice("No active note open.");
        return;
    }

    try {
        const currentContent = await plugin.app.vault.read(activeFile);

        const mermaidBlock = `

\`\`\`mermaid
${mermaid}
\`\`\`

`;

        await plugin.app.vault.modify(
            activeFile,
            currentContent + mermaidBlock
        );

        new Notice("Mermaid diagram inserted.");
    } catch (e) {
        console.error(e);
        new Notice("Failed to insert Mermaid diagram.");
    }
}

function parseTextToMermaid(text: string): string {
    const lines = text.split('\n').reverse();

    const nodes: string[] = [];
    const edges: string[] = [];

    let previousNodeId: string | null = null;
    let index = 0;

    lines.forEach((line) => {
        if (!line.startsWith("#")) {
            return;
        }

        const words = line.split(" ");

        let procedureName = "";

        if (words[2]?.startsWith("0x")) {
            procedureName = formatProcedure(words[4] ?? "");
        } else {
            procedureName = formatProcedure(words[2] ?? "");
        }

        if (!procedureName) {
            return;
        }

        const nodeId = `N${index}`;

        nodes.push(`${nodeId}["${procedureName}"]`);

        if (previousNodeId) {
            edges.push(`${previousNodeId} --> ${nodeId}`);
        }

        previousNodeId = nodeId;
        index++;
    });

    return [
        "flowchart TD",
        ...nodes,
        ...edges
    ].join("\n");
}

function formatProcedure(procedure: string): string {
    return procedure.replaceAll("-", ".").toUpperCase();
}


export { createMermaidFromClipboard }