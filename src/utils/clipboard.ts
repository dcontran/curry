async function getClipboardText(): Promise<string> {
    try {
        const text = await navigator.clipboard.readText();
        return text;
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        return '';
    }
}

function isGdbBacktrace(text: string): boolean {
    return text
        .split('\n')
        .some(line => /^#\d+\s/.test(line.trim()));
}



export { getClipboardText, isGdbBacktrace }