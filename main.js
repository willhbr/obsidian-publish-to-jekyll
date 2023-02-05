const obs = require('obsidian');
const fs = require('fs');

const sluggify = (input) => input.toLowerCase().replace(/[^\w]+/g, '-');

console.log('loading...');

const dateStr = date => date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

const writeToJekyll = (root, date, title, content) => {
  let date_str = dateStr(date);
  let dir = root + '/_posts/' + date.getFullYear();
  let fullpath = dir + '/' + date_str + '-' + sluggify(title) + '.md';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.writeFile(fullpath, content, err => {
    if (err) console.error(err);
  })
}

const toJekyll = (title, content, date) => {
  let date_str = dateStr(date);

  // TODO check content and merge frontmatter

  return `
---
title: "${title}"
date: ${date_str}
layout: post
---

${content}
  `;
}

class JekyllPublisher extends obs.Plugin {

  onload() {
    this.path = '/Users/will/projects/willhbr.github.io';
    console.log('loading plugin');

		this.addCommand({
			id: 'publish-to-jekyll',
			name: 'Publish to Jekyll',
			editorCallback: (editor, ctx) => {
        console.log('publishing...');
        this.publish(ctx, this.path);
			}
		});

    this.addSettingTab(new JekyllSettingsTab(this.app, this));
  }

  publish(ctx, path) {
    let content = ctx.getViewData();
    let title = ctx.file.basename;
    let filename = sluggify(title);
    let date = new Date();

    let jekyllContent = toJekyll(title, content, date);
    writeToJekyll(path, date, title, content)
  }

  onunload() {
    console.log('unloading plugin');
  }
}


class JekyllSettingsTab extends obs.PluginSettingTab {
	constructor(app, plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Jekyll Projects'});

		new obs.Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
module.exports = JekyllPublisher;
