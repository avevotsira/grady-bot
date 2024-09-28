import { Hono } from "hono";
import { REST } from "@discordjs/rest";
import {
  type RESTPostAPICurrentUserCreateDMChannelResult,
  Routes,
} from "discord-api-types/v9";
import type { Env } from "../bindings";

const app = new Hono<{ Bindings: Env }>();

function createRESTClient(env: Env) {
  return new REST({ version: "9" }).setToken(env.DISCORD_BOT_TOKEN);
}

async function sendDiscordDirectMessage(
  env: Env,
  userId: string,
  message: string
): Promise<void> {
  const rest = createRESTClient(env);
  try {
    // Create a DM channel
    const dmChannel = (await rest.post(Routes.userChannels(), {
      body: { recipient_id: userId },
    })) as RESTPostAPICurrentUserCreateDMChannelResult;

    // Send the message to the DM channel
    await rest.post(Routes.channelMessages(dmChannel.id), {
      body: { content: message },
    });
    console.log("Direct message sent successfully");
  } catch (error) {
    console.error("Error sending direct message:", error);
    throw error;
  }
}

function getRandomMessage(messages: string[]): string {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

async function sendScheduledMessage(env: Env) {
  const currentHour = new Date().getUTCHours() + 2; // Get the current hour in GMT+2

  if (!(currentHour === 8)) {
    const waterMessages = [
      "Do you know Grady, people die if they don't drink water",
      "You know there are virtual characters in an animated zombie survival game right now that wish they had water? DRINK WATER",
      "Grady, your body is 60% water. Time to refill the tank!",
      "Grady, imagine a world without water. Now drink some before it becomes a reality!",
      "Grady, your cells are screaming for hydration! Give them what they want!",
      "No water, no life. It's that simple, Grady. Drink up!",
      "Water is your best friend, Grady. Don't ghost it!",
      "I'll eat all your cereal if you don't drink water",
      "Grady, your body called. It's thirsty AF!",
      "Grady, if you were a plant, you'd be wilting right now. Water yourself!",
      "Water or else I'll break them pasta in half",
      "If you don't drink water, I will put pineapple on your pizza!",
      "Someone socks will get wet this morning if u don't drink water",
      "Grady, I bet you can't drink a gallon of water in one sitting",
      "Grady, if you don't drink water, I'll tell everyone you sleep with a nightlight",
      "Your future self called, Grady. It's begging you to drink water now!",
      "Grady, drink water or I'll replace all your music with baby shark remixes",
      "Hey Grady, did you know dehydration makes you look older? Drink up to stay young!",
      "Grady, if you were on a deserted island, you'd wish for water. Why wait? Drink now!",
      "Grady, drink water or I'll start using Comic Sans in all our communications",
      "Your kidneys are plotting revenge if you don't drink water soon, Grady",
      "Water: cheaper than therapy and better for your health. Drink up, Grady!",
      "Grady, your water bottle is feeling neglected. Show it some love!",
      "Grady, drink water or I'll spoil the ending of every movie you want to watch",
      "Grady, your plants are judging you for not drinking enough water",
      "Grady, if you don't drink water, I'll make this auto play 'Baby Shark' at full volume",
      "Grady, your water bottle called. It's feeling abandoned and wants you back",
      "Grady, if you don't drink water, I'll replace all message 'ILoveJustinBieber'",
      "Water: because your organs deserve a spa day too, Grady",
      "Grady, your water bottle called. It's time to refill!",
    ];

    // Send a random water message every hour except at 8:00 AM GMT+2
    const waterMsg = getRandomMessage(waterMessages);
    return await sendDiscordDirectMessage(env, env.TARGET_USER_ID, waterMsg);
  }

  const vitaminMessages = [
    "GRADY GRADY ! TIME TO NOM VITAMIN!",
    "GRADY ! VITAMIN TIME!",
    "YOU KNOW WAT TIM IS IT ! VITAMIN",
    "One Vitamin a day keep world war away",
    "Vitamin power, activate! Grady, it's time to take your vitamin!",
    "Grady, your body is calling for its daily dose of vitamins!",
    "Vitamin o'clock! Grady, you know what to do!",
    "Vitamins are your friends, Grady! Don't leave them hanging!",
    "Grady, take your vitamins or face the wrath of the health gods!",
    "Vitamin deficiency? Not on my watch, Grady!",
    "Grady, your vitamins called. They miss you.",
    "No vitamin, no gaming. Simple as that, Grady!",
  ];
  // Send a random vitamin message at 8:00 AM GMT+2
  const vitaminMsg = getRandomMessage(vitaminMessages);
  return await sendDiscordDirectMessage(env, env.TARGET_USER_ID, vitaminMsg);
}

app.get("/send-message", async (c) => {
  const apiKey = c.req.header("API-Key");

  if (c.env.NODE_ENV === "prod" && apiKey !== c.env.API_KEY) {
    return c.text("FORBIDDEN", 403);
  }

  try {
    const vitaminMsg = getRandomMessage([
      "Water or else I'll break them pasta in half",
    ]);
    await sendDiscordDirectMessage(c.env, c.env.TARGET_USER_ID, vitaminMsg);
    return c.text("Scheduled message sent successfully!");
  } catch (error) {
    console.error("Error in scheduled message:", error);
    return c.text("Failed to send scheduled message", 500);
  }
});

export default {
  fetch: app.fetch,
  scheduled: async (
    _event: ScheduledEvent,
    env: Env,
    _ctx: ExecutionContext
  ) => {
    await sendScheduledMessage(env);
  },
};

