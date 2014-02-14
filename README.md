mandrillctl
===========

Command line tool for managing a Mandrill server. Mandrill is a front-end web service for Munki. If you've never heard of either of these products, you probably don't need mandrillctl.

## Installation
You'll probably want to install this in your path, which requires `sudo`.

```
sudo npm install -g mandrillctl
```

## Requirements
Both mandrillctl and Mandrill can only run on OS X hosts. Development has been done on 10.9 with no testing on older versions as of v0.6.0. While there is a very good chance they will both work on older versions of OS X, no promises are made.

Still thinking about trying this on a linux server? Don't. It will break and then mock you in front of your friends. Seriously. It won't stop until you cry.


## Usage
Once you've got mandrillctl installed, the first thing you'll probably want to do is use it to install Mandrill.

```
sudo mandrillctl --install
```

By default, Mandrill is configured to use port 80. If you've already got a server on port 80 (and you probably do if this is your Munki server), you should change that port to something else:

```
# 3001 is just an example
sudo mandrillctl --set-http-port 3001
```

Lastly, Mandrill is configured to use `http://localhost` when listening for OAuth responses, which is again, probably not what you want.

```
sudo mandrillctl --set-http-host http://mandrill.example.com
```

## Starting & Stopping Mandrill
It's just like it sounds:

```
sudo mandrillctl --start
sudo mandrillctl --restart
sudo mandrillctl --stop
```


## Upgrading Mandrill
When a new version of Mandrill comes out, all you need to do to install it is run:

```
sudo mandrillctl --upgrade
```