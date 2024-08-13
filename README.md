![To Do List Extensions Preview](https://raw.githubusercontent.com/Anuswar/to-do-list-extensions/main/images/preview.jpg)

# To-Do List Extensions 📝

This repository contains the code and resources for a simple yet powerful To-Do List Chrome Extension. Designed to help you manage tasks efficiently, this extension allows you to add, edit, and delete tasks directly from your browser. With persistent storage, your tasks are saved even after closing the browser, ensuring that your to-do list is always up to date.

## ✨ Key Features:

- Adds and manages tasks through a simple and intuitive popup interface.
- Marks tasks as completed with a single click using custom checkbox images.
- Stores tasks locally, ensuring they persist across browser sessions.
- Highlights tasks on hover for improved user interaction.
- Utilizes custom icons for a visually appealing and cohesive design.
- Automatically adapts the interface for different screen sizes within the Chrome environment.

## ⚙️ Installation

To run this extension locally or make contributions, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/Anuswar/to-do-list-extensions.git
   ```

2. Navigate to the project directory:

   ```bash
   cd to-do-list-extensions
   ```

3. Open Chrome browser.
4. Navigate to `chrome://extensions/`.
5. Enable **Developer mode** by toggling the switch in the top-right corner.
6. Click on **Load unpacked** button.
7. Select the directory where you cloned this repository.
8. The Chrome extension will be installed and ready to use.

## 🛠️ Tech Stack

The repository utilizes the following technologies and tools:

- **HTML**: Used for structuring the popup interface in the `index.html` file.

- **CSS**: Applied for styling the popup interface via the `style.css` file, ensuring a visually appealing design.

- **JavaScript**: Powers the interactivity and logic within the popup, managed through the `script.js` file.

- **Chrome Extension APIs**: Facilitates interaction with the Chrome browser, allowing the extension to function seamlessly. Key configurations are set in the `manifest.json` file.

- **Visual Studio Code (VS Code)**: The primary code editor used for development, offering a streamlined environment for writing, testing, and debugging the extension.

- **Git**: A version control system employed for tracking changes in the project and enabling collaboration.

## 📂 File Structure

The project structure is organized as follows:

```
to-do-list-extension/
│
├── images/                      # Folder for storing images used in the extension
│   ├── checked.png              # Image for the checked state of a to-do item
│   ├── unchecked.png            # Image for the unchecked state of a to-do item
│   ├── hover.png                # Image for the hover effect on to-do items
│   ├── icon.png                 # Icon for the extension (used in manifest.json)
│   ├── preview.jpg              # Preview image of the extension's interface
│
├── popup/                       # Folder for the popup UI components
│   ├── index.html               # The main HTML file for the popup interface
│   ├── script.js                # JavaScript file to handle the popup's functionality
│   ├── style.css                # CSS file for styling the popup interface
│
├── LICENSE.md                   # Licensing information for the extension
├── README.md                    # Documentation and instructions for using the extension
├── manifest.json                # Configuration file that defines the extension's properties
```

## 🤝 Contributing

Contributions are welcome! If you find any issues, have suggestions, or want to add new features, please open an issue or create a pull request. Follow these steps:

1. **Fork the repository.**
2. **Create a new branch** for your feature or bug fix.
3. **Make your changes and commit them** with descriptive commit messages.
4. **Push your changes to your fork.**
5. **Open a pull request** to the `main` branch of the original repository.

## 📄 License

This project is licensed under the [MIT License](LICENSE.md), which means you are free to use, modify, and distribute the code.
