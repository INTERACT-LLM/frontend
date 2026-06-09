This folder contains all the UI components: chat panes, lesson grids, modals, banners, and so on. Most are small and self-explanatory (at least I have tried to name them after what they belong to in the prefix, `User`, `FreeChat`, `Lessons` etc. Some are of course generic, generalizable such as `Card` or `BaseModal`)

One component worth looking more into is [ChatWindow](/src/components/ChatWindow/ChatWindow.js), which holds the conversation logic and is the largest component in the app (likely to be refactored; holds too much logic atm).
