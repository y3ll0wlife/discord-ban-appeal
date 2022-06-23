# Discord Ban Appeal
### Make it possible for users to appeal their bans online
### With a simple configuration to make your form unqiue to your server and with the use of Discord oauth you can be sure that no one fakes their appeal.

#### For any sort of support head over to my [Discord server](https://discord.gg/mFW3Ugj8eJ) and ask in the #ban-appeal channel and I will happily help you.

#### Example screenshot
![](https://cdn.discordapp.com/attachments/928757369767354369/989551179279269958/yH8ukDpOuN3FN3O.png)

## How to use it?

### Creating a Cloudflare account and installing wrangler
1. Create a or login in to your [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. Head over to the **"Workers"** section and **"Overview"** and press **"Create a Service"**.
3. Also don't forget to copy the **"Account Id"**. Save this for later
![](https://cdn.discordapp.com/attachments/928757369767354369/989491635219992626/wHZACDX2eutUb1H.png)
4. We will now have to choice a name for our website in our case it will `discord-ban-appeals`
![](https://cdn.discordapp.com/attachments/928757369767354369/989491924413087744/rD7btOPtwj9Aybq.png)
5. Leave the starter as default as we will not be needing it and press **"Create service"**
6. Write down the **service url** as it will be needed for later
![](https://cdn.discordapp.com/attachments/928757369767354369/989492223173341264/UB4CqQSR6pHcL7L.png)
7. We will now have to download wrangler as it will make our process to deploying the system a lot easier. 
8. Before dowloading you will need to have [node.js](https://nodejs.org/) installed, so download that before the next step.
```bash
$ npm install -g wrangler
or if you have yarn
$ yarn global add wrangler
```

After this we will have to authenticate with Cloudflare
```
$ wrangler login
```

### Creating a Discord application
1. Head over to [discord.com/developers/applications](https://discord.com/developers/applications/) and sign in if you have to.
2. Press the **"New Application"** button and give it a good name
![](https://cdn.discordapp.com/attachments/928757369767354369/989494715328135229/JIoFXGjgdETRiAi.png)
3. Copy the **Application ID** and the **Public Key** and save them for later
![](https://cdn.discordapp.com/attachments/928757369767354369/989495031264063528/ohkJgu05tmFV0V3.png)
4. Go to the **Oauth2 section** of the application settings
5. Copy the **Client Secret** and in the **Redircts** section put the server url that will look something like `https://<service name>.<username>.workers.dev`
![](https://cdn.discordapp.com/attachments/928757369767354369/989541197343227974/4mv953DR6EjIH6H.png)
6. Now head over to the **Bot** category and press **Add Bot**
7. Copy the **Token** of the bot and save it for later
8. You can also disable **Public Bot** so only you can invite the bot to your server
![](https://cdn.discordapp.com/attachments/928757369767354369/989541951000944800/UqiLFbfjqP0z8MI.png)
9. Don't forget to invite the bot to your server where the appeals should happen with the following link.  

Dont forget to change the application id (also known as client id)
> https://discord.com/oauth2/authorize?client_id=replace_this_application_id&permissions=536889348&scope=bot+applications.commands

10. We also need a **channel id**. We can this by right click on a channel and pressing **Copy ID**
![](https://cdn.discordapp.com/attachments/928757369767354369/989544290470461550/0gMZ0NUYVEjj3rg.png)

⚠️ If this option does not show up its because you dont have **developer mode** enabled. This can be enabled by going to **User Settings** -> **Advanced** -> **Developer Mode**
![](https://cdn.discordapp.com/attachments/928757369767354369/989544622948745237/8CplrxUp5RGlPCA.png)

### The last steps
We should now have the following information
| Value          	| Description                                                                                                    	|
|----------------	|----------------------------------------------------------------------------------------------------------------	|
| Account ID     	| The account ID of your Cloudflare account                                                                      	|
| Service Name   	| The service name that you named your Cloudflare worker                                                         	|
| Service URL    	| The url of your Cloudflare worker page, will looks something like `https:/service_name.username.workers.dev`  	|
| Application ID 	| The application (or client ID) of the Discord Bot                                                              	|
| Public Key     	| The application public key from Discord                                                                        	|
| Client Secret  	| The application secret from Discord                                                                            	|
| Token          	| The application token from Discord                                                                             	|
| Channel ID     	| The channel ID where the appeals should be sent                                                                	|

Now that we are with authenticated Cloudflare and have a created a Discord application we can start with the ban appeal setup process. 
```
$ git clone https://github.com/y3ll0wlife/discord-ban-appeal.git
```
or download with [**this url**](https://github.com/y3ll0wlife/discord-ban-appeal/archive/refs/heads/master.zip)

Head into the directory of the dowloaded content and you will find a `wrangler.toml.example` open this in your favorite text application. As we will have to edit some things in the file.

```
name = "this will be your service name"
account_id = "this will be your account id"
```
Leave the rest as it is and save.  
After this rename the file to just `wrangler.toml`

Now we are ready to configure the form and its content
Open the `config.ts` file in the `src` folder. It might be a bit overwelming so lets take it bit by bit.

The first thing is `MESSAGE_CONTENT` this is the content of each appeal and can be whatever you want. Incase you want a moderator ping or if you want to just leave that is fine aswell.

Some examples:
```
export const MESSAGE_CONTENT: string = "@everyone new appeal";
export const MESSAGE_CONTENT: string = "<@&802589239094018090> Mods new appeal";
export const MESSAGE_CONTENT: string = "<3 new appeal";
```

The second thing is `WEBSITE_CONFIG` and its two parts
`WEBSITE_CONFIG.landingText` is the top part of the website and its recommended that you just replace the `[Your Server Name]` part.
`WEBSITE_CONFIG.landingTextDescription` is the second text on the website and can be left as default. Or if you have something else there for the users.

The third component and the largest one is the `CONFIG_HTML` which is how you can configure the form to be unique to your server. It allows **5** different options that include:
- text (a simple one line text box)
- textarea (for those larger texts)
- select (make a dropdown so users can select a option)
- range (a range slider)
- checkbox (make it possible to select one or more options)

Feel free to configure this however you want or leave it as the default. The system is built up as `json` config file that should be easy to understand and use. Here is a couple of examples
```ts
{
	label: "The label of the promt",
	type: "text",
	key: "unique_key",
	required: true, 
}
```
```ts
{
	label: "Select the reason as to why you were banned",
	type: "select",
	key: "my-select-box",
	required: true,
	selectInputs: [
		{
			text: "first option",
			value: "option1",
		},
		{
			text: "second option",
			value: "option2",
		},
		{
			text: "third option",
			value: "option3",
		},
	],
}
```

Now that we are done with the configuration lets take the last step and actually publish everything.

First we have to add all of the secret information we have as we dont want that to be public
```
$ wrangler secret put CLIENT_ID
The client or appplication ID

$ wrangler secret put CLIENT_SECRET
The clieent secret

$ wrangler secret put DISCORD_PUBLIC_KEY
The public key

$ wrangler secret put BOT_TOKEN
The bot token

$ wrangler secret put ENCRYPTION_KEY
A secret value that is used to encrypt the access key MAKE THIS SECRET!!!

$ wrangler secret put REDIRCT_URI
The service url from cloudflare (https:/service_name.username.workers.dev) 

$ wrangler secret put CHANNEL_ID
The channel id where the appeals should be sent
```

Lets send the information over to Cloudflare now
```
$ wrangler publish
```

And now you should see the bot online. This means we can do the last step which is done on [discord.com/developers/applications](https://discord.com/developers/applications/) find your application and go to the **Interactions Endpoint URL** part and input the service url and add `/interaction` and press save.
![](https://cdn.discordapp.com/attachments/928757369767354369/989550003716509788/Rgsz60AVXH1rEFp.png)

Tada we are now done. And everything should work if not feel free to send a message in the #ban-appeal section in my [Discord server](https://discord.gg/mFW3Ugj8eJ)