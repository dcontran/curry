import { Plugin, Notice } from "obsidian";





async function formatIssueCheckout(plugin: Plugin) {
    const file = plugin.app.workspace.getActiveFile();

    if (!file) {
        new Notice("No active note");
        return;
    }

    const cache = plugin.app.metadataCache.getFileCache(file);
    const issueNumber = cache?.frontmatter?.issue_number;
    const issueTitle = file.basename.replace(/^\{[^}]+\}\s*/, "");



    const text = `[dcontreras] #${issueNumber} ${issueTitle}`;

    await navigator.clipboard.writeText(text);


    new Notice(`Copied: ${text}`);
}

export default class CopyNoteInfoPlugin extends Plugin {
    async onload() {
        this.addCommand({
            id: "copy-note-name-and-id",
            name: "Copy issue for checkout comment",
            callback: async () => {
                const file = this.app.workspace.getActiveFile();

                if (!file) {
                    new Notice("No active note");
                    return;
                }

                const cache = this.app.metadataCache.getFileCache(file);
                const id = cache?.frontmatter?.id;

                const text = `${file.basename} ${id ?? ""}`;

                await navigator.clipboard.writeText(text);

                new Notice(`Copied: ${text}`);
            },
        });
    }
}


export { formatIssueCheckout }