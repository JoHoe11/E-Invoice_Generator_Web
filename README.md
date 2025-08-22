# E-Invoice_Generator_Web

## Badges

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) 
[![Build Status](https://img.shields.io/github/actions/workflow/status/JoHoe11/E-Invoice_Generator_Web/main.yml?branch=main)]()
[![npm version](https://img.shields.io/npm/v/e-invoice_generator)]()

## Description

This project is a web application for generating electronic invoices. This is an alpha version and currently can only create E-Invoices after the german law and the bare minimun input from the XRechnung site to not throw errors in the validator. That doesn't mean it's not going to in the future when the EN 16931 is being changed.(So use with caution)

## Table of Contents

- [Features](#features)
- [Tech Stack / Key Dependencies](#tech-stack--key-dependencies)
- [File Structure Overview](#file-structure-overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage / Getting Started](#usage--getting-started)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)
- [Author/Acknowledgements](#authoracknowledgements)
- [Contact](#contact)

## Screenshots

<!-- TODO: Add screenshots if applicable -->

## Features

- Generates electronic invoices.
- Uses React for a dynamic user interface.
- Utilizes Material UI for a consistent design system.
- Leverages Supabase for backend services.
- Uses React Router for navigation.

## Tech Stack / Key Dependencies

- JavaScript
- HTML
- CSS
- React
- React DOM
- React Router DOM
- Material UI (@mui/material)
- Emotion (React and Styled)
- Supabase (@supabase/supabase-js)
- Vite
- Tailwind CSS
- PostCSS

## File Structure Overview

```text
.
├── src/
│   └── ... (various JavaScript components and modules)
├── public/
│   └── index.html
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── template_config.json
└── vite.config.js
```

## Prerequisites

- Node.js (version specified in package.json engines if available, otherwise specify a recent version - TODO)
- npm or yarn (package manager)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/JoHoe11/E-Invoice_Generator_Web.git
   cd E-Invoice_Generator_Web
   ```
2. Install dependencies:
   ```bash
   npm install # or yarn install
   ```

## Usage / Getting Started

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Preview the project:
    ```bash
    npm run preview
    ```

## Contributing

Pull requests are welcome. This is only an alpha version and is probably not gonna go any further then that your welcome to use it.

## License

Distributed under the MIT License. See `LICENSE` file for more information.  <!-- TODO: Verify the License. A license file might be present in the repo.  -->

## Author
JoHoe11
