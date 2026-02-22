# Federico Tartarini's Personal Website

This website is built using [Docusaurus 2](https://docusaurus.io/).

## 🛠️ Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/inarhsec/FedericoTartarini.github.io.git
cd FedericoTartarini.github.io
yarn install
```

## 💻 Local Development

Start the local development server:

```bash
yarn start
```

This will open the site in your browser. Most changes are reflected live without restarting the server.

## 🏗️ Build

Generate static content for production:

```bash
yarn build
```

The output will be in the `build` directory and can be served by any static hosting service.

## 🚢 Deployment

Deployment to GitHub Pages is automated using **GitHub Actions**.  
Every push to the `master` branch triggers a workflow that builds and deploys the site.

You can also deploy manually:

### Using SSH

```bash
USE_SSH=true yarn deploy
```

### Not using SSH

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

This command builds the site and pushes the output to the `gh-pages` branch.

## ⚙️ Continuous Deployment

- The workflow file is located at `.github/workflows/deploy.yml`
- It uses [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages) for publishing
- The deployment is triggered automatically on every push to `master`

## 📚 Documentation

- See the [Docusaurus documentation](https://docusaurus.io/docs) for advanced configuration and usage.
- Project-specific docs are in the `docs/` folder.

## 📝 Contributing

Pull requests are welcome!  
Please follow the project conventions and guidelines described in the documentation.

## 📄 License

This project is licensed under the MIT License.
