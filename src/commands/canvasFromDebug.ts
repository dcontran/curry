import { Plugin, Notice } from "obsidian";


const AVG_CHAR_WIDTH = 10;
const PADDING = 40;
const NODE_HEIGHT = 60;


interface CanvasNode {
    id: string;
    type: 'text' | 'file';
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

interface CanvasEdge {
    id: string;
    fromNode: string;
    fromSide: 'top' | 'bottom' | 'left' | 'right';
    toNode: string;
    toSide: 'top' | 'bottom' | 'left' | 'right';
}


function generateUniqueId(): string {
    const dateString = Date.now().toString(36);
    const randomness = Math.random().toString(36).substring(2);
    return dateString + randomness;
}



function parseTextToCanvas(text: string): { nodes: CanvasNode[], edges: CanvasEdge[] } {

    const lines = text.split('\n').reverse();
    const edges: CanvasEdge[] = [];
    const nodes: CanvasNode[] = [];


    let yOffset = 0;
    const gap = 50;
    let index = 0;

    let biggestNodeWidth = 0;

    lines.forEach((line) => {

        if (line.startsWith("#")) {

            const nodeId = `node-${index}`;
            const words = line.split(" ");
            let procedureName: string = ""

            if (words[2]?.startsWith("0x")) {
                const value = words[4] ?? '';
                if (value !== '') {
                    procedureName = formatProcedure(value);
                }
            } else {
                const value = words[2] ?? '';
                if (value !== '') {
                    procedureName = formatProcedure(value);
                }

            }

            const nodeWidth = calculateNodeWidth(procedureName);
            if (biggestNodeWidth < nodeWidth) {
                biggestNodeWidth = nodeWidth;
            }

            nodes.push({
                id: nodeId,
                type: 'text',
                text: procedureName,
                x: 0,
                y: yOffset,
                width: nodeWidth,
                height: NODE_HEIGHT
            });

            // Connect to previous node
            if (index > 0) {
                edges.push({
                    id: `edge-${index}`,
                    fromNode: `node-${index - 1}`,
                    fromSide: 'bottom',
                    toNode: nodeId,
                    toSide: 'top'
                });
            }

            yOffset += NODE_HEIGHT + gap;
            index += 1;
        }

        // Center nodes vertically
        nodes.forEach((node) => {
            let difference = biggestNodeWidth - node.width;
            node.x = difference / 2;
        })

    })

    return { nodes, edges };
}

function formatProcedure(procedure: string): string {
    return procedure.replaceAll("-", ".").toUpperCase();
}
function calculateNodeWidth(text: string): number {
    // Find the longest line if text has newlines
    const lines = text.split('\n');
    const maxLineLength = Math.max(...lines.map(line => line.length));

    return (maxLineLength * AVG_CHAR_WIDTH) + PADDING;
}
async function getClipboardText(): Promise<string> {
    try {
        const text = await navigator.clipboard.readText();
        return text;
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        return '';
    }
}

async function createCanvasFromClipboard(plugin: Plugin) {
    const clipboardContent = await getClipboardText()
    const { nodes, edges } = parseTextToCanvas(clipboardContent);

    const canvasData = {
        nodes,
        edges
    };

    const fileName = `Canvas ${generateUniqueId()}.canvas`;

    try {
        await plugin.app.vault.create(fileName, JSON.stringify(canvasData, null, 2));

        new Notice(`Canvas created: ${fileName}`);

        const file = plugin.app.vault.getFileByPath(fileName);
        if (file) {
            await plugin.app.workspace.getLeaf().openFile(file);
        }
    } catch (e) {
        console.error(e);
        new Notice('Failed to create canvas.');
    }
}

export { createCanvasFromClipboard }