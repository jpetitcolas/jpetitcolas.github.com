---
layout: post
title: "Using Sublime Text 2 for web development"
---

# {{ page.title }}

As everyone else I suppose, I started development with very basic utility, such as Notepad (without the ++). Then, I gave a try to more advanced tools allowing me to have some syntax highlighting, basic auto-completion, etc. When I started professional development, I switched to more robust looking IDEs (especially Eclipse and Netbeans). It was pleasant at the beginning, when my needs were really basic. Yet, they are often based on Java, which provide them a particular heaviness (and critical security flaws). And, if you the misfortune to work on a remote Samba share, you have to be really patient...

Today, I am using several brand new exciting technologies, such as Symfony2 or Node.js, versionning it through the powerful Git, and having tamed Bash commands pretty well. Developing on Windows has become a terrible pain. Some solutions exists, such as Cygwin. Yet, they are not satisfactory, because of some limitations. The best solution I found is to use a virtual machine (for the Linux power) interfaced with a Samba network drive to my host system.

That's why I decided to quit IDE to switch back to basic text editors. Indeed, I am not using any of the extra feature provided by the big softs. I just edit my text, sometimes using auto-completion, and then switching to my browser to press manually F5. I never used integrated debugger or other such features. And even for my versionning, I rather like command line to wobbly integrated contextual menus.

I started to use Vim. And for several years, it was perfect for my needs. Really light, so powerful (even if it has a so steep learning curve) and a little bit geeky. Until I discovered another light solution, working natively on Windows, allowing me to do all what I was used to on Vim, but with a more user-friendly interface: Sublime Text 2.

