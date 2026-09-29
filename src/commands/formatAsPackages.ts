import { Editor, Notice } from "obsidian";

export async function formatAsPackages(editor: Editor) {
    const selection = editor.getSelection();

    if (!isTodoList(selection)) {
        new Notice("Selection is not a todo list");
        return;
    }

    let currentModule = "";
    const packages: string[] = [];


    const lines = selection.split("\n");

    for (const line of lines) {
        const moduleMatch = line.match(/^- \[.\] (.+)$/);

        if (moduleMatch && !line.startsWith("\t") && !line.startsWith(" ")) {
            if (packages.length > 0) {
                packages.push(""); // blank line between modules
            }

            currentModule = moduleMatch[1] ?? "";
            continue;
        }

        const fileMatch = line.match(/^\s+- \[.\] (.+)$/);

        if (fileMatch && currentModule) {
            packages.push(`./${currentModule}/${fileMatch[1]}`);
        }
    }

    await navigator.clipboard.writeText(packages.join("\n"));
    new Notice("Copied todo list formatted as packages to clipboard")
}

function isTodoList(text: string): boolean {
    return /^\s*-\s\[[ x]\]/m.test(text);
}