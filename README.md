phone-box
================

I made phone-box to help me customize the way my apartment complex's call box works.

The app exposes a web server with hard-coded routes that are configured to receive webhooks from Twilio. When someone outside my building calls me through the intercom system, Twilio picks up the call, sends events to the phone-box instance, and says the response out loud to the visitor.

There's also an easter egg that allows me to call myself in the phone box, press 9, and use the [Authy iOS app](https://www.authy.com/) to grab a secure constantly changing key and PIN myself into the building.

## Call prompts

Here's the experience from the user's perspective:

1. Someone shows up outside my apartment complex door. They scrub through the intercom/callbox, find my name, and key in the code to call me.
2. The callbox rings my Twilio number. Twilio pings a phone-box app instance running on Heroku. The app responds with some text to read.
3. Twilio reads out for the caller: "Hello. Press 1 for David Leonard. Press 2 for Kiigan Snaer." (In a kinda creepy robotic voice.)
4. The caller presses a number. Let's say 1, for David. (That's me.)
5. Twilio pings the app with the keypress and gets a response with some text to read and my number to call.
6. Twilio reads out for the caller: "One moment please." Twilio then dials my cell number and connects me with the caller.
7. I talk to them, see what they want, and buzz them in if I need to. (By pressing a key that is preset in the apartment callbox.) Or tell them to go away or something.

If the caller does not enter 1 or 2 during step 4, the call branches off.

If they press 9, it's probably me calling myself. Twilio will make a roundtrip to the app, trigger an authy challenge, and I'll enter the PIN from my authy app. If it is right, Twilio will buzz me in automatically.

If any other number is pressed, Twilio will make a roundtrip to the app and read out the error message: "I don't know that number. Press 1 for David Leonard. Press 2 for Keegan Snaer." Everything starts over again at step 4.

## Developing locally

### 0. Install prerequisites

To develop the app, you'll need the following installed:

* [node.js](https://nodejs.org/en/)
* [yarn](https://github.com/yarnpkg/yarn) - Optional, you can use NPM instead. Yarn provides a lockfile feature that pins dependencies, ensuring your node_modules folder has the same versions mine did when I developed the app.

### 1. Clone and install dependencies

Once you've installed the prerequisites, clone the app, `cd` into its directory, and install its dependencies:

```
$ git clone https://github.com/davidrleonard/phone-box.git
$ cd phone-box
$ yarn install # or npm install if you prefer
```

### 2. Setup environment variables

You'll need to supply some necessary secrets, like API keys. Copy the `.env.example` file to `.env` and fill out the necessary information:

* [Twilio](https://www.twilio.com/) API key - For the app to work, you'll need to sign up for a Twilio developer account, buy a phone number, and configure it to hit your app's URL. The screenshot below shows how I have configured my Twilio number, with some identifying details blacked out. After you've configured your number, retrieve your API key and set it in the `.env` file.

[![twilio screenshot](screenshots/twilio_screenshot.png?raw=true)](https://github.com/davidrleonard/phone-box)

* [Authy](https://www.authy.com/) API key and user ID - Authy provides two-factor identification style PINs that constantly refresh through a developer API. They also offer nice iOS/Android apps to retrieve the keys. Create a developer account, create an app, and get its API key. You'll also need to create a user account through Authy and add yourself to the app, then get your user ID. That way, when you dial 9, you will be able to retrieve the auth challenge from an Authy app.

* Phone numbers - I didn't want to check my phone number (or my partner's phone number) into source code, so I pulled them out as secrets. You can put phone numbers in here that Twilio will call when someone tries to reach you through your phone box. Note that the names Twilio reads are hard coded to my name (David for `PHONE1`) and my partner's name (Kiigan for `PHONE2`) in `app.js`. You'll need to change those yourself in the code. (Someday I'll clean that up. Pull requests welcome.)

### 3. Run the app

With the environment variables set, you're ready to go. You can start the app by running `$ node app.js`. It's pretty simple right now, so almost everything is kept in that one file. Take a look at the comments there to see what the app does.

## Deploying

I'm currently deploying the app to a free [Heroku](https://heroku.com/) instance.

(Note that because I'm not paying, my Heroku dyno goes to sleep when there isn't any activity for a few minutes. That means the first Twilio webhook has to wait a few seconds for a response. In my experience, this isn't really an issue and isn't noticeable for callers.)

If you want to deploy it to Heroku, and you already have [an account](https://signup.heroku.com/) and the [Heroku CLI tool installed](https://devcenter.heroku.com/articles/heroku-cli), it should be as easy as running the following commands from your app's root folder:

```
$ heroku apps:create [PICK_A_NAME]
```

You'll need to set your environment variables that are in your `.env` file on the Heroku instance as well.

```
$ heroku config:set URL_BASE="https://app.example.com" AUTHY_KEY="XXXXX" # ... etc ...
```

Deploy your app by checking any source code changes into git and pushing to the heroku remote (automatically created by the CLI):

```
$ git push heroku master
```

## Contributing

Contributions in the form of issues/bug reports, feature ideas or pull requests are welcome. Use the project's [Github Issues](https://github.com/davidrleonard/phone-box/issues) tracker and [Pull Request](https://github.com/davidrleonard/phone-box/pulls) form.

## License

Copyright (c) 2016 David R. Leonard. Released under the MIT license. [See the LICENSE file for details.](LICENSE)
