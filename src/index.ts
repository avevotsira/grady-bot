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
      "Either water or I'll spoil dandadan",
      "You know there are virtual characters in an animated zombie survival game right now that wish they had water? DRINK WATER",
      "You don't have to grind lvl 7 carpentry to get reliable water source irl , so drink it up",
      "I'll eat all your cereal if you don't drink water",
      "I will ddos your microwave if you don't drink water",
      "Your dog called , they want a grady hydrated",
      "Someone socks will get wet this morning if u don't drink water",
      "Grady, your water bottle called. It's feeling abandoned and wants you back",
      "Grady, your water bottle called. It's time to refill!",
      "Grady, your future self called. He's thirsty and disappointed in you.",
      "Drink water, or I'll replace your dog with an identical but older , so you will have less time with him , and I will gain a new dog",
      "I'll replace one of your stair step with a shorter one if you don't drink water...",
      "Roses are red, violets are blue, if you don't drink water, the bot will spam you!(Ave will also spam you)  - Love Bot",
      "Hydrate or I'll switch your coffee to decaf. ",
      "Drink up, or I'll make your socks permanently damp. Your feet's comfort depends on your hydration!",
    ];

    // Send a random water message every hour except at 8:00 AM GMT+2
    const waterMsg = getRandomMessage(waterMessages);
    return await sendDiscordDirectMessage(env, env.TARGET_USER_ID, waterMsg);
  }

  const vitaminMessages = [
    "GRADY GRADY ! TIME TO NOM VITAMIN!",
    "One Vitamin a day keep world war away",
    "Grady, your body is calling for its daily dose of vitamins!",
    "Vitamins are your friends, Grady! Don't leave them hanging!",
    "Vitamin deficiency? Not on my watch, Grady!",
    "Grady, your vitamins called. They miss you.",
    "No vitamin, no gaming. Simple as that, Grady!",
    "Grady, it's vitamin time! Ignore at your own risk of turning into a sad broccoli.",
    "Vitamin reminder: Because being a well-nourished human is better than being a sad potato.",
    "Zombie apocolyse might start cause somoene forget thier vitamin , just sayin",
    "Grady! Your body called. It's tired of sending passive-aggressive signals. Take your vitamins!",
    "Vitamin alert! Take them now, or I'll start narrating your life in a documentary voice. (with my new mic *wink wink*)",
    "Grady, your vitamins are feeling like abandoned side quests. Complete them now!",
    "Vitamin reminder: Because being a well-nourished Grady is better than being a vitamin-deficient Grady.",
    "If you were a fruit, you'd be a fine-apple. If you were a vegetable, I would care and love for you my whole life. but i am sure you dont want that , so take ur vitamin ",
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

