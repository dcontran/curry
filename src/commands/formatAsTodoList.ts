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
                return;
            }

            const parts = cleanPath.split("/");

            const packageIndex = parts.findIndex(part =>
                part.endsWith(".adb") ||
                part.endsWith(".ads") ||
                part.endsWith(".sh") ||
                part.endsWith(".gpr")
            );

            if (packageIndex <= 0) {
                return;
            }

            const module = parts[packageIndex - 1];
            const pkg = parts[packageIndex];

            if (!module || !pkg) {
                return
            }

            if (!modules.has(module)) {
                modules.set(module, []);
            }

            modules.get(module)!.push(pkg);
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