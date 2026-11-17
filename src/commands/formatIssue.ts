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


export { formatIssueCheckout }