import {
	Editor,
	MarkdownView,
	MarkdownFileInfo,
	Plugin,
} from 'obsidian';
import {
	DEFAULT_SETTINGS,
	MyPluginSettings,
	SampleSettingTab,
} from './settings';
import { createCanvasFromClipboard } from './commands/canvasFromDebug';
import { formatIssueCheckout } from './commands/formatIssue';
import { formatAsTodoList } from './commands/formatAsTodoList';

export default class CurryPlugin extends Plugin {
	settings!: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('dice', 'Create canvas from debug', async (_evt: MouseEvent) => {
			// Called when the user clicks the icon.

			await createCanvasFromClipboard(this)
		});

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'canvas-from-debug',
			name: 'Canvas from debug',
			callback: async () => {
				await createCanvasFromClipboard(this)
			},
		});

		this.addCommand({
			id: 'copy-issue-checkout',
			name: 'Copy issue for checkout comment',
			callback: async () => {
				await formatIssueCheckout(this)
			},
		});

		this.addCommand({
			id: 'format-packages-todo-list',
			name: 'Format packages as todo list',
			editorCallback: async () => {
				await formatAsTodoList(this);
			},
		});

		this.registerEvent(
			this.app.workspace.on(
				"editor-menu",
				(menu, editor, view) => {
					menu.addItem((item) => {
						item
							.setTitle("Format packages as todo list")
							.setIcon("list-todo")
							.onClick(async () => {
								await formatAsTodoList(this);
							});
					});
				}
			)
		);


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<MyPluginSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

