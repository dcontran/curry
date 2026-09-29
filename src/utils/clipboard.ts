async function getClipboardText(): Promise<string> {
    try {
        const text = await navigator.clipboard.readText();
        return text;
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        return '';
    }
}


export { getClipboardText }