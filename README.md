
# 🎉 KudosBot Setup Guide

Welcome to **KudosBot**! Follow this step-by-step guide to get the bot up and running on your machine, even if you're a beginner! 🚀

---

## 🛠️ Prerequisites

### 1. Install Git on your desktop:
- **Google Search**: "Download Git for Windows/Mac/Linux"
- **Download**: Choose the latest version for your OS and install it from [git-scm.com](https://git-scm.com/).

### 2. Install a Code Editor (e.g., VSCode):
- **Google Search**: "Download VSCode for Windows/Mac"
- **Download**: Grab the latest version from [Visual Studio Code](https://code.visualstudio.com/).

---

## 💻 Setting up KudosBot

### 1. Clone the repository using the VSCode Terminal:

```bash
git clone https://github.com/iamvaar-dev/kudosbot.git
```

This will create a local copy of the KudosBot project on your machine.

---

### 2. Configuring Your Slack Bot

1. **Locate the `.env.local` file** in the root directory of the cloned repository.
2. **Add your `Slack bot's OAuth Token` by editing the file like this:

```bash
SLACK_BOT_TOKEN = your-slack-bot-token-here
```

If you're unsure how to get your Slack Bot OAuth Token, proceed to the next section.

---

## 🔑 Getting the Slack Bot OAuth Token

1. **Go to your Slack Bot API** and click on `Install App` .  
   This will install the bot into your Slack workspace.
   
2. **Find the OAuth Token** by returning to the Slack API `Install App` page.  
   You will see the Slack bot OAuth Token—copy this token.

3. **Paste the OAuth Token** into the `.env.local` file where indicated earlier.

---

## 🚀 Final Configuration Steps

1. Go to the **Interactivity & Shortcuts** section on the Slack API page.
2. **Create a Shortcut**:
   - Give it any name and description.
   - Set the **Callback ID** to \`open_kudos_modal\` exactly as written.
   
3. You're done! 🎉

---

## 🎥 Need More Help?

If any step is unclear, search YouTube for terms like:
- *"How to find Slack bot OAuth Token"*
- *"How to set up a Slack bot with OAuth"*

Remember to go through the steps slowly, and if needed, watch tutorial videos to get a better idea of each step.

---

Feel free to reach out if you need any more help!
