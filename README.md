# Dir Path Searcher

A Next.js application that allows you to search for directory paths on your local file system.

## Features

- Recursively scans and indexes directories.
- Watches for file system changes and updates the index automatically.
- Advanced search functionality with include and exclude criteria.
- Case-insensitive and accent-insensitive search.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/KBungei/DirPathSearcher_NextJS.git
   ```
2. Navigate to the project directory:
   ```bash
   cd DirPathSearcher_NextJS
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### Adding a Directory to Scan

1. Enter the absolute path of the directory you want to scan in the "Directory Path" input field.
2. Click the "Scan Directory" button.

The application will then recursively scan the directory and add all subdirectories to its index. It will also watch the directory for any changes.

### Searching

Enter your search query in the "Search Phrase" input field. The search has the following features:

- **Case-Insensitive and Accent-Insensitive:** The search will match paths regardless of case or accents (e.g., `resume` will match `Resume` and `résumé`).

- **Hierarchy Search:** Use the `>` character to specify a directory hierarchy. The words you enter, separated by `>`, must appear in the directory path in that order.

  *Example:* `albums > named > celebrity > rihanna` will match paths like `E:\_PICTURES\1 _ALBUMS\1 _NAMED\CELEBRITY\R\Rihanna`.

- **Exclusion Search:** Use the `!` character to exclude paths that contain certain words. Any words after the `!` are the exclusion criteria.

  *Example:* `rihanna ! low res` will find paths containing "rihanna" but not "low res".

- **Hierarchical Exclusion:** You can also use the `>` character in the exclusion part of the query to specify a hierarchy of folders to exclude.

  *Example:* `rihanna ! low res > 2023` will exclude paths that have `low res` and then `2023` in their structure.

- **Order Enforcement:** Use the checkboxes to control whether the order of phrases should be enforced for both inclusion and exclusion queries.
