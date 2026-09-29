import { MarkdownView, Notice, Plugin } from "obsidian";
import { getClipboardText } from "../utils/clipboard";

export async function formatAsTodoList(plugin: Plugin) {
    const modules = new Map<string, string[]>();

    const text = await getClipboardText();

    text
        .split(/\s+/)
        .filter(path => path.startsWith("./"))
        .forEach(path => {
            const cleanPath = path.split("@@")[0];

            if (!cleanPath) {
                new Notice("Error")
                return
            }

            const match = cleanPath.match(/^\.\/([^/]+)\/(.+)$/);

            if (!match) {
                return;
            }

            const [, module, file] = match;

            if (!module) {
                new Notice("Error module")
                return
            }
            if (!file) {
                new Notice("Error file")
                return
            }

            if (!modules.has(module)) {
                modules.set(module, []);
            }

            modules.get(module)!.push(file);
        });

    let output = "";

    for (const [module, files] of modules) {
        output += `- [ ] ${module}\n`;

        for (const file of files) {
            output += `\t- [ ] ${file}\n`;
        }

        output += "\n";
    }

    const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);

    if (!view) {
        new Notice("No active note");
        return;
    }

    const editor = view.editor;

    // Insert at cursor position
    editor.replaceRange(
        output.trim(),
        editor.getCursor()
    );
}