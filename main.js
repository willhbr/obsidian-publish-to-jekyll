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

  fs.writeFile(fullpath, toJekyll(title, content, date), err => {
    if (err) console.error(err);
  })
}

const handleFrontmatter = (lines, front) => {
  let idx = 1;
  for (; idx < lines.length; idx++) {
    let line = lines[idx];
    if (line == '---') break;
    let index = line.indexOf(': ');
    let key = line.substr(0, index);
    let value = line.substr(index + 2);
    front[key] = value;
  }
  return lines.splice(idx).join('\n');
};

const toJekyll = (title, content, date) => {
  let date_str = dateStr(date);

  let lines = content.split('\n');
  let front = {
    title: title,
    date: date_str,
    layout: 'post',
  };
  if (lines[0] == '---') {
    console.log("handling frontmatter");
    content = handleFrontmatter(lines, front);
  }

  let buffer = '---\n';
  Object.keys(front).forEach(key => {
    buffer += key + ': ';
    let val = front[key];
    if (val.includes(' ')) {
      buffer += '"' + val + '"';
    } else {
      buffer += val;
    }
    buffer += '\n';
  })

  buffer += '---\n\n' + content.trim();

  return buffer;
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
    let content = ctx.getViewData().trim();
    let title = ctx.file.basename;
    let filename = sluggify(title);
    let date = new Date();

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
