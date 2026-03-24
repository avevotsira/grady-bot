import { Hono } from "hono";
import type { Env } from "../bindings";

const app = new Hono<{ Bindings: Env }>();

const DISCORD_API_BASE = "https://discord.com/api/v10";

interface DMChannel {
  id: string;
  type: number;
  last_message_id: string | null;
  recipients: Array<{
    id: string;
    username: string;
    discriminator: string;
  }>;
}

async function sendDiscordDirectMessage(
  env: Env,
  userId: string,
  message: string
): Promise<void> {
  try {
    // Create a DM channel
    const dmResponse = await fetch(`${DISCORD_API_BASE}/users/@me/channels`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipient_id: userId }),
    });

    if (!dmResponse.ok) {
      const errorText = await dmResponse.text();
      throw new Error(
        `Failed to create DM channel: ${dmResponse.status} ${errorText}`
      );
    }

    const dmChannel = (await dmResponse.json()) as DMChannel;

    // Send the message to the DM channel
    const messageResponse = await fetch(
      `${DISCORD_API_BASE}/channels/${dmChannel.id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: message }),
      }
    );

    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      throw new Error(
        `Failed to send message: ${messageResponse.status} ${errorText}`
      );
    }

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

// Old message archives - stored for reference
const _oldWaterMessages = [
  "Either water or I'll spoil dandadan",
  "You know there are virtual characters in an animated zombie survival game right now that wish they had water? DRINK WATER",
  "You don't have to grind lvl 7 carpentry to get reliable water source irl , so drink it up",
  "I'll eat all your cereal if you don't drink water",
  "I will ddos your microwave if you don't drink water",
  "Your dog called , they want a light hydrated",
  "Someone socks will get wet this morning if u don't drink water",
  "Light, your water bottle called. It's feeling abandoned and wants you back",
  "Light, your water bottle called. It's time to refill!",
  "Light, your future self called. He's thirsty and disappointed in you.",
  "Drink water, or I'll replace your dog with an identical but older , so you will have less time with him , and I will gain a new dog",
  "I'll replace one of your stair step with a shorter one if you don't drink water...",
  "Roses are red, violets are blue, if you don't drink water, the bot will spam you!(Ave will also spam you)  - Love Bot",
  "Hydrate or I'll switch your coffee to decaf. ",
  "Drink up, or I'll make your socks permanently damp. Your feet's comfort depends on your hydration!",
];

const _oldVitaminMessages = [
  "LIGHT LIGHT ! TIME TO NOM VITAMIN!",
  "One Vitamin a day keep world war away",
  "Light, your body is calling for its daily dose of vitamins!",
  "Vitamins are your friends, Light! Don't leave them hanging!",
  "Vitamin deficiency? Not on my watch, Light!",
  "Light, your vitamins called. They miss you.",
  "No vitamin, no gaming. Simple as that, Light!",
  "Light, it's vitamin time! Ignore at your own risk of turning into a sad broccoli.",
  "Vitamin reminder: Because being a well-nourished human is better than being a sad potato.",
  "Zombie apocolyse might start cause somoene forget thier vitamin , just sayin",
  "Light! Your body called. It's tired of sending passive-aggressive signals. Take your vitamins!",
  "Vitamin alert! Take them now, or I'll start narrating your life in a documentary voice. (with my new mic *wink wink*)",
  "Light, your vitamins are feeling like abandoned side quests. Complete them now!",
  "Vitamin reminder: Because being a well-nourished Light is better than being a vitamin-deficient Light.",
  "If you were a fruit, you'd be a fine-apple. If you were a vegetable, I would care and love for you my whole life. but i am sure you dont want that , so take ur vitamin ",
];

// New water messages - same playful threatening tone
const _newWaterMessages = [
  "Water check! Don't make me hide your keyboard, Light.",
  "Your plants are drinking water right now. Are you? Be smarter than a fern, Light.",
  "I'll swap your WiFi password with a riddle if you don't hydrate. Drink up!",
  "Light, your kidneys are filing a complaint. HR says drink water or face consequences.",
  "Hydrate or I'll replace your bed with a treadmill. Sweet dreams won't be so sweet.",
  "Your future self just slipped on a banana peel from dehydration. Save him, drink now!",
  "I'll leak your Spotify playlist to the group chat if you don't drink water.",
  "Light, your blood cells are swimming in syrup. Add some water to that pool!",
  "Skip this water reminder and I'll autocorrect all your texts to Shakespearean English.",
  "Your chair called. It says your dehydrated brain is making questionable sitting choices.",
  "Drink water or I'll make your next sandwich with the heel of the bread. You know which heel.",
  "Light, your shadow looks thirstier than you. That's saying something.",
  "Hydration now, or I'll narrate your inner monologue out loud at work tomorrow.",
  "Your fridge light stays on for water, not your glow. Fix that. Drink.",
  "I'll donate your unused CPU cycles to folding proteins until you take a sip. Think of the lag.",
];

// New vitamin messages - same playful threatening tone
const _newVitaminMessages = [
  "Light! Pop that vitamin or I'll set your alarm to Nickleback.",
  "Your immune system is holding a 'Going Out of Business' sale. Vitamins are the bailout!",
  "Skip your vitamin and I'll replace your search engine with Bing permanently.",
  "Light, your bones are writing bad reviews about you. Five stars if you take vitamins!",
  "Vitamin time! Ignore this and I'll replace your rice with cauli-rice. No one wants that.",
  "Your cells are rioting. Vitamins are the peaceful resolution. Be the hero, Light.",
  "Light, your hairline negotiated a better deal, but only if you take vitamins.",
  "I'll auto-subscribe you to daily cat facts SMS if that pill doesn't go down your throat.",
  "Your metabolism sent a strongly worded letter. Vitamins are the apology it deserves.",
  "Take your vitamins or I'll swap your butter with 'I Can't Believe It's Not Butter' and you'll never know which.",
  "Light, your future self is looking... wrinkly. Vitamins are cheaper than time travel fixes.",
  "That vitamin bottle has feelings. You're breaking its heart. Swallow your guilt and the pill!",
  "I'll make your next load of laundry 90% socks that need pairing. Vitamin prevents this fate.",
  "Light, your body is a temple. Right now it's a temple with a 'closed for renovations' sign. Vitamins reopen it!",
];

async function sendScheduledMessage(env: Env) {
  // Send a random water message every scheduled hour
  // (Vitamin messages are currently disabled)
  const waterMsg = getRandomMessage(_newWaterMessages);
  return await sendDiscordDirectMessage(env, env.TARGET_USER_ID, waterMsg);
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

