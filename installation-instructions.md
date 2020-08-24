# Installation instructions

## Ubuntu 20.04 machine

These instructions assume you have a machine running Ubuntu 20.04.
If you don't, then you can set one up on a cloud provider like AWS or as a virtual machine.

## git & github

Create a github account, then generate a ssh key and [add it to your github account](https://docs.github.com/en/github/authenticating-to-github/adding-a-new-ssh-key-to-your-github-account).

## Clone the repository and select the right branch

In the terminal, type
```bash
git clone git@github.com:dazsmith/whitebophir.git
cd whitebophir
git checkout testing
```

## Install node

In the terminal, type
```bash
curl -sL https://deb.nodesource.com/setup_current.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential
```

## Compile and deploy

In the terminal, type
```bash
npm install --production
PORT=5001 npm start
```

## Test

Open your web browser to [http://localhost:5001](http://localhost:5001) and try it out!

## Reverse proxy

If you want to use this for more tyhan just your own use, then I recommend setting up a reverse proxy.
I can provide instructions if you want.
