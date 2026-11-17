import { App, PluginSettingTab, Setting } from 'obsidian';
import MyPlugin from './main';

export interface MyPluginSettings {
	username: string;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	username: ''
};

export class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Username')
			.setDesc("Used for issues comment")
			.addText((text) =>
				text
					.setPlaceholder('Enter your username')
					.setValue(this.plugin.settings.username)
					.onChange(async (value) => {
						this.plugin.settings.username = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
