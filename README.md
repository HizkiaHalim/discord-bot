Hi there,

Welcome to my discord bot project! I made this bot only to satisfy my curiosity on making a discord bot, node.js, google-api, docker(containerization), and server setup.

I hope this README file helps you (and me in the future) to load / use the docker image i've made.

## Getting Ready
1. open cmd as admin and run wsl -v
2. if you alrdy have wsl then skip this section and go to [Installing Docker](#installing-docker) or [Loading Docker Image](#loading-docker-image)
3. if you don't have wsl installed, open windows > search for "turn windows feature on or off" > turn on "Virtual Machine Platform" and "Windows Subsystem For Linux" then restart device
4. open cmd as admin and run wsl --update
5. then run wsl --install -d Ubuntu-22.04 > type in your username and password after complete

## Installing Docker
6. type wsl
7. type sudo su -
8. then set up Docker's apt directory (https://docs.docker.com/engine/install/ubuntu/)

**run this code below one by one so it's easier to see**
```
sudo apt-get update

sudo apt-get install ca-certificates curl

sudo install -m 0755 -d /etc/apt/keyrings

sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc

sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
9. After that you could grant or add “docker” group to your own user so this user can run docker without using root
```
usermod -aG docker [your username here]
```

## Loading Docker Image
So i've build a docker image (discord-bot-hiz.tar) and all you need to do is just load the docker image > docker run > voila the bot successfully started.
But before you do this please and .env and credential.json to your discord-bot folder (put it in the same folder as the docker image)!
```
# Docker load and run
docker load -i discord-bot-hiz.tar

docker run --name discord-bot-hiz --env-file .env -v "$(pwd)/credential.json:/app/credential.json:ro" discord-bot-hiz

# To check wether docker started or not
docker ps -a

# To stop and remove the docker
docker stop discord-bot-hiz

docker rm discord-bot-hiz

# To build the docker image
docker build -t discord-bot-hiz .
```
I hope all of these notes help the reader to load this docker image. This bot is just a personal project and not built for commercial purposes.
I know there are still many things that can be added / fixed, i hope it will be fixed in the future i will still working on develop this project bcs this is a fun one.
Also, thank you to all the devs who were willing to answer my questions or provide guidance while making this project. You guys are awesome!
Thankyou for reading!
Best regards,
HizkiaHalim
