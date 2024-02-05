# OpenAI React Chat Web Application
<!-- markdown-link-check-disable -->
This project provides a web frontend for the OpenAI chat API. This project is for developers or advanced users that are familiar with [OpenAI ChatGPT](https://chat.openai.com/) but want to customize the web interface.
## Goals
* Provide the same features as [OpenAI ChatGPT](https://chat.openai.com/) and <!-- markdown-link-check-enable -->
[OpenAI Playground](https://platform.openai.com/playground?mode=chat).
* Use a modern web stack of React, Tailwind CSS, and Typescript.

See [FEATURES.md](FEATURES.md) for details.

## Preview
![chat-demo-02042024](https://github.com/elebitzero/openai-react-chat/assets/42903164/ce3157c0-59c6-4890-a18e-adc030a36128)





## Requirements

* [Node.JS](https://nodejs.dev/en/)
* [npm](https://www.npmjs.com/)
* [OpenAI API Account](https://openai.com/blog/openai-api)
  * Note: GPT-4 API access is currently accessible to those who have made at least [one successful payment](https://help.openai.com/en/articles/7102672-how-can-i-access-gpt-4) through the openai developer platform.


## Setup

1. Clone the repository.
```
git clone https://github.com/elebitzero/openai-react-chat.git
```
2. Edit [env.json](src/env.json) and change 'your-api-key-here' to your [OpenAI Key](https://platform.openai.com/account/api-keys)
3. Build & Run the web server
```
npm install
npm run start
```
<!-- markdown-link-check-disable-next-line -->
The local website [http://localhost:3000/](http://localhost:3000/) should open in your browser.

## Contributions

All contributions are welcome. Feel free to open an issue or create a pull request.
