---
theme: the-unnamed
title: You shouldn't write code!
info: |
  ## You shouldn't write code!
  A presentation about modern development practices and the evolution of software engineering.
class: text-center
background: '#161C2C'
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: slide-left
mdc: true
themeConfig:
  color: "#F3EFF5"
  background: "#161C2C"
  accents-teal: "#44FFD2"
  accents-yellow: "#FFE45E"
  primary: "#FFE45E"
--- 


# You shouldn't write code anymore!

Apéros Web Nancy - August 27th, 2025 - v1.0

---
layout: about-me

helloMsg: About me
name: Jonathan Petitcolas
imageSrc: "/assets/jonathan-petitcolas-tint.jpg"
position: left
job: "Engineering Platform Lead "
line1: (unofficial Claude Code Advocate)
line2: 
social1: "@Sethpolma"
social2: "tech.tint.ai"
---

--- 
layout: section
---

# Where our Journey Began


---

# 2023: GitHub Copilot

An auto-complete on steroids, pre-writing our code!

<Transform v-click :scale="0.85">
  <img src="/assets/copilot-unit-test-example.png" />
</Transform>

---

# 2023: GitHub Copilot

<div v-click style="margin-bottom: 16px">
  <h4 style="margin-bottom: 8px;"> Because we love French Fries!</h4>
  <Transform :scale="0.85">
    <img src="/assets/copilot-potatoe.png" />
  </Transform>
</div>

<div v-click>
  <h4 style="margin-bottom: 8px;">Copilot reaching the AGI? </h4>
  <Transform :scale="0.85">
    <img src="/assets/copilot-agi.png" />
  </Transform>
</div>


---

# 2023: GitHub Copilot

<div v-click style="margin-bottom: 16px">
  <h4 style="margin-bottom: 8px;">Let's play a game!</h4>
  <Transform :scale="0.85">
    <img src="/assets/copilot-kay.png" />
  </Transform>
</div>


---

# 2024 - H1 2025: Throwing Spaghettis at the Wall

* A lot of experiments in all the directions to see what works and what doesn't.
* Large range of tools have been tried...
  * Prototyping tools such as Lovable, Figma Make, Builder.io, etc.
  * LLMs such as Gemini or GPT,
  * AI-first IDEs such as Cursor or Windsurf,
  * Documentation finders like Super (from Slite)
* Sometimes a clever mix of them, taking the best of all worlds.
  * Creating an implementation plan with Gemini, who has a large context,
  * Develop the feature with Cursor using Sonnet,
  * Review the generated code with ChatGPT


---

# Q3 2025: Claude Code Breakthrough

* A Claude Code experiment started in June 2025, and it was AMAZING!
* For the first time, we can let AI work autonomously on features or bug fixes.
* It alone increased our velocity by a factor of 3 to 5x!


---
layout: section
---

# Measuring the AI Impact

---
layout: section
---

<blockquote style="font-size: 1.5rem; line-height: 1.5;">"When you can measure what you are speaking about, and express it in numbers, you know something about it."</blockquote>

<p style="text-align: right;">Lord Kelvin</p>

---

# What to Measure?


<v-clicks depth="2">
  <ul style="margin-top: 32px;">
    <li>We don't adopt tools based on hype; we adopt them based on data.</li>
    <li>Hence, we need an objective way to measure the tool effectiveness.</li>
    <li>
        Focus on three key areas:
        <ul>
          <li>Engineering Impact</li>
          <li>Code Quality</li>
          <li>Business Impact</li>
        </ul>
    </li>
  </ul>
</v-clicks>

---

# Number of Commits

<v-click>
<h4>Git Command</h4>

``` shell
git log 
  --author="$(git config user.name)" 
  --since="2024-01-01" 
  --until="$(date +%Y-%m-%d)" 
  --format="%ad" --date=format:"%Y-%W" | sort | uniq -c | 
    awk '{print "Week " $2 ": " $1 " commits"}'
```
</v-click>

<v-click>
  <h4 style="margin: 24px 0 16px 0;">Claude Prompt</h4>

  <blockquote style="line-height: 1.5; margin-top: 0;">Give me the number of commits from jpetitcolas, aggregated on a daily basis, from Jan. 1st 2024 to today. Export the result as a JSON file matching: [{ date: '2024-01-01', numberCommits: 42 }].</blockquote>
</v-click>

<blockquote v-click style="line-height: 1.5; margin-top: 16px;">From @number_commits.json and @time_off_dates.json, I want a weekly aggregate of the average number of commits per working day for each week. Export it as [{ "week": "2025-08-18", "commitsPerDay": 4.71 }]</blockquote>


