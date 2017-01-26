---
layout: post
title: "Npm (or Yarn) Install within a Docker Container, the Right Way"
illustration: "/img/docker.svg"
---

Working as a web agency (or more specifically at [marmelab](https://www.marmelab.com), as an innovation workshop), we have to deal with several different customers and projects. Each of these projects has its own set of technologies, and sometimes, their own version requirements. Installing concurrently all these heterogeneous components would be a nightmare. 

Fortunately, Docker exists. Docker containers are a kind of very light virtual machines (let be simple for this post). They have a lot of advantages, the best one being probably the Docker repository. It provides a wide range of ready-to-use components. Either you need a [WordPress](https://hub.docker.com/_/wordpress/) or a [Golang server](https://hub.docker.com/_/golang/), we can simply download the related Docker image and we are ready to go.

## Setting Up a Node Server with Docker

For instance, if we want to develop with Node.js, we can simply download the official Node.js image and use it as following:

``` sh
docker run -it --rm -v "$PWD":/app -w /app node:7 node index.js
```

This command instantiates a container using the `node:7` already configured image. It maps current working directory (`$PWD`) to `/app` container folder, and launch the command `node index.js`. The `--rm` option means Docker should delete the container once its command is executed. And the `-it` flag aims to map standard container input and output with the host ones.

We got a single container here, so this method may be just fine. Yet, if we deal with several containers (a PostGreSQL database for instance), it would be easier to use `docker-compose` to specify how they link to each other. Docker-compose configuration is stored in YAML format:

``` yaml
# /docker-compose.yml
version: '2'

services:
    db:
        # which image should we retrieve from Docker repository?
        image: postgres

        # configure database access based on environment variables
        environment:
            - POSTGRES_USER=username
            - POSTGRES_PASSWORD=password

    node:
        image: node:7
        working_dir: /app
        command: "node index.js"

        # map host project folder to /app container folder
        volumes:
            - .:/app
        
        # which port should be accessible from the outside?
        expose: 
            - "3000"

        # start container once `db` service is up
        depends_on:
            - db
        
        # `db` and `node` should be able to communicate
        links:
            - db
```

If we run `docker-compose up`, it would then start two containers, one for PostGreSQL and one for Node. Your architecture is now done, and every new developer on our project would then be able to bootstrap their whole environment in a couple of minutes, with exact required versions. Really exciting isn't it?

## Fixing Container Created Files Permissions Issues

Now, let's suppose we don't have `npm` installed on our host machine. Bootstrapping our project requires to install all Node dependencies we declared in our `package.json` file. So, we would need to execute a command on our `node` container, using the `run` command provided by `docker-compose`.

``` sh
docker-compose run --rm --no-deps node bash -ci 'npm install'
```

Note the `--no-deps` argument, which prevents to start `db` service in this case. 

This command would work fine. Yet, if we check `node_modules` file permissions, we would get an unpleasantly surprise:

``` 
ls -al node_modules

total 3184
drwxrwxrwx 784 root root 32768 Jan 26 17:47 .
drwxr-xr-x  19 root root  4096 Jan 26 17:46 ..
drwxr-xr-x   3 root root  4096 Jan 26 17:47 abab
drwxr-xr-x   2 root root  4096 Jan 26 17:47 abbrev
drwxr-xr-x   3 root root  4096 Jan 26 17:47 accepts
drwxr-xr-x   5 root root  4096 Jan 26 17:47 acorn
```

As you can notice, all files created from Docker container are created as `root` user. These permissions issues are not really terrible on local environment (we can just `sudo` after all). But on a CI server, when a PR merge triggers the removal of the branch folder, we would face some troubles. CI low-privileged agent would never be able to remove `root` folders.

There is no easy solution to this problem. One way is to specify the `user` option on our `node` service with host user and group id:

``` yaml
services:
    node:
        user: "${UID}:${GID}"
```

`docker-compose` would replace automatically variables from its configuration file using environment ones. Hence, we would just need to export both `UID` and `GID` variables before calling our `docker-compose run` command. To ease our future dependencies installation, we can use a `Makefile` task:

``` sh
export UID = $(id -u)
export GID = $(id -g)

install:
    docker-compose run --rm --no-deps node bash -ci 'npm install'
```

The `id -u` (or `-g`) retrieves current user (and group respectively) ids. We `export` them to put them in current environment, and so to transmit them to the docker container.

Now, if we want to install our JavaScript dependencies with correct file permissions, we would just need to launch following command:

``` sh
# remove previous dependencies mess
sudo rm -Rf node_modules/

# install them the correct way
make install
```

If you check file permissions, they all should be fine now.

``` 
ls -al node_modules

total 3184
drwxrwxrwx 784 jpetitcolas jpetitcolas 32768 Jan 26 17:47 .
drwxr-xr-x  19 jpetitcolas jpetitcolas  4096 Jan 26 17:46 ..
drwxr-xr-x   3 jpetitcolas jpetitcolas  4096 Jan 26 17:47 abab
drwxr-xr-x   2 jpetitcolas jpetitcolas  4096 Jan 26 17:47 abbrev
drwxr-xr-x   3 jpetitcolas jpetitcolas  4096 Jan 26 17:47 accepts
drwxr-xr-x   5 jpetitcolas jpetitcolas  4096 Jan 26 17:47 acorn
```

## Installing Dependencies From Private GitHub Repository

Everything worked fine... until we wanted to use a private GitHub repository. In this case, `npm` would simply fail to authenticate on GitHub, providing us a 401 error message.

### Sharing Local SSH Key with Docker Container

So, we would need to share our SSH credentials with our container. The simplest solution would be to map our `~/.ssh` folder within the container. Yet, I am not really confortable to share my own personal key, even within a private container. Fortunately, a better solution exists: SSH agent forwarding. It allows to use local SSH keys even while being connected on other machines.

To enable SSH forwarding within our container, we just need to map SSH authentication socket path (`SSH_AUTH_SOCK` environment variable) to `/ssh_agent`, and to specify this folder as our container `SSH_AUTH_SOCK` path:

``` sh
services:
    node:
        volumes:
            - $(SSH_AUTH_SOCK):/ssh_agent
        environment:
            - SSH_AUTH_SOCK=/ssh_agent
```

Before trying to install our private repository, we are going to test our SSH connection to GitHub:

``` sh
docker-compose run --rm --no-deps node bash -ci 'ssh -T git@github.com'
```

Our container still refuses our request, with the following error message:

> No user exists for uid 1000

### Creating a Dummy User for SSH Connection

Indeed, we mapped our container user to our host UUID (1000), yet our container has no user with such an id. A solution is to instantiate a fresh new container from main `node` image as `root`. It would then allow us to create a dummy user with expected UUID and to execute our `ssh` command correctly:

``` sh
docker run --rm -it \
    -v `pwd`:/app \
    -v $(SSH_AUTH_SOCK):/ssh_agent \
    -e SSH_AUTH_SOCK=/ssh_agent \
    -e USER_ID=$USER_ID \
    node bash -ci " \
        useradd -u $USER_ID dummy && \
        mkdir -p /home/dummy/.ssh && \
        chown -R dummy /home/dummy && \
        su dummy -c 'ssh -T git@github.com' \
    "
```

This command looks intimidating, but we simply create a user with our host UUID, create a folder required by `ssh`, set correct permissions on it, and execute our test `ssh` command. When ran, this command displays another error:

> Host key verification failed.

### Disabling Host Key Verification

Not an issue: just disable host key verification for GitHub, adding a `.ssh/config` file as following:

``` sh
docker run --rm -it \
    -v `pwd`:/app \
    -v $(SSH_AUTH_SOCK):/ssh_agent \
    -e SSH_AUTH_SOCK=/ssh_agent \
    -e USER_ID=$USER_ID \
    node bash -ci " \
        [...]
        cat /app/docker/node/ssh_config > /home/dummy/.ssh/config && \
        su dummy -c 'ssh -T git@github.com' \
    "
```

And the new `ssh_config` file:

``` sh
Host github.com
    StrictHostKeyChecking no
```

If we run another time the above command, we should then get a success message:

> Hi jpetitcolas! You've successfully authenticated, but GitHub does not provide shell access.

### Npm Install a Private Repository From Docker Container

Finally! We are now almost done. If we try to replace the `ssh -T` command by `npm install`, we would get an error because the `~/.npm` folder doesn't exist. Just add its creation to previous command, which would become finally:

``` sh
docker run --rm -it \
    -v `pwd`:/app \
    -v $(SSH_AUTH_SOCK):/ssh_agent \
    -e SSH_AUTH_SOCK=/ssh_agent \
    -e USER_ID=$USER_ID \
    node bash -ci " \
        useradd -u $USER_ID dummy && \
        mkdir -p /home/dummy/.ssh /home/dummy/.npm && \
        chown -R dummy /home/dummy && \
        cat /app/docker/node/ssh_config > /home/dummy/.ssh/config && \
        su dummy -c 'npm install' \
    "
```

And now, your private dependency should also be installed correctly.

### What About Yarn?

`yarn` is often promoted as a fully compatible `npm` clone on steroids. Our own experience proved this is not exactly the case. And here again, there are some subtle differences. First, we need to specify the `user` to our `ssh_config` file. It then becomes:

``` sh
Host github.com
    StrictHostKeyChecking no
    User git
```

Moreover, we had to change the way we declared our dependency in our `package.json` file:

``` diff
-    "my-repository": "MyCompany/my-repository#develop",
+    "my-repository": "ssh://github.com/MyCompany/my-repository#develop",
```

Indeed, without the `ssh://` protocol, `yarn` doesn't seem to understand it should clone it over SSH.

The solution proposed here is far from trivial, yet we were not able to find another solution. If a developer reading this post has an easier way, please, tell us! :)