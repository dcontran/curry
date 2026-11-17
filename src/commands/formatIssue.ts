import { Plugin, Notice } from "obsidian";
import CurryPlugin from "../main";


async function formatIssueCheckout(plugin: CurryPlugin) {
    const file = plugin.app.workspace.getActiveFile();

    if (!file) {
        new Notice("No active note");
        return;
    }

    const cache = plugin.app.metadataCache.getFileCache(file);
    const issueNumber = cache?.frontmatter?.issue_number;
    const issueTitle = file.basename.replace(/^\{[^}]+\}\s*/, "");



    const text = `[${plugin.settings.username}] #${issueNumber} ${issueTitle}`;

    await navigator.clipboard.writeText(text);


    new Notice(`Copied: ${text}`);
}


export { formatIssueCheckout }