[Sublime Text 2](http://www.sublimetext.com/2) is an awesome text editor, a worthy successor to Notepad++. It supports awesome features (more details on it later in this post), is really reactive and is cross platform. Moreover, it embeds a package manager allowing you to install or remove very easily community plug-in.

Even if it is a paid software, you can use it as a trial as much as you want, without any restrictions. This is probably the main reason of this software success. You will only get some rare pop-ups encouraging you to register if you liked the program. And, icing on the cake, the licence is per user, not by machine. So, you may use it on every machine and every desktop you use.

Really a nice business model. Try and buy if you want. Love it! But, let's dive into the basics of this awesome software.

## List of useful shortcuts

Here is a list of useful shortcuts:

* CTRL + P: quick go to file command
* CTRL + SHIFT + P: command line
* CTRL + J: put all the selected lines on a single line
* CTRL + K, CTRL + B: display or hide navigation sidebar if folder opened
* CTRL + K, CTRL + U: put in uppercase
* CTRL + K, CTRL + L: put in lowercase
* CTRL + SHIFT + UP/DOWN: move a line upward/downward
* CTRL + SHIFT + D: duplicate current line
* CTRL + SHIFT + K: delete current line
* CTRL + SHIFT + /: wrap selected content into a comment block
* F9: sort all selected lines by alphabetical order
* CTRL + click(s): multiple selection
* CTRL + D: add next occurence of current search to multiple selection
* CTRL + ALT + UP/DOWN: add previous/next line (but same column) to the multiple selection
* SHIFT + F11: go to no distraction mode. Only text and you, great to focus on your thought while writing a post.

This is not an exhaustive list: I discover new ones regularly. Moreover, I did not tell about standard commands, such as _Search and replace_, which are the same than in every other text editors.

Note that some softwares may interfer with previous shortcuts. For instance, some graphic cards control panel may override the CTRL + ALT + UP to rotate screen. Two solutions: either you disable it, or you change the default shortcut, as seen in the next section.

## Configuring Sublime Text 2 for Web development

All configuration is done through the editing of a simple JSON file. Here are the settings I use for web development.

First, open the preference settings thanks to the command line (CTRL + SHIFT + P) by typing `settings`. The default settings contains a description of all available parameters, which are overwritten by the user settings. So, rather like editing the user configuration file.

Here are the parameters I overrode:

````
{
    // The number of spaces a tab is considered equal to
    "tab_size": 4,

    // Set to true to insert spaces when tab is pressed
    "translate_tabs_to_spaces": true,

    // Set to true to removing trailing white space on save
    "trim_trailing_white_space_on_save": true,

    // Set to true to ensure the last line of the file ends in a newline
    // character when saving
    "ensure_newline_at_eof_on_save": true,

    // Determines what character(s) are used to terminate each line in new files.
    // Valid values are 'system' (whatever the OS uses), 'windows' (CRLF) and
    // 'unix' (LF only).
    "default_line_ending": "unix",

    // By default, shift+tab will only unindent if the selection spans
    // multiple lines. When pressing shift+tab at other times, it'll insert a
    // tab character - this allows tabs to be inserted when tab_completion is
    // enabled. Set this to true to make shift+tab always unindent, instead of
    // inserting tabs.
    "shift_tab_unindent": true
}
````

Not a lot to say here. I just use development standards, removing all unneccessary spaces and using 4 spaces instead of a tab.

I also hide the right minimap (I never found any utility to that) and hide menubar (still accessible by pressing Alt) to get as less distraction as possible when going to fullscreen (F11). You can do it in the menu `View`. However, it seems menu can not be hidden in Linux version. At least, I did not find any solution.

## Configuring your project

My files are located on a virtual Linux machine (to use the power of Git command line) and my Sublime Text is on my Windows host. To manipulate my sources, I am using a Samba share. As a result, communication is sometimes really slow when dealing with a high number of items. Especially on Sublime Text.

When I work on a Symfony2 application, external bundles represent a huge part of the project content. And when I try to `Refresh folders`, I have to wait several minutes to get the whole project folder fully updated. That's why I generally always modify my project settings.

Project management in Sublime Text is really basic (yet efficient). Just open a folder through the `File` menu. Then, save your selection as a project: `Project > Save project as`. A `.sublime-project` file will be created. Once it is saved, just edit your project settings, still in `Project` menu. You should get a similar configuration file:

````
{
    "folders":
    [
        {
            "path": "my-project"
        }
    ]
}
````

Simply turn it into:

````
{
    "folders":
    [
        {
            "path": "app",
            "folder_exclude_patterns": ["cache", "logs"]
        },
        {
            "path": "src"
        },
        {
            "web": "web",
            "file_exclude_patterns": ["*.css"]
        }
    ]
}
````

This way, you will import `app`, `src` and `web` folders only, the three main folders you should edit in a Symfony2 project. Moreover, I excluded cache and logs files, thanks to the `folder_exclude_patterns`. Finally, I chose to not include CSS files from `web` folders, assuming I am using LESS to stylize my website.

## Grab some extensions

Even if Sublime Text is a great editor, it may be far more powerful with some extensions. But, before browsing my installed ones, let install the package manager, allowing you to deal very easily with all the community plugins.

### Use package manager

To install package manager, simply open the Python console (CTRL + `, or _View > Show console_) and enter the following:

````
import urllib2,os; pf='Package Control.sublime-package'; ipp=sublime.installed_packages_path(); os.makedirs(ipp) if not os.path.exists(ipp) else None; urllib2.install_opener(urllib2.build_opener(urllib2.ProxyHandler())); open(os.path.join(ipp,pf),'wb').write(urllib2.urlopen('http://sublime.wbond.net/'+pf.replace(' ','%20')).read()); print('Please restart Sublime Text to finish installation')
````

If it does not work, you can still use the [manual procedure](http://wbond.net/sublime_packages/package_control/installation#Manual_Instructions).

Once done, restart Sublime and then you should have access to the package manager. Just open the command line (CTRL + SHIFT + P) and look for "Package control: install package". Just type the name of the plug-in you want, and that's all.

Here are few plug-ins I daily use.

### Emmet: write HTML the zen coding way

Zen coding allows to write HTML very quickly. If you do not already know it, just watch the following video:

<iframe src="http://player.vimeo.com/video/7405114" width="500" height="344" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>

To autocomplete an expression, just press <key>Tab</key> at the end. To open the abbreviation command, shortcut is CTRL + ALT + ENTER.

Plug-in repository: [Emmet](https://github.com/sergeche/emmet-sublime)

### Sublime Linter: parse your code before executing it

All developers are faced with typos. To avoid trivial innatention errors, Sublime Linter is a good plugin. It highlights in real-time the syntaxical mistakes you made: missing semi-column, misspelled keyword, and so on.

For Windows users, you have to [install Node.js](http://nodejs.org/) if you want CSS and Javascript parser to work.

Plug-in repository: [SublimeLinter](https://github.com/SublimeLinter/SublimeLinter)

## Adding some snippets

Another interesting feature is the possibility to use pre-configured snippets, and to add your custom ones. Let's take an example.

Imagine you want to create a new method in PHP. Simply write `fun`, and press Tab. It will replace your three single letters word `fun` by the whole following:

````
public function FunctionName($value='')
{
    # code...
}
````

Just navigate through the different editable items of snippets by pressing Tab. It increases strongly productivity, even if there is a time to get used.

To create your custom snippets, it is also really easy. Let's consider we want to write a snippet `sf2mail` which will be replaced by the whole code to send an email from a controller. Very useful, as I can not remember the exact process, forcing me to ask Google.

To create a snippet, simply go to `Tools > New snippet`. An XML file will appear:

````
<snippet>
    <content><![CDATA[
Hello, ${1:this} is a ${2:snippet}.
]]></content>
    <!-- Optional: Set a tabTrigger to define how to trigger the snippet -->
    <!-- <tabTrigger>hello</tabTrigger> -->
    <!-- Optional: Set a scope to limit where the snippet will trigger -->
    <!-- <scope>source.python</scope> -->
</snippet>
````

The snippet is composed of three items:

* *content:* code replacing the typed trigger,
* *tabTrigger:* the trigger you should type to deploy the snippet,
* *scope:* a link between the snippet and a file extension.

So, in our case, the corresponding snippet would be:

````
<snippet>
    <content><![CDATA[
\$message = \Swift_Message::newInstance()
    ->setSubject('${1:subject}')
    ->setFrom('${2:from}')
    ->setTo('${3:to}')
    ->setBody(\$this->renderView('${4:template}', ${5:parameters}))
;
\$this->get('mailer')->send(\$message);
    ]]></content>
    <tabTrigger>sf2mail</tabTrigger>
    <scope>source.php</scope>
</snippet>
````

Do not forget to include the content between CDATA tags.

As you may have already guessed, the `${1:subject}` and the others are the placeholders. You will be able to navigate through all these labels with tab key.

Save your file with `.sublime-snippet` extension. It is now available from PHP files.

## Sharing configuration across machines

I regularly use several machines, on different OS (Linux and Windows). I am using Sublime Text on all of these systems. So, I looked for a solution to share my configuration through all my computers.

I am using GitHub every day. So, it was logical to use it to store my config. To store your own configuration, you just have to send remotely (on GitHub or on Dropbox for instance) your user settings folder. It is located, depending of your system, at:

* *Windows:* C:\Users\[YOUR NAME]\AppData\Roaming\Sublime Text 2\Packages
* *Linux:* ~/.config/sublime-text-2/Packages
* *Mac:* ~/Library/Application\ Support/Sublime\ Text\ 2/Packages/

This way, I was able to share my configuration on GitHub: [https://github.com/jpetitcolas/sublime-text-config](https://github.com/jpetitcolas/sublime-text-config).

To use it, I simply clone the repository to the previous path. For instance, on Linux:

````
rm -Rf ~/.config/sublime-text-2/Packages
git clone git@github.com:jpetitcolas/sublime-text-config.git ~/.config/sublime-text-2/Packages
````

Easy, isn't it?
