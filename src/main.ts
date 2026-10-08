import {
	Editor,
	MarkdownView,
	MarkdownFileInfo,
	Plugin,
	Notice,
	setIcon,
} from 'obsidian';
import {
	DEFAULT_SETTINGS,
	MyPluginSettings,
	SampleSettingTab,
} from './settings';
import { createCanvasFromClipboard } from './commands/canvasFromDebug';
import { formatIssueCheckout } from './commands/formatIssue';
import { formatAsTodoList } from './commands/formatAsTodoList';
import { formatAsPackages } from './commands/formatAsPackages';

export default class CurryPlugin extends Plugin {
	settings!: MyPluginSettings;

	async onload() {
		console.log("Curry loaded")
		await this.loadSettings();

		// Initial scan
		this.addBaseCopyButtons();

		const observer = new MutationObserver(() => {
			this.addBaseCopyButtons();
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});

		this.register(() => observer.disconnect());

		this.registerInterval(
			window.setInterval(() => this.addCopyButtons(), 1000)
		);

		this.registerMarkdownPostProcessor((element) => {
			const properties = element.querySelectorAll(".metadata-property");

			properties.forEach((property) => {
				const key =
					property.querySelector(".metadata-property-key")
						?.textContent;

				console.log("no")

				if (key !== "Comando") return;
				console.log("Ok")

				const valueElement = property.querySelector(
					".metadata-property-value"
				);

				if (!valueElement) return;

				// Avoid adding the button twice
				if (valueElement.querySelector(".copy-command-button"))
					return;

				const value =
					valueElement.textContent?.trim() ?? "";

				const button = document.createElement("span");
				button.className = "copy-command-button";
				button.textContent = "📋";
				button.style.cursor = "pointer";
				button.style.marginLeft = "8px";

				button.onclick = async () => {
					await navigator.clipboard.writeText(value);
					new Notice("Command copied");
				};

				valueElement.appendChild(button);
			});
		});

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('dice', 'Create canvas from debug', async (_evt: MouseEvent) => {
			// Called when the user clicks the icon.

			await createCanvasFromClipboard(this)
		});

		this.addCommands()
		this.addMenus()


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
	private addBaseCopyButtons() {
		const cells = document.querySelectorAll(
			'.bases-td[data-property="note.Comando"]'
		);

		cells.forEach((cell) => {
			if (cell.querySelector(".copy-command-btn")) return;

			const valueElement = cell.querySelector(
				".metadata-input-longtext"
			);

			if (!valueElement) return;

			const button = document.createElement("span");
			button.className = "copy-command-btn";

			setIcon(button, "clipboard-copy");

			button.onclick = async (e) => {
				e.stopPropagation();

				const value = valueElement.textContent?.trim() ?? "";

				await navigator.clipboard.writeText(value);
				new Notice(`Copied: ${value}`);
			};

			cell.appendChild(button);
		});
	}
	private addCopyButtons() {
		const properties = document.querySelectorAll(
			'.metadata-property[data-property-key="comando"]'
		);

		properties.forEach((property) => {
			const valueContainer = property.querySelector(
				".metadata-property-value"
			);

			if (!valueContainer) return;

			// Already added?
			if (valueContainer.querySelector(".copy-command-btn")) return;

			const button = document.createElement("span");
			button.className = "copy-command-btn";

			setIcon(button, "clipboard-copy");

			button.onclick = async (event) => {
				event.stopPropagation();

				const value = property
					.querySelector(".metadata-input-longtext")
					?.textContent?.trim();

				if (!value) return;

				await navigator.clipboard.writeText(value);
				new Notice("Command copied");
			};

			valueContainer.appendChild(button);
		});
	}

	private addCommands() {
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
			id: 'format-packages-as-todo-list',
			name: 'Paste packages list -> Todo list',
			editorCallback: async () => {
				await formatAsTodoList(this);
			},
		});

		this.addCommand({
			id: 'format-todo-list-as-packages',
			name: 'Copy Todo list → Packages',
			editorCallback: async (editor: Editor) => {
				await formatAsPackages(editor);
			},
		});

	}

	private addMenus() {


		this.registerEvent(
			this.app.workspace.on(
				"editor-menu",
				(menu, editor, view) => {
					menu.addItem((item) => {
						item
							.setTitle("Paste packages list -> Todo list")
							.setIcon("list-todo")
							.onClick(async () => {
								await formatAsTodoList(this);
							});
					});
				}
			)
		);

		this.registerEvent(
			this.app.workspace.on(
				"editor-menu",
				(menu, editor, view) => {

					if (!editor.getSelection().trim()) {
						return;
					}

					menu.addItem((item) => {
						item
							.setTitle("Copy Todo list → Packages")
							.setIcon("list")
							.onClick(async () => {
								await formatAsPackages(editor);
							});
					});
				}
			)
		);
	}
}