--- 
layout: iframe
url: /assets/charts/commits-bar-chart.html
---

--- 
layout: iframe
url: /assets/charts/prs-bar-chart.html
---


--- 
layout: iframe
url: /assets/charts/cycle-time-chart.html
---

---

# CodeRabbit to the Rescue!

* Our cycle time increased by 65% after the introduction of AI.
* We send 3x more pull requests that still needs to be reviewed.
* Code reviews became the bottleneck!
* We're in 2025... Let's throw some AI on the problem!
* [Code Rabbit](https://www.coderabbit.ai/) is an AI-powered Code Review GitHub Bot!
  * Code Rabbit handles the technical reviews, humans the business review.
  * Humans are still responsible of their reviews, but the process is drastically faster.


---

# Bug Detection

<Transform :scale="0.55">
  <img src="./assets/code-rabbit-bug-detection.png" />
</Transform>

---

# Removing Dead Code

<Transform :scale="0.85">
  <img src="./assets/code-rabbit-dead-code.png" />
</Transform>

---

# Security Vulnerability Detection

<Transform :scale="0.75">
  <img src="./assets/code-rabbit-security.png" />
</Transform>


--- 
layout: iframe
url: /assets/charts/pr-comments-chart.html
---


--- 
layout: iframe
url: /assets/charts/tickets_chart.html
---

---

# 3-5x Increase of our Engineering Velocity

<h3 v-click>Code-Related Metrics</h3>

<v-clicks>
<ul style="margin-top: 16px;">
  <li><strong>Velocity</strong>: shipping 2-3x more code on a sustainable pace</li>
  <li><strong>Quality</strong>: Higher quality, letting humans focus on architecture and business logic.</li>
  <li><strong>Business Value</strong>: Shipping 2.5x more value to our customers for the same level of effort</li>
</ul>
</v-clicks>

<h3 style="margin-top: 32px" v-click>And Beyond</h3>

<v-clicks>
  <ul style="margin-top: 16px; margin-bottom: 16px;">
    <li>Faster architecture discussions</li>
    <li>Blazing fast troubleshooting</li>
    <li>Ghost writer for documentation, PR descriptions..., blog posts or slides</li>
  </ul>
</v-clicks>

<v-click>
  <h3>AI makes us between 3x and 5x Engineers effortlessly!</h3>
</v-click>

---
layout: section
---

# Claude Code Tips and Tricks

--- 

# Thinking Depths

No keywords

<div className="flex" style="margin-top: 16px;">
  <div><img src="/assets/brain-level-0.png" /></div>
  <ul style="margin-left: 32px;">
    <li>Standard analysis</li>
    <li>Quick implementation plans</li>
    <li>Straightforward solutions</li>
  </ul>
</div>

--- 

# Thinking Depths

`Think`

<div className="flex" style="margin-top: 16px;">
  <div><img src="/assets/brain-level-1.png" /></div>
  <ul style="margin-left: 32px;">
    <li>Extended thinking mode</li>
    <li>Evaluates alternatives</li>
    <li>More thorough analysis</li>
  </ul>
</div>

--- 

# Thinking Depths

`Think Hard`

<div className="flex" style="margin-top: 16px;">
  <div><img src="/assets/brain-level-2.png" /></div>
  <ul style="margin-left: 32px;">
    <li>Comprehensive evaluation</li>
    <li>Multiple approach comparison</li>
    <li>Edge-case considerations</li>
  </ul>
</div>



---
 
# Thinking Depths

`Ultrathink`

<div className="flex" style="margin-top: 16px;">
  <div><img src="/assets/brain-level-3.png" /></div>
  <ul style="margin-left: 32px;">
    <li>Maximum thinking budget</li>
    <li>Exhaustive analysis</li>
    <li>Complex architectural decisions</li>
  </ul>
</div>


---
layout: two-cols-header
---

# Plan Mode

`SHIFT + TAB` twice to enter into the Plan Mode

<h3 style="margin-top: 24px;">Example</h3>
<blockquote style="margin-top: 8px;">Create a URL shortener service with analytics tracking</blockquote>

::left::

<h3 style="margin-bottom: 16px;">Edit Mode (default)</h3>

* Jumps directly into implementation
* Suggests changes, waits for approval
* Best for quick fixes and simple edits
* Toggle auto-approval with `SHIFT + TAB`

::right::

<h3 style="margin-bottom: 16px;">Plan Mode</h3>

* Must-use for all new features or bugs
* Read-only analysis of your codebase
* Creates detailed implementation strategy
* Review and refine plan before any changes
* Support thinking depths

---

# Model Context Protocol

<v-click>

<h2>Definition</h2  >
<blockquote style="margin-top: 16px; margin-bottom: 32px; line-height: 1.5;">MCP is an open protocol that standardizes how applications provide context to large language models (LLMs).</blockquote>

Source: https://modelcontextprotocol.io/docs/getting-started/intro
</v-click>

<v-click>

<h2>Command</h2>
<blockquote style="margin-top: 16px; margin-bottom: 32px; line-height: 1.5;">/mcp</blockquote>

MCP configuration is stored in `/.mcp.json`

</v-click>

---

# Linear MCP

* Allows to create/edit tickets and comments, add labels, etc.
* Document all the issues in a seamless way
  * Contributes to the increased code quality: no more "forgotten" issues.

<blockquote style="margin-top: 8px; margin-bottom: 8px; line-height: 1.5;">/create-ticket to fix a 500 error when the ID provided to `/user/[id]` is not a UUID</blockquote>

<h3 style="margin-top: 48px;">Configuration</h3>

``` json
{
    "linear": {
        "command": "npx",
        "args": ["-y", "mcp-remote", "https://mcp.linear.app/sse"]
    }
}
```



--- 

# PostgreSQL MCP

* Explore your data schema for yourself, or for Claude
* Retrieve, run, and optimize even complex queries in a glance
* **Not for production use due to data privacy/security concerns**

<blockquote style="margin-top: 16px; margin-bottom: 32px;">Average premium for all Kentucky users born before 1980 having at least 5 insured vehicles?</blockquote>

<h3 style="margin-top: 48px;">Configuration</h3>

``` json
{
    "postgres": {
        "command": "npx",
        "args": [
              "-y",
              "@modelcontextprotocol/server-postgres",
              "postgresql://user:password@localhost:5432/db"
        ]
    }
}
```

--- 

# Context7 MCP

* Context7 provides a list of up-to-date docs, optimized for LLMs.
* Claude applies all the best and most modern practices of your favorite frameworks.

<blockquote style="margin-top: 24px; margin-bottom: 16px;">Leverage the React Admin cache to optimize the policies list. Use Context7 to fetch RA doc.</blockquote>

<h3 style="margin-top: 32px; margin-bottom: 8px;">Configuration</h3>

``` json
{
    "context7": {
        "type": "http",
        "url": "https://mcp.context7.com/mcp"
    }
}
```

--- 

# GitHub MCP

* A GitHub MCP exists: https://github.com/github/github-mcp-server
* But why using it when we can use `gh` in a much simpler way?

<blockquote style="margin-top: 24px; margin-bottom: 16px;">Using `gh`, get a list of all my draft pull requests and rebase them.</blockquote>


--- #26

# Communication Style

* Claude Code has several communication styles: `/output-style`

```
This changes how Claude Code communicates with you

Use /output-style:new to create custom output styles

❯ 1. Default      Claude completes coding tasks efficiently and provides concise responses ✔
  2. Explanatory  Claude explains its implementation choices and codebase patterns
  3. Learning     Claude pauses and asks you to write small pieces of code for hands-on practice  
```

<ul style="margin-top: 24px;"><li>You can make it challenge your decision and be more concise.</li></ul>

<blockquote style="margin-top: 8px; margin-bottom: 16px; line-height: 1.5">/output-style:new Be direct and concise, challenges my ideas and assumptions, asks tough questions about my approach, points out potential flaws or better alternatives, and avoids being overly verbose or polite.</blockquote>


---

# Custom Commands

* Custom commands are located in the `.claude/commands` folder.
* They allow to factorize repeated prompts, iterating over them.
* A few examples of our daily commands:
  * `/ticket PLA-123` to read the Linear ticket, propose an implementation path, and work on it.
  * `/create-ticket` to create a Linear ticket following our optimized template
  * `/rebase` to automate the rebases, asking you for the trickiest pieces.
  * `/create-pr` to open a PR following with our template
  * `/apply-review` to fetch all comments on a PR and implement the review

--- 

# Custom Commands

* Rule of 3: if you repeat three times the same prompt, time to factorize it!
* Start with a basic prompt, without over-thinking it:

<blockquote style="margin-top: 8px; margin-bottom: 32px; line-height: 1.5">Rebase the current branch based on the ($ARGUMENTS or `main`) branch.<br /><br />
In case of conflicts, summarize the changes in both version, and ask the user what to do.</blockquote>

* Then ask Claude to optimize it:

<blockquote style="margin-top: 8px; margin-bottom: 16px; line-height: 1.5">Optimize the following custom command for Claude Code:</blockquote>

---

``` txt
Rebase the current branch onto the target branch (default: main).

1. First, identify the current branch name and the target branch from $ARGUMENTS
   (defaulting to 'main' if not specified)
2. Stash any uncommitted changes if present
3. Fetch the latest changes from the remote repository
4. Pull the latest version of both the current branch and the target branch
5. Attempt to rebase the current branch onto the target branch

## If conflicts occur:

-   List each conflicted file
-   For each conflict, show:
    -   The incoming changes from the target branch
    -   The current branch's changes
    -   A brief summary of what each version is trying to accomplish
-   Ask the user how to resolve each conflict with options:
    -   Accept target branch version
    -   Accept current branch version
    -   Merge both changes
    -   Let me manually resolve

## After rebase completion:

-   If changes were stashed, offer to pop the stash
-   Show a summary of the rebase result
```

---

# Parallelization


* Spawn several Claude Code instances at the same time to work on several features at the same time.
* No more waiting time while Claude Code is working. 
* Engineers become an agent orchestrator.

<h3 style="margin-top: 48px; margin-bottom: 16px;">Anthropic Recommended Approaches</h3>

* Have one Claude write code; use another Claude to verify
* Have multiple checkouts of your repo
* Use git worktrees (if working on fully independent tasks)
* Use headless mode with a custom harness (`claude -p`)


---
layout: image
image: ./assets/parallelization.png
--- 

---

# Context Management

* Claude Code, as all other LLMs, has a limited context window.
* For better performances, <strong>the context should be as focused as possible on the task</strong>.

* Storing everything into memory is not the best choice.
  * It fills the context with information that may not be immediately relevant.
  * If you have to stop working on this task, it may be lost.
  * You can leverage the `/resume` command, but it's not the most convenient.
---

# Issue Trackers as a Context Database

* We are using Linear as an example, but it could be any tools.
  * Prefer tools using `gh` or that have a MCP ready to use. 
* Use Linear tickets and comments to persist the LLM context.
  * `/create-ticket` stores the implementation plan within the ticket.
  * If the plan is too ambitious, `/create-ticket` for the sub-tasks. 
  * If you have to temporarily pause a task:
  
<blockquote style="margin-top: 8px; margin-bottom: 16px; line-height: 1.5">Add a comment to the current ticket describing what has been done and what still remains to be done. Add all the attention points we need to keep into memory.</blockquote>

* Optimized context workflow: `/create-ticket`, then `/clear`, and finally `/ticket`.

---

# /create-ticket

```
Create a Linear ticket for the task below. The ticket should...

1. Be assigned to the right team (eg. PLA for infrastructure related work),
2. Provide context about the request, 
3. Have the considered implementation path
4. Highlight the benefits it provides.
5. Add an estimate description of the complexity (from XS to XL),
6. Add an explanation for the priority,
7. Always create the ticket in the Backlog,
8. Do not assign anyone to the ticket.
9. Return the ticket link to the user.

$ARGUMENTS
```

---

# Estimates

* Velocity knowledge is requried to plan proper feature launches.
* Velocity = average number of complexity points / sprint duration
* Velocity is relative to a given referential (here, a given team)
* Let's change referential, and work in the Claude Code referential.

## Claude Code Advantages

* Align the estimates on a massive number of different code bases
* More objective than humans, whose judgement could be biased (fatigue, past trauma, etc.)
* No need to spend full estimate sessions, saving a few hours every cycle 

---

# Estimate example

```
Complexity Estimate: S

This is a straightforward implementation involving:

* Single endpoint creation
* Cookie management (well-established patterns)
* Simple template/page creation
* Standard test coverage

The work is contained within the authentication service and uses existing patterns.
```


---

# Troubleshooting

<h3>CI/CD issues</h3>

<blockquote style="margin-top: 8px; margin-bottom: 16px; line-height: 1.5">This run failed: https://github.com/tint-ai/insurance/actions/runs/17168464169<br /><br />
Investigate carefully where it comes from, and propose a fix.</blockquote>

<h3 style="margin-top: 32px;">Build errors</h3>

<blockquote style="margin-top: 8px; margin-bottom: 16px; line-height: 1.5">The event-sourcing package doesn't buidl anymore</blockquote>

<h3 style="margin-top: 32px;">Typos</h3>

<blockquote style="margin-top: 8px; margin-bottom: 16px; line-height: 1.5">https://staging.tint.ai/users/john.doe/vehicles/insrued/2cc9ed9c => 404</blockquote>


---
layout: end
---

# Thank you!

Jonathan Petitcolas - @Sethpolma

petitcolas.jonathan@gmail.com - www.jonathan-petitcolas.com
